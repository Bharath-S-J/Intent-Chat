import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import userRoutes from "./routes/user.route.js"
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
    origin: "http://localhost:5173",
    credentials: true,
  })
); 



app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);

server.listen(PORT, ()=> {
    console.log("Server is running on port: " + PORT)
    connectDB();
})