import GameProgress from '../models/GameProgress.js';

// @desc    Get current user's game progress
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res) => {
    try {
        const progress = await GameProgress.findOne({ user: req.user._id });

        if (!progress) {
            return res.status(404).json({
                error: 'Game progress not found'
            });
        }

        res.json({ progress });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Server error fetching progress' });
    }
};

// @desc    Update/save game progress
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
            // Create new progress if doesn't exist
            progress = new GameProgress({
                user: req.user._id
            });
        }

        // Update fields if provided
        if (currentLevel !== undefined) progress.currentLevel = currentLevel;
        if (hasCompletedIntro !== undefined) progress.hasCompletedIntro = hasCompletedIntro;
        if (hasSeenLoginCutscene !== undefined) progress.hasSeenLoginCutscene = hasSeenLoginCutscene;
        if (unlockedFeatures) progress.unlockedFeatures = unlockedFeatures;
        if (achievements) progress.achievements = achievements;
        if (saveData) progress.saveData = { ...progress.saveData, ...saveData };
        if (lastCheckpoint) progress.lastCheckpoint = lastCheckpoint;

        await progress.save();

        res.json({
            message: 'Progress saved successfully',
            progress
        });
    } catch (error) {
        console.error('Save progress error:', error);
        res.status(500).json({ error: 'Server error saving progress' });
    }
};
