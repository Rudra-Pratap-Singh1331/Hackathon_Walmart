// routes/ai.js
import express from "express";
import geminiIngredientInfo from "../utils/gemini.js";

const router = express.Router();

router.post("/ingredient-info", async (req, res) => {
  const { productName } = req.body;
  if (!productName) {
    return res.status(400).json({ message: "Product name is required" });
  }

  const output = await geminiIngredientInfo(productName);
  if (!output) {
    return res.status(500).json({ message: "AI failed to generate response" });
  }

  try {
    const parsed = JSON.parse(output);
    res.json({ ...parsed });
  } catch (err) {
    console.error("Parse error:", err.message);
    res.json({ raw: output, message: "Failed to parse structured response, showing raw" });
  }
});

export default router;
