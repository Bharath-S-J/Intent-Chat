import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

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

    // If already friends, no restriction
    if (!senderToReceiver.isFriend) {
      // Check if receiver has already replied
      const hasReceiverReplied = await Message.exists({
        senderId: receiverId,
        receiverId: senderId,
      });

      if (hasReceiverReplied) {
        // Upgrade both to friends
        senderToReceiver.isFriend = true;
        if (receiverToSender) receiverToSender.isFriend = true;

        delete senderToReceiver.messageCount;
        if (receiverToSender) delete receiverToSender.messageCount;

        await sender.save();
        await receiver.save();
      } else {
        // Limit sender's outbound messages before getting reply
        if ((senderToReceiver.messageCount || 0) >= 5) {
          return res.status(403).json({
            message: "Message limit reached. Wait for reply from the user.",
          });
        }

        senderToReceiver.messageCount = (senderToReceiver.messageCount || 0) + 1;
        await sender.save();
      }
    }

    // Upload image if present
    let imageUrl = null;
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "chat_uploads", quality: "auto", fetch_format: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      imageUrl = uploadResult.secure_url;
    }

    // Save message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Emit to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
