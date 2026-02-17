import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import GameProgress from '../models/GameProgress.js';

// Generate JWT tokens
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

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Create game progress
        const gameProgress = new GameProgress({
            user: user._id
        });

        await gameProgress.save();

        // Link game progress to user
        user.gameProgress = gameProgress._id;
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            accessToken,
            refreshToken
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

        const { email, username, password } = req.body;

        // Find user by email or username
        const query = { $or: [] };
        if (email) query.$or.push({ email });
        if (username) query.$or.push({ username });

        const user = await User.findOne(query);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find user with this refresh token
        const user = await User.findOne({
            _id: decoded.userId,
            refreshToken
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Update refresh token
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
