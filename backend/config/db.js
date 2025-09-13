import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
const connectDb = async()=>{
  try{
      await mongoose.connect(process.env.MONGO_DB_URL)
    
      console.log("db connected")
  
  
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
export default connectDb