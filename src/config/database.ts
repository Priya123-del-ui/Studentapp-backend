import mongoose from 'mongoose';
import logger from '../utils/logger'; // Import the logger utility

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info('MongoDB connected'); // Use logger.info
  } catch (error) {
    logger.error('MongoDB connection error:', error); // Use logger.error
    process.exit(1);
  }
};
