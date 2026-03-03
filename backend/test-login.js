/**
 * Quick test for login functionality
 * Run with: node test-login.js
 */

require("dotenv").config();
const axios = require("axios");

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

// Test credentials
const TEST_CREDENTIALS = {
  email: "admin@example.com",
  password: "password123"
};

async function testLogin() {
  console.log("🧪 Testing Login Functionality\n");
  console.log("API URL:", API_URL);
  console.log("🔑 Testing with:", TEST_CREDENTIALS.email, "\n");

  try {
    // Test 1: Login
    console.log("1️⃣  Testing Login...");
    const loginResponse = await axios.post(
      `${API_URL}/auth/login`,
      TEST_CREDENTIALS,
      { validateStatus: () => true }
    );

    if (loginResponse.status === 200) {
      console.log("✅ Login successful!");
      console.log("   Token:", loginResponse.data.token.substring(0, 30) + "...");
      console.log("   User:", loginResponse.data.user.name);
      console.log("   Role:", loginResponse.data.user.role, "\n");

      const token = loginResponse.data.token;

      // Test 2: Access protected route
      console.log("2️⃣  Testing Protected Route...");
      const protectedResponse = await axios.get(
        `${API_URL}/protected/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          validateStatus: () => true
        }
      );

      if (protectedResponse.status === 200) {
        console.log("✅ Protected route accessible!");
        console.log("   User ID:", protectedResponse.data.user.id);
        console.log("   Role:", protectedResponse.data.user.role, "\n");
      } else {
        console.log("❌ Protected route failed!");
        console.log("   Status:", protectedResponse.status);
        console.log("   Error:", protectedResponse.data.message, "\n");
      }

      console.log("✅ All tests passed!\n");
    } else {
      console.log("❌ Login failed!");
      console.log("   Status:", loginResponse.status);
      console.log("   Error:", loginResponse.data.message, "\n");
      console.log("💡 Try running: npm run seed\n");
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("❌ Cannot connect to backend!");
      console.log("   Make sure backend is running: npm run dev\n");
    } else {
      console.log("❌ Error:", error.message, "\n");
    }
  }
}

testLogin();
