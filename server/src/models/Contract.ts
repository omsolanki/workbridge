import mongoose, { Document, Schema } from "mongoose";

export interface IMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  completedAt?: Date;
}

export interface IContract extends Document {
  job: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  proposal: mongoose.Types.ObjectId;
  amount: number;
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "cancelled" | "disputed";
  milestones: IMilestone[];
  totalHours?: number;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  completedAt: {
    type: Date,
  },
});

const contractSchema = new Schema<IContract>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proposal: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "disputed"],
      default: "active",
    },
    milestones: [milestoneSchema],
    totalHours: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contractSchema.index({ job: 1 });
contractSchema.index({ client: 1 });
contractSchema.index({ freelancer: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ createdAt: -1 });

// Virtual populate for job details
contractSchema.virtual("jobDetails", {
  ref: "Job",
  localField: "job",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for client details
contractSchema.virtual("clientDetails", {
  ref: "User",
  localField: "client",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for freelancer details
contractSchema.virtual("freelancerDetails", {
  ref: "User",
  localField: "freelancer",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for proposal details
contractSchema.virtual("proposalDetails", {
  ref: "Proposal",
  localField: "proposal",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
contractSchema.set("toJSON", { virtuals: true });
contractSchema.set("toObject", { virtuals: true });

export const Contract = mongoose.model<IContract>("Contract", contractSchema);
