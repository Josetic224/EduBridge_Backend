const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");
const { askAI } = require("../helpers/ai");


function detectSubject(message = "") {
  const lower = message.toLowerCase();

  if (lower.includes("theorem") || lower.includes("proof")) return "Mathematics";
  if (lower.includes("react") || lower.includes("frontend")) return "Frontend Development";
  if (lower.includes("sorting") || lower.includes("algorithm")) return "Algorithms";

  return null; // No subject matched
}

module.exports = (io) => {  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("student-message", async (data) => {
        const { userId, message } = data || {};
      
        if (!userId || !message || typeof message !== "string") {
          return socket.emit("ai-response", {
            message: "Invalid input. Provide both userId and message.",
          });
        }
      
        const subject = detectSubject(message);
      
        // Use Gemini AI to attempt response first
        if (!subject) {
          const aiResult = await askAI(message);
      
          if (aiResult.error) {
            return socket.emit("ai-response", {
              message: "AI failed to answer. Escalating to a lecturer.",
            });
          }
      
          return socket.emit("ai-response", {
            message: aiResult.answer,
          });
        }
      
        // Escalation to subject-specific lecturer
        const lecturer = await User.findOne({
          role: "LECTURER",
          subjects: subject,
        });
      
        if (!lecturer) {
          return socket.emit("ai-response", {
            message: `No lecturer available for subject: ${subject}`,
          });
        }
      
        const chatRoom = await ChatRoom.create({
          participants: [userId, lecturer._id],
          isEscalated: true,
        });
      
        await Message.create({
          room: chatRoom._id,
          sender: userId,
          content: message,
        });
      
        socket.emit("ai-response", {
          message: "Your question has been escalated to a lecturer.",
          roomId: chatRoom._id,
        });
      
        io.to(lecturer._id.toString()).emit("new-escalated-chat", {
          from: userId,
          roomId: chatRoom._id,
          message,
        });
      });
      
    // JOIN ROOM FOR LECTURERS & STUDENTS
    socket.on("join-room", ({ userId }) => {
      socket.join(userId);
    });

    // SEND CHAT MESSAGE
    socket.on("send-message", async ({ roomId, senderId, content }) => {
      if (!roomId || !senderId || !content) return;

      await Message.create({
        room: roomId,
        sender: senderId,
        content,
      });

      const room = await ChatRoom.findById(roomId).populate("participants");

      room.participants.forEach((user) => {
        io.to(user._id.toString()).emit("new-message", {
          roomId,
          senderId,
          content,
        });
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
