import express from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be 3-20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('password')
        .notEmpty()
        .withMessage('Password required'),
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.username) {
            throw new Error('Username or Email is required');
        }
        return true;
    })
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

export default router;
