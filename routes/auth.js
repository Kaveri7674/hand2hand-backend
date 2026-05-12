import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, password, role,securityQuestions  } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedQuestions = await Promise.all(
      securityQuestions.map(async (q) => ({
        question: q.question.trim(),
        answer: await bcrypt.hash(q.answer.toLowerCase().trim(), 10)
      }))
    );
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword, 
      role,
      securityQuestions : hashedQuestions
    });

    await newUser.save();

    // 🔐 Generate token immediately after signup
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        userid: newUser._id,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// SIGNUP FLOW

// User signs up
// ↓
// Backend creates user
// ↓
// Backend generates JWT
// ↓
// Frontend stores token
// ↓
// User automatically authenticated
// ↓
// Protected routes work immediately


// Login

router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or role" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🔥 GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,   // 👈 VERY IMPORTANT
      user: {
        userid: user._id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN FLOW

// User enters username + password
// ↓
// Frontend sends credentials to backend
// ↓
// Backend verifies user exists
// ↓
// Backend verifies password matches
// ↓
// Backend generates JWT
// ↓
// Backend sends token + user info to frontend
// ↓
// Frontend stores token in AsyncStorage
// ↓
// User is authenticated
// ↓
// Protected routes use token for authorization

//--------CREATE FORGOT PASSWORD APIs------------//
router.post("/get-security-questions", async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Send ONLY questions (not answers)
  const questions = user.securityQuestions.map(q => q.question);

  res.json({ questions });
});


//--------VERIFY ANSWERS API------------//
router.post("/verify-security-answers", async (req, res) => {
  try {
    const { username, answers } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      return res.status(400).json({ message: "No security questions set" });
    }

    // Normalize helper
    const normalize = (str) => str.trim().toLowerCase();

    const results = await Promise.all(
      user.securityQuestions.map(async (q) => {
        const matched = answers.find(
          (a) => normalize(a.question) === normalize(q.question)
        );

        if (!matched) return false;

        return await bcrypt.compare(
          normalize(matched.answer),
          q.answer
        );
      })
    );

    const isValid = results.every(Boolean);

    if (!isValid) {
      return res.status(400).json({ message: "Answers incorrect" });
    }

    res.json({ message: "Verified successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//-------- RESET PASSWORD API ------------//
router.post("/reset-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
