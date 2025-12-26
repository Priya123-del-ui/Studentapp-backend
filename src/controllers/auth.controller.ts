import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/Users/Users.models';
import config from '../config/config'; // Import the config utility

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password_hash,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, { // Use config.JWT_SECRET
      expiresIn: config.JWT_EXPIRES_IN, // Use config.JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, { // Use config.JWT_REFRESH_SECRET
      expiresIn: config.JWT_REFRESH_EXPIRES_IN, // Use config.JWT_REFRESH_EXPIRES_IN
    });

    user.refreshToken = refreshToken;
    await user.save();


    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // In a real app, you would send an email with the resetToken
    // console.log(`Password reset token for ${email}: ${resetToken}`); // Replaced console.log with logger.info if logger was available here
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = await User.findOne({ refreshToken: token });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    jwt.verify(token, config.JWT_REFRESH_SECRET, (err: any, decoded: any) => { // Use config.JWT_REFRESH_SECRET
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const payload = {
        id: user.id,
        role: user.role,
      };

      const accessToken = jwt.sign(payload, config.JWT_SECRET, { // Use config.JWT_SECRET
        expiresIn: config.JWT_EXPIRES_IN, // Use config.JWT_EXPIRES_IN
      });

      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
