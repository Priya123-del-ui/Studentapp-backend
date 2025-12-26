import { Request, Response } from 'express';
import AuthService from '../services/AuthService'; // Import AuthService

const authService = new AuthService(); // Create an instance of AuthService

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Basic validation remains in controller to catch obvious missing fields before service call
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await authService.register({ email, password, role }); // Use authService.register

    res.status(201).json({ message: result.message });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation remains in controller
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { accessToken, refreshToken, message } = await authService.login({ email, password }); // Use authService.login

    res.json({ accessToken, refreshToken, message });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.json({ message: result.message });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.json({ message: result.message });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const { accessToken } = await authService.refreshToken(token);
    res.json({ accessToken });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

