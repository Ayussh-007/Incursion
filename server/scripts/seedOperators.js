
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Setup dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/incursion';

const seedOperators = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        const csvPath = path.join(__dirname, '../data/operators.csv');
        if (!fs.existsSync(csvPath)) {
            console.error(`❌ CSV not found at ${csvPath}`);
            process.exit(1);
        }

        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n');
        const headers = lines[0].trim().split(',');

        console.log(`📂 Found ${lines.length - 1} operators to process.`);

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',');
            const operator = {};

            headers.forEach((header, index) => {
                operator[header.trim()] = values[index]?.trim();
            });

            if (!operator.username || !operator.password) {
                console.warn(`⚠️ Skipping invalid line ${i + 1}: Missing username or password`);
                continue;
            }

            // Check if user exists
            const existingUser = await User.findOne({ username: operator.username });

            if (existingUser) {
                console.log(`🔄 Updating existing operator: ${operator.username}`);
                existingUser.password = operator.password;
                if (operator.email) existingUser.email = operator.email;
                await existingUser.save(); // Triggers pre-save hash
            } else {
                console.log(`✨ Creating new operator: ${operator.username}`);
                await User.create({
                    username: operator.username,
                    email: operator.email || `${operator.username}@aegis.net`,
                    password: operator.password
                });
            }
        }

        console.log('✅ Seeding complete.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedOperators();
