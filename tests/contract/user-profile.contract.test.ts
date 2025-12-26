import request from 'supertest';
import { connectDB } from '../../src/config/database';
import User from '../../src/models/Users/Users.models';
import app from '../../src/server'; // Your Express app instance

describe('User Profile Contract Test: /user/me', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  // Helper to register and login a user to get an auth token
  const getAuthToken = async () => {
    const newUser = {
      email: 'testuser@example.com',
      password: 'password123',
      role: 'student',
    };

    await request(app)
      .post('/api/auth/register')
      .send(newUser);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: newUser.email, password: newUser.password });

    authToken = loginRes.body.accessToken;
    const userInDb = await User.findOne({ email: newUser.email });
    testUser = userInDb;
  };

  describe('GET /user/me', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/user/me');
      expect(res.statusCode).toEqual(401);
    });

    it('should return 200 and the user profile if authenticated', async () => {
      await getAuthToken();
      const res = await request(app)
        .get('/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', testUser._id.toString());
      expect(res.body).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('role', testUser.role);
      expect(res.body).not.toHaveProperty('password_hash'); // Ensure sensitive data is not returned
    });
  });

  describe('PUT /user/me', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .put('/user/me')
        .send({ name: 'Updated Name' });
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if attempting to update email', async () => {
      await getAuthToken();
      const res = await request(app)
        .put('/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'newemail@example.com' }); // Attempt to update email

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Email and Role cannot be updated directly through this endpoint.');
    });

    it('should return 403 if attempting to update role', async () => {
      await getAuthToken();
      const res = await request(app)
        .put('/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: 'admin' }); // Attempt to update role

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Email and Role cannot be updated directly through this endpoint.');
    });

    it('should return 200 and update other profile fields if authenticated', async () => {
      await getAuthToken();
      const updatedData = { name: 'New Test Name', age: 30 };
      const res = await request(app)
        .put('/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Profile updated successfully');
      expect(res.body.user).toHaveProperty('name', updatedData.name);
      expect(res.body.user).toHaveProperty('age', updatedData.age);

      // Verify the update in the database
      const userInDb = await User.findById(testUser._id);
      expect(userInDb).toHaveProperty('name', updatedData.name);
      expect(userInDb).toHaveProperty('age', updatedData.age);
    });
  });
});