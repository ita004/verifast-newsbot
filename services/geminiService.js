const axios = require('axios');

async function generateGeminiResponse(prompt) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    }
  );

  return res.data.candidates[0].content.parts[0].text;
}

module.exports = { generateGeminiResponse };