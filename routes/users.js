import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /users
 * Retrieve all users
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password from response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /users/:id
 * Retrieve a specific user by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * POST /users
 * Create a new user (registration/signup)
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, password, userType, adminNo, course, yearOfStudy } = req.body;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Generate new ID
    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? String(parseInt(lastUser.id) + 1) : "1";

    // Create new user
    const newUser = new User({
      id: newId,
      name,
      email,
      password, // In production, hash this password!
      userType,
      adminNo,
      course,
      yearOfStudy,
    });

    const savedUser = await newUser.save();
    
    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * POST /users/login
 * Validate user login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: "Email, password, and userType are required" });
    }

    const user = await User.findOne({ email, userType });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * PUT /users/:id
 * Update a user's details
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE /users/:id
 * Delete a user
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;