interface IConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  WEBSOCKET_CORS_ORIGIN: string;
  CORS_ORIGIN: string; // Add CORS_ORIGIN to interface
  LOG_LEVEL: string;
  MONGODB_DB_NAME: string;
}

const getConfig = (): IConfig => {
  return {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
    JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkey', // IMPORTANT: Change in production
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey', // IMPORTANT: Change in production
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    WEBSOCKET_CORS_ORIGIN: process.env.WEBSOCKET_CORS_ORIGIN || '*',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*', // Add CORS_ORIGIN here
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'studentapp-backend',
  };
};

const config = getConfig();

// Basic validation (optional but recommended)
if (!config.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}
if (!config.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
// Add more validations as needed

export default config;
