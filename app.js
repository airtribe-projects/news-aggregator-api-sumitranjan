/**
 * News Aggregator API
 * A personalized news aggregator RESTful API with authentication,
 * user preferences, and external API integration.
 */

require("dotenv").config();
const express = require("express");
const app = express();
const config = require("./config");

// Import routes
const userRoutes = require("./routes/users");
const newsRoutes = require("./routes/news");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        message: "News Aggregator API",
        version: "1.0.0",
        endpoints: {
            auth: {
                signup: "POST /users/signup",
                login: "POST /users/login",
            },
            preferences: {
                get: "GET /users/preferences",
                update: "PUT /users/preferences",
            },
            news: {
                get: "GET /news",
                search: "GET /news/search?q=query",
                byTopic: "GET /news/topic/:topic",
            },
        },
    });
});

// Routes
app.use("/users", userRoutes);
app.use("/news", newsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `The requested endpoint ${req.method} ${req.path} does not exist`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Something went wrong",
    });
});

// Start server
const port = config.server.port;
app.listen(port, (err) => {
    if (err) {
        return console.log("Something bad happened", err);
    }
    console.log(`Server is listening on ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
