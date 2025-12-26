import request from 'supertest';
import { connectDB } from '../../src/config/database';
import User from '../../src/models/Users/Users.models';
import Teacher from '../../src/models/Teacher/Teacher.models';
import Device from '../../src/models/Device/Device.models';
import app from '../../src/server';

describe('Device Contract Test: /devices', () => {
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
    const teacher = new Teacher({ userId, name: 'Test Teacher' });
    await teacher.save();
    return teacher._id.toString();
  };

  beforeEach(async () => {
    adminToken = await registerAndLoginUser('admin');
    teacherToken = await registerAndLoginUser('teacher');
    const teacherUser = await User.findOne({ email: new RegExp('^teacher-') });
    teacherUserId = teacherUser?._id.toString() || '';
    teacherProfileId = await createTeacherProfile(teacherUserId);
  });


  // --- POST /devices/register (Teacher only) ---
  describe('POST /devices/register', () => {
    it('should allow a teacher to register a new device (status 201)', async () => {
      const res = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'test_fingerprint_123' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Device registered successfully with pending status');
      expect(res.body.device).toHaveProperty('_id');
      expect(res.body.device).toHaveProperty('fingerprint', 'test_fingerprint_123');
      expect(res.body.device).toHaveProperty('teacherId', teacherProfileId);
      expect(res.body.device).toHaveProperty('status', 'pending');
      registeredDeviceId = res.body.device._id;
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/devices/register')
        .send({ fingerprint: 'test_fingerprint_unauth' });
      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 if fingerprint is missing', async () => {
      const res = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Fingerprint and teacherId are required.');
    });
  });

  // --- GET /devices (Admin only) ---
  describe('GET /devices', () => {
    beforeEach(async () => {
      // Register a device for the teacher
      await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'device_for_admin_get' });
    });

    it('should allow admin to get all devices (status 200)', async () => {
      const res = await request(app)
        .get('/devices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('fingerprint', 'device_for_admin_get');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/devices');
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if authenticated as non-admin', async () => {
      const res = await request(app)
        .get('/devices')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  // --- GET /devices/:id (Admin only) ---
  describe('GET /devices/:id', () => {
    let specificDeviceId: string;

    beforeEach(async () => {
      // Register a device for the teacher
      const regRes = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'specific_device_get' });
      specificDeviceId = regRes.body.device._id;
    });

    it('should allow admin to get a device by ID (status 200)', async () => {
      const res = await request(app)
        .get(`/devices/${specificDeviceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', specificDeviceId);
      expect(res.body).toHaveProperty('fingerprint', 'specific_device_get');
    });

    it('should return 404 if device not found', async () => {
      const res = await request(app)
        .get('/devices/60c72b2f9f1b2c001c8e2d3f') // Non-existent ID
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  // --- PUT /devices/:id (Admin only, general update) ---
  describe('PUT /devices/:id (general update)', () => {
    let specificDeviceId: string;

    beforeEach(async () => {
      // Register a device for the teacher
      const regRes = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'specific_device_update' });
      specificDeviceId = regRes.body.device._id;
    });

    it('should allow admin to update a device (status 200)', async () => {
      const res = await request(app)
        .put(`/devices/${specificDeviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ lastUsedAt: new Date().toISOString() });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Device updated successfully');
      expect(res.body.device).toHaveProperty('_id', specificDeviceId);
      expect(res.body.device).toHaveProperty('lastUsedAt');
    });

    it('should return 404 if device not found', async () => {
      const res = await request(app)
        .put('/devices/60c72b2f9f1b2c001c8e2d3f')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      expect(res.statusCode).toEqual(404);
    });
  });


  // --- PUT /devices/:id/approve (Admin only) ---
  describe('PUT /devices/:id/approve', () => {
    let pendingDeviceId: string;

    beforeEach(async () => {
      // Register a device for the teacher
      const regRes = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'pending_device_approve' });
      pendingDeviceId = regRes.body.device._id;
    });

    it('should allow admin to approve a pending device (status 200)', async () => {
      const res = await request(app)
        .put(`/devices/${pendingDeviceId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Device approved successfully');
      expect(res.body.device).toHaveProperty('status', 'approved');
    });

    it('should return 400 if device is not pending', async () => {
      // Approve it first
      await request(app)
        .put(`/devices/${pendingDeviceId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to approve again
      const res = await request(app)
        .put(`/devices/${pendingDeviceId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Device is not in pending status');
    });
  });

  // --- PUT /devices/:id/reject (Admin only) ---
  describe('PUT /devices/:id/reject', () => {
    let pendingDeviceId: string;

    beforeEach(async () => {
      // Register a device for the teacher
      const regRes = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'pending_device_reject' });
      pendingDeviceId = regRes.body.device._id;
    });

    it('should allow admin to reject a pending device (status 200)', async () => {
      const res = await request(app)
        .put(`/devices/${pendingDeviceId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Device rejected successfully');
      expect(res.body.device).toHaveProperty('status', 'rejected');
    });

    it('should return 400 if device is not pending', async () => {
      // Reject it first
      await request(app)
        .put(`/devices/${pendingDeviceId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to reject again
      const res = await request(app)
        .put(`/devices/${pendingDeviceId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Device is not in pending status');
    });
  });

  // --- PUT /devices/:id/revoke (Admin only) ---
  describe('PUT /devices/:id/revoke', () => {
    let approvedDeviceId: string;

    beforeEach(async () => {
      // Register and approve a device
      const regRes = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'approved_device_revoke' });
      approvedDeviceId = regRes.body.device._id;

      await request(app)
        .put(`/devices/${approvedDeviceId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should allow admin to revoke an approved device (status 200)', async () => {
      const res = await request(app)
        .put(`/devices/${approvedDeviceId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Device revoked successfully');
      expect(res.body.device).toHaveProperty('status', 'revoked');
    });

    it('should return 400 if device is not approved', async () => {
      // Revoke it first
      await request(app)
        .put(`/devices/${approvedDeviceId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to revoke again
      const res = await request(app)
        .put(`/devices/${approvedDeviceId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Device is not in approved status');
    });
  });

  // --- DELETE /devices/:id (Admin only) ---
  describe('DELETE /devices/:id', () => {
    let deletableDeviceId: string;

    beforeEach(async () => {
      // Register a device
      const regRes = await request(app)
        .post('/devices/register')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ fingerprint: 'deletable_device' });
      deletableDeviceId = regRes.body.device._id;
    });

    it('should allow admin to delete a device (status 200)', async () => {
      const res = await request(app)
        .delete(`/devices/${deletableDeviceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Device deleted successfully.');

      // Verify deletion from DB
      const deletedDevice = await Device.findById(deletableDeviceId);
      expect(deletedDevice).toBeNull();
    });

    it('should return 404 if device not found', async () => {
      const res = await request(app)
        .delete('/devices/60c72b2f9f1b2c001c8e2d3f')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
