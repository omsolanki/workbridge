import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { sendEmail } from "../services/emailService";
import { asyncHandler } from "../middleware/asyncHandler";
import { authLogger } from "../utils/logger";

interface AuthRequest extends Request {
  user?: IUser;
}

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env["JWT_SECRET"]!, {
    expiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
  } as jwt.SignOptions);
};

// Generate Refresh Token
const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env["JWT_REFRESH_SECRET"]!, {
    expiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, username, firstName, lastName, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      username,
      firstName,
      lastName,
      password,
      role: role || "freelancer",
    });

    // Send email verification if enabled
    if (process.env["ENABLE_EMAIL_VERIFICATION"] === "true") {
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      const verificationUrl = `${process.env["CLIENT_URL"]}/verify-email?token=${verificationToken}`;

      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - WorkBridge",
        template: "emailVerification",
        data: {
          name: user.firstName,
          verificationUrl,
        },
      });
    }

    // Generate tokens
    const token = generateToken((user._id as any).toString());
    const refreshToken = generateRefreshToken((user._id as any).toString());

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
      message:
        process.env["ENABLE_EMAIL_VERIFICATION"] === "true"
          ? "Registration successful! Please check your email to verify your account."
          : "Registration successful!",
    });
  }
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
      return;
    }

    // Check for user
    const user = await User.findByEmail(email, true);

    if (!user) {
      authLogger.login(
        email,
        false,
        req.ip || req.connection.remoteAddress || "unknown",
        req.get("User-Agent") || ""
      );
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    // Check if user is locked
    if ((user as any).isLocked) {
      res.status(423).json({
        success: false,
        error: "Account is locked due to too many failed login attempts",
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account if too many failed attempts
      if (
        user.loginAttempts >= parseInt(process.env["MAX_LOGIN_ATTEMPTS"] || "5")
      ) {
        user.lockUntil = new Date(
          Date.now() + parseInt(process.env["LOCK_TIME"] || "900000")
        ); // 15 minutes
      }

      await user.save();

      authLogger.login(
        email,
        false,
        req.ip || req.connection.remoteAddress || "unknown",
        req.get("User-Agent") || ""
      );
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined as any;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken((user._id as any).toString());
    const refreshToken = generateRefreshToken((user._id as any).toString());

    // Log successful login
    authLogger.login(
      email,
      true,
      req.ip || req.connection.remoteAddress || "unknown",
      req.get("User-Agent") || ""
    );

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
  }
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (req.user) {
    authLogger.logout(
      req.user && req.user._id ? req.user._id.toString() : "unknown",
      req.ip || req.connection.remoteAddress || "unknown"
    );
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id);

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
  }
);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { firstName, lastName, bio, skills, hourlyRate, location, timezone } =
      req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (hourlyRate !== undefined) user.hourlyRate = hourlyRate;
    if (location !== undefined) user.location = location;
    if (timezone) user.timezone = timezone;

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
  }
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select("+password");

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send email
    const resetUrl = `${process.env["CLIENT_URL"]}/reset-password?token=${resetToken}`;

    await sendEmail({
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
  }
);

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;

    // Hash token
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
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

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined as any;
    user.passwordResetExpires = undefined as any;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  }
);

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    // Hash token
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
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

    // Verify user
    user.isVerified = true;
    user.emailVerificationToken = undefined as any;
    user.emailVerificationExpires = undefined as any;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  }
);

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id);

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

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send email
    const verificationUrl = `${process.env["CLIENT_URL"]}/verify-email?token=${verificationToken}`;

    await sendEmail({
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
  }
);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
      return;
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env["JWT_REFRESH_SECRET"]!
      ) as any;
      const user = await User.findById(decoded.id);

      if (!user) {
        res.status(401).json({
          success: false,
          error: "Invalid refresh token",
        });
        return;
      }

      // Generate new tokens
      const newToken = generateToken((user._id as any).toString());
      const newRefreshToken = generateRefreshToken(
        (user._id as any).toString()
      );

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }
  }
);
