import express from 'express';
import { getProgress, saveProgress } from '../controllers/progressController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All progress routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', getProgress);
router.post('/', saveProgress);

export default router;
