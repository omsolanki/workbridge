"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const onlineUsers = new Map();
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth["token"] ||
            socket.handshake.headers.authorization?.split(" ")[1];
        if (!token) {
            return next(new Error("Authentication error"));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env["JWT_SECRET"]);
        const user = await User_1.User.findById(decoded.id).select("-password");
        if (!user) {
            return next(new Error("User not found"));
        }
        socket.userId = user._id.toString();
        socket.user = user;
        next();
    }
    catch (error) {
        next(new Error("Authentication error"));
    }
};
const setupSocketHandlers = (io) => {
    io.use(authenticateSocket);
    io.on("connection", (socket) => {
        logger_1.logger.info(`User connected: ${socket.userId}`);
        if (socket.userId) {
            onlineUsers.set(socket.userId, socket.id);
            io.emit("userOnline", { userId: socket.userId, user: socket.user });
        }
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            logger_1.logger.info(`User ${socket.userId} joined room ${roomId}`);
        });
        socket.on("leaveRoom", (roomId) => {
            socket.leave(roomId);
            logger_1.logger.info(`User ${socket.userId} left room ${roomId}`);
        });
        socket.on("sendMessage", async (data) => {
            try {
                io.to(data.roomId).emit("newMessage", {
                    roomId: data.roomId,
                    message: data.message,
                    senderId: data.senderId,
                    timestamp: new Date(),
                });
                const receiverSocketId = onlineUsers.get(data.receiverId);
                if (receiverSocketId && receiverSocketId !== socket.id) {
                    io.to(receiverSocketId).emit("messageNotification", {
                        senderId: data.senderId,
                        message: data.message,
                        roomId: data.roomId,
                    });
                }
                logger_1.logger.info(`Message sent in room ${data.roomId} by ${data.senderId}`);
            }
            catch (error) {
                logger_1.logger.error("Error sending message:", error);
                socket.emit("messageError", { error: "Failed to send message" });
            }
        });
        socket.on("typing", (data) => {
            socket.to(data.roomId).emit("userTyping", {
                roomId: data.roomId,
                userId: data.userId,
                isTyping: data.isTyping,
            });
        });
        socket.on("stopTyping", (data) => {
            socket.to(data.roomId).emit("userTyping", {
                roomId: data.roomId,
                userId: data.userId,
                isTyping: false,
            });
        });
        socket.on("jobStatusUpdate", (data) => {
            io.to(`job:${data.jobId}`).emit("jobStatusChanged", {
                jobId: data.jobId,
                status: data.status,
                updatedBy: data.userId,
                timestamp: new Date(),
            });
        });
        socket.on("proposalUpdate", (data) => {
            io.to(`proposal:${data.proposalId}`).emit("proposalStatusChanged", {
                proposalId: data.proposalId,
                status: data.status,
                updatedBy: data.userId,
                timestamp: new Date(),
            });
        });
        socket.on("contractUpdate", (data) => {
            io.to(`contract:${data.contractId}`).emit("contractStatusChanged", {
                contractId: data.contractId,
                status: data.status,
                updatedBy: data.userId,
                timestamp: new Date(),
            });
        });
        socket.on("timeTrackingUpdate", (data) => {
            io.to(`contract:${data.contractId}`).emit("timeTrackingUpdated", {
                contractId: data.contractId,
                timeEntry: data.timeEntry,
                updatedBy: data.userId,
                timestamp: new Date(),
            });
        });
        socket.on("paymentNotification", (data) => {
            const userSocketId = onlineUsers.get(data.userId);
            if (userSocketId) {
                io.to(userSocketId).emit("paymentReceived", {
                    amount: data.amount,
                    type: data.type,
                    timestamp: new Date(),
                });
            }
        });
        socket.on("disconnect", () => {
            logger_1.logger.info(`User disconnected: ${socket.userId}`);
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit("userOffline", { userId: socket.userId });
            }
        });
    });
    io.on("error", (error) => {
        logger_1.logger.error("Socket.IO error:", error);
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=socketHandlers.js.map