/**
 * In-memory user storage
 * In production, this would be replaced with a database
 */

const users = new Map();

module.exports = {
    /**
     * Find a user by email
     * @param {string} email 
     * @returns {Object|null} User object or null
     */
    findByEmail(email) {
        for (const [id, user] of users) {
            if (user.email === email) {
                return { id, ...user };
            }
        }
        return null;
    },

    /**
     * Find a user by ID
     * @param {string} id 
     * @returns {Object|null} User object or null
     */
    findById(id) {
        const user = users.get(id);
        return user ? { id, ...user } : null;
    },

    /**
     * Create a new user
     * @param {Object} userData - User data (name, email, password, preferences)
     * @returns {Object} Created user with ID
     */
    create(userData) {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = {
            name: userData.name,
            email: userData.email,
            password: userData.password, // Should be hashed before storing
            preferences: userData.preferences || [],
            createdAt: new Date().toISOString()
        };
        users.set(id, user);
        return { id, ...user };
    },

    /**
     * Update user preferences
     * @param {string} id - User ID
     * @param {Array} preferences - New preferences array
     * @returns {Object|null} Updated user or null
     */
    updatePreferences(id, preferences) {
        const user = users.get(id);
        if (!user) return null;
        
        user.preferences = preferences;
        users.set(id, user);
        return { id, ...user };
    },

    /**
     * Get all users (for debugging)
     * @returns {Array} Array of all users
     */
    getAll() {
        return Array.from(users.entries()).map(([id, user]) => ({ id, ...user }));
    },

    /**
     * Clear all users (for testing)
     */
    clear() {
        users.clear();
    }
};

