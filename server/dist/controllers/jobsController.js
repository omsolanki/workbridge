"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyJobs = exports.deleteJob = exports.updateJob = exports.createJob = exports.getJob = exports.getJobs = void 0;
const Job_1 = require("../models/Job");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.getJobs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query["page"]) || 1;
    const limit = parseInt(req.query["limit"]) || 10;
    const skip = (page - 1) * limit;
    const filter = { status: "open", visibility: "public" };
    if (req.query["category"] && req.query["category"] !== "all") {
        filter.category = req.query["category"];
    }
    if (req.query["experienceLevel"] &&
        req.query["experienceLevel"] !== "all") {
        filter.experienceLevel = req.query["experienceLevel"];
    }
    if (req.query["search"]) {
        filter.$or = [
            { title: { $regex: req.query["search"], $options: "i" } },
            { description: { $regex: req.query["search"], $options: "i" } },
        ];
    }
    if (req.query["budgetMin"] || req.query["budgetMax"]) {
        filter["budget.min"] = {};
        if (req.query["budgetMin"]) {
            filter["budget.min"].$gte = parseInt(req.query["budgetMin"]);
        }
        if (req.query["budgetMax"]) {
            filter["budget.max"].$lte = parseInt(req.query["budgetMax"]);
        }
    }
    const total = await Job_1.Job.countDocuments(filter);
    const jobs = await Job_1.Job.find(filter)
        .populate("client", "username firstName lastName avatar rating")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    res.json({
        success: true,
        data: {
            jobs: jobs.map((job) => ({
                id: job._id,
                title: job.title,
                description: job.description,
                category: job.category,
                subcategory: job.subcategory,
                skills: job.skills,
                budget: job.budget,
                duration: job.duration,
                experienceLevel: job.experienceLevel,
                projectType: job.projectType,
                client: job.client,
                status: job.status,
                visibility: job.visibility,
                attachments: job.attachments,
                location: job.location,
                isUrgent: job.isUrgent,
                isFeatured: job.isFeatured,
                views: job.views,
                proposalsCount: job.proposalsCount,
                createdAt: job.get("createdAt"),
                updatedAt: job.get("updatedAt"),
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        },
    });
});
exports.getJob = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await Job_1.Job.findById(req.params["id"]).populate("client", "username firstName lastName avatar rating");
    if (!job) {
        res.status(404).json({
            success: false,
            error: "Job not found",
        });
        return;
    }
    job.views += 1;
    await job.save();
    res.json({
        success: true,
        data: {
            id: job._id,
            title: job.title,
            description: job.description,
            category: job.category,
            subcategory: job.subcategory,
            skills: job.skills,
            budget: job.budget,
            duration: job.duration,
            experienceLevel: job.experienceLevel,
            projectType: job.projectType,
            client: job.client,
            status: job.status,
            visibility: job.visibility,
            attachments: job.attachments,
            location: job.location,
            isUrgent: job.isUrgent,
            isFeatured: job.isFeatured,
            views: job.views,
            proposalsCount: job.proposalsCount,
            createdAt: job.get("createdAt"),
            updatedAt: job.get("updatedAt"),
        },
    });
});
exports.createJob = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, category, subcategory, skills, budget, duration, experienceLevel, projectType, visibility, location, isUrgent, isFeatured, } = req.body;
    if (req.user?.role !== "client") {
        res.status(403).json({
            success: false,
            error: "Only clients can create jobs",
        });
        return;
    }
    const job = await Job_1.Job.create({
        title,
        description,
        category,
        subcategory,
        skills,
        budget,
        duration,
        experienceLevel,
        projectType,
        visibility: visibility || "public",
        location: location || { type: "remote" },
        isUrgent: isUrgent || false,
        isFeatured: isFeatured || false,
        client: req.user._id,
        status: "open",
        views: 0,
        proposalsCount: 0,
    });
    res.status(201).json({
        success: true,
        data: {
            id: job._id,
            title: job.title,
            description: job.description,
            category: job.category,
            subcategory: job.subcategory,
            skills: job.skills,
            budget: job.budget,
            duration: job.duration,
            experienceLevel: job.experienceLevel,
            projectType: job.projectType,
            client: req.user,
            status: job.status,
            visibility: job.visibility,
            attachments: job.attachments,
            location: job.location,
            isUrgent: job.isUrgent,
            isFeatured: job.isFeatured,
            views: job.views,
            proposalsCount: job.proposalsCount,
            createdAt: job.get("createdAt"),
            updatedAt: job.get("updatedAt"),
        },
    });
});
exports.updateJob = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await Job_1.Job.findById(req.params["id"]);
    if (!job) {
        res.status(404).json({
            success: false,
            error: "Job not found",
        });
        return;
    }
    if (job.client.toString() !== String(req.user?._id)) {
        res.status(403).json({
            success: false,
            error: "Not authorized to update this job",
        });
        return;
    }
    const updatedJob = await Job_1.Job.findByIdAndUpdate(req.params["id"], req.body, {
        new: true,
        runValidators: true,
    }).populate("client", "username firstName lastName avatar rating");
    res.json({
        success: true,
        data: {
            id: updatedJob._id,
            title: updatedJob.title,
            description: updatedJob.description,
            category: updatedJob.category,
            subcategory: updatedJob.subcategory,
            skills: updatedJob.skills,
            budget: updatedJob.budget,
            duration: updatedJob.duration,
            experienceLevel: updatedJob.experienceLevel,
            projectType: updatedJob.projectType,
            client: updatedJob.client,
            status: updatedJob.status,
            visibility: updatedJob.visibility,
            attachments: updatedJob.attachments,
            location: updatedJob.location,
            isUrgent: updatedJob.isUrgent,
            isFeatured: updatedJob.isFeatured,
            views: updatedJob.views,
            proposalsCount: updatedJob.proposalsCount,
            createdAt: updatedJob.get("createdAt"),
            updatedAt: updatedJob.get("updatedAt"),
        },
    });
});
exports.deleteJob = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await Job_1.Job.findById(req.params["id"]);
    if (!job) {
        res.status(404).json({
            success: false,
            error: "Job not found",
        });
        return;
    }
    if (job.client.toString() !== String(req.user?._id)) {
        res.status(403).json({
            success: false,
            error: "Not authorized to delete this job",
        });
        return;
    }
    await Job_1.Job.findByIdAndDelete(req.params["id"]);
    res.json({
        success: true,
        message: "Job deleted successfully",
    });
});
exports.getMyJobs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const jobs = await Job_1.Job.find({ client: req.user?._id })
        .populate("client", "username firstName lastName avatar rating")
        .sort({ createdAt: -1 });
    res.json({
        success: true,
        data: jobs.map((job) => ({
            id: job._id,
            title: job.title,
            description: job.description,
            category: job.category,
            subcategory: job.subcategory,
            skills: job.skills,
            budget: job.budget,
            duration: job.duration,
            experienceLevel: job.experienceLevel,
            projectType: job.projectType,
            client: job.client,
            status: job.status,
            visibility: job.visibility,
            attachments: job.attachments,
            location: job.location,
            isUrgent: job.isUrgent,
            isFeatured: job.isFeatured,
            views: job.views,
            proposalsCount: job.proposalsCount,
            createdAt: job.get("createdAt"),
            updatedAt: job.get("updatedAt"),
        })),
    });
});
//# sourceMappingURL=jobsController.js.map