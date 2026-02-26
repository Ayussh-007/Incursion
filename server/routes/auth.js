import express from 'express';
import { body } from 'express-validator';
import { register, verifyOtp, login, refresh, logout, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be 3–20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

const verifyOtpValidation = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only digits')
];

const loginValidation = [
    body('username').notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/verify-otp', verifyOtpValidation, verifyOtp);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', authMiddleware, getMe);       // GET  /api/auth/me
router.post('/logout', authMiddleware, logout); // POST /api/auth/logout

export default router;
