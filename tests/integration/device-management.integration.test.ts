import request from 'supertest';
import { connectDB } from '../../src/config/database';
import User from '../../src/models/Users/Users.models';
import Teacher from '../../src/models/Teacher/Teacher.models';
import Device from '../../src/models/Device/Device.models';
import app from '../../src/server';

describe('Device Management Integration Test', () => {
  let adminToken: string;
  let teacherToken: string;
  let teacherUserId: string;
  let teacherProfileId: string;
  let registeredDeviceId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Device.deleteMany({});
  });

  const registerAndLoginUser = async (role: 'admin' | 'teacher' | 'student') => {
    const email = `${role}-${Date.now()}@example.com`;
    const password = 'password123';
    await request(app).post('/api/auth/register').send({ email, password, role });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    return loginRes.body.accessToken;
  };

  const createTeacherProfile = async (userId: string) => {
    const teacher = new Teacher({ userId, name: `Teacher ${userId}` });
    await teacher.save();
    return teacher._id.toString();
  };

  it('should allow an admin to manage a teacher\'s device lifecycle', async () => {
    // 1. Register Admin and Teacher
    adminToken = await registerAndLoginUser('admin');
    teacherToken = await registerAndLoginUser('teacher');

    const teacherUser = await User.findOne({ email: new RegExp('^teacher-') });
    teacherUserId = teacherUser?._id.toString() || '';

    // Create Teacher Profile (required for device registration)
    teacherProfileId = await createTeacherProfile(teacherUserId);

    // 2. Teacher registers a device
    const registerRes = await request(app)
      .post('/devices/register')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ fingerprint: 'teacher_device_fp_123' });

    expect(registerRes.statusCode).toEqual(201);
    registeredDeviceId = registerRes.body.device._id;

    // 3. Admin approves the device
    const approveRes = await request(app)
      .put(`/devices/${registeredDeviceId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approveRes.statusCode).toEqual(200);
    expect(approveRes.body.device.status).toEqual('approved');

    // 4. Admin lists all devices
    const listRes = await request(app)
      .get('/devices')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.statusCode).toEqual(200);
    expect(listRes.body).toBeInstanceOf(Array);
    const foundDevice = listRes.body.find((d: any) => d._id === registeredDeviceId);
    expect(foundDevice).toBeDefined();
    expect(foundDevice.status).toEqual('approved');

    // 5. Admin updates the device (e.g., lastUsedAt)
    const updateRes = await request(app)
      .put(`/devices/${registeredDeviceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lastUsedAt: new Date().toISOString() });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.device).toHaveProperty('lastUsedAt');

    // 6. Admin deletes the device
    const deleteRes = await request(app)
      .delete(`/devices/${registeredDeviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body).toHaveProperty('message', 'Device deleted successfully.');

    // Verify deletion
    const verifyDeleteRes = await request(app)
      .get(`/devices/${registeredDeviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(verifyDeleteRes.statusCode).toEqual(404);
  });

  it('should not allow non-admins to manage devices (beyond registering their own)', async () => {
    // Attempt to list devices as a teacher
    const listRes = await request(app)
      .get('/devices')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(listRes.statusCode).toEqual(403); // Forbidden

    // Attempt to approve a device as a teacher
    // (Need a device first)
    const registerRes = await request(app)
      .post('/devices/register')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ fingerprint: 'another_device_fp' });
    const deviceId = registerRes.body.device._id;

    const approveRes = await request(app)
      .put(`/devices/${deviceId}/approve`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(approveRes.statusCode).toEqual(403); // Forbidden
  });
});
