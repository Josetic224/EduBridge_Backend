// helpers/aiEscalation.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { askAI } = require("./ai");
const User = require("../models/User");
const Course = require("../models/Course");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

// The escalation trigger phrase that indicates the AI is suggesting escalation
const ESCALATION_TRIGGER = "I'll escalate this to a qualified lecturer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes a message to determine the subject area and complexity
 * @param {string} message The message to analyze
 * @returns {Promise<{subject: string, complexity: number, keywords: string[]}>}
 */
async function analyzeQuery(message) {
  try {
    const analyzerModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    
    const prompt = `
    Analyze the following educational query and provide:
    1. The primary subject area (e.g., Mathematics, Computer Science, Physics)
    2. A complexity score from 1-10 (where 1 is very basic and 10 is extremely advanced)
    3. Extract 3-5 key technical terms or concepts from the query
    
    Format your response as JSON with the following structure:
    {
      "subject": "subject name",
      "complexity": number,
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
    
    Query: "${message}"
    `;
    
    const result = await analyzerModel.generateContent(prompt);
    const analysisText = result.response.text();
    
    // Extract the JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      subject: "General",
      complexity: 5,
      keywords: []
    };
  } catch (error) {
    console.error("Query Analysis Error:", error.message);
    return {
      subject: "General",
      complexity: 5,
      keywords: []
    };
  }
}

/**
 * Finds the most suitable lecturer for a given query based on subject expertise
 * @param {string} subject The subject of the query
 * @param {string[]} keywords Keywords from the query
 * @returns {Promise<Object|null>} The most suitable lecturer or null if none found
 */
async function findSuitableLecturer(subject, keywords) {
  try {
    // First, try to find lecturers who teach courses related to the subject
    const relatedCourses = await Course.find({
      $or: [
        { title: { $regex: subject, $options: 'i' } },
        { description: { $regex: subject, $options: 'i' } },
        { department: { $regex: subject, $options: 'i' } }
      ]
    }).populate('lecturer');
    
    if (relatedCourses.length > 0) {
      // Create a map of lecturers with a count of how many related courses they teach
      const lecturerMap = {};
      
      relatedCourses.forEach(course => {
        const lecturerId = course.lecturer._id.toString();
        if (!lecturerMap[lecturerId]) {
          lecturerMap[lecturerId] = {
            lecturer: course.lecturer,
            count: 0,
            keywordMatches: 0
          };
        }
        
        lecturerMap[lecturerId].count += 1;
        
        // Check if course title or description contains any of the keywords
        keywords.forEach(keyword => {
          if (
            course.title.toLowerCase().includes(keyword.toLowerCase()) ||
            course.description.toLowerCase().includes(keyword.toLowerCase())
          ) {
            lecturerMap[lecturerId].keywordMatches += 1;
          }
        });
      });
      
      // Convert to array and sort by keyword matches first, then by course count
      const sortedLecturers = Object.values(lecturerMap).sort((a, b) => {
        if (b.keywordMatches !== a.keywordMatches) {
          return b.keywordMatches - a.keywordMatches;
        }
        return b.count - a.count;
      });
      
      if (sortedLecturers.length > 0) {
        return sortedLecturers[0].lecturer;
      }
    }
    
    // If no suitable lecturer found by courses, find any lecturer
    const anyLecturer = await User.findOne({ role: "LECTURER" });
    return anyLecturer;
  } catch (error) {
    console.error("Error finding suitable lecturer:", error);
    return null;
  }
}

/**
 * Creates or finds a chat room between a student and a lecturer
 * @param {string} studentId The student's user ID
 * @param {string} lecturerId The lecturer's user ID
 * @returns {Promise<Object>} The chat room object
 */
async function getOrCreateChatRoom(studentId, lecturerId) {
  try {
    // Check if a chat room already exists between these users
    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [studentId, lecturerId] },
    });
    
    // If no chat room exists, create one
    if (!chatRoom) {
      chatRoom = new ChatRoom({
        participants: [studentId, lecturerId],
        isEscalated: true,
      });
      await chatRoom.save();
    } else if (!chatRoom.isEscalated) {
      // If chat room exists but isn't marked as escalated, update it
      chatRoom.isEscalated = true;
      await chatRoom.save();
    }
    
    return chatRoom;
  } catch (error) {
    console.error("Error creating/finding chat room:", error);
    throw error;
  }
}

/**
 * Handles the escalation of a query from AI to a human lecturer
 * @param {string} userId The user ID of the student
 * @param {string} message The original message from the student
 * @param {string} aiResponse The AI's response to the message
 * @param {Object} io The Socket.IO instance
 * @returns {Promise<{success: boolean, chatRoomId: string, lecturerId: string}>}
 */
async function handleQueryEscalation(userId, message, aiResponse, io) {
  try {
    // Get the student user
    const student = await User.findById(userId);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Analyze the query to determine subject and keywords
    const analysis = await analyzeQuery(message);
    
    // Find a suitable lecturer based on the subject and keywords
    const lecturer = await findSuitableLecturer(analysis.subject, analysis.keywords);
    if (!lecturer) {
      throw new Error("No suitable lecturer found");
    }
    
    // Create or find a chat room between the student and lecturer
    const chatRoom = await getOrCreateChatRoom(userId, lecturer._id);
    
    // Create a message in the chat room with the original query
    const studentMessage = new Message({
      room: chatRoom._id,
      sender: userId,
      content: message,
    });
    await studentMessage.save();
    
    // Create a system message indicating the escalation
    const systemMessage = new Message({
      room: chatRoom._id,
      sender: null, // System message
      content: `This question has been escalated from AI assistance. 
Original question: "${message}"
AI response: "${aiResponse}"
Subject: ${analysis.subject}
Complexity: ${analysis.complexity}/10
Keywords: ${analysis.keywords.join(", ")}`,
    });
    await systemMessage.save();
    
    // Notify the lecturer about the escalated query
    if (io) {
      io.to(lecturer._id.toString()).emit('new-escalated-chat', {
        chatRoomId: chatRoom._id,
        studentName: student.userName,
        message: message,
        timestamp: new Date(),
      });
    }
    
    return {
      success: true,
      chatRoomId: chatRoom._id,
      lecturerId: lecturer._id,
    };
  } catch (error) {
    console.error("Error handling query escalation:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Enhanced version of askAI that includes escalation detection
 * @param {string} message The message to send to the AI
 * @returns {Promise<{answer: string, shouldEscalate: boolean}|{error: string}>}
 */
async function askAIWithEscalation(message) {
  try {
    const result = await askAI(message);
    
    if (result.error) {
      return result;
    }
    
    // Check if the answer contains the escalation trigger phrase
    const shouldEscalate = result.answer.includes(ESCALATION_TRIGGER);
    
    return {
      answer: result.answer,
      shouldEscalate
    };
  } catch (error) {
    console.error("AI Escalation Error:", error.message);
    return { error: "Failed to process AI response with escalation." };
  }
}

module.exports = {
  askAIWithEscalation,
  handleQueryEscalation,
  analyzeQuery,
  ESCALATION_TRIGGER
};