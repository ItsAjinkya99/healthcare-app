/**
 * Debug utility to check users in database and test password comparison
 * Run with: node check-users.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user.model");
const { comparePassword } = require("./src/utils/auth.utils");

async function checkDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...\n");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Get all users
    const users = await User.find();
    console.log(`📊 Found ${users.length} users in database:\n`);

    if (users.length === 0) {
      console.log("⚠️  No users found in database!");
      console.log("Run 'npm run seed' to create demo users.\n");
      process.exit(0);
    }

    // Display user information
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`User ${i + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Password Hash: ${user.password.substring(0, 20)}...`);

      // Test password comparison
      const testPassword = "password123";
      try {
        const isValid = await comparePassword(testPassword, user.password);
        console.log(`  Password Test (${testPassword}): ${isValid ? "✓ Valid" : "✗ Invalid"}`);
      } catch (error) {
        console.log(`  Password Test: ✗ Error - ${error.message}`);
      }

      console.log();
    }

    // Test with incorrect password
    console.log("🧪 Testing with incorrect password:");
    const firstUser = users[0];
    const isValid = await comparePassword("wrongpassword", firstUser.password);
    console.log(`  User: ${firstUser.email}`);
    console.log(`  Password "wrongpassword": ${isValid ? "✓ Valid" : "✗ Invalid (expected)"}\n`);

    console.log("✅ Debug check complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
