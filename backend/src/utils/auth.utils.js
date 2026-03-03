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
 * Generate JWT token
 */
function generateToken(userId, role) {
  try {
    const token = jwt.sign(
      { id: userId, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return token;
  } catch (error) {
    throw new Error("Error generating token: " + error.message);
  }
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token: " + error.message);
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};
