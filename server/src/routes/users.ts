import express from "express";
import { protect } from "../middleware/auth";

const router = express.Router();

// @desc    Get all users (placeholder)
// @route   GET /api/users
// @access  Private
router.get("/", protect, (_req, res) => {
  res.json({
    success: true,
    message: "Users route - to be implemented",
  });
});

// @desc    Get user by ID (placeholder)
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", protect, (_req, res) => {
  res.json({
    success: true,
    message: "Get user by ID - to be implemented",
  });
});

// @desc    Update user (placeholder)
// @route   PUT /api/users/:id
// @access  Private
router.put("/:id", protect, (_req, res) => {
  res.json({
    success: true,
    message: "Update user - to be implemented",
  });
});

// @desc    Delete user (placeholder)
// @route   DELETE /api/users/:id
// @access  Private
router.delete("/:id", protect, (_req, res) => {
  res.json({
    success: true,
    message: "Delete user - to be implemented",
  });
});

export default router;
