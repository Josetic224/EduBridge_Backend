const socketIo = require("socket.io");
const { decodeToken } = require("./helpers/token");
const User = require("./models/User");
const ChatRoom = require("./models/ChatRoom");
const Message = require("./models/Message");
const socketController = require("./controllers/socket.controller");

// Centralized logging utility
const logger = {
    info: (message, ...args) => {
        console.log(`[Socket:INFO] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[Socket:ERROR] ${message}`, ...args);
    },
    debug: (message, ...args) => {
        console.debug(`[Socket:DEBUG] ${message}`, ...args);
    }
};

/**
 * Initialize Socket.IO with the HTTP server
 * @param {Object} http - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
function initializeSocket(http) {
    const io = socketIo(http, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Initialize the socket controller
    socketController.initialize(io);

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error("Authentication token is required"));
            }
            
            const decoded = decodeToken(token, process.env.JWT_SECRET);
            
            if (!decoded || !decoded.user || !decoded.user.userId) {
                return next(new Error("Invalid authentication token"));
            }
            
            // Find the user
            const user = await User.findById(decoded.user.userId);
            
            if (!user) {
                return next(new Error("User not found"));
            }
            
            // Attach user to socket
            socket.user = {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role
            };
            
            next();
        } catch (error) {
            logger.error("Socket authentication error:", error);
            next(new Error("Authentication failed"));
        }
    });

    // Handle socket connections
    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();
        
        logger.info("User connected", { userId, userName: socket.user.userName });
        
        // Join user's personal room for direct messages
        socket.join(userId);
        
        // Handle joining a chat room
        socket.on("join-room", async (data) => {
            try {
                const { chatRoomId } = data;
                
                // Check if the chat room exists and the user is a participant
                const chatRoom = await ChatRoom.findOne({
                    _id: chatRoomId,
                    participants: userId
                });
                
                if (!chatRoom) {
                    socket.emit("error", { message: "Chat room not found or you don't have access" });
                    return;
                }
                
                socket.join(chatRoomId);
                logger.debug("User joined room", { userId, chatRoomId });
                
                // Notify other participants that the user has joined
                socket.to(chatRoomId).emit("user-joined", {
                    userId,
                    userName: socket.user.userName
                });
            } catch (error) {
                logger.error("Error joining room:", error);
                socket.emit("error", { message: "Failed to join chat room" });
            }
        });
        
        // Handle sending a message in a chat room
        socket.on("send-message", async (data) => {
            try {
                const { chatRoomId, content } = data;
                
                // Validate input
                if (!chatRoomId || !content) {
                    socket.emit("error", { message: "Chat room ID and message content are required" });
                    return;
                }
                
                // Check if the chat room exists and the user is a participant
                const chatRoom = await ChatRoom.findOne({
                    _id: chatRoomId,
                    participants: userId
                });
                
                if (!chatRoom) {
                    socket.emit("error", { message: "Chat room not found or you don't have access" });
                    return;
                }
                
                // Create and save the message
                const newMessage = new Message({
                    room: chatRoomId,
                    sender: userId,
                    content
                });
                
                await newMessage.save();
                
                // Populate sender information
                await newMessage.populate({
                    path: 'sender',
                    select: 'userName email profileImage role'
                });
                
                // Emit the message to all participants in the room
                io.to(chatRoomId).emit("new-message", {
                    chatRoomId,
                    message: newMessage
                });
                
                // If the sender is a lecturer and the chat is escalated, mark it as resolved
                if (socket.user.role === "LECTURER" && chatRoom.isEscalated) {
                    chatRoom.isEscalated = false;
                    await chatRoom.save();
                }
                
                logger.debug("Message sent", { userId, chatRoomId });
            } catch (error) {
                logger.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        
        // Handle student messages to AI
        socket.on("student-message", async (data) => {
            try {
                const { message } = data;
                
                // Validate input
                if (!message) {
                    socket.emit("error", { message: "Message content is required" });
                    return;
                }
                
                // Process the message through the socket controller's test endpoint
                // This is a workaround to reuse the existing logic
                const mockReq = {
                    headers: {
                        authorization: `Bearer ${socket.handshake.auth.token}`
                    },
                    body: {
                        message
                    }
                };
                
                const mockRes = {
                    status: (code) => ({
                        json: (data) => {
                            if (code >= 400) {
                                socket.emit("error", data);
                            } else {
                                // Success is handled by the socket controller directly
                            }
                        }
                    })
                };
                
                await socketController.testSocketMessage(mockReq, mockRes);
                
                logger.debug("Student message processed", { userId });
            } catch (error) {
                logger.error("Error processing student message:", error);
                socket.emit("error", { message: "Failed to process message" });
            }
        });
        
        // Handle disconnection
        socket.on("disconnect", () => {
            logger.info("User disconnected", { userId });
        });
    });

    return io;
}

module.exports = initializeSocket;