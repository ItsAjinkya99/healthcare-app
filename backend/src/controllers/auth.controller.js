
const User = require("../models/user.model");

const { comparePassword, generateTokens, generateToken, verifyRefreshToken } = require("../utils/auth.utils");

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

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.name, user.email);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTPOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api'
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
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

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.name, user.email);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTPOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api'
    });

    console.log(`✓ Login successful: ${email}`);

    res.json({
      message: "Login successful",
      accessToken,
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

/**
 * Refresh access token using refresh token from cookies
 */
exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    // Validation
    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token not provided"
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      console.log(`✗ Invalid refresh token`);
      // Clear invalid cookie
      res.clearCookie('refreshToken', { path: '/api' });
      return res.status(401).json({
        message: "Invalid or expired refresh token"
      });
    }

    // Find user by ID
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      console.log(`✗ Refresh token mismatch or user not found`);
      res.clearCookie('refreshToken', { path: '/api' });
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    // Generate new access token and optionally new refresh token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role, user.name, user.email);

    // Save new refresh token to database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token as HTTPOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api'
    });

    console.log(`✓ Token refreshed for user: ${user.email}`);

    // Return only access token (refresh token is in cookie)
    res.json({
      message: "Token refreshed successfully",
      accessToken
    });
  } catch (error) {
    console.error("Token refresh error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Logout - invalidate refresh token
 */
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required"
      });
    }

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    // Clear refresh token cookie
    res.clearCookie('refreshToken', { path: '/api' });

    console.log(`✓ User logged out: ${userId}`);

    res.json({
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
