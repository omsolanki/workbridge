import { User } from "../../models/User";

describe("User Model (Simple)", () => {
  describe("Schema Definition", () => {
    it("should have required fields", () => {
      const schema = User.schema;

      expect(schema.paths["email"]).toBeDefined();
      expect(schema.paths["username"]).toBeDefined();
      expect(schema.paths["firstName"]).toBeDefined();
      expect(schema.paths["lastName"]).toBeDefined();
      expect(schema.paths["password"]).toBeDefined();
      expect(schema.paths["role"]).toBeDefined();
    });

    it("should have default values", () => {
      const schema = User.schema;

      const isVerifiedPath = schema.paths["isVerified"] as any;
      const isActivePath = schema.paths["isActive"] as any;
      const ratingPath = schema.paths["rating"] as any;
      const totalReviewsPath = schema.paths["totalReviews"] as any;
      const loginAttemptsPath = schema.paths["loginAttempts"] as any;

      expect(isVerifiedPath.defaultValue).toBe(false);
      expect(isActivePath.defaultValue).toBe(true);
      expect(ratingPath.defaultValue).toBe(0);
      expect(totalReviewsPath.defaultValue).toBe(0);
      expect(loginAttemptsPath.defaultValue).toBe(0);
    });

    it("should have required validations", () => {
      const schema = User.schema;

      const emailPath = schema.paths["email"] as any;
      const usernamePath = schema.paths["username"] as any;
      const firstNamePath = schema.paths["firstName"] as any;
      const lastNamePath = schema.paths["lastName"] as any;
      const passwordPath = schema.paths["password"] as any;
      const rolePath = schema.paths["role"] as any;

      expect(emailPath.isRequired).toBe(true);
      expect(usernamePath.isRequired).toBe(true);
      expect(firstNamePath.isRequired).toBe(true);
      expect(lastNamePath.isRequired).toBe(true);
      expect(passwordPath.isRequired).toBe(true);
      expect(rolePath.isRequired).toBe(true);
    });

    it("should have role enum validation", () => {
      const schema = User.schema;
      const rolePath = schema.paths["role"] as any;

      expect(rolePath.enumValues).toContain("client");
      expect(rolePath.enumValues).toContain("freelancer");
      expect(rolePath.enumValues).toContain("admin");
    });
  });

  describe("Virtual Fields", () => {
    it("should have fullName virtual", () => {
      const schema = User.schema;
      expect(schema.virtuals.fullName).toBeDefined();
    });

    it("should have isLocked virtual", () => {
      const schema = User.schema;
      expect(schema.virtuals.isLocked).toBeDefined();
    });
  });

  describe("Instance Methods", () => {
    it("should have comparePassword method", () => {
      const user = new User({
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      });

      expect(typeof user.comparePassword).toBe("function");
    });

    it("should have generateAuthToken method", () => {
      const user = new User({
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      });

      expect(typeof user.generateAuthToken).toBe("function");
    });

    it("should have generateEmailVerificationToken method", () => {
      const user = new User({
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      });

      expect(typeof user.generateEmailVerificationToken).toBe("function");
    });

    it("should have generatePasswordResetToken method", () => {
      const user = new User({
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      });

      expect(typeof user.generatePasswordResetToken).toBe("function");
    });
  });

  describe("Static Methods", () => {
    it("should have findByEmail method", () => {
      expect(typeof User.findByEmail).toBe("function");
    });

    it("should have findByUsername method", () => {
      expect(typeof User.findByUsername).toBe("function");
    });

    it("should have findFreelancers method", () => {
      expect(typeof User.findFreelancers).toBe("function");
    });

    it("should have findClients method", () => {
      expect(typeof User.findClients).toBe("function");
    });
  });

  describe("Model Creation", () => {
    it("should create a user instance", () => {
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
  });
});
