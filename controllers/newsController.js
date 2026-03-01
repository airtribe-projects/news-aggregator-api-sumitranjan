/**
 * News Controller - Handles news-related operations
 */

const newsService = require('../services/newsService');

/**
 * Get news based on user preferences
 * GET /news
 */
const getNews = async (req, res) => {
    try {
        const userPreferences = req.user.preferences || [];
        
        // Fetch news based on user preferences
        const result = await newsService.getNews(userPreferences);

        res.status(200).json({
            news: result.news,
            metadata: {
                count: result.news.length,
                preferences: userPreferences,
                cached: result.cached,
                source: result.source
            }
        });
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({
            error: 'Failed to fetch news',
            message: 'An error occurred while fetching news articles'
        });
    }
};

/**
 * Search news with a query
 * GET /news/search?q=query
 */
const searchNews = async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Search query is required'
            });
        }

        const userPreferences = req.user.preferences || [];
        const result = await newsService.searchNews(query.trim(), userPreferences);

        res.status(200).json({
            news: result.news,
            metadata: {
                count: result.news.length,
                query: query.trim(),
                preferences: userPreferences,
                cached: result.cached,
                source: result.source
            }
        });
    } catch (error) {
        console.error('Search news error:', error);
        res.status(500).json({
            error: 'Search failed',
            message: 'An error occurred while searching for news'
        });
    }
};

/**
 * Get news by specific topic
 * GET /news/topic/:topic
 */
const getNewsByTopic = async (req, res) => {
    try {
        const { topic } = req.params;
        
        if (!topic || topic.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Topic is required'
            });
        }

        const result = await newsService.getNews([topic.trim().toLowerCase()]);

        res.status(200).json({
            news: result.news,
            metadata: {
                count: result.news.length,
                topic: topic.trim().toLowerCase(),
                cached: result.cached,
                source: result.source
            }
        });
    } catch (error) {
        console.error('Get news by topic error:', error);
        res.status(500).json({
            error: 'Failed to fetch news',
            message: 'An error occurred while fetching news for this topic'
        });
    }
};

module.exports = {
    getNews,
    searchNews,
    getNewsByTopic
};

