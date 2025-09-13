import express from "express";
import Product from "../model/productModel.js"; // ✅ Add this line

const router = express.Router();

router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;

    const products = await Product.find({ category: category });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
