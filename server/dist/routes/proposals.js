"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const proposalsController_1 = require("../controllers/proposalsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", auth_1.protect, proposalsController_1.getProposals);
router.get("/:id", auth_1.protect, proposalsController_1.getProposal);
router.post("/", auth_1.protect, proposalsController_1.createProposal);
router.put("/:id", auth_1.protect, proposalsController_1.updateProposal);
router.delete("/:id", auth_1.protect, proposalsController_1.deleteProposal);
exports.default = router;
//# sourceMappingURL=proposals.js.map