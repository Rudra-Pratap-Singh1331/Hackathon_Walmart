import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const geminiIngredientInfo = async (productName) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const prompt = `
You are a helpful AI. Provide a short summary of the food product "${productName}" in valid JSON format.

Strictly follow this JSON structure:

{
  "ingredients": ["..."],
  "nutritionalContent": ["..."],
  "benefits": ["..."],
  "disadvantages": ["..."]
}

- Each field must be an array of short strings.
- Do NOT include any markdown (like ** or -).
- Do NOT include any text outside the JSON.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    throw err;
  }
};
export default geminiIngredientInfo;