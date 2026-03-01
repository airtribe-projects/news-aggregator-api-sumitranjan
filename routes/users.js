/**
 * User Routes
 * Handles authentication and user preferences
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validateSignup, validateLogin, validatePreferences } = require('../middleware/validate');

/**
 * @route   POST /users/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateSignup, userController.signup);

/**
 * @route   POST /users/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', validateLogin, userController.login);

/**
 * @route   GET /users/preferences
 * @desc    Get user's news preferences
 * @access  Private (requires authentication)
 */
router.get('/preferences', authenticate, userController.getPreferences);

/**
 * @route   PUT /users/preferences
 * @desc    Update user's news preferences
 * @access  Private (requires authentication)
 */
router.put('/preferences', authenticate, validatePreferences, userController.updatePreferences);

module.exports = router;

