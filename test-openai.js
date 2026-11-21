const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10,
    });
    console.log("✅ Success:", completion.choices[0].message.content);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Code:", error.code);
    console.error("Status:", error.status);
  }
}

test();