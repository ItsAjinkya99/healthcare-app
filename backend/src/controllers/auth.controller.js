
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword, generateToken } = require("../utils/auth.utils");

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Email, password, and name are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "RECEPTIONIST"
    });

    console.log(`✓ User registered: ${email} with role ${user.role}`);

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    console.log(`Attempting login for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`✗ User not found: ${email}`);
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    console.log(`✓ User found: ${email}`);
    console.log(`Comparing password...`);

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      console.log(`✗ Invalid password for: ${email}`);
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    console.log(`✓ Password valid for: ${email}`);

    // Generate token
    const token = generateToken(user._id, user.role);

    console.log(`✓ Login successful: ${email}`);

    res.json({
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
