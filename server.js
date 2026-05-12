import dotenv from "dotenv";
dotenv.config(); //It allows your app to load environment variables from a .env file into process.env

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import Message from "./models/marketplace/Message.js";



const app = express();

// Middleware
app.use(express.json()); //lets backend understand JSON data sent from frontend.
app.use(cors()); //To allow frontend apps (running on different domains/ports) to call your backend.

import authRoutes from "./routes/auth.js";
app.use("/auth", authRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Server listen
const PORT = process.env.PORT || 5000;



import userRoutes from "./routes/userRoutes.js";
app.use("/api/users", userRoutes);


import pincodeRoutes from "./routes/pincodeRoutes.js";
app.use("/api/pincode", pincodeRoutes);


// import profileRoutes from "./routes/profile.routes.js";
// app.use("/api/customerprofile", profileRoutes);

// import profileRoutes from "./routes/profileRoutes.js";
// app.use("/profile", profileRoutes);

import customerProfileRoutes from "./routes/Customer Routes/customerProfileRoutes.js";
app.use("/customerprofile", customerProfileRoutes);

import workerProfileRoutes from "./routes/Worker Routes/workerProfileRoutes.js";
app.use("/workerprofile", workerProfileRoutes);

import workerPostRoutes from "./routes/Worker Routes/workerPostRoutes.js";
import customerPostRoutes from "./routes/Customer Routes/customerPostRoutes.js";
app.use("/api/worker-posts", workerPostRoutes);
app.use("/api/customer-posts", customerPostRoutes);

import requestRoutes from "./routes/marketplace/requestRoutes.js";
app.use("/api/requests", requestRoutes);

import bookingRoutes from "./routes/marketplace/bookingRoutes.js";
app.use("/api/bookings", bookingRoutes);

import profileStatsRoutes from "./routes/marketplace/profileStatsRoutes.js";
app.use("/profile", profileStatsRoutes);

import notificationRoutes from "./routes/marketplace/notificationRoutes.js";
app.use( "/api/notifications", notificationRoutes);

import chatRoutes from "./routes/marketplace/chatRoutes.js";
app.use("/api/chat", chatRoutes);

import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// 🔥 SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("typing", ({ roomId }) => {
    socket.to(roomId).emit("typing");
  });

  //DELIVERED
  socket.on("messageDelivered", async ({ messageId, userId }) => {
    const msg = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deliveredTo: userId } },
      { new: true }
    );

    io.to(msg.chatRoom.toString()).emit("messageDelivered", {
      messageId,
      userId
    });
  });

  //SEEN
  socket.on("messageSeen", async ({ messageId, userId }) => {
    const msg = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenBy: userId } },
      { new: true }
    );

    io.to(msg.chatRoom.toString()).emit("messageSeen", {
      messageId,
      userId
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🔥 export io
export { io };

// ✅ ONLY THIS LISTEN
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);