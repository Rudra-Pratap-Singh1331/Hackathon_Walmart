import express from "express";
import Product from "../model/productModel.js";

const router = express.Router();

// GET /api/search?q=samsung mobile phone
router.get("/", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "No search query provided" });
  }

  // Split the query into words
  const keywords = query.split(" ").filter(Boolean);

  try {
    // Create a regex OR condition for each keyword
    const conditions = keywords.map((word) => ({
      $or: [
        { name: { $regex: word, $options: "i" } },
        { description: { $regex: word, $options: "i" } },
        { category: { $regex: word, $options: "i" } },
      ],
    }));

    // Match all keywords
    const products = await Product.find({ $and: conditions });

    res.json(products);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
