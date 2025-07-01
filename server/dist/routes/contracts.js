"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Contracts route - to be implemented",
    });
});
router.get("/:id", (_req, res) => {
    res.json({
        success: true,
        message: "Get contract by ID - to be implemented",
    });
});
router.post("/", (_req, res) => {
    res.json({
        success: true,
        message: "Create contract - to be implemented",
    });
});
router.put("/:id", (_req, res) => {
    res.json({
        success: true,
        message: "Update contract - to be implemented",
    });
});
router.delete("/:id", (_req, res) => {
    res.json({
        success: true,
        message: "Delete contract - to be implemented",
    });
});
exports.default = router;
//# sourceMappingURL=contracts.js.map