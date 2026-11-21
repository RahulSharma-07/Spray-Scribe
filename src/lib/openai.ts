import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not defined in the environment variables.");
}

const openai = new OpenAI({
  apiKey: apiKey || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export default openai;
