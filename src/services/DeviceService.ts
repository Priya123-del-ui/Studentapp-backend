import Device from '../models/Device/Device.models';
import AppError from '../utils/appError';
import logger from '../utils/logger';
import Teacher from '../models/Teacher/Teacher.models'; // Assuming Teacher model exists

class DeviceService {
  async registerDevice(fingerprint: string, teacherId: string): Promise<any> {
    if (!fingerprint || !teacherId) {
      logger.warn('Device registration failed: Fingerprint and teacherId are required.');
      throw new AppError('Fingerprint and teacherId are required.', 400);
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      logger.warn(`Device registration failed: Teacher with ID ${teacherId} not found.`);
      throw new AppError(`Teacher with ID ${teacherId} not found.`, 404);
    }

    // Check if device with this fingerprint already exists
    const existingDevice = await Device.findOne({ fingerprint });
    if (existingDevice) {
      logger.warn(`Device registration failed: Device with fingerprint ${fingerprint} already exists.`);
      throw new AppError(`Device with fingerprint ${fingerprint} already exists.`, 400);
    }

    const newDevice = new Device({
      fingerprint,
      teacherId,
      status: 'pending', // Default status as per model
    });
    await newDevice.save();
    logger.info(`Device registered successfully: ${newDevice._id} for teacher ${teacherId}.`);
    return newDevice;
  }

  async getDeviceById(deviceId: string): Promise<any> {
    const device = await Device.findById(deviceId).populate('teacherId');
    if (!device) {
      logger.warn(`Device not found with ID: ${deviceId}`);
      throw new AppError(`Device not found with ID: ${deviceId}`, 404);
    }
    logger.info(`Retrieved device with ID: ${deviceId}`);
    return device;
  }

  async getAllDevices(query: any): Promise<any[]> {
    const devices = await Device.find(query).populate('teacherId');
    logger.info(`Retrieved ${devices.length} device(s) with query: ${JSON.stringify(query)}`);
    return devices;
  }

  async updateDevice(deviceId: string, updateData: any): Promise<any> {
    const { status } = updateData;

    if (status && !['pending', 'approved', 'rejected', 'revoked'].includes(status)) {
      logger.warn(`Invalid device status provided: ${status} for device ID: ${deviceId}`);
      throw new AppError('Invalid device status provided.', 400);
    }

    const updatedDevice = await Device.findByIdAndUpdate(
      deviceId,
      updateData,
      { new: true, runValidators: true }
    ).populate('teacherId');

    if (!updatedDevice) {
      logger.warn(`Device not found for update with ID: ${deviceId}`);
      throw new AppError(`Device not found with ID: ${deviceId}`, 404);
    }
    logger.info(`Device ID ${deviceId} updated successfully.`);
    return updatedDevice;
  }

  async deleteDevice(deviceId: string): Promise<string> {
    const deletedDevice = await Device.findByIdAndDelete(deviceId);
    if (!deletedDevice) {
      logger.warn(`Device not found for deletion with ID: ${deviceId}`);
      throw new AppError(`Device not found with ID: ${deviceId}`, 404);
    }
    logger.info(`Device ID ${deviceId} deleted successfully.`);
    return 'Device deleted successfully.';
  }
}

export default DeviceService;
