import mongoose, { Document } from "mongoose";
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
export declare const Contract: mongoose.Model<IContract, {}, {}, {}, mongoose.Document<unknown, {}, IContract, {}> & IContract & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Contract.d.ts.map