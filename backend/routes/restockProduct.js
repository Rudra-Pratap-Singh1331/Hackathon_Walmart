// routes/restockproducts.js
import express from "express";
import Product from "../model/productModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ error: "Product ID and quantity are required." });
  }

  try {
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $inc: { quantity: parseInt(quantity) } },
      { new: true, runValidators: false } // Disable validation here!
    );

    if (!updated) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json({ message: "Restocked successfully", updated });
  } catch (err) {
    console.error("Restock error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
