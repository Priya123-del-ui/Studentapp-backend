import mongoose from 'mongoose';
import logger from '../utils/logger';
import config from './config'; // Import the config utility

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI); // Use config.MONGODB_URI
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
