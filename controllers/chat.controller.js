const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Centralized logging utility
const logger = {
    info: (message, ...args) => {
        console.log(`[ChatController:INFO] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ChatController:ERROR] ${message}`, ...args);
    },
    debug: (message, ...args) => {
        console.debug(`[ChatController:DEBUG] ${message}`, ...args);
    }
};

/**
 * Get all chat rooms for a user
 * @route GET /api/chats
 * @access Private
 */
const getUserChatRooms = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find all chat rooms where the user is a participant
        const chatRooms = await ChatRoom.find({
            participants: userId
        }).populate({
            path: 'participants',
            select: 'userName email profileImage role'
        });
        
        // For each chat room, get the last message
        const chatRoomsWithLastMessage = await Promise.all(
            chatRooms.map(async (room) => {
                const lastMessage = await Message.findOne({ room: room._id })
                    .sort({ createdAt: -1 })
                    .populate({
                        path: 'sender',
                        select: 'userName'
                    });
                
                // Filter out the current user from participants
                const otherParticipants = room.participants.filter(
                    participant => participant._id.toString() !== userId.toString()
                );
                
                return {
                    _id: room._id,
                    participants: otherParticipants,
                    isEscalated: room.isEscalated,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        sender: lastMessage.sender ? lastMessage.sender.userName : 'System',
                        createdAt: lastMessage.createdAt
                    } : null
                };
            })
        );
        
        return res.status(200).json({
            success: true,
            data: chatRoomsWithLastMessage
        });
    } catch (error) {
        logger.error("Error fetching chat rooms:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch chat rooms",
            details: error.message
        });
    }
};

/**
 * Get messages for a specific chat room
 * @route GET /api/chats/:chatRoomId/messages
 * @access Private
 */
const getChatRoomMessages = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const userId = req.user._id;
        
        // Check if the chat room exists and the user is a participant
        const chatRoom = await ChatRoom.findOne({
            _id: chatRoomId,
            participants: userId
        });
        
        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                error: "Chat room not found or you don't have access"
            });
        }
        
        // Get messages for the chat room
        const messages = await Message.find({ room: chatRoomId })
            .sort({ createdAt: 1 })
            .populate({
                path: 'sender',
                select: 'userName email profileImage role'
            });
        
        return res.status(200).json({
            success: true,
            data: {
                chatRoom,
                messages
            }
        });
    } catch (error) {
        logger.error("Error fetching chat room messages:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch chat room messages",
            details: error.message
        });
    }
};

/**
 * Get all escalated chats (for lecturers only)
 * @route GET /api/chats/escalated
 * @access Private (Lecturer only)
 */
const getEscalatedChats = async (req, res) => {
    try {
        // Check if the user is a lecturer
        if (req.user.role !== "LECTURER") {
            return res.status(403).json({
                success: false,
                error: "Only lecturers can access escalated chats"
            });
        }
        
        const userId = req.user._id;
        
        // Find all escalated chat rooms where the lecturer is a participant
        const chatRooms = await ChatRoom.find({
            participants: userId,
            isEscalated: true
        }).populate({
            path: 'participants',
            select: 'userName email profileImage role'
        });
        
        // For each chat room, get the last message
        const chatRoomsWithLastMessage = await Promise.all(
            chatRooms.map(async (room) => {
                const lastMessage = await Message.findOne({ room: room._id })
                    .sort({ createdAt: -1 })
                    .populate({
                        path: 'sender',
                        select: 'userName'
                    });
                
                // Get the student participant
                const student = room.participants.find(
                    participant => participant.role === "STUDENT"
                );
                
                return {
                    _id: room._id,
                    student,
                    isEscalated: room.isEscalated,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        sender: lastMessage.sender ? lastMessage.sender.userName : 'System',
                        createdAt: lastMessage.createdAt
                    } : null
                };
            })
        );
        
        return res.status(200).json({
            success: true,
            data: chatRoomsWithLastMessage
        });
    } catch (error) {
        logger.error("Error fetching escalated chats:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch escalated chats",
            details: error.message
        });
    }
};

/**
 * Send a message in a chat room
 * @route POST /api/chats/:chatRoomId/messages
 * @access Private
 */
const sendChatMessage = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;
        
        // Validate input
        if (!content || typeof content !== "string") {
            return res.status(400).json({
                success: false,
                error: "Message content is required and must be a string"
            });
        }
        
        // Check if the chat room exists and the user is a participant
        const chatRoom = await ChatRoom.findOne({
            _id: chatRoomId,
            participants: userId
        });
        
        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                error: "Chat room not found or you don't have access"
            });
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
        
        // Emit socket event to all participants
        const io = req.app.get('io');
        if (io) {
            chatRoom.participants.forEach(participantId => {
                if (participantId.toString() !== userId.toString()) {
                    io.to(participantId.toString()).emit('new-message', {
                        chatRoomId,
                        message: newMessage
                    });
                }
            });
        }
        
        // If the sender is a lecturer and the chat is escalated, mark it as resolved
        if (req.user.role === "LECTURER" && chatRoom.isEscalated) {
            chatRoom.isEscalated = false;
            await chatRoom.save();
        }
        
        return res.status(201).json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        logger.error("Error sending chat message:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to send message",
            details: error.message
        });
    }
};

/**
 * Create a chat room between a student and a lecturer they follow
 * @route POST /api/chats/create-with-lecturer/:lecturerId
 * @access Private (Student only)
 */
const createChatWithLecturer = async (req, res) => {
    try {
        const { lecturerId } = req.params;
        const userId = req.user._id;
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(lecturerId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid ID format." 
            });
        }
        
        // Check if the user is a student
        const student = await User.findById(userId);
        if (!student) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        if (student.role !== "STUDENT") {
            return res.status(403).json({ 
                success: false,
                error: "Only students can initiate chats with lecturers" 
            });
        }
        
        // Check if the lecturer exists
        const lecturer = await User.findOne({ 
            _id: lecturerId, 
            role: "LECTURER",
            isActive: true 
        });
        
        if (!lecturer) {
            return res.status(404).json({ 
                success: false,
                error: "Lecturer not found" 
            });
        }
        
        // Check if the student follows this lecturer
        if (!student.followedLecturers || !student.followedLecturers.some(id => id.toString() === lecturerId)) {
            return res.status(403).json({ 
                success: false,
                error: "You can only chat with lecturers you follow" 
            });
        }
        
        // Check if a chat room already exists between these users
        let chatRoom = await ChatRoom.findOne({
            participants: { $all: [userId, lecturerId] }
        });
        
        // If no chat room exists, create one
        if (!chatRoom) {
            chatRoom = new ChatRoom({
                participants: [userId, lecturerId]
            });
            await chatRoom.save();
            
            // Create a welcome message
            const welcomeMessage = new Message({
                room: chatRoom._id,
                sender: null, // System message
                content: `Chat started between ${student.userName} and ${lecturer.userName}.`
            });
            await welcomeMessage.save();
        }
        
        // Populate the chat room with participant details
        await chatRoom.populate({
            path: 'participants',
            select: 'userName email profileImage role'
        });
        
        // Get the last message in the chat room
        const lastMessage = await Message.findOne({ room: chatRoom._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'sender',
                select: 'userName'
            });
        
        // Format the response
        const response = {
            _id: chatRoom._id,
            participants: chatRoom.participants.filter(
                participant => participant._id.toString() !== userId.toString()
            ),
            isEscalated: chatRoom.isEscalated,
            createdAt: chatRoom.createdAt,
            updatedAt: chatRoom.updatedAt,
            lastMessage: lastMessage ? {
                content: lastMessage.content,
                sender: lastMessage.sender ? lastMessage.sender.userName : 'System',
                createdAt: lastMessage.createdAt
            } : null
        };
        
        return res.status(200).json({
            success: true,
            message: "Chat room created successfully",
            data: response
        });
    } catch (error) {
        logger.error("Error creating chat with lecturer:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to create chat with lecturer",
            details: error.message
        });
    }
};

module.exports = {
    getUserChatRooms,
    getChatRoomMessages,
    getEscalatedChats,
    sendChatMessage,
    createChatWithLecturer
};