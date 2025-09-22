const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../config/database");
const { generateToken } = require("../utils/jwt");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert([{ name, email: email.toLowerCase(), password: hashedPassword }])
      .select("id, name, email")
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const token = generateToken(user.id);
    res.status(201).json({ message: "Registered successfully", user, token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, password")
      .eq("email", email.toLowerCase())
      .single();

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    const { password: _omit, ...safeUser } = user;
    res.json({ message: "Logged in successfully", user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
