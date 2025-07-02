import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  verbose: 5,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
  verbose: "cyan",
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env["NODE_ENV"] || "development";
  const logLevel = process.env["LOG_LEVEL"] || "info";

  if (env === "development") {
    return logLevel === "debug" ? "debug" : "info";
  }

  return logLevel;
};

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let log = `${timestamp} ${level}: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// Custom format for file output (JSON for better parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create daily rotate file transport for different log levels
const createDailyRotateFileTransport = (level: string, filename: string) => {
  return new DailyRotateFile({
    filename: path.join(logsDir, `${filename}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d", // Keep logs for 14 days
    level,
    format: fileFormat,
  });
};

// Define transports
const transports: winston.transport[] = [
  // Console transport for development
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Daily rotate file transports
  createDailyRotateFileTransport("error", "error"),
  createDailyRotateFileTransport("warn", "warn"),
  createDailyRotateFileTransport("info", "info"),
  createDailyRotateFileTransport("http", "http"),
  createDailyRotateFileTransport("debug", "debug"),

  // Combined log file
  createDailyRotateFileTransport("info", "combined"),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

// Add request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  // Log request
  logger.http("Incoming Request", {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk: any, encoding: any) {
    const duration = Date.now() - start;

    logger.http("Outgoing Response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length"),
      timestamp: new Date().toISOString(),
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLogger = (error: any, req: any, _res: any, next: any) => {
  logger.error("Unhandled Error", {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      body: req.body,
      params: req.params,
      query: req.query,
    },
    timestamp: new Date().toISOString(),
  });

  next(error);
};

// Performance monitoring middleware
export const performanceLogger = (req: any, res: any, next: any) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    if (duration > 1000) {
      // Log slow requests (>1 second)
      logger.warn("Slow Request Detected", {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};

// Database query logger
export const dbLogger = {
  query: (query: string, params: any[], duration: number) => {
    logger.debug("Database Query", {
      query,
      params,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  },

  error: (error: any, query?: string) => {
    logger.error("Database Error", {
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
      query,
      timestamp: new Date().toISOString(),
    });
  },
};

// Authentication logger
export const authLogger = {
  login: (email: string, success: boolean, ip: string, userAgent: string) => {
    const level = success ? "info" : "warn";
    logger[level]("Authentication Attempt", {
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  logout: (userId: string, ip: string) => {
    logger.info("User Logout", {
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  tokenRefresh: (userId: string, success: boolean) => {
    const level = success ? "info" : "warn";
    logger[level]("Token Refresh", {
      userId,
      success,
      timestamp: new Date().toISOString(),
    });
  },
};

// API endpoint logger
export const apiLogger = {
  request: (endpoint: string, method: string, userId?: string) => {
    logger.info("API Request", {
      endpoint,
      method,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  response: (
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number
  ) => {
    logger.info("API Response", {
      endpoint,
      method,
      statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  },

  error: (endpoint: string, method: string, error: any, userId?: string) => {
    logger.error("API Error", {
      endpoint,
      method,
      userId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      timestamp: new Date().toISOString(),
    });
  },
};

// System logger
export const systemLogger = {
  startup: (port: number, env: string) => {
    logger.info("Server Startup", {
      port,
      environment: env,
      timestamp: new Date().toISOString(),
    });
  },

  shutdown: (signal: string) => {
    logger.info("Server Shutdown", {
      signal,
      timestamp: new Date().toISOString(),
    });
  },

  health: (status: string, uptime: number) => {
    logger.info("Health Check", {
      status,
      uptime: `${uptime}s`,
      timestamp: new Date().toISOString(),
    });
  },
};

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export the main logger
export { logger };

// Log uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    reason:
      reason instanceof Error
        ? {
            message: reason.message,
            stack: reason.stack,
            name: reason.name,
          }
        : reason,
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
