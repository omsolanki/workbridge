import express from "express";

const router = express.Router();

// @desc    Get all payments (placeholder)
// @route   GET /api/payments
// @access  Private
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Payments route - to be implemented",
  });
});

// @desc    Get payment by ID (placeholder)
// @route   GET /api/payments/:id
// @access  Private
router.get("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Get payment by ID - to be implemented",
  });
});

// @desc    Create payment (placeholder)
// @route   POST /api/payments
// @access  Private
router.post("/", (_req, res) => {
  res.json({
    success: true,
    message: "Create payment - to be implemented",
  });
});

// @desc    Update payment (placeholder)
// @route   PUT /api/payments/:id
// @access  Private
router.put("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Update payment - to be implemented",
  });
});

// @desc    Delete payment (placeholder)
// @route   DELETE /api/payments/:id
// @access  Private
router.delete("/:id", (_req, res) => {
  res.json({
    success: true,
    message: "Delete payment - to be implemented",
  });
});

export default router;
