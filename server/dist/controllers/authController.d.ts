import { Request, Response } from "express";
import { IUser } from "../models/User";
interface AuthRequest extends Request {
    user?: IUser;
}
export declare const register: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const login: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const logout: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const forgotPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const verifyEmail: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const resendVerification: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const refreshToken: (req: Request, res: Response, next: import("express").NextFunction) => void;
export {};
//# sourceMappingURL=authController.d.ts.map