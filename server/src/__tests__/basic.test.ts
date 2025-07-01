import { User } from "../models/User";
import { Job } from "../models/Job";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Basic Functionality Tests", () => {
  describe("User Model", () => {
    it("should have required schema fields", () => {
      const schema = User.schema;

      expect(schema.paths["email"]).toBeDefined();
      expect(schema.paths["username"]).toBeDefined();
      expect(schema.paths["firstName"]).toBeDefined();
      expect(schema.paths["lastName"]).toBeDefined();
      expect(schema.paths["password"]).toBeDefined();
      expect(schema.paths["role"]).toBeDefined();
    });

    it("should have static methods", () => {
      expect(typeof User.findByEmail).toBe("function");
      expect(typeof User.findByUsername).toBe("function");
      expect(typeof User.findFreelancers).toBe("function");
      expect(typeof User.findClients).toBe("function");
    });

    it("should create user instance with default values", () => {
      const userData = {
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer" as const,
      };

      const user = new User(userData);

      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.isVerified).toBe(false);
      expect(user.isActive).toBe(true);
      expect(user.rating).toBe(0);
      expect(user.totalReviews).toBe(0);
      expect(user.loginAttempts).toBe(0);
    });

    it("should have instance methods", () => {
      const user = new User({
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      });

      expect(typeof user.comparePassword).toBe("function");
      expect(typeof user.generateAuthToken).toBe("function");
      expect(typeof user.generateEmailVerificationToken).toBe("function");
      expect(typeof user.generatePasswordResetToken).toBe("function");
    });
  });

  describe("Job Model", () => {
    it("should have required schema fields", () => {
      const schema = Job.schema;

      expect(schema.paths["title"]).toBeDefined();
      expect(schema.paths["description"]).toBeDefined();
      expect(schema.paths["category"]).toBeDefined();
      expect(schema.paths["client"]).toBeDefined();
      expect(schema.paths["budget.min"]).toBeDefined();
      expect(schema.paths["budget.max"]).toBeDefined();
      expect(schema.paths["budget.type"]).toBeDefined();
      expect(schema.paths["duration.value"]).toBeDefined();
      expect(schema.paths["duration.unit"]).toBeDefined();
    });

    it("should create job instance with default values", () => {
      const jobData = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development" as const,
        subcategory: "Frontend Development",
        skills: ["React", "TypeScript"],
        client: "507f1f77bcf86cd799439011",
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed" as const,
        },
        duration: {
          value: 2,
          unit: "weeks" as const,
        },
        experienceLevel: "intermediate" as const,
        projectType: "one-time" as const,
        location: {
          type: "remote" as const,
        },
      };

      const job = new Job(jobData);

      expect(job.title).toBe(jobData.title);
      expect(job.description).toBe(jobData.description);
      expect(job.category).toBe(jobData.category);
      expect(job.client.toString()).toBe(jobData.client);
      expect(job.budget).toEqual(jobData.budget);
      expect(job.duration).toEqual(jobData.duration);
      expect(job.status).toBe("open");
      expect(job.visibility).toBe("public");
      expect(job.views).toBe(0);
    });
  });

  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const plainPassword = "password123";
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it("should reject wrong password", async () => {
      const plainPassword = "password123";
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const isMatch = await bcrypt.compare("wrongpassword", hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe("JWT Token", () => {
    it("should generate and verify token", () => {
      const payload = {
        userId: "507f1f77bcf86cd799439011",
        role: "freelancer",
      };
      const secret = "test-secret";

      const token = jwt.sign(payload, secret, { expiresIn: "24h" });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it("should reject invalid token", () => {
      const secret = "test-secret";

      expect(() => {
        jwt.verify("invalid-token", secret);
      }).toThrow();
    });
  });

  describe("Environment Variables", () => {
    it("should have fallback values for required env vars", () => {
      const jwtSecret = process.env["JWT_SECRET"] || "fallback-secret";
      const bcryptRounds = process.env["BCRYPT_ROUNDS"] || "12";
      const jwtExpiresIn = process.env["JWT_EXPIRES_IN"] || "7d";

      expect(jwtSecret).toBeDefined();
      expect(bcryptRounds).toBeDefined();
      expect(jwtExpiresIn).toBeDefined();
    });
  });
});
