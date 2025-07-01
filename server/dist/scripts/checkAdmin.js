"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
dotenv_1.default.config();
const MONGODB_URI = process.env["MONGODB_URI"] || "mongodb://localhost:27017/workbridge";
async function checkAndFixAdmin() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        const adminUser = await User_1.User.findOne({
            email: "admin@workbridge.com",
        }).select("+password");
        if (!adminUser) {
            console.log("Admin user not found. Creating admin user...");
            const hashedPassword = await bcryptjs_1.default.hash("admin123", 10);
            const newAdmin = new User_1.User({
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
        }
        else {
            console.log("Admin user found!");
            console.log(`Email: ${adminUser.email}`);
            console.log(`Role: ${adminUser.role}`);
            console.log(`Username: ${adminUser.username}`);
            console.log(`Is Verified: ${adminUser.isVerified}`);
            console.log(`Is Active: ${adminUser.isActive}`);
            const isPasswordValid = await adminUser.comparePassword("admin123");
            console.log(`Password test: ${isPasswordValid ? "VALID" : "INVALID"}`);
            if (!isPasswordValid) {
                console.log("Password is invalid. Updating password...");
                adminUser.password = "admin123";
                await adminUser.save();
                console.log("Password updated successfully!");
            }
            if (!adminUser.isVerified) {
                console.log("User is not verified. Marking as verified...");
                adminUser.isVerified = true;
                await adminUser.save();
                console.log("User marked as verified!");
            }
        }
    }
    catch (error) {
        console.error("Error checking admin user:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB");
    }
}
checkAndFixAdmin();
//# sourceMappingURL=checkAdmin.js.map