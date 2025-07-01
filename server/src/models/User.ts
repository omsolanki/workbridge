import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "freelancer" | "client" | "admin";
  avatar?: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  rating: number;
  totalReviews: number;
  location?: string;
  timezone?: string;
  isVerified: boolean;
  isActive: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string, includePassword?: boolean): Promise<IUser | null>;
  findByUsername(
    username: string,
    includePassword?: boolean
  ): Promise<IUser | null>;
  findFreelancers(): Promise<IUser[]>;
  findClients(): Promise<IUser[]>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["freelancer", "client", "admin"],
      default: "freelancer",
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    hourlyRate: {
      type: Number,
      min: [0, "Hourly rate cannot be negative"],
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isLocked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ location: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(
      parseInt(process.env["BCRYPT_ROUNDS"] || "12")
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to reset login attempts
userSchema.pre("save", function (next) {
  if (this.isModified("password") && this.loginAttempts > 0) {
    this.loginAttempts = 0;
    this.lockUntil = undefined as any;
  }
  next();
});

// Instance method to compare password
userSchema.methods["comparePassword"] = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this["password"]);
};

// Instance method to generate auth token
userSchema.methods["generateAuthToken"] = function (): string {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { id: this["_id"], role: this["role"] },
    process.env["JWT_SECRET"]!,
    { expiresIn: process.env["JWT_EXPIRES_IN"] || "7d" }
  );
};

// Instance method to generate email verification token
userSchema.methods["generateEmailVerificationToken"] = function (): string {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");

  this["emailVerificationToken"] = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this["emailVerificationExpires"] = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return token;
};

// Instance method to generate password reset token
userSchema.methods["generatePasswordResetToken"] = function (): string {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");

  this["passwordResetToken"] = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this["passwordResetExpires"] = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return token;
};

// Static method to find by email
userSchema.statics["findByEmail"] = function (
  email: string,
  includePassword = false
) {
  const query = this.findOne({ email: email.toLowerCase() });
  if (includePassword) {
    return query.select("+password");
  }
  return query;
};

// Static method to find by username
userSchema.statics["findByUsername"] = function (
  username: string,
  includePassword = false
) {
  const query = this.findOne({ username });
  if (includePassword) {
    return query.select("+password");
  }
  return query;
};

// Static method to find freelancers
userSchema.statics["findFreelancers"] = function () {
  return this.find({ role: "freelancer", isActive: true });
};

// Static method to find clients
userSchema.statics["findClients"] = function () {
  return this.find({ role: "client", isActive: true });
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
