"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.resendVerification = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
const asyncHandler_1 = require("../middleware/asyncHandler");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env["JWT_SECRET"], {
        expiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
    });
};
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env["JWT_REFRESH_SECRET"], {
        expiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
    });
};
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, username, firstName, lastName, password, role } = req.body;
    const existingUser = await User_1.User.findOne({
        $or: [{ email }, { username }],
    });
    if (existingUser) {
        res.status(400).json({
            success: false,
            error: existingUser.email === email
                ? "Email already registered"
                : "Username already taken",
        });
        return;
    }
    const user = await User_1.User.create({
        email,
        username,
        firstName,
        lastName,
        password,
        role: role || "freelancer",
    });
    if (process.env["ENABLE_EMAIL_VERIFICATION"] === "true") {
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();
        const verificationUrl = `${process.env["CLIENT_URL"]}/verify-email?token=${verificationToken}`;
        await (0, emailService_1.sendEmail)({
            email: user.email,
            subject: "Verify Your Email - WorkBridge",
            template: "emailVerification",
            data: {
                name: user.firstName,
                verificationUrl,
            },
        });
    }
    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
            },
            token,
            refreshToken,
        },
        message: process.env["ENABLE_EMAIL_VERIFICATION"] === "true"
            ? "Registration successful! Please check your email to verify your account."
            : "Registration successful!",
    });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            success: false,
            error: "Please provide email and password",
        });
        return;
    }
    const user = await User_1.User.findOne({ email }).select("+password");
    if (!user) {
        res.status(401).json({
            success: false,
            error: "Invalid credentials",
        });
        return;
    }
    if (user.isLocked) {
        res.status(423).json({
            success: false,
            error: "Account is locked due to too many failed login attempts",
        });
        return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= parseInt(process.env["MAX_LOGIN_ATTEMPTS"] || "5")) {
            user.lockUntil = new Date(Date.now() + parseInt(process.env["LOCK_TIME"] || "900000"));
        }
        await user.save();
        res.status(401).json({
            success: false,
            error: "Invalid credentials",
        });
        return;
    }
    if (user.loginAttempts > 0) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
                bio: user.bio,
                skills: user.skills,
                hourlyRate: user.hourlyRate,
                rating: user.rating,
                totalReviews: user.totalReviews,
                location: user.location,
                timezone: user.timezone,
            },
            token,
            refreshToken,
        },
    });
});
const logout = async (_req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            success: false,
            error: "User not found",
        });
        return;
    }
    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
                bio: user.bio,
                skills: user.skills,
                hourlyRate: user.hourlyRate,
                rating: user.rating,
                totalReviews: user.totalReviews,
                location: user.location,
                timezone: user.timezone,
            },
        },
    });
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, bio, skills, hourlyRate, location, timezone } = req.body;
    const user = await User_1.User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            success: false,
            error: "User not found",
        });
        return;
    }
    if (firstName)
        user.firstName = firstName;
    if (lastName)
        user.lastName = lastName;
    if (bio !== undefined)
        user.bio = bio;
    if (skills)
        user.skills = skills;
    if (hourlyRate !== undefined)
        user.hourlyRate = hourlyRate;
    if (location !== undefined)
        user.location = location;
    if (timezone)
        user.timezone = timezone;
    await user.save();
    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
                bio: user.bio,
                skills: user.skills,
                hourlyRate: user.hourlyRate,
                rating: user.rating,
                totalReviews: user.totalReviews,
                location: user.location,
                timezone: user.timezone,
            },
        },
        message: "Profile updated successfully",
    });
});
exports.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User_1.User.findById(req.user?._id).select("+password");
    if (!user) {
        res.status(404).json({
            success: false,
            error: "User not found",
        });
        return;
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        res.status(400).json({
            success: false,
            error: "Current password is incorrect",
        });
        return;
    }
    user.password = newPassword;
    await user.save();
    res.json({
        success: true,
        message: "Password changed successfully",
    });
});
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        res.status(404).json({
            success: false,
            error: "User not found",
        });
        return;
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    const resetUrl = `${process.env["CLIENT_URL"]}/reset-password?token=${resetToken}`;
    await (0, emailService_1.sendEmail)({
        email: user.email,
        subject: "Password Reset Request - WorkBridge",
        template: "passwordReset",
        data: {
            name: user.firstName,
            resetUrl,
        },
    });
    res.json({
        success: true,
        message: "Password reset email sent",
    });
});
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, password } = req.body;
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User_1.User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        res.status(400).json({
            success: false,
            error: "Invalid or expired reset token",
        });
        return;
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({
        success: true,
        message: "Password reset successful",
    });
});
exports.verifyEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User_1.User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) {
        res.status(400).json({
            success: false,
            error: "Invalid or expired verification token",
        });
        return;
    }
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.json({
        success: true,
        message: "Email verified successfully",
    });
});
exports.resendVerification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            success: false,
            error: "User not found",
        });
        return;
    }
    if (user.isVerified) {
        res.status(400).json({
            success: false,
            error: "Email is already verified",
        });
        return;
    }
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    const verificationUrl = `${process.env["CLIENT_URL"]}/verify-email?token=${verificationToken}`;
    await (0, emailService_1.sendEmail)({
        email: user.email,
        subject: "Verify Your Email - WorkBridge",
        template: "emailVerification",
        data: {
            name: user.firstName,
            verificationUrl,
        },
    });
    res.json({
        success: true,
        message: "Verification email sent",
    });
});
exports.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({
            success: false,
            error: "Refresh token is required",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env["JWT_REFRESH_SECRET"]);
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                error: "Invalid refresh token",
            });
            return;
        }
        const newToken = generateToken(user._id.toString());
        const newRefreshToken = generateRefreshToken(user._id.toString());
        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: "Invalid refresh token",
        });
    }
});
//# sourceMappingURL=authController.js.map