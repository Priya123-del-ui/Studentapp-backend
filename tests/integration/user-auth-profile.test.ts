import request from 'supertest';
import { connectDB } from '../../src/config/database';
import User from '../../src/models/Users/Users.models';
import app from '../../src/server'; // Your Express app instance
import mongoose from 'mongoose';

describe('Integration Test: User registration, login, and profile update', () => {
  let accessToken: string;
  let refreshToken: string;
  const testUser = {
    email: 'integration@example.com',
    password: 'integrationpassword123',
    role: 'student',
  };

  beforeAll(async () => {
    // Connect to a test database (or ensure a connection is established)
    // For integration tests, it's often good to use a separate test database
    // Configure MONGODB_URI in your .env or a test-specific config
    if (mongoose.connection.readyState === 0) { // Only connect if not already connected
        await connectDB();
    }
  });

  afterEach(async () => {
    // Clean up test user after each test to ensure test isolation
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the database if connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('should successfully register a user, log in, and update their profile', async () => {
    // 1. Register User
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(registerRes.statusCode).toEqual(201);
    expect(registerRes.body).toEqual({ message: 'User created successfully' });

    const userInDbAfterRegister = await User.findOne({ email: testUser.email });
    expect(userInDbAfterRegister).toBeDefined();

    // 2. Login User
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    expect(loginRes.body).toHaveProperty('refreshToken');

    accessToken = loginRes.body.accessToken;
    refreshToken = loginRes.body.refreshToken;

    // 3. Update User Profile
    const updatedName = 'Integration Test User';
    const profileUpdateRes = await request(app)
      .put(`/api/user/${userInDbAfterRegister?._id}`) // Assuming a user update endpoint like /api/user/:id
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: updatedName });

    // Assuming a 200 or 204 for successful update and a relevant response body
    // This part might need adjustment based on your actual user update endpoint behavior
    expect(profileUpdateRes.statusCode).toEqual(200); // Or 204 No Content
    expect(profileUpdateRes.body).toHaveProperty('message', 'User profile updated successfully'); // Adjust message as per API

    // Verify profile update in DB
    const updatedUserInDb = await User.findById(userInDbAfterRegister?._id);
    expect(updatedUserInDb?.name).toEqual(updatedName); // Assuming your User model has a 'name' field
  });

  // You can add more negative integration tests here, e.g.,
  // - Try to update profile with invalid token
  // - Try to update profile for a non-existent user
  // - Test password reset flow
});
