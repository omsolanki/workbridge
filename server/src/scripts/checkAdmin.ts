import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User";

dotenv.config();

const MONGODB_URI =
  process.env["MONGODB_URI"] || "mongodb://localhost:27017/workbridge";

async function checkAndFixAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin user exists
    const adminUser = await User.findOne({
      email: "admin@workbridge.com",
    }).select("+password");

    if (!adminUser) {
      console.log("Admin user not found. Creating admin user...");

      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newAdmin = new User({
        username: "admin_user",
        email: "admin@workbridge.com",
        firstName: "Admin",
        lastName: "User",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        isActive: true,
      });

      await newAdmin.save();
      console.log("Admin user created successfully!");
      console.log("Email: admin@workbridge.com");
      console.log("Password: admin123");
    } else {
      console.log("Admin user found!");
      console.log(`Email: ${adminUser.email}`);
      console.log(`Role: ${adminUser.role}`);
      console.log(`Username: ${adminUser.username}`);
      console.log(`Is Verified: ${adminUser.isVerified}`);
      console.log(`Is Active: ${adminUser.isActive}`);

      // Test password
      const isPasswordValid = await adminUser.comparePassword("admin123");
      console.log(`Password test: ${isPasswordValid ? "VALID" : "INVALID"}`);

      if (!isPasswordValid) {
        console.log("Password is invalid. Updating password...");
        adminUser.password = "admin123";
        await adminUser.save();
        console.log("Password updated successfully!");
      }

      // Check if user is verified
      if (!adminUser.isVerified) {
        console.log("User is not verified. Marking as verified...");
        adminUser.isVerified = true;
        await adminUser.save();
        console.log("User marked as verified!");
      }
    }
  } catch (error) {
    console.error("Error checking admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
checkAndFixAdmin();
