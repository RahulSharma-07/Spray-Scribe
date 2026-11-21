const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listAll() {
  try {
    // Note: The JS SDK doesn't have a direct listModels method in all versions.
    // We might need to use fetch.
    const apiKey = "AIzaSyBoJm_na84rvszZihp8KP24B6hzdhVP3BM";
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await resp.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

listAll();
