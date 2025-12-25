import { Request, Response } from 'express';
import Device from '../models/Device/Device.models';
import Teacher from '../models/Teacher/Teacher.models';

export const registerDevice = async (req: Request, res: Response) => {
  try {
    const { fingerprint } = req.body;
    const userId = (req as any).user.id; // Assuming user ID from protected route

    if (!fingerprint) {
      return res.status(400).json({ message: 'Fingerprint is required' });
    }

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found for this user' });
    }

    // Check if the fingerprint is already registered
    const existingDevice = await Device.findOne({ fingerprint });
    if (existingDevice) {
      return res.status(400).json({ message: 'Device with this fingerprint already exists' });
    }

    // Check if the teacher already has an approved device
    const approvedDevice = await Device.findOne({ teacherId: teacher._id, status: 'approved' });
    if (approvedDevice) {
      return res.status(400).json({ message: 'Teacher already has an approved device. Revoke existing device to register a new one.' });
    }


    const newDevice = new Device({
      fingerprint,
      teacherId: teacher._id,
      status: 'pending', // Default to pending
    });

    await newDevice.save();

    res.status(201).json({ message: 'Device registered successfully with pending status', device: newDevice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const approveDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.status !== 'pending') {
      return res.status(400).json({ message: 'Device is not in pending status' });
    }

    // Check if the teacher already has an approved device
    const approvedDevice = await Device.findOne({ teacherId: device.teacherId, status: 'approved' });
    if (approvedDevice) {
      return res.status(400).json({ message: 'Teacher already has an approved device. Revoke existing device to approve this one.' });
    }

    device.status = 'approved';
    await device.save();

    res.json({ message: 'Device approved successfully', device });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const rejectDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.status !== 'pending') {
      return res.status(400).json({ message: 'Device is not in pending status' });
    }

    device.status = 'rejected';
    await device.save();

    res.json({ message: 'Device rejected successfully', device });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const revokeDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.status !== 'approved') {
      return res.status(400).json({ message: 'Device is not in approved status' });
    }

    device.status = 'revoked';
    await device.save();

    res.json({ message: 'Device revoked successfully', device });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
