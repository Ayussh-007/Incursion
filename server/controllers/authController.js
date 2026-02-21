import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import GameProgress from '../models/GameProgress.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    return { accessToken, refreshToken };
};

/** Fetch (or lazily create) the GameProgress doc for a user and return key fields. */
async function getOrCreateProgress(userId) {
    let progress = await GameProgress.findOne({ user: userId });
    if (!progress) {
        progress = new GameProgress({ user: userId, currentLevel: 1 });
        await progress.save();
    }
    return {
        currentLevel: Math.max(1, progress.currentLevel),
        hasCompletedIntro: progress.hasCompletedIntro ?? false
    };
}

// ── Controllers ───────────────────────────────────────────────────────────────

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Auto-generate a placeholder email so the unique index is satisfied
        // without requiring the terminal user to supply one.
        const email = `${username.toLowerCase()}@incursion.local`;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username
                    ? 'Username already taken'
                    : 'User already exists'
            });
        }

        // Create user
        const user = new User({ username, email, password });
        await user.save();

        // Create game progress (starting at level 1)
        const gameProgress = new GameProgress({ user: user._id, currentLevel: 1 });
        await gameProgress.save();

        // Link progress to user
        user.gameProgress = gameProgress._id;
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, username: user.username },
            accessToken,
            refreshToken,
            currentLevel: 1
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        user.lastLogin = new Date();

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        const progress = await getOrCreateProgress(user._id);

        res.json({
            message: 'Login successful',
            user: { id: user._id, username: user.username },
            accessToken,
            refreshToken,
            currentLevel: progress.currentLevel,
            hasCompletedIntro: progress.hasCompletedIntro
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// @desc    Get current authenticated user + progress
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const progress = await getOrCreateProgress(req.user._id);
        res.json({
            user: { id: req.user._id, username: req.user.username },
            currentLevel: progress.currentLevel,
            hasCompletedIntro: progress.hasCompletedIntro
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ error: 'Server error fetching user data' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findOne({ _id: decoded.userId, refreshToken });

        if (!user) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const tokens = generateTokens(user._id);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error during logout' });
    }
};
