import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendInviteEmail } from "../lib/mailer.js";

export const addContactByEmail = async (req, res) => {
  const currentUserId = req.user._id;
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    if (!currentUserId)
      return res.status(401).json({ message: "Unauthorized" });

    // Prevent adding yourself
    const currentUser = await User.findById(currentUserId);
    if (!currentUser)
      return res.status(404).json({ message: "Current user not found" });

    if (currentUser.email === email) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    // Check if user with email exists
    const contactUser = await User.findOne({ email });

    if (!contactUser) {
      // User doesn't exist — send invite email only
      const inviteLink = `${process.env.CLIENT_URL}/signup?inviteFrom=${currentUserId}`;

      // Pass inviter's name to email
      await sendInviteEmail(
        email,
        inviteLink,
        currentUser.fullName || currentUser.email
      );

      return res.status(200).json({ message: "Invite sent to email" });
    }

    // If user exists, add mutual contacts if not already contacts
    const alreadyContactCurrentUser = currentUser.contacts.find(
      (c) => c.user.toString() === contactUser._id.toString()
    );
    if (alreadyContactCurrentUser) {
      return res.status(400).json({ message: "User already in contacts" });
    }

    // Add contactUser to currentUser contacts
    currentUser.contacts.push({
      user: contactUser._id,
      isFriend: false,
      messageCount: 0,
    });

    // Add currentUser to contactUser contacts if not present
    const alreadyContactContactUser = contactUser.contacts.find(
      (c) => c.user.toString() === currentUserId.toString()
    );
    if (!alreadyContactContactUser) {
      contactUser.contacts.push({
        user: currentUserId,
        isFriend: false,
        messageCount: 0,
      });
    }

    await currentUser.save();
    await contactUser.save();

    return res.status(201).json({ message: "Contact added mutually" });
  } catch (error) {
    console.error("Error in addContactByEmail:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeContact = async (req, res) => {
  const currentUserId = req.user._id;
  const { contactUserId } = req.params;

  if (!contactUserId) {
    return res.status(400).json({ message: "Contact user ID is required" });
  }

  try {
    // Remove contact from current user
    const currentUser = await User.findById(currentUserId);
    const initialCount = currentUser.contacts.length;

    currentUser.contacts = currentUser.contacts.filter(
      (c) => c.user.toString() !== contactUserId
    );

    if (currentUser.contacts.length === initialCount) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await currentUser.save();

    // Optional: Remove contact from the other user's contacts (unfriend both sides)
    const otherUser = await User.findById(contactUserId);
    if (otherUser) {
      otherUser.contacts = otherUser.contacts.filter(
        (c) => c.user.toString() !== currentUserId.toString()
      );
      await otherUser.save();
    }

    // Delete all messages between these two users
    await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: contactUserId },
        { senderId: contactUserId, receiverId: currentUserId },
      ],
    });

    res.status(200).json({ message: "Contact removed and messages deleted" });
  } catch (error) {
    console.error("Error removing contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getContacts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).populate(
      "contacts.user",
      "fullName email profilePic"
    );

    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    // Map to flatten nested user objects
    const users = currentUser.contacts.map(contact => contact.user);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getContacts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
