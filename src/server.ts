require('dotenv').config(); // Load environment variables from .env file

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database';
import { swaggerSpec } from './config/swagger';
import apiRouter from './routes';
import errorHandler from './middleware/errorMiddleware';
import logger from './utils/logger'; // Import the logger utility
import config from './config/config'; // Import the config utility

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.WEBSOCKET_CORS_ORIGIN, // Use config.WEBSOCKET_CORS_ORIGIN
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', apiRouter);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`A user connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });

  // Example: Echo message back to the client
  socket.on('message', (message) => {
    logger.info(`Received message: ${message}`);
    socket.emit('message', `Server received: ${message}`);
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = config.PORT; // Use config.PORT
httpServer.listen(
    PORT,
    () => {
        logger.info(`Server started on port: ${PORT}`);
        connectDB();
    }
);