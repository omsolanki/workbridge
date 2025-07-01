import mongoose, { Document } from "mongoose";
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
export declare const Proposal: mongoose.Model<IProposal, {}, {}, {}, mongoose.Document<unknown, {}, IProposal, {}> & IProposal & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Proposal.d.ts.map