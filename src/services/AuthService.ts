import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/Users/Users.models'; // Assuming User model is correct
import config from '../config/config'; // Assuming config is correct
import AppError from '../utils/appError'; // Import the custom error class
import logger from '../utils/logger'; // Import the logger utility

class AuthService {
  async register(userData: any): Promise<any> {
    const { email, password, role } = userData;

    if (!email || !password || !role) {
      logger.warn(`Registration attempt failed: All fields are required for email: ${email}`);
      throw new AppError('All fields are required', 400);
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn(`Registration attempt failed: Invalid email format for email: ${email}`);
      throw new AppError('Invalid email format', 400);
    }

    // Password length validation
    if (password.length < 6) {
      logger.warn(`Registration attempt failed: Password too short for email: ${email}`);
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration attempt failed: User already exists with email: ${email}`);
      throw new AppError('User already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password_hash,
      role,
    });

    await newUser.save();
    logger.info(`User registered successfully with email: ${email} and role: ${role}`);
    return { message: 'User created successfully' };
  }

  async login(credentials: any): Promise<any> {
    const { email, password } = credentials;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login attempt failed: User not found for email: ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      logger.warn(`Login attempt failed: Incorrect password for email: ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });

    user.refreshToken = refreshToken;
    await user.save();
    logger.info(`User logged in successfully with email: ${email} and role: ${user.role}`);
    return { accessToken, refreshToken, message: 'Login successful' };
  }

  async validateToken(token: string): Promise<any> {
    if (!token) {
      logger.warn('Token validation failed: No token provided');
      throw new AppError('No token provided', 401);
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      logger.info(`Token validated successfully for user ID: ${decoded.id}`);
      return { isValid: true, user: decoded };
    } catch (error: any) {
      logger.warn(`Token validation failed: ${error.message}`);
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

export default AuthService;


