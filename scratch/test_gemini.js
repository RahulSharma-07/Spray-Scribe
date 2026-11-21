require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GROQ_API_KEY=);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello!");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (error) {
    console.error("Test Error:", error);
  }
}

test();
