const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");
const { decodeToken } = require("../helpers/token");
const { askAI } = require("../helpers/ai");
const { askAIWithEscalation, handleQueryEscalation } = require("../helpers/aiEscalation");
require("dotenv").config();

// Centralized logging utility
const logger = {
    info: (message, ...args) => {
        console.log(`[SocketController:INFO] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[SocketController:ERROR] ${message}`, ...args);
    },
    debug: (message, ...args) => {
        console.debug(`[SocketController:DEBUG] ${message}`, ...args);
    }
};

let io; // Socket.io instance global variable

// Initialize socket.io instance
exports.initialize = (socketIo) => {
    io = socketIo;
    logger.info("Socket.IO Controller Initialized", { hasInstance: !!io });
};

// Subject detection function
function detectSubject(message = "") {
    const lower = message.toLowerCase();
  
    const subjectMap = {
        "Mathematics": ["theorem", "proof", "calculus", "algebra"],
        "Frontend Development": ["react", "frontend", "javascript", "html", "css"],
        "Algorithms": ["sorting", "algorithm", "complexity", "data structure"]
    };

    for (const [subject, keywords] of Object.entries(subjectMap)) {
        if (keywords.some(keyword => lower.includes(keyword))) {
            return subject;
        }
    }
  
    return null; // No subject matched
}

// Comprehensive socket message test endpoint
exports.testSocketMessage = async (req, res) => {
    // Comprehensive request logging
    logger.info("Incoming Socket Message Request", {
        headers: JSON.stringify(req.headers, null, 2),
        body: JSON.stringify(req.body, null, 2)
    });
   try {
        // Enhanced token extraction
        const authHeader = req.headers["authorization"];
        logger.debug("Authorization Header", { header: authHeader });   
        const token = authHeader?.split(" ")[1];
        logger.debug("Extracted Token", { token: token ? "Present" : "Missing" });
        
        // Comprehensive token validation
        if (!token) {
            logger.error("No Authorization Token");
            return res.status(401).json({ 
                success: false,
                error: "Authorization token is missing",
                details: "No Bearer token found in Authorization header"
            });
        }

        // Decode token with comprehensive logging
        const decoded = decodeToken(token, process.env.JWT_SECRET);
        logger.debug("Token Decoding Result", { 
            decoded: JSON.stringify(decoded, null, 2) 
        });

        // User ID extraction with validation
        const userId = decoded?.user?.userId;
        if (!userId) {
            logger.error("Invalid Token", { decoded });
            return res.status(400).json({ 
                success: false,
                error: "Invalid token: user ID missing",
                details: "Decoded token does not contain a valid user ID"
            });
        }

        // Message validation
        const { message } = req.body;
        if (!message || typeof message !== "string") {
            logger.error("Invalid Message", { message });
            return res.status(400).json({ 
                success: false,
                error: 'Message is required and must be a string',
                details: `Received: ${JSON.stringify(message)}`
            });
        }

        // Subject detection
        const subject = detectSubject(message);
        logger.info("Message Analysis", {
            userId,
            messageLength: message.length,
            detectedSubject: subject || "No specific subject"
        });

        // AI Response Generation with Escalation Detection
        logger.debug("Calling Gemini AI with Escalation Detection");
        const aiResult = await askAIWithEscalation(message);
        
        if (aiResult.error) {
            logger.error("AI Response Generation Failed", { error: aiResult.error });
            return res.status(500).json({ 
                success: false,
                error: "AI response generation failed",
                details: aiResult.error
            });
        }

        const aiResponse = aiResult.answer;
        const shouldEscalate = aiResult.shouldEscalate;
        
        logger.info("AI Response Generated", { 
            responseLength: aiResponse.length,
            shouldEscalate
        });

        // Socket Event Emission
        if (io) {
            logger.debug("Emitting Socket Event", { 
                userId, 
                eventName: 'ai-response' 
            });

            io.to(userId).emit('ai-response', {
                success: true,
                data: {
                    message: aiResponse,
                    subject,
                    timestamp: new Date(),
                    escalated: shouldEscalate
                }
            });
            
            // Handle escalation if needed
            if (shouldEscalate) {
                logger.info("Escalating query to human lecturer", { userId, subject });
                
                const escalationResult = await handleQueryEscalation(userId, message, aiResponse, io);
                
                if (escalationResult.success) {
                    logger.info("Query successfully escalated", {
                        chatRoomId: escalationResult.chatRoomId,
                        lecturerId: escalationResult.lecturerId
                    });
                    
                    // Notify the student that their query has been escalated
                    io.to(userId).emit('query-escalated', {
                        success: true,
                        data: {
                            message: "Your question has been sent to a lecturer. They will respond in the chat section.",
                            chatRoomId: escalationResult.chatRoomId,
                            timestamp: new Date()
                        }
                    });
                } else {
                    logger.error("Query escalation failed", { error: escalationResult.error });
                }
            }
        } else {
            logger.error("No Socket.IO Instance Available");
        }

        // Database Persistence
        try {
            const newMessage = new Message({
                sender: userId,
                content: message,
                subject,
                aiResponse,
                timestamp: new Date()
            });
            await newMessage.save();
            logger.info("Message Saved to Database");
        } catch (dbError) {
            logger.error("Database Save Failed", { error: dbError });
        }
        
        // Successful Response
        res.status(200).json({
            success: true,
            data: {
                userId,
                message,
                detectedSubject: subject,
                aiResponse
            }
        });

    } catch (error) {
        // Comprehensive Error Handling
        logger.error("Socket Message Processing Failed", {
            errorMessage: error.message,
            errorStack: error.stack
        });

        res.status(500).json({ 
            success: false,
            error: 'Internal server error', 
            details: error.message, 
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Additional utility exports if needed
exports.detectSubject = detectSubject;