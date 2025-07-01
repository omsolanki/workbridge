import express from "express";
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} from "../controllers/jobsController";
import { protect } from "../middleware/auth";

const router = express.Router();

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get("/", getJobs);

// @desc    Get my jobs (for clients)
// @route   GET /api/jobs/my-jobs
// @access  Private
router.get("/my-jobs", protect, getMyJobs);

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
router.get("/:id", getJob);

// @desc    Create job
// @route   POST /api/jobs
// @access  Private
router.post("/", protect, createJob);

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
router.put("/:id", protect, updateJob);

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
router.delete("/:id", protect, deleteJob);

export default router;
