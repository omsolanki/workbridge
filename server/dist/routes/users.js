"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", auth_1.protect, (_req, res) => {
    res.json({
        success: true,
        message: "Users route - to be implemented",
    });
});
router.get("/:id", auth_1.protect, (_req, res) => {
    res.json({
        success: true,
        message: "Get user by ID - to be implemented",
    });
});
router.put("/:id", auth_1.protect, (_req, res) => {
    res.json({
        success: true,
        message: "Update user - to be implemented",
    });
});
router.delete("/:id", auth_1.protect, (_req, res) => {
    res.json({
        success: true,
        message: "Delete user - to be implemented",
    });
});
exports.default = router;
//# sourceMappingURL=users.js.map