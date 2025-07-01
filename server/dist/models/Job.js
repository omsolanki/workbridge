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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const jobSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Job title is required"],
        trim: true,
        maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Job description is required"],
        minlength: [50, "Job description must be at least 50 characters long"],
        maxlength: [5000, "Job description cannot exceed 5000 characters"],
    },
    category: {
        type: String,
        required: [true, "Job category is required"],
        enum: [
            "web-development",
            "mobile-development",
            "design-creative",
            "writing-translation",
            "digital-marketing",
            "video-animation",
            "music-audio",
            "programming-tech",
            "business",
            "lifestyle",
            "data-science",
            "other",
        ],
    },
    subcategory: {
        type: String,
        required: [true, "Job subcategory is required"],
    },
    skills: [
        {
            type: String,
            required: [true, "At least one skill is required"],
            trim: true,
        },
    ],
    budget: {
        min: {
            type: Number,
            required: [true, "Minimum budget is required"],
            min: [1, "Minimum budget must be at least 1"],
        },
        max: {
            type: Number,
            required: [true, "Maximum budget is required"],
            min: [1, "Maximum budget must be at least 1"],
        },
        type: {
            type: String,
            enum: ["fixed", "hourly"],
            required: [true, "Budget type is required"],
        },
    },
    duration: {
        value: {
            type: Number,
            required: [true, "Duration value is required"],
            min: [1, "Duration must be at least 1"],
        },
        unit: {
            type: String,
            enum: ["hours", "days", "weeks", "months"],
            required: [true, "Duration unit is required"],
        },
    },
    experienceLevel: {
        type: String,
        enum: ["entry", "intermediate", "expert"],
        required: [true, "Experience level is required"],
    },
    projectType: {
        type: String,
        enum: ["one-time", "ongoing"],
        required: [true, "Project type is required"],
    },
    client: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Client is required"],
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "completed", "cancelled"],
        default: "open",
    },
    visibility: {
        type: String,
        enum: ["public", "private", "invite-only"],
        default: "public",
    },
    attachments: [
        {
            type: String,
            validate: {
                validator: function (v) {
                    return /^https?:\/\/.+/.test(v);
                },
                message: "Attachment must be a valid URL",
            },
        },
    ],
    location: {
        type: {
            type: String,
            enum: ["remote", "onsite", "hybrid"],
            required: [true, "Location type is required"],
        },
        address: String,
        city: String,
        country: String,
    },
    isUrgent: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    },
    proposalsCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    hiredFreelancer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    cancellationReason: {
        type: String,
        maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
jobSchema.virtual("budgetRange").get(function () {
    if (this.budget.min === this.budget.max) {
        return `$${this.budget.min}`;
    }
    return `$${this.budget.min} - $${this.budget.max}`;
});
jobSchema.virtual("durationText").get(function () {
    const unit = this.duration.value === 1
        ? this.duration.unit.slice(0, -1)
        : this.duration.unit;
    return `${this.duration.value} ${unit}`;
});
jobSchema.virtual("isActive").get(function () {
    return this.status === "open";
});
jobSchema.virtual("isCompleted").get(function () {
    return this.status === "completed";
});
jobSchema.virtual("isCancelled").get(function () {
    return this.status === "cancelled";
});
jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ category: 1 });
jobSchema.index({ subcategory: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ "budget.min": 1, "budget.max": 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ projectType: 1 });
jobSchema.index({ client: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ isUrgent: 1 });
jobSchema.index({ isFeatured: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ views: -1 });
jobSchema.index({ proposalsCount: -1 });
jobSchema.pre("save", function (next) {
    if (this.budget.max < this.budget.min) {
        this.budget.max = this.budget.min;
    }
    next();
});
jobSchema.methods["incrementViews"] = function () {
    this["views"] += 1;
    return this["save"]();
};
jobSchema.methods["incrementProposalsCount"] = function () {
    this["proposalsCount"] += 1;
    return this["save"]();
};
jobSchema.methods["decrementProposalsCount"] = function () {
    if (this["proposalsCount"] > 0) {
        this["proposalsCount"] -= 1;
    }
    return this["save"]();
};
jobSchema.statics["findOpenJobs"] = function () {
    return this.find({
        status: "open",
        visibility: "public",
    }).populate("client", "username firstName lastName rating totalReviews");
};
jobSchema.statics["findByCategory"] = function (category) {
    return this.find({
        category,
        status: "open",
        visibility: "public",
    }).populate("client", "username firstName lastName rating totalReviews");
};
jobSchema.statics["findBySkills"] = function (skills) {
    return this.find({
        skills: { $in: skills },
        status: "open",
        visibility: "public",
    }).populate("client", "username firstName lastName rating totalReviews");
};
jobSchema.statics["findFeaturedJobs"] = function () {
    return this.find({
        isFeatured: true,
        status: "open",
        visibility: "public",
    }).populate("client", "username firstName lastName rating totalReviews");
};
jobSchema.statics["findUrgentJobs"] = function () {
    return this.find({
        isUrgent: true,
        status: "open",
        visibility: "public",
    }).populate("client", "username firstName lastName rating totalReviews");
};
exports.Job = mongoose_1.default.model("Job", jobSchema);
//# sourceMappingURL=Job.js.map