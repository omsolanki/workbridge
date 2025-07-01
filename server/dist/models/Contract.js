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
exports.Contract = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const milestoneSchema = new mongoose_1.Schema({
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
const contractSchema = new mongoose_1.Schema({
    job: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    client: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    freelancer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    proposal: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
contractSchema.index({ job: 1 });
contractSchema.index({ client: 1 });
contractSchema.index({ freelancer: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ createdAt: -1 });
contractSchema.virtual("jobDetails", {
    ref: "Job",
    localField: "job",
    foreignField: "_id",
    justOne: true,
});
contractSchema.virtual("clientDetails", {
    ref: "User",
    localField: "client",
    foreignField: "_id",
    justOne: true,
});
contractSchema.virtual("freelancerDetails", {
    ref: "User",
    localField: "freelancer",
    foreignField: "_id",
    justOne: true,
});
contractSchema.virtual("proposalDetails", {
    ref: "Proposal",
    localField: "proposal",
    foreignField: "_id",
    justOne: true,
});
contractSchema.set("toJSON", { virtuals: true });
contractSchema.set("toObject", { virtuals: true });
exports.Contract = mongoose_1.default.model("Contract", contractSchema);
//# sourceMappingURL=Contract.js.map