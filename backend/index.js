import express from "express";
import dotenv from "dotenv";
import connectDb from "../backend/config/db.js";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";

// Route Imports
import productRoute from "./routes/productRoute.js";
import showProductRoute from "./routes/showProductRoute.js";
import soldRoute from "./routes/soldRoute.js";
import dashBoardRoute from "./routes/dashboardRoutes.js";
import lowStock from "./routes/lowStock.js";
import gemini from "./routes/gemini.js";
import restock from "./routes/restockProduct.js";
import fillProductRoute from "./routes/fillProduct.js";
import cartRoute from "./routes/cartRoutes.js";
import prodDetails from "./routes/detailsProd.js";
import loyaltyPoints from "./routes/loyaltyPoitnt.js";
import category from "./routes/category.js";
import geminiResponse from "./gemini.js";
import geminifinal from "./routes/geminiFinal.js";
import searchRoute from "./routes/SearchRoute.js";
import userRoutes from "./routes/loyality_update.js";
import authRoutes from "./routes/authRoutes.js";
import purchasedRoute from "./routes/purchased.js";
import ingredient from "./routes/ingredient.js";

dotenv.config();
const app = express();

// ✅ Use middlewares
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ✅ Setup HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  },
});

// ✅ Pass io instance to app for access in routes
app.set("io", io);

// ✅ Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  // 💬 Real-time cart collaboration
  socket.on("join-cart", (cartId) => {
    socket.join(cartId);
    console.log(`🔗 Socket ${socket.id} joined cart room ${cartId}`);
  });

  socket.on("cart-update", ({ cartId, updatedCart }) => {
    io.to(cartId).emit("receive-cart", updatedCart);
  });

  // 🎯 NEW: For Join Collaboration Button
  socket.on("join-collaboration", (cartId) => {
    socket.join(cartId);
    console.log(`🤝 Socket ${socket.id} joined collaboration cart ${cartId}`);
  });

  // 📴 NEW: For Disconnect Button
  socket.on("leave-collaboration", (cartId) => {
    socket.leave(cartId);
    console.log(`🚪 Socket ${socket.id} left collaboration cart ${cartId}`);
  });

  socket.on("loyalty-used", ({ cartId, useLoyalty }) => {
    io.to(cartId).emit("loyalty-used", useLoyalty);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ Routes
app.use("/api/gemini", gemini);
app.use("/api/dashboard", dashBoardRoute);
app.use("/api/products", lowStock);
app.use("/api/sold", soldRoute);
app.use("/api/product", productRoute);
app.use("/api/showproducts", showProductRoute);
app.use("/api/restockproducts", restock);
app.use("/api/ai", fillProductRoute);
app.use("/api/cart", cartRoute);
app.use("/api/products", prodDetails);
app.use("/api", loyaltyPoints);
app.use("/api/products", category);
app.use("/api/search", searchRoute);
app.use("/api/auth", authRoutes);
app.use("/api/sales", purchasedRoute);
app.use("/api/users", userRoutes);
app.use("/api/ai",ingredient);

// ✅ Test Gemini endpoint
app.get("/", async (req, res) => {
  const prompt = req.query.prompt;
  const data = await geminiResponse(prompt);
  res.json(data);
});
app.use("/api/ai", geminifinal);

// ✅ Start the server using `server.listen` not `app.listen`
const Port = process.env.PORT || 5000;
server.listen(Port, () => {
  console.log(`🚀 Server is running on port ${Port}`);
  connectDb();
});
