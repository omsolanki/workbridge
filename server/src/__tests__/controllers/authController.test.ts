import mongoose from "mongoose";
import { User } from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Auth Controller Logic", () => {
  beforeAll(async () => {
    // Connect to test database
    const TEST_MONGODB_URI = process.env["TEST_MONGODB_URI"];

    if (!TEST_MONGODB_URI) {
      throw new Error("TEST_MONGODB_URI environment variable is not set");
    }

    try {
      await mongoose.connect(TEST_MONGODB_URI);
      console.log("Connected to test database");
    } catch (error) {
      console.error("Failed to connect to test database:", error);
    }
  });

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("Disconnected from test database");
      }
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        if (collection) {
          try {
            await collection.deleteMany({});
          } catch (error) {
            console.error(`Error clearing collection ${key}:`, error);
          }
        }
      }
    }
  });

  describe("User Registration Logic", () => {
    it("should create a new user with hashed password", async () => {
      const userData = {
        email: "authcreate@example.com",
        username: "authcreateuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.isVerified).toBe(false);
      expect(savedUser.isActive).toBe(true);
    });

    it("should prevent duplicate email registration", async () => {
      const userData = {
        email: "authduplicate@example.com",
        username: "authduplicate1",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      // Create first user
      await User.create(userData);

      // Try to create second user with same email
      const duplicateUserData = {
        ...userData,
        username: "authduplicate2",
      };

      let err: any;
      try {
        await User.create(duplicateUserData);
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.code === 11000 || err.name === "MongoServerError").toBe(true); // MongoDB duplicate key error
    });

    it("should prevent duplicate username registration", async () => {
      const userData = {
        email: "authduplicateuser1@example.com",
        username: "authduplicateuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      // Create first user
      await User.create(userData);

      // Try to create second user with same username
      const duplicateUserData = {
        ...userData,
        email: "authduplicateuser2@example.com",
      };

      let err: any;
      try {
        await User.create(duplicateUserData);
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.code === 11000 || err.name === "MongoServerError").toBe(true); // MongoDB duplicate key error
    });
  });

  describe("User Login Logic", () => {
    beforeEach(async () => {
      const userData = {
        email: "authlogin@example.com",
        username: "authloginuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      await User.create(userData);
    });

    it("should find user by email and verify password", async () => {
      const user = await User.findByEmail("authlogin@example.com", true);
      expect(user).toBeDefined();
      expect(user?.email).toBe("authlogin@example.com");

      const isPasswordValid = await user?.comparePassword("password123");
      expect(isPasswordValid).toBe(true);

      const isPasswordInvalid = await user?.comparePassword("wrongpassword");
      expect(isPasswordInvalid).toBe(false);
    });

    it("should find user by username and verify password", async () => {
      const user = await User.findByUsername("authloginuser", true);
      expect(user).toBeDefined();
      expect(user?.username).toBe("authloginuser");

      const isPasswordValid = await user?.comparePassword("password123");
      expect(isPasswordValid).toBe(true);
    });

    it("should return null for non-existent user", async () => {
      const user = await User.findByEmail("nonexistent@example.com");
      expect(user).toBeNull();
    });
  });

  describe("JWT Token Generation", () => {
    it("should generate valid JWT token", () => {
      const userId = "507f1f77bcf86cd799439011";
      const role = "freelancer";
      const secret = process.env["JWT_SECRET"] || "test-secret";

      const token = jwt.sign({ userId, role }, secret, { expiresIn: "24h" });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
    });

    it("should verify JWT token correctly", () => {
      const userId = "507f1f77bcf86cd799439011";
      const role = "freelancer";
      const secret = process.env["JWT_SECRET"] || "test-secret";

      const token = jwt.sign({ userId, role }, secret, { expiresIn: "24h" });

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
    });

    it("should reject invalid JWT token", () => {
      const secret = process.env["JWT_SECRET"] || "test-secret";

      expect(() => {
        jwt.verify("invalid-token", secret);
      }).toThrow();
    });
  });

  describe("Password Security", () => {
    it("should hash password with bcrypt", async () => {
      const plainPassword = "password123";
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it("should compare password correctly", async () => {
      const plainPassword = "password123";
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);

      const isNotMatch = await bcrypt.compare("wrongpassword", hashedPassword);
      expect(isNotMatch).toBe(false);
    });
  });
});
