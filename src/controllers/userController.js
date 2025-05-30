const User = require('../models/User');

/**
 * Get all users with pagination (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role; // Optional filter by role

    // Build filters
    const filters = {};
    if (role && ['admin', 'user'].includes(role)) {
      filters.role = role;
    }

    const result = await User.getPaginatedUsers(page, limit, filters);

    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error getting users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error getting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new user (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, department, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const userData = {
      firstName,
      middleName,
      lastName,
      email,
      password,
      department,
      role: role || 'user'
    };

    const user = await User.create(userData);

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Remove role from update data if user is not admin (users can't change their own role)
    if (req.user.role !== 'admin' && updateData.role) {
      delete updateData.role;
    }

    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete user (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get users by role (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be either admin or user'
      });
    }

    const result = await User.getPaginatedUsers(page, limit, { role });

    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error getting users by role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole
}; 