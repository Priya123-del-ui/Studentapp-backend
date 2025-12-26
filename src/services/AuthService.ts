import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // For generating reset tokens
import nodemailer from 'nodemailer'; // For sending password reset emails
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

  async requestPasswordReset(email: string): Promise<any> {
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Password reset request failed: User with email ${email} not found.`);
      throw new AppError('User not found', 400);
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    logger.info(`Password reset token generated for user: ${email}`);
    // In a real app, you would send an email with the resetToken
    // console.log(`Password reset token for ${email}: ${resetToken}`); // Example of sending email:
    // await this.sendPasswordResetEmail(email, resetToken);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, password: string): Promise<any> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn('Password reset failed: Invalid or expired token provided.');
      throw new AppError('Invalid or expired token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    logger.info(`Password successfully reset for user ID: ${user._id}`);
    return { message: 'Password reset successfully' };
  }

  async refreshToken(token: string): Promise<any> {
    if (!token) {
      logger.warn('Refresh token failed: No token provided.');
      throw new AppError('No token provided', 401);
    }

    const user = await User.findOne({ refreshToken: token });

    if (!user) {
      logger.warn('Refresh token failed: Invalid refresh token.');
      throw new AppError('Invalid token', 401);
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, config.JWT_REFRESH_SECRET, async (err: any, decoded: any) => {
        if (err) {
          logger.warn(`Refresh token verification failed: ${err.message}`);
          return reject(new AppError('Invalid token', 401));
        }

        const payload = {
          id: user.id,
          role: user.role,
        };

        const accessToken = jwt.sign(payload, config.JWT_SECRET, {
          expiresIn: config.JWT_EXPIRES_IN,
        });

        logger.info(`Access token refreshed for user ID: ${user._id}`);
        resolve({ accessToken });
      });
    });
  }
}

export default AuthService;

