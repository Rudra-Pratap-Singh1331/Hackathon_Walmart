import express from "express";
import Product from "../model/productModel.js";

const router = express.Router();

// 🔹 GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
