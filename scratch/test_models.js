require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyBoJm_na84rvszZihp8KP24B6hzdhVP3BM");
    // Listing models is not directly available in the standard JS SDK without a separate fetch or specialized client.
    // But we can try a few common names.
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("Hi");
        console.log(`Success with ${m}`);
        return;
      } catch (e) {
        console.log(`Failed with ${m}: ${e.message}`);
      }
    }
  } catch (error) {
    console.error("Test Error:", error);
  }
}

listModels();
