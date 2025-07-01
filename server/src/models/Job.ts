import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  skills: string[];
  budget: {
    min: number;
    max: number;
    type: "fixed" | "hourly";
  };
  duration: {
    value: number;
    unit: "hours" | "days" | "weeks" | "months";
  };
  experienceLevel: "entry" | "intermediate" | "expert";
  projectType: "one-time" | "ongoing";
  client: mongoose.Types.ObjectId;
  status: "open" | "in-progress" | "completed" | "cancelled";
  visibility: "public" | "private" | "invite-only";
  attachments: string[];
  location: {
    type: "remote" | "onsite" | "hybrid";
    address?: string;
    city?: string;
    country?: string;
  };
  isUrgent: boolean;
  isFeatured: boolean;
  views: number;
  proposalsCount: number;
  hiredFreelancer?: mongoose.Types.ObjectId;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  incrementViews(): void;
  incrementProposalsCount(): void;
  decrementProposalsCount(): void;
}

interface IJobModel extends mongoose.Model<IJob> {
  findOpenJobs(): Promise<IJob[]>;
  findByCategory(category: string): Promise<IJob[]>;
  findBySkills(skills: string[]): Promise<IJob[]>;
  findFeaturedJobs(): Promise<IJob[]>;
  findUrgentJobs(): Promise<IJob[]>;
}

const jobSchema = new Schema<IJob>(
  {
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
      type: Schema.Types.ObjectId,
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
          validator: function (v: string) {
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
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for budget range
jobSchema.virtual("budgetRange").get(function () {
  if (this.budget.min === this.budget.max) {
    return `$${this.budget.min}`;
  }
  return `$${this.budget.min} - $${this.budget.max}`;
});

// Virtual for duration text
jobSchema.virtual("durationText").get(function () {
  const unit =
    this.duration.value === 1
      ? this.duration.unit.slice(0, -1)
      : this.duration.unit;
  return `${this.duration.value} ${unit}`;
});

// Virtual for isActive
jobSchema.virtual("isActive").get(function () {
  return this.status === "open";
});

// Virtual for isCompleted
jobSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

// Virtual for isCancelled
jobSchema.virtual("isCancelled").get(function () {
  return this.status === "cancelled";
});

// Indexes
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

// Pre-save middleware
jobSchema.pre("save", function (next) {
  // Ensure max budget is greater than or equal to min budget
  if (this.budget.max < this.budget.min) {
    this.budget.max = this.budget.min;
  }
  next();
});

// Instance method to increment views
jobSchema.methods["incrementViews"] = function () {
  this["views"] += 1;
  return this["save"]();
};

// Instance method to increment proposals count
jobSchema.methods["incrementProposalsCount"] = function () {
  this["proposalsCount"] += 1;
  return this["save"]();
};

// Instance method to decrement proposals count
jobSchema.methods["decrementProposalsCount"] = function () {
  if (this["proposalsCount"] > 0) {
    this["proposalsCount"] -= 1;
  }
  return this["save"]();
};

// Static method to find open jobs
jobSchema.statics["findOpenJobs"] = function () {
  return this.find({
    status: "open",
    visibility: "public",
  }).populate("client", "username firstName lastName rating totalReviews");
};

// Static method to find jobs by category
jobSchema.statics["findByCategory"] = function (category: string) {
  return this.find({
    category,
    status: "open",
    visibility: "public",
  }).populate("client", "username firstName lastName rating totalReviews");
};

// Static method to find jobs by skills
jobSchema.statics["findBySkills"] = function (skills: string[]) {
  return this.find({
    skills: { $in: skills },
    status: "open",
    visibility: "public",
  }).populate("client", "username firstName lastName rating totalReviews");
};

// Static method to find featured jobs
jobSchema.statics["findFeaturedJobs"] = function () {
  return this.find({
    isFeatured: true,
    status: "open",
    visibility: "public",
  }).populate("client", "username firstName lastName rating totalReviews");
};

// Static method to find urgent jobs
jobSchema.statics["findUrgentJobs"] = function () {
  return this.find({
    isUrgent: true,
    status: "open",
    visibility: "public",
  }).populate("client", "username firstName lastName rating totalReviews");
};

export const Job = mongoose.model<IJob, IJobModel>("Job", jobSchema);
