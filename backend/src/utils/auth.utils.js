const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Hash a plain text password
 */
async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
}

/**
 * Compare plain text password with hashed password
 */
async function comparePassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error("Error comparing passwords: " + error.message);
  }
}

/**
 * Generate JWT access token (short-lived: 15 minutes)
 */
function generateAccessToken(userId, role, name, email) {
  try {
    const token = jwt.sign(
      { id: userId, role: role, name: name, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    return token;
  } catch (error) {
    throw new Error("Error generating access token: " + error.message);
  }
}

/**
 * Generate JWT refresh token (long-lived: 7 days)
 */
function generateRefreshToken(userId, role, name, email) {
  try {
    const token = jwt.sign(
      { id: userId, role: role, name: name, email: email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    return token;
  } catch (error) {
    throw new Error("Error generating refresh token: " + error.message);
  }
}

/**
 * Generate both access and refresh tokens
 */
function generateTokens(userId, role, name, email) {
  return {
    accessToken: generateAccessToken(userId, role, name, email),
    refreshToken: generateRefreshToken(userId, role, name, email)
  };
}

/**
 * Verify JWT access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid access token: " + error.message);
  }
}

/**
 * Verify JWT refresh token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid refresh token: " + error.message);
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyToken: verifyAccessToken,
  verifyAccessToken,
  verifyRefreshToken
};
