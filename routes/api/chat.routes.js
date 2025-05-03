const express = require("express");
const { Router } = express;
const { isAuthenticated } = require("../../middlewares/auth");
const { flexibleAuthentication } = require("../../middlewares/flexible-auth");
const {
    getUserChatRooms,
    getChatRoomMessages,
    getEscalatedChats,
    sendChatMessage,
    createChatWithLecturer
} = require("../../controllers/chat.controller");

const chatRouter = Router();

// Get all chat rooms for a user
chatRouter.get("/", flexibleAuthentication, getUserChatRooms);

// Get all escalated chats (for lecturers only)
chatRouter.get("/escalated", flexibleAuthentication, getEscalatedChats);

// Create a chat room with a lecturer
chatRouter.post("/create-with-lecturer/:lecturerId", flexibleAuthentication, createChatWithLecturer);

// Get messages for a specific chat room
chatRouter.get("/:chatRoomId/messages", flexibleAuthentication, getChatRoomMessages);

// Send a message in a chat room
chatRouter.post("/:chatRoomId/messages", flexibleAuthentication, sendChatMessage);

module.exports = chatRouter;