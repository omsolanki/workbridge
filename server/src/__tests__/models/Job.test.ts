import mongoose from "mongoose";
import { User } from "../../models/User";
import { Job } from "../../models/Job";

describe("Job Model", () => {
  let clientId: string;

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

    // Create a test client
    const clientData = {
      email: "client@example.com",
      username: "clientuser",
      firstName: "Client",
      lastName: "User",
      password: "password123",
      role: "client",
    };

    const client = new User(clientData);
    const savedClient = await client.save();
    clientId = savedClient._id?.toString() || "";
  });

  describe("Schema Validation", () => {
    it("should create a valid job", async () => {
      const validJob = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React", "TypeScript"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        client: clientId,
        location: {
          type: "remote",
        },
        visibility: "public",
      };

      const job = new Job(validJob);
      const savedJob = await job.save();

      expect(savedJob._id).toBeDefined();
      expect(savedJob.title).toBe(validJob.title);
      expect(savedJob.description).toBe(validJob.description);
      expect(savedJob.category).toBe(validJob.category);
      expect(savedJob.subcategory).toBe(validJob.subcategory);
      expect(savedJob.skills).toEqual(validJob.skills);
      expect(savedJob.budget).toEqual(validJob.budget);
      expect(savedJob.duration).toEqual(validJob.duration);
      expect(savedJob.experienceLevel).toBe(validJob.experienceLevel);
      expect(savedJob.projectType).toBe(validJob.projectType);
      expect(savedJob.client.toString()).toBe(clientId);
      expect(savedJob.status).toBe("open");
      expect(savedJob.visibility).toBe(validJob.visibility);
      expect(savedJob.views).toBe(0);
    });

    it("should require title", async () => {
      const jobWithoutTitle = {
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobWithoutTitle);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["title"]).toBeDefined();
    });

    it("should require description", async () => {
      const jobWithoutDescription = {
        title: "Test Job",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobWithoutDescription);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["description"]).toBeDefined();
    });

    it("should require category", async () => {
      const jobWithoutCategory = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobWithoutCategory);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["category"]).toBeDefined();
    });

    it("should require client", async () => {
      const jobWithoutClient = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
      };

      const job = new Job(jobWithoutClient);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["client"]).toBeDefined();
    });

    it("should validate category enum", async () => {
      const jobWithInvalidCategory = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "invalid-category",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobWithInvalidCategory);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["category"]).toBeDefined();
    });

    it("should validate experience level enum", async () => {
      const jobWithInvalidExperience = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "invalid-level",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobWithInvalidExperience);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["experienceLevel"]).toBeDefined();
    });

    it("should validate project type enum", async () => {
      const jobWithInvalidProjectType = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "invalid-type",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobWithInvalidProjectType);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["projectType"]).toBeDefined();
    });

    it("should validate visibility enum", async () => {
      const jobWithInvalidVisibility = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        visibility: "invalid-visibility",
        client: clientId,
      };

      const job = new Job(jobWithInvalidVisibility);
      let err: any;

      try {
        await job.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors["visibility"]).toBeDefined();
    });

    it("should auto-correct budget range when max is less than min", async () => {
      const jobWithInvalidBudget = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 2000,
          max: 1000, // Max less than min
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobWithInvalidBudget);
      const savedJob = await job.save();

      // The pre-save middleware should have corrected the budget
      expect(savedJob.budget.max).toBe(savedJob.budget.min);
      expect(savedJob.budget.max).toBe(2000);
    });
  });

  describe("Default Values", () => {
    it("should set default status to open", async () => {
      const jobData = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobData);
      const savedJob = await job.save();

      expect(savedJob.status).toBe("open");
    });

    it("should set default visibility to public", async () => {
      const jobData = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobData);
      const savedJob = await job.save();

      expect(savedJob.visibility).toBe("public");
    });

    it("should set default views to 0", async () => {
      const jobData = {
        title: "Test Job",
        description:
          "This is a comprehensive test job description that meets the minimum length requirement of 50 characters for job descriptions.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React"],
        budget: {
          min: 1000,
          max: 2000,
          type: "fixed",
        },
        duration: {
          value: 2,
          unit: "weeks",
        },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: {
          type: "remote",
        },
        client: clientId,
      };

      const job = new Job(jobData);
      const savedJob = await job.save();

      expect(savedJob.views).toBe(0);
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      // Create multiple jobs for testing
      const jobData1 = {
        title: "React Developer Needed",
        description:
          "Looking for an experienced React developer to build a modern web application with comprehensive features and functionality.",
        category: "web-development",
        subcategory: "Frontend Development",
        skills: ["React", "JavaScript"],
        budget: { min: 1000, max: 2000, type: "fixed" },
        duration: { value: 2, unit: "weeks" },
        experienceLevel: "intermediate",
        projectType: "one-time",
        location: { type: "remote" },
        client: clientId,
        status: "open",
        visibility: "public",
      };

      const jobData2 = {
        title: "Node.js Backend Developer",
        description:
          "Seeking a skilled Node.js developer to create robust backend services and APIs for our enterprise application platform.",
        category: "web-development",
        subcategory: "Backend Development",
        skills: ["Node.js", "Express"],
        budget: { min: 1500, max: 3000, type: "fixed" },
        duration: { value: 3, unit: "weeks" },
        experienceLevel: "expert",
        projectType: "one-time",
        location: { type: "remote" },
        client: clientId,
        status: "open",
        visibility: "public",
      };

      const jobData3 = {
        title: "Mobile App Developer",
        description:
          "Need a talented mobile developer to create a feature-rich iOS application with modern UI/UX design and functionality.",
        category: "mobile-development",
        subcategory: "iOS Development",
        skills: ["Swift", "iOS"],
        budget: { min: 2000, max: 4000, type: "fixed" },
        duration: { value: 4, unit: "weeks" },
        experienceLevel: "entry",
        projectType: "ongoing",
        location: { type: "remote" },
        client: clientId,
        status: "completed",
        visibility: "public",
      };

      await Job.create([jobData1, jobData2, jobData3]);
    });

    it("should find jobs by category", async () => {
      const webJobs = await Job.find({ category: "web-development" });
      expect(webJobs).toHaveLength(2);
      expect(
        webJobs.every((job: any) => job.category === "web-development")
      ).toBe(true);

      const mobileJobs = await Job.find({ category: "mobile-development" });
      expect(mobileJobs).toHaveLength(1);
      expect(mobileJobs[0]?.category).toBe("mobile-development");
    });

    it("should find open jobs", async () => {
      const openJobs = await Job.find({ status: "open" });
      expect(openJobs).toHaveLength(2);
      expect(openJobs.every((job: any) => job.status === "open")).toBe(true);
    });

    it("should find jobs by client", async () => {
      const clientJobs = await Job.find({ client: clientId });
      expect(clientJobs).toHaveLength(3);
      expect(
        clientJobs.every((job: any) => job.client.toString() === clientId)
      ).toBe(true);
    });
  });
});
