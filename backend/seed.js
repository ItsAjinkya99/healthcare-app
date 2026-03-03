require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user.model");

const DEMO_USERS = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "ADMIN"
  },
  {
    name: "Dr. John Smith",
    email: "doctor@example.com",
    password: "password123",
    role: "DOCTOR"
  },
  {
    name: "Jane Doe",
    email: "receptionist@example.com",
    password: "password123",
    role: "RECEPTIONIST"
  }
];

async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing users
    console.log("\n🗑️  Clearing existing users...");
    const deletedCount = await User.deleteMany({});
    console.log(`✓ Deleted ${deletedCount.deletedCount} existing users`);

    // Create demo users
    console.log("\n👥 Creating demo users...");
    const createdUsers = await User.insertMany(DEMO_USERS);
    console.log(`✓ Created ${createdUsers.length} demo users:\n`);
    
    createdUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. Email: ${user.email}`);
      console.log(`     Name: ${user.name}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     ID: ${user._id}\n`);
    });

    console.log("📝 Login credentials:");
    DEMO_USERS.forEach(user => {
      console.log(`  • ${user.email} / password123`);
    });

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
