import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow dynamic origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'INCURSION server operational' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`✓ INCURSION server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

export default app;
