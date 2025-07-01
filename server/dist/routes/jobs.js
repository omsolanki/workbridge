"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobsController_1 = require("../controllers/jobsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", jobsController_1.getJobs);
router.get("/my-jobs", auth_1.protect, jobsController_1.getMyJobs);
router.get("/:id", jobsController_1.getJob);
router.post("/", auth_1.protect, jobsController_1.createJob);
router.put("/:id", auth_1.protect, jobsController_1.updateJob);
router.delete("/:id", auth_1.protect, jobsController_1.deleteJob);
exports.default = router;
//# sourceMappingURL=jobs.js.map