import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import GameProgress from '../models/GameProgress.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail, generateOtp } from '../utils/emailService.js';

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

// @desc    Step 1 — Send registration OTP to email
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if username or email already taken
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username
                    ? 'Username already taken'
                    : 'Email already registered'
            });
        }

        // Remove any previous pending OTPs for this email
        await Otp.deleteMany({ email });

        // Generate & store OTP (password is hashed by the Otp pre-save hook... no,
        // we hash it ourselves here so we can recreate the user later)
        const otpCode = generateOtp();

        // Hash the password now so we don't store plaintext in the Otp doc
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otpDoc = new Otp({
            email,
            username,
            password: hashedPassword,
            otp: otpCode    // hashed by Otp pre-save hook
        });
        await otpDoc.save();

        // Send OTP via email (or log to console in dev mode)
        await sendOtpEmail(email, otpCode);

        res.status(200).json({
            message: 'OTP sent to email',
            email
        });
    } catch (error) {
        console.error('Register/OTP error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// @desc    Step 2 — Verify OTP and create the account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Find the most recent OTP for this email
        const otpDoc = await Otp.findOne({ email }).sort({ createdAt: -1 });
        if (!otpDoc) {
            return res.status(400).json({ error: 'OTP expired or not found. Use /register to request a new one' });
        }

        // Verify the OTP
        const isValid = await otpDoc.compareOtp(otp);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP. Try again or request a new one' });
        }

        // Double-check username/email are still available (race condition guard)
        const existingUser = await User.findOne({
            $or: [{ email: otpDoc.email }, { username: otpDoc.username }]
        });
        if (existingUser) {
            await Otp.deleteMany({ email });
            return res.status(400).json({
                error: existingUser.username === otpDoc.username
                    ? 'Username was taken while verifying. Try a different username'
                    : 'Email was registered while verifying'
            });
        }

        // Create the user (password is already hashed)
        const user = new User({
            username: otpDoc.username,
            email: otpDoc.email,
            password: 'placeholder',     // will be overwritten below
            isEmailVerified: true
        });
        // Directly set the pre-hashed password, skipping the pre-save hook
        user.password = otpDoc.password;
        await user.save({ validateBeforeSave: false });

        // Create game progress
        const gameProgress = new GameProgress({ user: user._id, currentLevel: 1 });
        await gameProgress.save();
        user.gameProgress = gameProgress._id;

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Clean up OTP docs
        await Otp.deleteMany({ email });

        res.status(201).json({
            message: 'Account verified and created',
            user: { id: user._id, username: user.username },
            accessToken,
            refreshToken,
            currentLevel: 1
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Server error during verification' });
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
