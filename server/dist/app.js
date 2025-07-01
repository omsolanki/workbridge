"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const proposals_1 = __importDefault(require("./routes/proposals"));
const contracts_1 = __importDefault(require("./routes/contracts"));
const messages_1 = __importDefault(require("./routes/messages"));
const payments_1 = __importDefault(require("./routes/payments"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const admin_1 = __importDefault(require("./routes/admin"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const timeTracking_1 = __importDefault(require("./routes/timeTracking"));
const socketHandlers_1 = require("./sockets/socketHandlers");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io = io;
const PORT = process.env["PORT"] || 5000;
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "WorkBridge API",
            version: "1.0.0",
            description: "A comprehensive freelancing platform API",
            contact: {
                name: "WorkBridge Team",
                email: "support@workbridge.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"),
    max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100"),
    message: {
        error: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, morgan_1.default)("combined", {
    stream: { write: (message) => logger_1.logger.info(message.trim()) },
}));
app.use(limiter);
if (process.env["ENABLE_SWAGGER"] === "true") {
    app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
}
app.get("/api/ping", (_req, res) => {
    res.json({
        success: true,
        message: "WorkBridge API is running!",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});
app.use("/api/auth", auth_1.default);
app.use("/api/users", users_1.default);
app.use("/api/jobs", jobs_1.default);
app.use("/api/proposals", proposals_1.default);
app.use("/api/contracts", contracts_1.default);
app.use("/api/messages", messages_1.default);
app.use("/api/payments", payments_1.default);
app.use("/api/reviews", reviews_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/notifications", notifications_1.default);
app.use("/api/time-tracking", timeTracking_1.default);
(0, socketHandlers_1.setupSocketHandlers)(io);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        logger_1.logger.info("Connected to MongoDB");
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 WorkBridge Server running on port ${PORT}`);
            logger_1.logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            logger_1.logger.info(`🔗 Health Check: http://localhost:${PORT}/api/ping`);
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start server:", error);
        process.exit(1);
    }
};
process.on("unhandledRejection", (err) => {
    logger_1.logger.error("Unhandled Promise Rejection:", err);
    server.close(() => {
        process.exit(1);
    });
});
process.on("uncaughtException", (err) => {
    logger_1.logger.error("Uncaught Exception:", err);
    process.exit(1);
});
process.on("SIGTERM", () => {
    logger_1.logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Process terminated");
    });
});
startServer();
//# sourceMappingURL=app.js.map