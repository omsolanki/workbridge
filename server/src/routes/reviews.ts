import express from "express";

const router = express.Router();

// @desc    Get all reviews (placeholder)
// @route   GET /api/reviews
// @access  Public
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Reviews route - to be implemented",
  });
});

// @desc    Get review by ID (placeholder)
// @route   GET /api/reviews/:id
// @access  Public
router.get("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Get review by ID - to be implemented",
  });
});

// @desc    Create review (placeholder)
// @route   POST /api/reviews
// @access  Private
router.post("/", (_req, res) => {
  res.json({
    success: true,
    message: "Create review - to be implemented",
  });
});

// @desc    Update review (placeholder)
// @route   PUT /api/reviews/:id
// @access  Private
router.put("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Update review - to be implemented",
  });
});

// @desc    Delete review (placeholder)
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Delete review - to be implemented",
  });
});

export default router;
