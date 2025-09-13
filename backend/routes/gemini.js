// backend/routes/gemini.js
import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cleanText = (text) => {
  return text
    .replace(/[*_`~#>\[\](){}]/g, "")
    .replace(/^\s*[-•]\s*/gm, "• ")
    .replace(/(?<!\n)• /g, "\n• ") // ensure each bullet starts on a new line
    .replace(/\$\s?(\d+)/g, (match, amt) => "₹" + Number(amt).toLocaleString("en-IN"))
    .trim();
};

router.post("/summarize", async (req, res) => {
  try {
    const { query, dashboardData, marketData } = req.body;

    let prompt = "";

    if (query.toLowerCase().includes("thanku") || query.toLowerCase().includes("thanks")) {
      prompt = `
You are a helpful AI assistant.

You are a smart and helpful AI assistant trained to analyze business performance and market trends.
while answering be precise and make sure your answer is consice not too big

Dashboard Data: 
${JSON.stringify(dashboardData, null, 2)}
You are a smart and friendly virtual assistant designed to help users with their queries in a clear, concise, and helpful manner. 

  Your response format must be:
{
  "type": "general" | "google-search" | "greeting" | "thanku" ,
  "response": "string to speak or show",
}
Your role is to:
1. Understand the user's intent based on their input (whether it's a question, command, or casual chat).
2. Provide accurate and meaningful answers or take necessary steps based on the prompt.
3. Keep your responses short and relevant unless detailed information is explicitly requested.
4. Always maintain a helpful, respectful, and positive tone.
5. If a task involves summarizing, translating, or answering technical questions, perform it accurately and explain your reasoning if required.
6. If you are unable to answer something due to insufficient context, ask the user to clarify.
7. Avoid hallucinating or assuming facts not provided or verifiable.

Instruction : 
-"response" : A short voice freindly response e.g "sure" , playin it now ", navigating to" , etc
You will now act as a virtual assistant in a dashboard environment, capable of providing summaries, analysis, navigation help, and insights from the data provided.
type meaning:
-"general" : if its a factual or informational questioon

Wait for the user input and respond accordingly.
- Keep the summary short and clear.
- Use ₹ currency.
- Do not include symbols like *, _, ~.
- Ensure each bullet point starts on a new line.
      `;
    } else {
      prompt = `
You are a smart and helpful AI assistant trained to analyze business performance and market trends.
while answering be precise and make sure your answer is consice not too big
User Question: ${query}

Internal Business Data:
${JSON.stringify(dashboardData, null, 2)}

Latest Market Best Seller Data:
${JSON.stringify(marketData, null, 2)}

Now, using both internal insights , generate practical and strategic recommendations:
- Format all responses as concise bullet points.
- Use Indian currency (₹) wherever price or value is mentioned.
- Avoid special characters like *, _, ~, or symbols that can confuse voice output.
- Begin each bullet point on a new line.
- Suggestions may include what to stock more of, remove, promote, or add.
- Keep the tone professional and direct.
also gove answer related to genral question that are not the part of dashboard using your intelligence      

`;
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    let output = result.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated";
    output = cleanText(output);

    res.status(200).json({ output });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

export default router;
