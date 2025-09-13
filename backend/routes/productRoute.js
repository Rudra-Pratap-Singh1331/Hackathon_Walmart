import express from "express";
import { addProduct } from "../controller/PRODUCTcONTROLLER.JS.js";
const productRoute = express.Router();
productRoute.post("/addProduct",addProduct)
export default productRoute;