import express from "express";

const router = express.Router();

// @desc    Get all time entries (placeholder)
// @route   GET /api/time-tracking
// @access  Private
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Time tracking route - to be implemented",
  });
});

// @desc    Get time entry by ID (placeholder)
// @route   GET /api/time-tracking/:id
// @access  Private
router.get("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Get time entry by ID - to be implemented",
  });
});

// @desc    Create time entry (placeholder)
// @route   POST /api/time-tracking
// @access  Private
router.post("/", (_req, res) => {
  res.json({
    success: true,
    message: "Create time entry - to be implemented",
  });
});

// @desc    Update time entry (placeholder)
// @route   PUT /api/time-tracking/:id
// @access  Private
router.put("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Update time entry - to be implemented",
  });
});

// @desc    Delete time entry (placeholder)
// @route   DELETE /api/time-tracking/:id
// @access  Private
router.delete("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Delete time entry - to be implemented",
  });
});

export default router;
