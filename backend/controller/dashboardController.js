import ProductSold from "../model/productSoldModel.js";
import mongoose from "mongoose";

// 📊 Top N Products by quantity sold
export const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await ProductSold.aggregate([
      {
        $group: {
          _id: "$name",
          totalSold: { $sum: "$quantitySold" },
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);
    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching top products" });
  }
};

export const getTotalRevenueProfit = async (req, res) => {
  try {
    const result = await ProductSold.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalRevenue" },
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ["$price", "$costprice"] },
                "$quantitySold"
              ]
            },
          },
        },
      },
    ]);

    res.json(result[0] || { totalRevenue: 0, totalProfit: 0 });
  } catch (err) {
    res.status(500).json({ message: "Error fetching totals" });
  }
};


export const getDailySales = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const data = await ProductSold.aggregate([
      {
        $match: {
          soldAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$soldAt",
              timezone: "Asia/Kolkata",
            },
          },
          dailyRevenue: { $sum: "$totalRevenue" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Error in daily-sales route", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
