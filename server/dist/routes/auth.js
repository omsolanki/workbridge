"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('firstName')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .trim(),
    (0, express_validator_1.body)('lastName')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
        .trim(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['freelancer', 'client', 'admin'])
        .withMessage('Role must be freelancer, client, or admin')
], validateRequest_1.validateRequest, authController_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
], validateRequest_1.validateRequest, authController_1.login);
router.post('/logout', auth_1.protect, authController_1.logout);
router.get('/me', auth_1.protect, authController_1.getMe);
router.put('/profile', auth_1.protect, [
    (0, express_validator_1.body)('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .trim(),
    (0, express_validator_1.body)('lastName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
        .trim(),
    (0, express_validator_1.body)('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    (0, express_validator_1.body)('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array'),
    (0, express_validator_1.body)('hourlyRate')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Hourly rate must be a positive number'),
    (0, express_validator_1.body)('location')
        .optional()
        .trim(),
    (0, express_validator_1.body)('timezone')
        .optional()
        .trim()
], validateRequest_1.validateRequest, authController_1.updateProfile);
router.put('/change-password', auth_1.protect, [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
], validateRequest_1.validateRequest, authController_1.changePassword);
router.post('/forgot-password', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail()
], validateRequest_1.validateRequest, authController_1.forgotPassword);
router.post('/reset-password', [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], validateRequest_1.validateRequest, authController_1.resetPassword);
router.post('/verify-email/:token', authController_1.verifyEmail);
router.post('/refresh', [
    (0, express_validator_1.body)('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
], validateRequest_1.validateRequest, authController_1.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.js.map