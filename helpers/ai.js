// helpers/ai.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `
You are a smart, friendly educational assistant for an online learning platform called EduBridge.

Your job is to help students by answering questions in clear, simple terms.

Only answer questions that are direct, general, and easy to explain (such as “What is recursion?” or “What is a function in JavaScript?”). Keep your tone polite and educational.

If a question is complex, requires deep subject expertise, is too vague, or you are unsure about the answer, do **not** guess. Instead, respond with:

“This is a great question, but it’s a bit advanced. I’ll escalate this to a qualified lecturer for a detailed response.”

Do not generate code or long explanations unless it’s clearly a simple topic.

Always prioritize accuracy, clarity, and helpful tone.
  `,
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

async function askAI(message) {
  try {
    const chat = model.startChat({ generationConfig });
    const result = await chat.sendMessage(message);
    const answer = result.response.text();

    return { answer };
  } catch (error) {
    console.error("Gemini AI Error:", error.message);
    return { error: "Gemini AI failed to respond." };
  }
}

module.exports = { askAI };
