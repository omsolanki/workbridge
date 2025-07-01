import mongoose, { Document } from "mongoose";
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
export declare const Job: IJobModel;
export {};
//# sourceMappingURL=Job.d.ts.map