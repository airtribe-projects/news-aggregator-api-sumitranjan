require('dotenv').config();

module.exports = {
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback_secret_key',
        expiresIn: '24h'
    },
    newsApi: {
        gnewsApiKey: process.env.GNEWS_API_KEY,
        gnewsBaseUrl: 'https://gnews.io/api/v4',
        newsApiKey: process.env.NEWSAPI_KEY,
        newsApiBaseUrl: 'https://newsapi.org/v2'
    },
    cache: {
        ttl: 5 * 60 * 1000 // 5 minutes in milliseconds
    },
    server: {
        port: process.env.PORT || 3000
    }
};

