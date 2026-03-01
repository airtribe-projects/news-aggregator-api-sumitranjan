# News Aggregator API

A REST API for personalized news aggregation with JWT authentication, user preferences, external news provider integration, and in-memory caching.

## Features

- User signup and login with hashed passwords (`bcrypt`)
- JWT-based authentication for protected routes
- User preference management (`/users/preferences`)
- Personalized news feed from user preferences
- News search and topic-based news endpoints
- Provider fallback chain:
  - GNews API
  - NewsAPI
  - Mock data (development-safe fallback)
- In-memory TTL cache for news responses
- Basic automated tests with `tap` + `supertest`

## Tech Stack

- Node.js (>= 18)
- Express
- Axios
- JSON Web Token (`jsonwebtoken`)
- bcrypt
- tap + supertest

## Project Structure

```text
news-aggregator-api-sumitranjan/
  app.js
  config/
    index.js
  controllers/
    newsController.js
    userController.js
  data/
    users.js
  middleware/
    auth.js
    validate.js
  routes/
    news.js
    users.js
  services/
    newsService.js
  utils/
    cache.js
  test/
    server.test.js
```

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
GNEWS_API_KEY=your_gnews_api_key
NEWSAPI_KEY=your_newsapi_key
NODE_ENV=development
```

Notes:

- `JWT_SECRET` should be set in all environments.
- If `GNEWS_API_KEY` and `NEWSAPI_KEY` are both missing or fail, the API serves mock news data.

## Run the Application

```bash
node app.js
```

The API runs on `http://localhost:3000` by default.

## Run Tests

```bash
npm test
```

## API Overview

### Health Check

- `GET /`

Returns service metadata and endpoint summary.

### Authentication Routes

- `POST /users/signup`
- `POST /users/login`

#### Signup Request Body

```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

#### Login Request Body

```json
{
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

Login/signup responses include a JWT token:

```json
{
  "token": "<jwt_token_here>"
}
```

### Preference Routes (Protected)

- `GET /users/preferences`
- `PUT /users/preferences`

`PUT /users/preferences` request body:

```json
{
  "preferences": ["technology", "sports", "business"]
}
```

### News Routes (Protected)

- `GET /news`
  - Returns news based on the authenticated user's saved preferences.
- `GET /news/search?q=<query>`
  - Searches news using query + user preferences.
- `GET /news/topic/:topic`
  - Returns news for a specific topic.

### Authorization Header

Protected endpoints require:

```http
Authorization: Bearer <jwt_token>
```

## Example cURL Flow

### 1) Signup

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Clark Kent","email":"clark@superman.com","password":"Krypt()n8","preferences":["movies","comics"]}'
```

### 2) Login

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clark@superman.com","password":"Krypt()n8"}'
```

### 3) Get personalized news

```bash
curl http://localhost:3000/news \
  -H "Authorization: Bearer <jwt_token>"
```

## Important Implementation Notes

- Data storage is in-memory (`data/users.js`). Restarting the server resets users.
- News cache is in-memory with default TTL of **5 minutes** (`utils/cache.js`).
- Signup currently returns HTTP `200` on success (not `201`).

## Error Behavior (High-level)

- `400` for validation failures and bad input
- `401` for missing/invalid/expired token or invalid login
- `404` for unknown routes
- `500` for unexpected server-side failures

## License

ISC
