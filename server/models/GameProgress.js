import mongoose from 'mongoose';

const gameProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentLevel: {
        type: Number,
        default: 0
    },
    hasCompletedIntro: {
        type: Boolean,
        default: false
    },
    hasSeenLoginCutscene: {
        type: Boolean,
        default: false
    },
    unlockedFeatures: [{
        type: String
    }],
    achievements: [{
        id: String,
        unlockedAt: Date,
        name: String
    }],
    saveData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    lastCheckpoint: {
        type: String,
        default: 'intro'
    }
}, {
    timestamps: true
});

const GameProgress = mongoose.model('GameProgress', gameProgressSchema);

export default GameProgress;
