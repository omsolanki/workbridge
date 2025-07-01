import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Proposal } from "../models/Proposal";
import { Contract } from "../models/Contract";

dotenv.config();

const MONGODB_URI =
  process.env["MONGODB_URI"] || "mongodb://localhost:27017/workbridge";

// Additional sample data for development
const additionalUsers = [
  {
    username: "alex_chen",
    email: "alex@example.com",
    firstName: "Alex",
    lastName: "Chen",
    password: "password123",
    role: "freelancer",
    profile: {
      bio: "Mobile app developer specializing in React Native and Flutter",
      skills: [
        "React Native",
        "Flutter",
        "JavaScript",
        "TypeScript",
        "Firebase",
      ],
      hourlyRate: 40,
      rating: 4.7,
      totalReviews: 15,
      completedJobs: 10,
      totalEarnings: 18000,
    },
  },
  {
    username: "emma_davis",
    email: "emma@example.com",
    firstName: "Emma",
    lastName: "Davis",
    password: "password123",
    role: "client",
    profile: {
      bio: "Marketing consultant looking for creative designers",
      company: "Creative Solutions",
      website: "https://creativesolutions.com",
    },
  },
];

const additionalJobs = [
  {
    title: "React Native Mobile App Development",
    description:
      "Need a React Native developer to build a food delivery app. The app should include user authentication, restaurant listings, order management, and payment integration.",
    category: "Mobile Development",
    subcategory: "React Native",
    skills: ["React Native", "JavaScript", "Firebase", "Stripe", "Redux"],
    budget: {
      min: 5000,
      max: 8000,
      type: "fixed",
    },
    duration: {
      value: 6,
      unit: "weeks",
    },
    experienceLevel: "expert",
    projectType: "one-time",
    status: "open",
    visibility: "public",
    attachments: [],
    location: {
      type: "remote",
    },
    isUrgent: true,
    isFeatured: true,
    views: 89,
    proposalsCount: 2,
  },
  {
    title: "Logo and Brand Identity Design",
    description:
      "Looking for a creative designer to create a modern logo and brand identity for a tech startup. Need logo variations, color palette, and brand guidelines.",
    category: "Design",
    subcategory: "Logo Design",
    skills: [
      "Adobe Illustrator",
      "Logo Design",
      "Brand Identity",
      "Typography",
    ],
    budget: {
      min: 500,
      max: 1000,
      type: "fixed",
    },
    duration: {
      value: 1,
      unit: "weeks",
    },
    experienceLevel: "intermediate",
    projectType: "one-time",
    status: "open",
    visibility: "public",
    attachments: [],
    location: {
      type: "remote",
    },
    isUrgent: false,
    isFeatured: false,
    views: 34,
    proposalsCount: 1,
  },
];

async function seedDevelopmentData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if users already exist
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users`);

    // Create additional users if they don't exist
    const createdUsers = [];
    for (const userData of additionalUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword,
        });
        const savedUser = await user.save();
        createdUsers.push(savedUser);
        console.log(`Created user: ${savedUser.username}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${existingUser.username}`);
      }
    }

    // Get all users for job creation
    const allUsers = await User.find({});
    const clients = allUsers.filter((user) => user.role === "client");
    const freelancers = allUsers.filter((user) => user.role === "freelancer");

    // Create additional jobs
    const createdJobs = [];
    for (let i = 0; i < additionalJobs.length; i++) {
      const jobData = additionalJobs[i];
      const client = clients[i % clients.length];

      if (!client) {
        console.warn(
          `No client available for job ${i}, skipping job creation.`
        );
        continue;
      }

      const job = new Job({
        ...jobData,
        client: client._id,
      });
      const savedJob = await job.save();
      createdJobs.push(savedJob);
      console.log(`Created job: ${savedJob.title}`);
    }

    // Create proposals - ensure each freelancer only submits one proposal per job
    for (let i = 0; i < additionalJobs.length; i++) {
      const jobData = additionalJobs[i];
      const job = createdJobs[i % createdJobs.length];
      const freelancer = freelancers[i % freelancers.length];

      if (!job) {
        console.warn(
          `No job available for proposal ${i}, skipping proposal creation.`
        );
        continue;
      }
      if (!freelancer) {
        console.warn(
          `No freelancer available for proposal ${i}, skipping proposal creation.`
        );
        continue;
      }

      // Check for existing proposal
      const existingProposal = await Proposal.findOne({
        job: job._id,
        freelancer: freelancer._id,
      });
      if (existingProposal) {
        console.log(`Proposal already exists for job: ${job.title}`);
        continue;
      }

      const proposal = new Proposal({
        coverLetter:
          "I have extensive experience with React Native and have built several food delivery apps. I can deliver a high-quality, scalable solution that meets all your requirements.",
        proposedAmount: 6500,
        estimatedDuration: 42,
        attachments: [],
        status: "pending",
        job: job._id,
        freelancer: freelancer._id,
      });
      await proposal.save();
      console.log(`Created proposal for job: ${job.title}`);
    }

    // Create one accepted proposal and contract
    if (createdJobs.length > 0 && freelancers.length > 0) {
      const job = createdJobs[0];
      const freelancer = freelancers[0];

      if (!job) {
        console.warn(
          "No job available for accepted proposal, skipping contract creation."
        );
      } else if (!freelancer) {
        console.warn(
          "No freelancer available for accepted proposal, skipping contract creation."
        );
      } else {
        // Create accepted proposal
        const acceptedProposal = new Proposal({
          coverLetter:
            "I'm excited to work on this project! I have the exact skills you need and can start immediately.",
          proposedAmount: 3500,
          estimatedDuration: 25,
          attachments: [],
          status: "accepted",
          job: job._id,
          freelancer: freelancer._id,
        });
        const savedProposal = await acceptedProposal.save();

        // Create contract
        const contract = new Contract({
          job: job._id,
          client: job.client,
          freelancer: freelancer._id,
          proposal: savedProposal._id,
          amount: 3500,
          startDate: new Date(),
          status: "active",
          milestones: [
            {
              title: "Project Setup and Planning",
              description:
                "Initial setup, requirements gathering, and project planning",
              amount: 700,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              status: "completed",
            },
            {
              title: "Core Development",
              description: "Main development phase with core features",
              amount: 2100,
              dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
              status: "in-progress",
            },
            {
              title: "Testing and Deployment",
              description: "Final testing, bug fixes, and deployment",
              amount: 700,
              dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
              status: "pending",
            },
          ],
        });
        await contract.save();
        console.log("Created contract for accepted proposal");
      }
    }

    console.log("Development data seeded successfully!");
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Total jobs: ${await Job.countDocuments()}`);
    console.log(`Total proposals: ${await Proposal.countDocuments()}`);
    console.log(`Total contracts: ${await Contract.countDocuments()}`);
  } catch (error) {
    console.error("Error seeding development data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedDevelopmentData();
