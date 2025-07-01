import mongoose, { Document } from "mongoose";
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
    findByEmail(email: string): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    findFreelancers(): Promise<IUser[]>;
    findClients(): Promise<IUser[]>;
}
export declare const User: IUserModel;
export {};
//# sourceMappingURL=User.d.ts.map