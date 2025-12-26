import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file'; // For daily rotating file logs
import path from 'path';
import config from '../config/config'; // Import the config utility

const { combine, timestamp, printf, colorize } = format;

// Define custom levels to match common practice
const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  levels: customLevels,
  level: config.LOG_LEVEL, // Use config.LOG_LEVEL
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console Transport (for development or real-time monitoring)
    new transports.Console({
      format: combine(
        colorize({ all: true }), // Colorize logs for better readability in console
        logFormat
      ),
      level: 'debug' // Always show debug and above in console during development
    }),

    // File Transport for errors
    new transports.DailyRotateFile({
      level: 'error',
      filename: path.join(__dirname, '../../logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m', // Max size of a log file
      maxFiles: '14d', // Retain logs for 14 days
      handleExceptions: true, // Handle uncaught exceptions
      json: true // Log in JSON format for easier parsing
    }),

    // File Transport for all logs (info and above)
    new transports.DailyRotateFile({
      level: 'info',
      filename: path.join(__dirname, '../../logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      json: true
    })
  ],
  exceptionHandlers: [ // Handle uncaught exceptions gracefully
    new transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs', 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      json: true
    })
  ],
  rejectionHandlers: [ // Handle unhandled promise rejections
    new transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs', 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      json: true
    })
  ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (config.NODE_ENV !== 'production') { // Use config.NODE_ENV
  logger.add(new transports.Console({
    format: combine(
      colorize({ all: true }),
      printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
      })
    ),
    level: 'debug'
  }));
}

export default logger;
