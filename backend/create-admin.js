require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User"); // Agar path alag hai to uske hisaab se change karna

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await User.findOne({
      email: "admin@swastikala.com",
    });

    if (exists) {
      console.log("❌ Admin already exists.");
      process.exit();
    }

    const admin = new User({
      name: "Super Admin",
      email: "admin@swastikala.com",
      password: "Admin@5272",
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@swastikala.com");
    console.log("Password: Admin@123");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
