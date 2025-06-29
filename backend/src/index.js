import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import userRoutes from "./routes/user.route.js"
import aiRoutes from "./routes/ai.route.js"
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";

dotenv.config()
const PORT = process.env.PORT

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
); 

// app.use(cors())


app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);

server.listen(PORT, ()=> {
    console.log("Server is running on port: " + PORT)
    connectDB();
})