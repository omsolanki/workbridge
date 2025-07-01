import { Request, Response } from "express";
import { Job } from "../models/Job";
import { asyncHandler } from "../middleware/asyncHandler";

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query["page"] as string) || 1;
    const limit = parseInt(req.query["limit"] as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { status: "open", visibility: "public" };

    if (req.query["category"] && req.query["category"] !== "all") {
      filter.category = req.query["category"];
    }

    if (
      req.query["experienceLevel"] &&
      req.query["experienceLevel"] !== "all"
    ) {
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
        filter["budget.min"].$gte = parseInt(req.query["budgetMin"] as string);
      }
      if (req.query["budgetMax"]) {
        filter["budget.max"].$lte = parseInt(req.query["budgetMax"] as string);
      }
    }

    // Get total count
    const total = await Job.countDocuments(filter);

    // Get jobs with pagination
    const jobs = await Job.find(filter)
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
  }
);

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const job = await Job.findById(req.params["id"]).populate(
      "client",
      "username firstName lastName avatar rating"
    );

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Increment views
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
  }
);

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (clients only)
export const createJob = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      title,
      description,
      category,
      subcategory,
      skills,
      budget,
      duration,
      experienceLevel,
      projectType,
      visibility,
      location,
      isUrgent,
      isFeatured,
    } = req.body;

    // Check if user is a client
    if (req.user?.role !== "client") {
      res.status(403).json({
        success: false,
        error: "Only clients can create jobs",
      });
      return;
    }

    const job = await Job.create({
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
  }
);

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (job owner only)
export const updateJob = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const job = await Job.findById(req.params["id"]);

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Check if user owns the job
    if (job.client.toString() !== String(req.user?._id)) {
      res.status(403).json({
        success: false,
        error: "Not authorized to update this job",
      });
      return;
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(req.params["id"], req.body, {
      new: true,
      runValidators: true,
    }).populate("client", "username firstName lastName avatar rating");

    res.json({
      success: true,
      data: {
        id: updatedJob!._id,
        title: updatedJob!.title,
        description: updatedJob!.description,
        category: updatedJob!.category,
        subcategory: updatedJob!.subcategory,
        skills: updatedJob!.skills,
        budget: updatedJob!.budget,
        duration: updatedJob!.duration,
        experienceLevel: updatedJob!.experienceLevel,
        projectType: updatedJob!.projectType,
        client: updatedJob!.client,
        status: updatedJob!.status,
        visibility: updatedJob!.visibility,
        attachments: updatedJob!.attachments,
        location: updatedJob!.location,
        isUrgent: updatedJob!.isUrgent,
        isFeatured: updatedJob!.isFeatured,
        views: updatedJob!.views,
        proposalsCount: updatedJob!.proposalsCount,
        createdAt: updatedJob!.get("createdAt"),
        updatedAt: updatedJob!.get("updatedAt"),
      },
    });
  }
);

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (job owner only)
export const deleteJob = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const job = await Job.findById(req.params["id"]);

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Check if user owns the job
    if (job.client.toString() !== String(req.user?._id)) {
      res.status(403).json({
        success: false,
        error: "Not authorized to delete this job",
      });
      return;
    }

    await Job.findByIdAndDelete(req.params["id"]);

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  }
);

// @desc    Get my jobs (for clients)
// @route   GET /api/jobs/my-jobs
// @access  Private
export const getMyJobs = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const jobs = await Job.find({ client: req.user?._id })
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
  }
);
