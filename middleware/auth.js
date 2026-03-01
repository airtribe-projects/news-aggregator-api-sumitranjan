/**
 * Authentication middleware using JWT
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const userStore = require('../data/users');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'No authorization token provided'
            });
        }

        // Check for Bearer token format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Invalid token format',
                message: 'Authorization header must be in format: Bearer <token>'
            });
        }

        const token = parts[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Find user by ID from token
        const user = userStore.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Please login again'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Token verification failed'
            });
        }

        return res.status(500).json({
            error: 'Authentication error',
            message: 'An error occurred during authentication'
        });
    }
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user.id,
            email: user.email 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

module.exports = {
    authenticate,
    generateToken
};

