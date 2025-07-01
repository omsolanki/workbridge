"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, _req, res, _next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error(err);
    if (err.name === "CastError") {
        const message = "Resource not found";
        error = {
            ...error,
            message,
            statusCode: 404,
        };
    }
    if (err.code === "11000") {
        const message = "Duplicate field value entered";
        error = {
            ...error,
            message,
            statusCode: 400,
        };
    }
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error = {
            ...error,
            message,
            statusCode: 400,
        };
    }
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
    if (err.name === "MulterError") {
        const message = "File upload error";
        error = {
            ...error,
            message,
            statusCode: 400,
        };
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || "Server Error";
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map