import express from "express";
import Carts from "../model/CartModel.js";
import protect from "../middleware/authmiddleware.js";

const router = express.Router();

/**
 * ➕ Add product to a collaborative cart
 */
router.post("/add", protect, async (req, res) => {
  const { cartId, product } = req.body;
  const io = req.app.get("io");

  try {
    if (!cartId || !product?.productId) {
      return res.status(400).json({ message: "Missing cartId or product" });
    }

    let cart = await Carts.findOne({ cartId });

    if (!cart) {
      cart = new Carts({
        cartId,
        users: [req.user._id],
        products: [product],
      });
    } else {
      const existing = cart.products.find(
        (p) => p.productId.toString() === product.productId.toString()
      );

      if (existing) {
        existing.quantity += product.quantity || 1;
      } else {
        cart.products.push(product);
      }

      if (!cart.users.includes(req.user._id)) {
        cart.users.push(req.user._id);
      }
    }

    await cart.save();
    await cart.populate({
      path: "products.productId",
      select: "name description price imgUrl imgurl"
    });

    const transformed = cart.products.map((p) => ({
      _id: p._id,
      quantity: p.quantity,
      productId: p.productId._id,
      name: p.productId?.name,
      description: p.productId?.description,
      price: p.productId?.price,
      imgUrl: p.productId?.imgUrl || p.productId?.imgurl,
    }));

    io.to(cartId).emit("receive-cart", { products: transformed });

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (err) {
    console.error("Add error:", err.message);
    res.status(500).json({ message: "Add to cart failed", error: err.message });
  }
});

/**
 * 🎩 Get cart by cartId
 */
router.get("/get/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    let cart = await Carts.findOne({ cartId }).populate({
      path: "products.productId",
      select: "name description price imgUrl imgurl",
    });

    if (!cart) {
      cart = await Carts.create({ cartId, products: [] });
      console.log("✅ New empty cart created:", cartId);
    }

    const transformed = cart.products.map((p) => ({
      _id: p._id,
      quantity: p.quantity,
      productId: p.productId._id,
      name: p.productId?.name,
      description: p.productId?.description,
      price: p.productId?.price,
      imgUrl: p.productId?.imgUrl || p.productId?.imgurl,
    }));

    res.json({ cartId: cart.cartId, products: transformed });
  } catch (err) {
    console.error("Get cart error:", err.message);
    res.status(500).json({ message: "Failed to get cart", error: err.message });
  }
});

/**
 * 🔁 Update product quantity in collaborative cart
 */
router.post("/update", async (req, res) => {
  try {
    const { cartId, productId, action } = req.body;

    const cart = await Carts.findOne({ cartId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find((p) => p.productId.toString() === productId.toString());
    if (item) {
      if (action === "add") item.quantity += 1;
      if (action === "remove") item.quantity = Math.max(0, item.quantity - 1);
    } else {
      return res.status(400).json({ message: "Product not in cart" });
    }

    cart.products = cart.products.filter((p) => p.quantity > 0);
    await cart.save();
    await cart.populate({
      path: "products.productId",
      select: "name description price imgUrl imgurl"
    });

    const transformed = cart.products.map((p) => ({
      _id: p._id,
      quantity: p.quantity,
      productId: p.productId._id,
      name: p.productId?.name,
      description: p.productId?.description,
      price: p.productId?.price,
      imgUrl: p.productId?.imgUrl || p.productId?.imgurl,
    }));

    res.status(200).json({ message: "Cart updated", products: transformed });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ message: "Update cart failed", error: err.message });
  }
});

/**
 * ❌ Remove product from cart
 */
router.delete("/remove", async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    const cart = await Carts.findOne({ cartId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId.toString()
    );

    await cart.save();
    res.status(200).json({ message: "Product removed", cart });
  } catch (err) {
    res.status(500).json({ message: "Error removing product", error: err.message });
  }
});

/**
 * 🩹 Clear entire cart (if needed)
 */
router.delete("/clear", async (req, res) => {
  try {
    const { cartId } = req.body;
    await Carts.deleteOne({ cartId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err.message });
  }
});

export default router;
