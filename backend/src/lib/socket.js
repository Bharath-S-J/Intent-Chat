import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js"; 


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
  },
});

// Track online users: { userId: socketId }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return;

  console.log("User connected:", userId, socket.id);
  userSocketMap[userId] = socket.id;

  await emitOnlineContactsToUser(userId);       
  await notifyContactsOfStatusChange(userId);   

  socket.on("disconnect", async () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    await notifyContactsOfStatusChange(userId);
  });
});

// Emit online contacts list to a specific user
async function emitOnlineContactsToUser(userId) {
  try {
    const user = await User.findById(userId).populate("contacts.user", "_id");
    if (!user) return;

    const contactIds = user.contacts.map((c) =>
      typeof c.user === "string" ? c.user : c.user._id.toString()
    );

    const onlineContacts = contactIds.filter((id) => userSocketMap[id]);
    const socketId = userSocketMap[userId];
    if (socketId) {
      io.to(socketId).emit("getOnlineUsers", onlineContacts);
    }
  } catch (err) {
    console.error("emitOnlineContactsToUser error:", err.message);
  }
}

// Notify all users who have `userId` in their contacts
async function notifyContactsOfStatusChange(userId) {
  try {
    const users = await User.find({ "contacts.user": userId }).populate(
      "contacts.user",
      "_id"
    );

    for (const contactOwner of users) {
      const ownerId = contactOwner._id.toString();
      const socketId = userSocketMap[ownerId];
      if (socketId) {
        await emitOnlineContactsToUser(ownerId);
      }
    }
  } catch (err) {
    console.error("notifyContactsOfStatusChange error:", err.message);
  }
}

export { io, app, server };
