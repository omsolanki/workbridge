"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/dashboard", (_req, res) => {
    res.json({
        success: true,
        message: "Admin dashboard - to be implemented",
    });
});
router.get("/users", (_req, res) => {
    res.json({
        success: true,
        message: "Get all users - to be implemented",
    });
});
router.get("/users/:id", (_req, res) => {
    res.json({
        success: true,
        message: "Get user by ID - to be implemented",
    });
});
router.put("/users/:id", (_req, res) => {
    res.json({
        success: true,
        message: "Update user - to be implemented",
    });
});
router.delete("/users/:id", (_req, res) => {
    res.json({
        success: true,
        message: "Delete user - to be implemented",
    });
});
exports.default = router;
//# sourceMappingURL=admin.js.map