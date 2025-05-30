const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

/**
 * Script to create a default admin user
 * Usage: node scripts/createAdmin.js
 */
const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-profile-management';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📦 Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create default admin user
    const adminData = {
      firstName: process.env.DEFAULT_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.DEFAULT_ADMIN_LAST_NAME || 'User',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      department: 'Administration'
    };

    const admin = await User.create(adminData);
    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminData.password);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

createDefaultAdmin(); 