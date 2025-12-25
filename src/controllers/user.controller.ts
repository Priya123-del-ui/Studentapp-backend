import { Request, Response } from 'express';
import User from '../models/Users/Users.models';

export const getMe = async (req: Request, res: Response) => {
  res.json((req as any).user);
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const { email, role, ...rest } = req.body; // Destructure to prevent direct email/role update
    const userId = (req as any).user.id;

    // Optional: Prevent users from changing their email or role through this endpoint
    if (email || role) {
      return res.status(403).json({ message: 'Email and Role cannot be updated directly through this endpoint.' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, rest, {
      new: true,
      runValidators: true,
    }).select('-password_hash -passwordResetToken -passwordResetExpires -refreshToken');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile photo uploaded successfully', profilePhoto: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password_hash -passwordResetToken -passwordResetExpires -refreshToken');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
