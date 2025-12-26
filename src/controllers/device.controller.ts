import { Request, Response } from 'express';
import DeviceService from '../services/DeviceService'; // Import DeviceService
import AppError from '../utils/appError'; // Import AppError
import { AuthenticatedRequest } from '../middleware/auth.middleware'; // Assuming AuthenticatedRequest for user.id

const deviceService = new DeviceService();

export const registerDevice = async (req: Request, res: Response) => {
  try {
    const { fingerprint } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated request

    if (!userId) {
        throw new AppError('User not authenticated.', 401);
    }

    const newDevice = await deviceService.registerDevice(fingerprint, userId);
    res.status(201).json({ message: 'Device registered successfully with pending status', device: newDevice });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const getDevices = async (req: Request, res: Response) => {
    try {
        const query = req.query; // Allow filtering by query parameters
        const devices = await deviceService.getAllDevices(query);
        res.status(200).json(devices);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
    }
};

export const getDeviceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const device = await deviceService.getDeviceById(id);
        res.status(200).json(device);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
    }
};

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedDevice = await deviceService.updateDevice(id, updatedData);
    res.status(200).json({ message: 'Device updated successfully', device: updatedDevice });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};


export const approveDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedDevice = await deviceService.updateDevice(id, { status: 'approved' }); // Use service to update status
    res.json({ message: 'Device approved successfully', device: updatedDevice });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const rejectDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedDevice = await deviceService.updateDevice(id, { status: 'rejected' }); // Use service to update status
    res.json({ message: 'Device rejected successfully', device: updatedDevice });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const revokeDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedDevice = await deviceService.updateDevice(id, { status: 'revoked' }); // Use service to update status
    res.json({ message: 'Device revoked successfully', device: updatedDevice });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const message = await deviceService.deleteDevice(id);
        res.status(200).json({ message });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
    }
};
