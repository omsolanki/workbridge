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
const sampleUsers = [
    {
        username: "john_doe",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        role: "client",
        profile: {
            bio: "Experienced entrepreneur looking for talented developers",
            company: "TechCorp Inc.",
            website: "https://techcorp.com",
        },
    },
    {
        username: "jane_smith",
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Smith",
        password: "password123",
        role: "freelancer",
        profile: {
            bio: "Full-stack developer with 5+ years of experience in React, Node.js, and Python",
            skills: ["React", "Node.js", "Python", "MongoDB", "AWS"],
            hourlyRate: 45,
            rating: 4.8,
            totalReviews: 12,
            completedJobs: 8,
            totalEarnings: 15000,
        },
    },
    {
        username: "mike_wilson",
        email: "mike@example.com",
        firstName: "Mike",
        lastName: "Wilson",
        password: "password123",
        role: "freelancer",
        profile: {
            bio: "UI/UX designer passionate about creating beautiful and functional interfaces",
            skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
            hourlyRate: 35,
            rating: 4.6,
            totalReviews: 8,
            completedJobs: 5,
            totalEarnings: 8000,
        },
    },
    {
        username: "sarah_jones",
        email: "sarah@example.com",
        firstName: "Sarah",
        lastName: "Jones",
        password: "password123",
        role: "client",
        profile: {
            bio: "Startup founder looking for innovative solutions",
            company: "InnovateStart",
            website: "https://innovatestart.com",
        },
    },
    {
        username: "admin_user",
        email: "admin@workbridge.com",
        firstName: "Admin",
        lastName: "User",
        password: "admin123",
        role: "admin",
    },
];
const sampleJobs = [
    {
        title: "Build a React E-commerce Website",
        description: "I need a modern e-commerce website built with React and Node.js. The site should include user authentication, product catalog, shopping cart, and payment integration with Stripe.",
        category: "web-development",
        subcategory: "E-commerce",
        skills: ["React", "Node.js", "MongoDB", "Stripe", "Redux"],
        budget: {
            min: 3000,
            max: 5000,
            type: "fixed",
        },
        duration: {
            value: 4,
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
        isFeatured: true,
        views: 45,
        proposalsCount: 3,
    },
    {
        title: "Design Mobile App UI/UX",
        description: "Looking for a talented UI/UX designer to create beautiful and intuitive designs for a fitness tracking mobile app. Need wireframes, mockups, and prototypes.",
        category: "design-creative",
        subcategory: "UI/UX Design",
        skills: ["Figma", "Adobe XD", "Prototyping", "Mobile Design"],
        budget: {
            min: 1500,
            max: 2500,
            type: "fixed",
        },
        duration: {
            value: 2,
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
        isUrgent: true,
        isFeatured: false,
        views: 23,
        proposalsCount: 1,
    },
    {
        title: "Python Data Analysis Project",
        description: "Need help analyzing a large dataset using Python. Looking for someone with experience in pandas, numpy, and matplotlib. The project involves data cleaning, analysis, and visualization.",
        category: "data-science",
        subcategory: "Data Analysis",
        skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Jupyter"],
        budget: {
            min: 800,
            max: 1200,
            type: "fixed",
        },
        duration: {
            value: 1,
            unit: "weeks",
        },
        experienceLevel: "entry",
        projectType: "one-time",
        status: "open",
        visibility: "public",
        attachments: [],
        location: {
            type: "remote",
        },
        isUrgent: false,
        isFeatured: false,
        views: 12,
        proposalsCount: 0,
    },
    {
        title: "WordPress Website Maintenance",
        description: "Looking for ongoing WordPress website maintenance including updates, security monitoring, and content updates. Need someone reliable and experienced.",
        category: "web-development",
        subcategory: "WordPress",
        skills: ["WordPress", "PHP", "MySQL", "Security", "SEO"],
        budget: {
            min: 25,
            max: 35,
            type: "hourly",
        },
        duration: {
            value: 6,
            unit: "months",
        },
        experienceLevel: "intermediate",
        projectType: "ongoing",
        status: "open",
        visibility: "public",
        attachments: [],
        location: {
            type: "remote",
        },
        isUrgent: false,
        isFeatured: true,
        views: 67,
        proposalsCount: 4,
    },
];
const sampleProposals = [
    {
        coverLetter: "I have extensive experience building e-commerce websites with React and Node.js. I've completed similar projects for multiple clients and can deliver a high-quality, scalable solution within your timeline. I'll ensure the site is responsive, fast, and includes all the features you need.",
        proposedAmount: 4200,
        estimatedDuration: 28,
        attachments: [],
        status: "pending",
    },
    {
        coverLetter: "As a UI/UX designer with 3+ years of experience, I specialize in creating user-centered designs for mobile applications. I've worked on several fitness apps and understand the unique challenges of this domain. I'll create intuitive, engaging designs that users will love.",
        proposedAmount: 2000,
        estimatedDuration: 14,
        attachments: [],
        status: "pending",
    },
    {
        coverLetter: "I'm a data scientist with strong Python skills and experience in data analysis. I've worked with similar datasets and can provide comprehensive analysis with clear visualizations. I'll deliver insights that help you make informed decisions.",
        proposedAmount: 1000,
        estimatedDuration: 7,
        attachments: [],
        status: "pending",
    },
];
async function seedDatabase() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        await User_1.User.deleteMany({});
        await Job_1.Job.deleteMany({});
        await Proposal_1.Proposal.deleteMany({});
        await Contract_1.Contract.deleteMany({});
        console.log("Cleared existing data");
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
            const user = new User_1.User({
                ...userData,
                password: hashedPassword,
            });
            const savedUser = await user.save();
            createdUsers.push(savedUser);
            console.log(`Created user: ${savedUser.username}`);
        }
        const clients = createdUsers.filter((user) => user.role === "client");
        const freelancers = createdUsers.filter((user) => user.role === "freelancer");
        if (clients.length === 0) {
            throw new Error("No clients created");
        }
        if (freelancers.length === 0) {
            throw new Error("No freelancers created");
        }
        const createdJobs = [];
        for (let i = 0; i < sampleJobs.length; i++) {
            const jobData = sampleJobs[i];
            const client = clients[i % clients.length];
            if (!client) {
                throw new Error(`No client available for job ${i}`);
            }
            const job = new Job_1.Job({
                ...jobData,
                client: client._id,
            });
            const savedJob = await job.save();
            createdJobs.push(savedJob);
            console.log(`Created job: ${savedJob.title}`);
        }
        for (let i = 0; i < sampleProposals.length; i++) {
            const proposalData = sampleProposals[i];
            const job = createdJobs[i % createdJobs.length];
            const freelancer = freelancers[i % freelancers.length];
            if (!job) {
                throw new Error(`No job available for proposal ${i}`);
            }
            if (!freelancer) {
                throw new Error(`No freelancer available for proposal ${i}`);
            }
            const proposal = new Proposal_1.Proposal({
                ...proposalData,
                job: job._id,
                freelancer: freelancer._id,
            });
            await proposal.save();
            console.log(`Created proposal for job: ${job.title} by ${freelancer.username}`);
        }
        if (createdJobs.length > 0 && freelancers.length > 0) {
            const job = createdJobs[0];
            const freelancer = freelancers[0];
            if (!job) {
                throw new Error("No job available for accepted proposal");
            }
            if (!freelancer) {
                throw new Error("No freelancer available for accepted proposal");
            }
            const acceptedProposal = new Proposal_1.Proposal({
                coverLetter: "I'm excited to work on this project! I have the exact skills you need and can start immediately.",
                proposedAmount: 3500,
                estimatedDuration: 25,
                attachments: [],
                status: "accepted",
                job: job._id,
                freelancer: freelancer._id,
            });
            const savedProposal = await acceptedProposal.save();
            const contract = new Contract_1.Contract({
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
                        description: "Initial setup, requirements gathering, and project planning",
                        amount: 700,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        status: "completed",
                    },
                    {
                        title: "Core Development",
                        description: "Main development phase with core features",
                        amount: 2100,
                        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                        status: "in-progress",
                    },
                    {
                        title: "Testing and Deployment",
                        description: "Final testing, bug fixes, and deployment",
                        amount: 700,
                        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                        status: "pending",
                    },
                ],
            });
            await contract.save();
            console.log("Created contract for accepted proposal");
        }
        console.log("Database seeded successfully!");
        console.log(`Created ${createdUsers.length} users`);
        console.log(`Created ${createdJobs.length} jobs`);
        console.log(`Created ${sampleProposals.length + 1} proposals`);
        console.log("Created 1 contract");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB");
    }
}
seedDatabase();
//# sourceMappingURL=seed.js.map