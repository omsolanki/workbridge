import { Request, Response, NextFunction } from "express";
interface CustomError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
}
export declare const errorHandler: (err: CustomError, _req: Request, res: Response, _next: NextFunction) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map