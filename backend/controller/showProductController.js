import Product from "../model/productModel.js";
const showProducts =  async (req, res) => {
  try {
    const products = await Product.find({}).limit(16);
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}
export default showProducts