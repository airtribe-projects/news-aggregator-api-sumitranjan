/**
 * User Controller - Handles user-related operations
 */

const bcrypt = require('bcrypt');
const userStore = require('../data/users');
const { generateToken } = require('../middleware/auth');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * POST /users/signup
 */
const signup = async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;

        // Check if user already exists
        const existingUser = userStore.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                error: 'Registration failed',
                message: 'A user with this email already exists'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create the user
        const user = userStore.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            preferences: preferences || []
        });

        // Generate token for immediate login after signup
        const token = generateToken(user);

        res.status(200).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                preferences: user.preferences
            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration'
        });
    }
};

/**
 * Login user
 * POST /users/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = userStore.findByEmail(email.toLowerCase().trim());
        
        if (!user) {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
};

/**
 * Get user preferences
 * GET /users/preferences
 */
const getPreferences = (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            preferences: user.preferences || []
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            error: 'Failed to get preferences',
            message: 'An error occurred while fetching preferences'
        });
    }
};

/**
 * Update user preferences
 * PUT /users/preferences
 */
const updatePreferences = (req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.user.id;

        // Sanitize preferences (trim whitespace, lowercase)
        const sanitizedPreferences = preferences.map(p => p.trim().toLowerCase());

        // Update preferences
        const updatedUser = userStore.updatePreferences(userId, sanitizedPreferences);

        if (!updatedUser) {
            return res.status(404).json({
                error: 'Update failed',
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'Preferences updated successfully',
            preferences: updatedUser.preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            error: 'Update failed',
            message: 'An error occurred while updating preferences'
        });
    }
};

module.exports = {
    signup,
    login,
    getPreferences,
    updatePreferences
};

