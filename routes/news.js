/**
 * News Routes
 * Handles news fetching and search
 */

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /news
 * @desc    Get news based on user preferences
 * @access  Private (requires authentication)
 */
router.get('/', authenticate, newsController.getNews);

/**
 * @route   GET /news/search
 * @desc    Search news with a query
 * @access  Private (requires authentication)
 */
router.get('/search', authenticate, newsController.searchNews);

/**
 * @route   GET /news/topic/:topic
 * @desc    Get news by specific topic
 * @access  Private (requires authentication)
 */
router.get('/topic/:topic', authenticate, newsController.getNewsByTopic);

module.exports = router;

