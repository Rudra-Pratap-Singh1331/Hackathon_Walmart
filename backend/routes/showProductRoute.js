// routes/productRoutes.js
import express from "express";
import showProducts from "../controller/showProductController.js";

const showProductRoute = express.Router();

// GET all products
showProductRoute.get("/show", showProducts);

export default showProductRoute;
