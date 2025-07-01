import express from "express";
import {
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal,
} from "../controllers/proposalsController";
import { protect } from "../middleware/auth";

const router = express.Router();

// @desc    Get all proposals
// @route   GET /api/proposals
// @access  Private
router.get("/", protect, getProposals);

// @desc    Get proposal by ID
// @route   GET /api/proposals/:id
// @access  Private
router.get("/:id", protect, getProposal);

// @desc    Create proposal
// @route   POST /api/proposals
// @access  Private
router.post("/", protect, createProposal);

// @desc    Update proposal
// @route   PUT /api/proposals/:id
// @access  Private
router.put("/:id", protect, updateProposal);

// @desc    Delete proposal
// @route   DELETE /api/proposals/:id
// @access  Private
router.delete("/:id", protect, deleteProposal);

export default router;
