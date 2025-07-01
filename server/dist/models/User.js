"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});
userSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
});
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ location: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ createdAt: -1 });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(parseInt(process.env["BCRYPT_ROUNDS"] || "12"));
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.pre("save", function (next) {
    if (this.isModified("password") && this.loginAttempts > 0) {
        this.loginAttempts = 0;
        this.lockUntil = undefined;
    }
    next();
});
userSchema.methods["comparePassword"] = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this["password"]);
};
userSchema.methods["generateAuthToken"] = function () {
    const jwt = require("jsonwebtoken");
    return jwt.sign({ id: this["_id"], role: this["role"] }, process.env["JWT_SECRET"], { expiresIn: process.env["JWT_EXPIRES_IN"] || "7d" });
};
userSchema.methods["generateEmailVerificationToken"] = function () {
    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    this["emailVerificationToken"] = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    this["emailVerificationExpires"] = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return token;
};
userSchema.methods["generatePasswordResetToken"] = function () {
    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    this["passwordResetToken"] = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    this["passwordResetExpires"] = new Date(Date.now() + 10 * 60 * 1000);
    return token;
};
userSchema.statics["findByEmail"] = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
userSchema.statics["findByUsername"] = function (username) {
    return this.findOne({ username });
};
userSchema.statics["findFreelancers"] = function () {
    return this.find({ role: "freelancer", isActive: true });
};
userSchema.statics["findClients"] = function () {
    return this.find({ role: "client", isActive: true });
};
exports.User = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=User.js.map