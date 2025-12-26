import request from 'supertest';
import { connectDB } from '../../src/config/database';
import User from '../../src/models/Users/Users.models';
import app from '../../src/server'; // Your Express app instance

describe('User Profile Integration Test', () => {
  let accessToken: string;
  let testUserEmail: string;
  let testUserId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  // Helper function to register and login a user
  const registerAndLogin = async (email?: string, password?: string, role?: string) => {
    const userEmail = email || `integration-${Date.now()}@example.com`;
    const userPassword = password || 'password123';
    const userRole = role || 'student';

    // 1. Register a new user
    await request(app)
      .post('/api/auth/register')
      .send({ email: userEmail, password: userPassword, role: userRole });

    // 2. Log in with the registered user's credentials
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userEmail, password: userPassword });

    accessToken = loginRes.body.accessToken;
    testUserEmail = userEmail;
    const userInDb = await User.findOne({ email: userEmail });
    testUserId = userInDb?._id.toString();
  };

  it('should allow a user to register, log in, view their profile, and update it', async () => {
    // Register and Login
    await registerAndLogin();

    // 3. Get Profile
    const getProfileRes = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(getProfileRes.statusCode).toEqual(200);
    expect(getProfileRes.body).toHaveProperty('_id', testUserId);
    expect(getProfileRes.body).toHaveProperty('email', testUserEmail);
    expect(getProfileRes.body).toHaveProperty('role', 'student');

    // 4. Update Profile
    const updatedName = 'Integration Test User';
    const updatedData = { name: updatedName, age: 30 };
    const updateProfileRes = await request(app)
      .put('/user/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedData);

    expect(updateProfileRes.statusCode).toEqual(200);
    expect(updateProfileRes.body).toHaveProperty('message', 'Profile updated successfully');
    expect(updateProfileRes.body.user).toHaveProperty('name', updatedName);
    expect(updateProfileRes.body.user).toHaveProperty('age', updatedData.age);

    // 5. Verify Update by getting profile again
    const verifyProfileRes = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(verifyProfileRes.statusCode).toEqual(200);
    expect(verifyProfileRes.body).toHaveProperty('name', updatedName);
    expect(verifyProfileRes.body).toHaveProperty('age', updatedData.age);
  });

  it('should prevent unauthenticated access to profile endpoints', async () => {
    const getRes = await request(app).get('/user/me');
    expect(getRes.statusCode).toEqual(401);

    const putRes = await request(app).put('/user/me').send({ name: 'Unauthorized' });
    expect(putRes.statusCode).toEqual(401);
  });
});
