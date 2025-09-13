import mongoose from "mongoose";

const productSoldSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required:true,
        default: "https://via.placeholder.com/150",
    },
    price: {
      type: Number,
      required: true,
    },
    costprice: {
      type: Number,
    },
    quantitySold: {
      type: Number,
      required: true,
    },
    totalRevenue: {
      type: Number,
      required: true, // price * quantitySold
    },
    category: {
      type: String,
      required: true,
      enum: ["shoes", "furniture", "mobile", "electronics","grocery", "laptop"],
    },
    soldAt: {
  type: Date,
  default: Date.now,
},
  },
  { timestamps: true }
);

const ProductSold = mongoose.model("ProductSold", productSoldSchema);
export default ProductSold;
