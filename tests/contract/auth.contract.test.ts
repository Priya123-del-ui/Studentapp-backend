import request from 'supertest';
import { connectDB } from '../../src/config/database'; // Assuming you have this to connect to DB
import User from '../../src/models/Users/Users.models'; // Import User model to cleanup after tests

// Import the Express app. You might need to adjust the path if your server export is different.
// For example, if your app is exported from src/server.ts:
import app from '../../src/server'; // Your Express app instance

describe('Auth Contract Test: /api/auth/register', () => {
  // Before all tests, ensure the database is connected
  beforeAll(async () => {
    // connectDB() is async, so await it
    await connectDB();
    // Ensure the app is listening (if it's not already, or use a test-specific app instance)
    // For Supertest, you typically pass the app instance directly, it handles starting/stopping
  });

  // After each test, clean up any created users to ensure test isolation
  afterEach(async () => {
    await User.deleteMany({}); // Clears all users from the test database
  });

  // After all tests, disconnect from the database
  afterAll(async () => {
    // You might need a disconnect function if not handled by Mongoose automatically on process exit
    // For now, let's assume Mongoose handles it or it's fine for the test environment
  });

  it('should register a new user successfully with status 201', async () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({ message: 'User created successfully' });

    // Verify user exists in database
    const userInDb = await User.findOne({ email: newUser.email });
    expect(userInDb).toBeDefined();
    expect(userInDb?.email).toEqual(newUser.email);
  });

  it('should return 400 if email is missing', async () => {
    const newUser = {
      password: 'password123',
      role: 'student',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: 'All fields are required' });
  });

  it('should return 400 if user already exists', async () => {
    const existingUser = {
      email: 'existing@example.com',
      password: 'password123',
      role: 'student',
    };

    // First, register the user
    await request(app)
      .post('/api/auth/register')
      .send(existingUser);

    // Then try to register the same user again
    const res = await request(app)
      .post('/api/auth/register')
      .send(existingUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: 'User already exists' });
  });

  // Add more test cases for invalid roles, weak passwords (if validation is in place), etc.
});
