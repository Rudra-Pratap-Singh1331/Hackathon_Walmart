import express from "express";
import ProductSold from "../model/productSoldModel.js";
import Product from "../model/productModel.js";
import Carts from "../model/CartModel.js";
import protect from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/add", protect, async (req, res) => {
  try {
    const { products } = req.body;
    const userId = req.user._id;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    const sales = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      if (!product.imgUrl) {
        return res.status(400).json({ message: `Product "${product.name}" is missing imgUrl.` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.quantity} units available for ${product.name}`,
        });
      }

      const sellingPrice = product.price;
      const costPrice = product.costprice;
      const totalAmount = sellingPrice * item.quantity;
      const profit = (sellingPrice - costPrice) * item.quantity;

      sales.push({
        userId,
        productId: product._id,
        name: product.name,
        imgUrl: product.imgUrl,
        price: sellingPrice,
        costprice: costPrice,
        quantitySold: item.quantity,
        totalRevenue: totalAmount,
        category: product.category,
        profit,
        soldAt: new Date(),
      });

      product.quantity -= item.quantity;
      product.totalSold += item.quantity;
      await product.save();
    }

    await ProductSold.insertMany(sales);

    // Optional: reward loyalty points
    const cart = await Carts.findOne({ userId });
    if (cart) {
      cart.loyaltyPoints = (cart.loyaltyPoints || 0) + 10;
      await cart.save();
    }

    await Carts.deleteOne({ userId });

    res.status(201).json({ message: "Products purchased and recorded" });
  } catch (err) {
    console.error("Sales error:", err);
    res.status(500).json({ message: "Failed to complete sale", error: err.message });
  }
});

export default router;
