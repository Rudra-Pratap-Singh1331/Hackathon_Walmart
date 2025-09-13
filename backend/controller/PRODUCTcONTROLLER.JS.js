import Product from "../model/productModel.js";

export const addProduct = async (req, res) => {
  try {
    const { name, imgUrl, quantity, price, costprice, description, category } = req.body;

   // Validate required fields
    if (!name || !imgUrl || !price || !quantity || !description || !costprice || !category) {
      return res.status(400).json({ error: "All fields including category and image are required." });
    }


    // Optional: Validate if the image is base64
    if (!imgUrl.startsWith("data:image")) {
      return res.status(400).json({ error: "Invalid image format. Must be base64 string." });
    }

    const product = new Product({
      name,
      imgUrl, // this is base64 now
      price: Number(price),
      quantity: Number(quantity),
      costprice: Number(costprice),
      description,
      category,
    });
  
    await product.save();
    return res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error in addProduct:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};
