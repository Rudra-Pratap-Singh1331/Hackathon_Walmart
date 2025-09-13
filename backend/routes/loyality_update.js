// routes/user.js
import express from "express";
import User from "../model/UserModel.js";
import protect from "../middleware/authmiddleware.js";
const router = express.Router();

// ✅ PUT /api/users/update-loyalty
router.put("/update-loyalty", protect, async (req, res) => {
  try {
    const { newPoints } = req.body;

    if (typeof newPoints !== "number" || isNaN(newPoints) || newPoints < 0) {
      return res.status(400).json({ message: "Invalid loyalty points" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.loyaltyPoints = newPoints;
    await user.save();

    res.json({ message: "Loyalty points updated", loyaltyPoints: newPoints });
  } catch (err) {
    console.error("Loyalty update error:", err.message);
    res.status(500).json({ message: "Failed to update loyalty points" });
  }
});
export default router;
