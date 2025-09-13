import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/fill-product", async (req, res) => {
  const { text } = req.body;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI that fills product forms in JSON format. The user will speak a description of the product.
            
Instruction:
Based on this speech: "${text}", return only a valid **JSON object**, strictly matching:

{
  "name": "Product name as string",
  "imgurl": "A placeholder image URL or relevant one if mentioned",
  "price": "Numeric price value (no ₹ symbol)",
  "quantity": "Numeric stock quantity",
  "costprice": "Numeric cost price",
  "description": "One-line product description"
}

Respond with **only** the JSON object. No symbols like *, -, ~. No markdown. No explanation. Only pure JSON.`,
            },
          ],
        },
      ],
    });

    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    console.log("Gemini raw response:", raw);

    let output = {};
    try {
      output = JSON.parse(raw);
    } catch (e) {
      console.error("Parse error:", e);
      return res.status(400).json({ error: "Invalid JSON format", output: raw });
    }

    res.json({ output });
  } catch (err) {
    console.error("Gemini fill-product route error:", err.message);
    res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;
