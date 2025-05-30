const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorizeAdmin, authorizeProfileAccess } = require('../middleware/auth');
const { validate, userRegistrationSchema, userUpdateSchema } = require('../middleware/validation');

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Private (Admin only)
 */
router.get('/', authenticate, authorizeAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role (admin or user) with pagination
 * @access  Private (Admin only)
 */
router.get('/role/:role', authenticate, authorizeAdmin, userController.getUsersByRole);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorizeAdmin, validate(userRegistrationSchema), userController.createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Users can view their own profile, Admins can view any profile)
 */
router.get('/:id', authenticate, authorizeProfileAccess, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Users can update their own profile, Admins can update any profile)
 */
router.put('/:id', authenticate, authorizeProfileAccess, validate(userUpdateSchema), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorizeAdmin, userController.deleteUser);

module.exports = router; 