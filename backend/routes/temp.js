// routes/migrate.js
import express from "express";
import Product from "../model/productModel.js"; // Adjust path if needed

const router = express.Router();

router.get("/migrate-imgurl", async (req, res) => {
  try {
    const productsToUpdate = await Product.find({
      imgurl: { $exists: true },
      imgUrl: { $exists: false },
    });

    let updatedCount = 0;

    for (let product of productsToUpdate) {
      product.imgUrl = product.imgurl;
      product.imgurl = undefined;
      await product.save();
      updatedCount++;
    }

    res.status(200).json({
      message: "Migration complete",
      updated: updatedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ message: "Migration failed", error: error.message });
  }
});

export default router;
