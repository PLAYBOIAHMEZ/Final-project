import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;
const connectedUsers = new Map();

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);

    socket.on("join chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    socket.on("send message", async (data) => {
      const { chatId, message, senderId } = data;
      try {
        // Save message to database
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const newMessage = {
          sender: senderId,
          content: message,
          timestamp: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Broadcast to chat room
        io.to(chatId).emit("new message", {
          chatId,
          message: newMessage,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export const getConnectedUsers = () => connectedUsers;
