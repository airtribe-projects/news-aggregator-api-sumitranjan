/**
 * Input validation middleware
 */

/**
 * Validate user signup input
 */
const validateSignup = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required');
    }

    // Validate email
    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    // Validate password
    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    // Validate preferences (optional but must be array if provided)
    if (req.body.preferences !== undefined) {
        if (!Array.isArray(req.body.preferences)) {
            errors.push('Preferences must be an array');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            messages: errors
        });
    }

    next();
};

/**
 * Validate user login input
 */
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.push('Email is required');
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            messages: errors
        });
    }

    next();
};

/**
 * Validate preferences update input
 */
const validatePreferences = (req, res, next) => {
    const { preferences } = req.body;

    if (!preferences) {
        return res.status(400).json({
            error: 'Validation failed',
            message: 'Preferences are required'
        });
    }

    if (!Array.isArray(preferences)) {
        return res.status(400).json({
            error: 'Validation failed',
            message: 'Preferences must be an array'
        });
    }

    // Validate each preference is a non-empty string
    for (const pref of preferences) {
        if (typeof pref !== 'string' || pref.trim().length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Each preference must be a non-empty string'
            });
        }
    }

    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validatePreferences
};

