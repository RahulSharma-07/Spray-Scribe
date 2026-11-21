const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyBoJm_na84rvszZihp8KP24B6hzdhVP3BM");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello!");
    const response = await result.response;
    console.log("Success with gemini-2.0-flash:", response.text());
  } catch (error) {
    console.error("Test Error:", error);
  }
}

test();
