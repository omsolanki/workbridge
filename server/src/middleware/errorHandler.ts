import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      ...error,
      message,
      statusCode: 404,
    };
  }

  // Mongoose duplicate key
  if (err.code === "11000") {
    const message = "Duplicate field value entered";
    error = {
      ...error,
      message,
      statusCode: 400,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(", ");
    error = {
      ...error,
      message,
      statusCode: 400,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = {
      ...error,
      message,
      statusCode: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = {
      ...error,
      message,
      statusCode: 401,
    };
  }

  // Multer errors
  if (err.name === "MulterError") {
    const message = "File upload error";
    error = {
      ...error,
      message,
      statusCode: 400,
    };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
  });
};
