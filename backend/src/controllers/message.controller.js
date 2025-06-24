import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import {detectTone}  from './ai.controller.js'

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // 1. Validate users and relationships
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const senderToReceiver = sender.contacts.find(
      (c) => c.user.toString() === receiverId
    );
    const receiverToSender = receiver.contacts.find(
      (c) => c.user.toString() === senderId
    );

    if (!senderToReceiver) {
      return res.status(400).json({ message: "Contact not found" });
    }

    // 2. Handle message limits for non-friends
    if (!senderToReceiver.isFriend) {
      const hasReceiverReplied = await Message.exists({
        senderId: receiverId,
        receiverId: senderId,
      });

      if (hasReceiverReplied) {
        // Upgrade to friends
        senderToReceiver.isFriend = true;
        if (receiverToSender) receiverToSender.isFriend = true;
        delete senderToReceiver.messageCount;
        if (receiverToSender) delete receiverToSender.messageCount;
        await Promise.all([sender.save(), receiver.save()]);
      } else {
        // Enforce message limit
        if ((senderToReceiver.messageCount || 0) >= 5) {
          return res.status(403).json({
            message: "Message limit reached. Wait for reply from the user.",
          });
        }
        senderToReceiver.messageCount =
          (senderToReceiver.messageCount || 0) + 1;
        await sender.save();
      }
    }

    // 3. Handle image upload if present
    let imageUrl = null;
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "chat_uploads", quality: "auto", fetch_format: "auto" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    // 4. Create and save message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      tone: null, // Will be updated later
    });
    await newMessage.save();

    // 5. Get socket IDs
    const senderSocketId = getReceiverSocketId(senderId);
    const receiverSocketId = getReceiverSocketId(receiverId);
    const initialMessage = newMessage.toObject();

    // 6. Immediate delivery to both parties
    // - Sender sees "Detecting..." status
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", {
        ...initialMessage,
        tone: "Detecting...",
      });
    }

    // - Receiver gets the raw message immediately
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", initialMessage);
    }

    // 7. Respond to HTTP request
    res.status(201).json({ ...initialMessage, tone: "Detecting..." });

    // 8. Background tone detection (non-blocking)
    if (text?.trim()) {
      detectTone(text)
        .then(async (detectedTone) => {
          // Update message in database
          await Message.findByIdAndUpdate(newMessage._id, {
            tone: detectedTone,
          });

          // Prepare update payload
          const update = {
            messageId: newMessage._id,
            tone: detectedTone,
          };

          // Sync tone update to both users
          if (senderSocketId) {
            io.to(senderSocketId).emit("updateMessageTone", update);
          }
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("updateMessageTone", update);
          }
        })
        .catch((error) => {
          console.warn("Tone detection failed:", error.message);
          // Optional: Emit failure notification to sender
          if (senderSocketId) {
            io.to(senderSocketId).emit("updateMessageTone", {
              messageId: newMessage._id,
              tone: "Analysis failed",
            });
          }
        });
    }
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};