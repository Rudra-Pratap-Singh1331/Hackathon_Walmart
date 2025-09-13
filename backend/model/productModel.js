import mongoose from "mongoose"
import { type } from "os"
const productSchema  = mongoose.Schema({
  name: {
    type:String,
    required:true,
  },
  imgUrl: {
    type: String, // base64 string
    required: true,
  },
  price:{
    type:Number,
    required:true,
  },
  quantity:{
    type:Number,
    required:true,
  },
  costprice:{
    type:Number,
    required:true,
  },
  description:{
    type:String,
    required : true,
  },
  category: {
    type: String,
    required: true,
    enum: ["shoes", "furniture", "mobile", "electronics","laptop","grocery"],
  },
    totalSold: {
    type: Number,
    default: 0, // total units sold
  },
  modelUrl: {
    type: String,
    default: "", // Not shown to retailer
  },
},{timestamps:true})
const Product  = mongoose.model("Product", productSchema);
export default Product;