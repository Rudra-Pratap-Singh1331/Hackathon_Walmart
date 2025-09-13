import express from "express";
import {
  getTopSellingProducts,
  getTotalRevenueProfit,
  getDailySales,
} from "../controller/dashboardController.js";

const dashBoardRoute = express.Router();

dashBoardRoute.get("/top-products", getTopSellingProducts);
dashBoardRoute.get("/totals", getTotalRevenueProfit);
dashBoardRoute.get("/daily-sales", getDailySales);

export default dashBoardRoute;
