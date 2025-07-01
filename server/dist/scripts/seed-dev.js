"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Job_1 = require("../models/Job");
const Proposal_1 = require("../models/Proposal");
const Contract_1 = require("../models/Contract");
dotenv_1.default.config();
const MONGODB_URI = process.env["MONGODB_URI"] || "mongodb://localhost:27017/workbridge";
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
        description: "Need a React Native developer to build a food delivery app. The app should include user authentication, restaurant listings, order management, and payment integration.",
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
        description: "Looking for a creative designer to create a modern logo and brand identity for a tech startup. Need logo variations, color palette, and brand guidelines.",
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
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        const existingUsers = await User_1.User.find({});
        console.log(`Found ${existingUsers.length} existing users`);
        const createdUsers = [];
        for (const userData of additionalUsers) {
            const existingUser = await User_1.User.findOne({ email: userData.email });
            if (!existingUser) {
                const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
                const user = new User_1.User({
                    ...userData,
                    password: hashedPassword,
                });
                const savedUser = await user.save();
                createdUsers.push(savedUser);
                console.log(`Created user: ${savedUser.username}`);
            }
            else {
                createdUsers.push(existingUser);
                console.log(`User already exists: ${existingUser.username}`);
            }
        }
        const allUsers = await User_1.User.find({});
        const clients = allUsers.filter((user) => user.role === "client");
        const freelancers = allUsers.filter((user) => user.role === "freelancer");
        const createdJobs = [];
        for (let i = 0; i < additionalJobs.length; i++) {
            const jobData = additionalJobs[i];
            const client = clients[i % clients.length];
            const job = new Job_1.Job({
                ...jobData,
                client: client._id,
            });
            const savedJob = await job.save();
            createdJobs.push(savedJob);
            console.log(`Created job: ${savedJob.title}`);
        }
        if (createdJobs.length > 0 && freelancers.length > 0) {
            const job = createdJobs[0];
            const freelancer = freelancers[0];
            const existingProposal = await Proposal_1.Proposal.findOne({
                job: job._id,
                freelancer: freelancer._id,
            });
            if (!existingProposal) {
                const proposal = new Proposal_1.Proposal({
                    coverLetter: "I have extensive experience with React Native and have built several food delivery apps. I can deliver a high-quality, scalable solution that meets all your requirements.",
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
            else {
                console.log(`Proposal already exists for job: ${job.title}`);
            }
        }
        console.log("Development data seeded successfully!");
        console.log(`Total users: ${allUsers.length}`);
        console.log(`Total jobs: ${await Job_1.Job.countDocuments()}`);
        console.log(`Total proposals: ${await Proposal_1.Proposal.countDocuments()}`);
        console.log(`Total contracts: ${await Contract_1.Contract.countDocuments()}`);
    }
    catch (error) {
        console.error("Error seeding development data:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB");
    }
}
seedDevelopmentData();
//# sourceMappingURL=seed-dev.js.map