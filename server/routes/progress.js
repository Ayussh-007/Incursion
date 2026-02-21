import express from 'express';
import { getProgress, saveProgress, updateLevel } from '../controllers/progressController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All progress routes require authentication
router.use(authMiddleware);

router.get('/', getProgress);       // GET  /api/progress
router.post('/', saveProgress);     // POST /api/progress  (full save)
router.patch('/', updateLevel);     // PATCH /api/progress (level-complete update)

export default router;
