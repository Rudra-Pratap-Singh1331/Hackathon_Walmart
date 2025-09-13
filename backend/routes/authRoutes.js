// routes/auth.js
import express from "express";
import User from "../model/UserModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import protect from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("loyaltyPoints name email");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});
// ✅ Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // 👇 Let schema handle hashing now
    const newUser = await User.create({ name, email, password });

    const token = generateToken(newUser._id);

    res.status(201).json({
      msg: "Registration successful",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("🛑 Registration error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    console.log("🧪 Login Debug:");
console.log("Entered password:", password);
console.log("Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("result :" ,isMatch);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
});

export default router;
