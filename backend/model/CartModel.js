import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    cartId: {
      type: String, // shared cart room ID (like "room123")
      required: true,
      unique: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        description: String,
        price: Number,
        imgUrl: String,
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
