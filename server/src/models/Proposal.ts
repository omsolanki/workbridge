import mongoose, { Document, Schema } from "mongoose";

export interface IProposal extends Document {
  job: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  coverLetter: string;
  proposedAmount: number;
  estimatedDuration: number;
  attachments: string[];
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 2000,
    },
    proposedAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },
    attachments: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });
proposalSchema.index({ status: 1 });
proposalSchema.index({ createdAt: -1 });

// Virtual populate for job details
proposalSchema.virtual("jobDetails", {
  ref: "Job",
  localField: "job",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for freelancer details
proposalSchema.virtual("freelancerDetails", {
  ref: "User",
  localField: "freelancer",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
proposalSchema.set("toJSON", { virtuals: true });
proposalSchema.set("toObject", { virtuals: true });

export const Proposal = mongoose.model<IProposal>("Proposal", proposalSchema);
