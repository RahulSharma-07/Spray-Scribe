const OpenAI = require("openai");

async function test() {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Success with OpenAI:", completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Error:", error);
  }
}

test();
