// routes/sales.js
import express from "express";
import Product from "../model/productModel.js";
import ProductSold from "../model/productSoldModel.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !products || products.length === 0) {
      return res.status(400).json({ message: "Missing sales data" });
    }

    const entries = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const totalRevenue = product.price * item.quantity;
const profit = (product.price - product.costprice) * item.quantity;


      entries.push({
        userId,
        productId: product._id,
        name: product.name,
        imgurl: product.imgurl,
        price: product.price,
        costprice: product.costprice,
        quantitySold: item.quantity,
        totalRevenue,
        profit,
        category: product.category,
      });

      product.totalSold += item.quantity;
      product.quantity -= item.quantity;

      if (product.quantity < 0) product.quantity = 0; // don't allow negative stock

      await product.save();
    }

    await ProductSold.insertMany(entries);

    res.status(201).json({ message: "Products marked as sold" });
  } catch (err) {
    console.error("Sales error:", err.message);
    res.status(500).json({ message: "Failed to add sales", error: err.message });
  }
});


export default router;
