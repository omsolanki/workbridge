import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { logger } from "../utils/logger";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

interface MessageData {
  roomId: string;
  message: string;
  senderId: string;
  receiverId: string;
}

interface TypingData {
  roomId: string;
  isTyping: boolean;
  userId: string;
}

// Store online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

// Authenticate socket connection
const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth["token"] ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env["JWT_SECRET"]!) as any;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = (user._id as any).toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};

export const setupSocketHandlers = (io: Server) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Add user to online users
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      io.emit("userOnline", { userId: socket.userId, user: socket.user });
    }

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle joining chat room
    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      logger.info(`User ${socket.userId} joined room ${roomId}`);
    });

    // Handle leaving chat room
    socket.on("leaveRoom", (roomId: string) => {
      socket.leave(roomId);
      logger.info(`User ${socket.userId} left room ${roomId}`);
    });

    // Handle sending message
    socket.on("sendMessage", async (data: MessageData) => {
      try {
        // Save message to database (implement your message model)
        // const message = await Message.create({
        //   roomId: data.roomId,
        //   senderId: data.senderId,
        //   receiverId: data.receiverId,
        //   content: data.message,
        //   timestamp: new Date()
        // });

        // Emit message to room
        io.to(data.roomId).emit("newMessage", {
          roomId: data.roomId,
          message: data.message,
          senderId: data.senderId,
          timestamp: new Date(),
        });

        // Send notification to receiver if not in room
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId && receiverSocketId !== socket.id) {
          io.to(receiverSocketId).emit("messageNotification", {
            senderId: data.senderId,
            message: data.message,
            roomId: data.roomId,
          });
        }

        logger.info(`Message sent in room ${data.roomId} by ${data.senderId}`);
      } catch (error) {
        logger.error("Error sending message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing", (data: TypingData) => {
      socket.to(data.roomId).emit("userTyping", {
        roomId: data.roomId,
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle stop typing
    socket.on("stopTyping", (data: TypingData) => {
      socket.to(data.roomId).emit("userTyping", {
        roomId: data.roomId,
        userId: data.userId,
        isTyping: false,
      });
    });

    // Handle job status updates
    socket.on(
      "jobStatusUpdate",
      (data: { jobId: string; status: string; userId: string }) => {
        // Emit to all users interested in this job
        io.to(`job:${data.jobId}`).emit("jobStatusChanged", {
          jobId: data.jobId,
          status: data.status,
          updatedBy: data.userId,
          timestamp: new Date(),
        });
      }
    );

    // Handle proposal updates
    socket.on(
      "proposalUpdate",
      (data: { proposalId: string; status: string; userId: string }) => {
        // Emit to proposal owner
        io.to(`proposal:${data.proposalId}`).emit("proposalStatusChanged", {
          proposalId: data.proposalId,
          status: data.status,
          updatedBy: data.userId,
          timestamp: new Date(),
        });
      }
    );

    // Handle contract updates
    socket.on(
      "contractUpdate",
      (data: { contractId: string; status: string; userId: string }) => {
        // Emit to contract participants
        io.to(`contract:${data.contractId}`).emit("contractStatusChanged", {
          contractId: data.contractId,
          status: data.status,
          updatedBy: data.userId,
          timestamp: new Date(),
        });
      }
    );

    // Handle time tracking updates
    socket.on(
      "timeTrackingUpdate",
      (data: { contractId: string; timeEntry: any; userId: string }) => {
        // Emit to contract participants
        io.to(`contract:${data.contractId}`).emit("timeTrackingUpdated", {
          contractId: data.contractId,
          timeEntry: data.timeEntry,
          updatedBy: data.userId,
          timestamp: new Date(),
        });
      }
    );

    // Handle payment notifications
    socket.on(
      "paymentNotification",
      (data: { userId: string; amount: number; type: string }) => {
        const userSocketId = onlineUsers.get(data.userId);
        if (userSocketId) {
          io.to(userSocketId).emit("paymentReceived", {
            amount: data.amount,
            type: data.type,
            timestamp: new Date(),
          });
        }
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.userId}`);

      // Remove user from online users
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("userOffline", { userId: socket.userId });
      }
    });
  });

  // Handle server-wide events
  io.on("error", (error) => {
    logger.error("Socket.IO error:", error);
  });
};
