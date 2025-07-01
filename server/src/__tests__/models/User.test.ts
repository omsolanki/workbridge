import mongoose from "mongoose";
import { User } from "../../models/User";

describe("User Model", () => {
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

  describe("Schema Validation", () => {
    it("should create a valid user", async () => {
      const validUser = {
        email: "validuser@example.com",
        username: "validuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.username).toBe(validUser.username);
      expect(savedUser.firstName).toBe(validUser.firstName);
      expect(savedUser.lastName).toBe(validUser.lastName);
      expect(savedUser.role).toBe(validUser.role);
      expect(savedUser.isVerified).toBe(false);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.rating).toBe(0);
      expect(savedUser.totalReviews).toBe(0);
    });

    it("should require email", async () => {
      const userWithoutEmail = {
        username: "noemailuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const user = new User(userWithoutEmail);
      let err: any;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["email"]).toBeDefined();
    });

    it("should require unique email", async () => {
      const userData = {
        email: "unique@example.com",
        username: "uniqueuser1",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      await User.create(userData);

      const duplicateUser = new User({
        ...userData,
        username: "uniqueuser2",
      });

      let err: any;
      try {
        await duplicateUser.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.code === 11000 || err.name === "MongoServerError").toBe(true); // MongoDB duplicate key error
    });

    it("should validate email format", async () => {
      const userWithInvalidEmail = {
        email: "invalid-email",
        username: "invalidemailuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const user = new User(userWithInvalidEmail);
      let err: any;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["email"]).toBeDefined();
    });

    it("should validate password length", async () => {
      const userWithShortPassword = {
        email: "shortpass@example.com",
        username: "shortpassuser",
        firstName: "Test",
        lastName: "User",
        password: "123",
        role: "freelancer",
      };

      const user = new User(userWithShortPassword);
      let err: any;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["password"]).toBeDefined();
    });

    it("should validate role enum", async () => {
      const userWithInvalidRole = {
        email: "invalidrole@example.com",
        username: "invalidroleuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "invalid-role",
      };

      const user = new User(userWithInvalidRole);
      let err: any;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["role"]).toBeDefined();
    });
  });

  describe("Password Hashing", () => {
    it("should hash password before saving", async () => {
      const userData = {
        email: "hashpass@example.com",
        username: "hashpassuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(
        /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/
      ); // bcrypt hash pattern
    });
  });

  describe("Password Comparison", () => {
    it("should compare password correctly", async () => {
      const userData = {
        email: "comparepass@example.com",
        username: "comparepassuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword("password123");
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword("wrongpassword");
      expect(isNotMatch).toBe(false);
    });
  });

  describe("Static Methods", () => {
    it("should find user by email", async () => {
      const userData = {
        email: "findbyemail@example.com",
        username: "findbyemailuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      await User.create(userData);

      const foundUser = await User.findByEmail("findbyemail@example.com", true);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe("findbyemail@example.com");

      const notFoundUser = await User.findByEmail("nonexistent@example.com");
      expect(notFoundUser).toBeNull();
    });

    it("should find user by username", async () => {
      const userData = {
        email: "findbyusername@example.com",
        username: "findbyusernameuser",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      await User.create(userData);

      const foundUser = await User.findByUsername("findbyusernameuser", true);
      expect(foundUser).toBeDefined();
      expect(foundUser?.username).toBe("findbyusernameuser");

      const notFoundUser = await User.findByUsername("nonexistent");
      expect(notFoundUser).toBeNull();
    });

    it("should find freelancers", async () => {
      const freelancerData = {
        email: "findfreelancer@example.com",
        username: "findfreelancer",
        firstName: "Freelancer",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const clientData = {
        email: "findclient@example.com",
        username: "findclient",
        firstName: "Client",
        lastName: "User",
        password: "password123",
        role: "client",
      };

      await User.create([freelancerData, clientData]);

      const freelancers = await User.findFreelancers();
      expect(freelancers).toHaveLength(1);
      expect(freelancers[0]?.role).toBe("freelancer");
    });

    it("should find clients", async () => {
      const freelancerData = {
        email: "findclientsfreelancer@example.com",
        username: "findclientsfreelancer",
        firstName: "Freelancer",
        lastName: "User",
        password: "password123",
        role: "freelancer",
      };

      const clientData = {
        email: "findclientsclient@example.com",
        username: "findclientsclient",
        firstName: "Client",
        lastName: "User",
        password: "password123",
        role: "client",
      };

      await User.create([freelancerData, clientData]);

      const clients = await User.findClients();
      expect(clients).toHaveLength(1);
      expect(clients[0]?.role).toBe("client");
    });
  });
});
