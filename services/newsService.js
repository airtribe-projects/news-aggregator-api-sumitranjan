/**
 * News Service - Handles external news API integration
 * Supports GNews API with fallback to mock data
 */

const axios = require('axios');
const config = require('../config');
const cache = require('../utils/cache');

/**
 * Fetch news from GNews API
 * @param {Array} preferences - User's news preferences/topics
 * @returns {Promise<Array>} Array of news articles
 */
async function fetchFromGNews(preferences) {
    const apiKey = config.newsApi.gnewsApiKey;
    
    if (!apiKey) {
        console.warn('GNews API key not configured, using mock data');
        return null;
    }

    try {
        // Build search query from preferences
        const query = preferences.length > 0 
            ? preferences.join(' OR ')
            : 'general';

        const response = await axios.get(`${config.newsApi.gnewsBaseUrl}/search`, {
            params: {
                q: query,
                lang: 'en',
                max: 10,
                apikey: apiKey
            },
            timeout: 10000
        });

        if (response.data && response.data.articles) {
            return response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                content: article.content,
                url: article.url,
                image: article.image,
                publishedAt: article.publishedAt,
                source: {
                    name: article.source.name,
                    url: article.source.url
                }
            }));
        }

        return [];
    } catch (error) {
        console.error('GNews API error:', error.message);
        throw error;
    }
}

/**
 * Fetch news from NewsAPI.org
 * @param {Array} preferences - User's news preferences/topics
 * @returns {Promise<Array>} Array of news articles
 */
async function fetchFromNewsAPI(preferences) {
    const apiKey = config.newsApi.newsApiKey;
    
    if (!apiKey) {
        return null;
    }

    try {
        const query = preferences.length > 0 
            ? preferences.join(' OR ')
            : 'general';

        const response = await axios.get(`${config.newsApi.newsApiBaseUrl}/everything`, {
            params: {
                q: query,
                language: 'en',
                pageSize: 10,
                sortBy: 'publishedAt'
            },
            headers: {
                'X-Api-Key': apiKey
            },
            timeout: 10000
        });

        if (response.data && response.data.articles) {
            return response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                content: article.content,
                url: article.url,
                image: article.urlToImage,
                publishedAt: article.publishedAt,
                source: {
                    name: article.source.name,
                    url: null
                }
            }));
        }

        return [];
    } catch (error) {
        console.error('NewsAPI error:', error.message);
        throw error;
    }
}

/**
 * Generate mock news data for testing/development
 * @param {Array} preferences - User's news preferences/topics
 * @returns {Array} Array of mock news articles
 */
function generateMockNews(preferences) {
    const topics = preferences.length > 0 ? preferences : ['general'];
    
    const mockArticles = [
        {
            title: `Latest updates in ${topics[0]} industry`,
            description: `Breaking news and developments in the ${topics[0]} sector that you need to know about today.`,
            content: `This is a comprehensive article about the latest trends and updates in ${topics[0]}. Stay informed with our in-depth coverage...`,
            url: `https://example.com/news/${topics[0]}/article-1`,
            image: `https://picsum.photos/seed/${topics[0]}/800/400`,
            publishedAt: new Date().toISOString(),
            source: {
                name: 'Mock News Source',
                url: 'https://example.com'
            }
        },
        {
            title: `Top ${topics[0]} stories of the week`,
            description: `A roundup of the most important ${topics[0]} news from this week.`,
            content: `Here are the top stories you might have missed in ${topics[0]} this week...`,
            url: `https://example.com/news/${topics[0]}/article-2`,
            image: `https://picsum.photos/seed/${topics[0]}2/800/400`,
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            source: {
                name: 'Weekly Digest',
                url: 'https://example.com'
            }
        },
        {
            title: `Expert analysis on ${topics[0]} trends`,
            description: `Industry experts share their insights on where ${topics[0]} is heading.`,
            content: `Our panel of experts discusses the future of ${topics[0]} and what to expect in the coming months...`,
            url: `https://example.com/news/${topics[0]}/article-3`,
            image: `https://picsum.photos/seed/${topics[0]}3/800/400`,
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            source: {
                name: 'Expert Insights',
                url: 'https://example.com'
            }
        }
    ];

    // Add more articles for each preference
    if (topics.length > 1) {
        topics.slice(1).forEach(topic => {
            mockArticles.push({
                title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} news update`,
                description: `The latest news and updates about ${topic}.`,
                content: `Detailed coverage of ${topic} news and developments...`,
                url: `https://example.com/news/${topic}/latest`,
                image: `https://picsum.photos/seed/${topic}/800/400`,
                publishedAt: new Date(Date.now() - Math.random() * 259200000).toISOString(),
                source: {
                    name: 'Topic News',
                    url: 'https://example.com'
                }
            });
        });
    }

    return mockArticles;
}

/**
 * Main function to fetch news articles based on user preferences
 * Uses caching to reduce API calls
 * @param {Array} preferences - User's news preferences/topics
 * @returns {Promise<Object>} Object containing news array and metadata
 */
async function getNews(preferences = []) {
    // Check cache first
    const cacheKey = cache.generateKey(preferences);
    const cachedNews = cache.get(cacheKey);
    
    if (cachedNews) {
        console.log('Returning cached news for:', cacheKey);
        return {
            news: cachedNews,
            cached: true,
            source: 'cache'
        };
    }

    let news = null;
    let source = 'mock';

    // Try GNews API first
    try {
        news = await fetchFromGNews(preferences);
        if (news && news.length > 0) {
            source = 'gnews';
        }
    } catch (error) {
        console.warn('GNews fetch failed, trying alternative...');
    }

    // Try NewsAPI as fallback
    if (!news || news.length === 0) {
        try {
            news = await fetchFromNewsAPI(preferences);
            if (news && news.length > 0) {
                source = 'newsapi';
            }
        } catch (error) {
            console.warn('NewsAPI fetch failed, using mock data...');
        }
    }

    // Use mock data as final fallback
    if (!news || news.length === 0) {
        news = generateMockNews(preferences);
        source = 'mock';
    }

    // Cache the results
    cache.set(cacheKey, news);
    console.log('Cached news for:', cacheKey);

    return {
        news,
        cached: false,
        source
    };
}

/**
 * Search for specific news articles
 * @param {string} query - Search query
 * @param {Array} preferences - User's preferences for filtering
 * @returns {Promise<Object>} Search results
 */
async function searchNews(query, preferences = []) {
    // For search, we combine user query with preferences
    const searchTerms = [...(preferences || []), query];
    return getNews(searchTerms);
}

module.exports = {
    getNews,
    searchNews,
    generateMockNews,
    fetchFromGNews,
    fetchFromNewsAPI
};

