import GameProgress from '../models/GameProgress.js';

// @desc    Get current user's game progress
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res) => {
    try {
        const progress = await GameProgress.findOne({ user: req.user._id });

        if (!progress) {
            return res.status(404).json({ error: 'Game progress not found' });
        }

        res.json({ progress });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Server error fetching progress' });
    }
};

// @desc    Update game progress (full save)
// @route   POST /api/progress
// @access  Private
export const saveProgress = async (req, res) => {
    try {
        const {
            currentLevel,
            hasCompletedIntro,
            hasSeenLoginCutscene,
            unlockedFeatures,
            achievements,
            saveData,
            lastCheckpoint
        } = req.body;

        let progress = await GameProgress.findOne({ user: req.user._id });

        if (!progress) {
            progress = new GameProgress({ user: req.user._id, currentLevel: 1 });
        }

        if (currentLevel !== undefined) progress.currentLevel = currentLevel;
        if (hasCompletedIntro !== undefined) progress.hasCompletedIntro = hasCompletedIntro;
        if (hasSeenLoginCutscene !== undefined) progress.hasSeenLoginCutscene = hasSeenLoginCutscene;
        if (unlockedFeatures) progress.unlockedFeatures = unlockedFeatures;
        if (achievements) progress.achievements = achievements;
        if (saveData) progress.saveData = { ...progress.saveData, ...saveData };
        if (lastCheckpoint) progress.lastCheckpoint = lastCheckpoint;

        await progress.save();

        res.json({ message: 'Progress saved successfully', progress });
    } catch (error) {
        console.error('Save progress error:', error);
        res.status(500).json({ error: 'Server error saving progress' });
    }
};

// @desc    Update only currentLevel (lightweight patch after level completion)
// @route   PATCH /api/progress
// @access  Private
export const updateLevel = async (req, res) => {
    try {
        const { currentLevel } = req.body;

        if (typeof currentLevel !== 'number' || currentLevel < 1) {
            return res.status(400).json({ error: 'currentLevel must be a positive number' });
        }

        let progress = await GameProgress.findOne({ user: req.user._id });

        if (!progress) {
            progress = new GameProgress({ user: req.user._id });
        }

        // Only allow increasing progress, never decreasing
        if (currentLevel > progress.currentLevel) {
            progress.currentLevel = currentLevel;
            await progress.save();
        }

        res.json({
            message: 'Level updated',
            currentLevel: progress.currentLevel
        });
    } catch (error) {
        console.error('Update level error:', error);
        res.status(500).json({ error: 'Server error updating level' });
    }
};
