import express from "express";

const router = express.Router();

// @desc    Get all notifications (placeholder)
// @route   GET /api/notifications
// @access  Private
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Notifications route - to be implemented",
  });
});

// @desc    Get notification by ID (placeholder)
// @route   GET /api/notifications/:id
// @access  Private
router.get("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Get notification by ID - to be implemented",
  });
});

// @desc    Create notification (placeholder)
// @route   POST /api/notifications
// @access  Private
router.post("/", (_req, res) => {
  res.json({
    success: true,
    message: "Create notification - to be implemented",
  });
});

// @desc    Update notification (placeholder)
// @route   PUT /api/notifications/:id
// @access  Private
router.put("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Update notification - to be implemented",
  });
});

// @desc    Delete notification (placeholder)
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Delete notification - to be implemented",
  });
});

export default router;
