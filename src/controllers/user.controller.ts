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
