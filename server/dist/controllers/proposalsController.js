"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProposal = exports.updateProposal = exports.createProposal = exports.getProposal = exports.getProposals = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.getProposals = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.json({
        success: true,
        data: [],
    });
});
exports.getProposal = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.status(404).json({
        success: false,
        error: "Proposal not found",
    });
});
exports.createProposal = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.status(501).json({
        success: false,
        error: "Proposals not yet implemented",
    });
});
exports.updateProposal = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.status(501).json({
        success: false,
        error: "Proposals not yet implemented",
    });
});
exports.deleteProposal = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.status(501).json({
        success: false,
        error: "Proposals not yet implemented",
    });
});
//# sourceMappingURL=proposalsController.js.map