const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

// Test database
const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/user-profile-management-test';

describe('User Management Endpoints', () => {
  let adminUser, regularUser;
  let adminToken, userToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });

    adminUser = adminResponse.body.data.user;
    adminToken = adminResponse.body.data.token;

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });

    regularUser = userResponse.body.data.user;
    userToken = userResponse.body.data.token;
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('GET /api/users', () => {
    it('should allow admin to get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.totalUsers).toBe(2);
    });

    it('should not allow regular user to get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.currentPage).toBe(1);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].role).toBe('admin');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow admin to view any user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('user@example.com');
    });

    it('should allow user to view their own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('user@example.com');
    });

    it('should not allow user to view another user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. You can only access your own profile.');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /api/users', () => {
    const newUserData = {
      firstName: 'New',
      lastName: 'User',
      email: 'newuser@example.com',
      password: 'password123',
      department: 'Marketing'
    };

    it('should allow admin to create new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUserData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not allow regular user to create new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newUserData)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should fail with duplicate email', async () => {
      const duplicateUserData = { ...newUserData, email: 'user@example.com' };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUserData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('PUT /api/users/:id', () => {
    const updateData = {
      firstName: 'Updated',
      department: 'Updated Department'
    };

    it('should allow admin to update any user', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.department).toBe('Updated Department');
    });

    it('should allow user to update their own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.firstName).toBe('Updated');
    });

    it('should not allow user to update another user profile', async () => {
      const response = await request(app)
        .put(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. You can only access your own profile.');
    });

    it('should not allow user to change their own role', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...updateData, role: 'admin' })
        .expect(200);

      // Role should not be changed
      expect(response.body.data.user.role).toBe('user');
    });

    it('should allow admin to change user role', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.data.user.role).toBe('admin');
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'admin@example.com' })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email already exists');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should not allow regular user to delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should not allow admin to delete themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('You cannot delete your own account');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /api/users/role/:role', () => {
    it('should allow admin to get users by role', async () => {
      const response = await request(app)
        .get('/api/users/role/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].role).toBe('admin');
    });

    it('should not allow regular user to get users by role', async () => {
      const response = await request(app)
        .get('/api/users/role/user')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .get('/api/users/role/invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid role. Must be either admin or user');
    });
  });
}); 