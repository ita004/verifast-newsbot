# NewsBot Backend - RAG-Powered News Chatbot

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-v14+-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

This repository contains the backend implementation of a RAG-powered chatbot for news websites. The system ingests news articles, embeds them using Jina Embeddings, stores them in a Qdrant vector database, and uses Google's Gemini API to generate responses based on retrieved relevant articles.

## 🚀 Features

- **News Ingestion**: Fetches news articles from BBC RSS feeds with robust error handling and fallback mechanisms
- **Vector Database**: Stores article embeddings in Qdrant for semantic search
- **Session Management**: Maintains chat history using Redis with configurable TTL
- **RAG Pipeline**: Retrieves relevant articles for user queries and generates contextual responses
- **REST API**: Provides endpoints for chat interactions, session management, and vector database operations
- **Enhanced Prompting**: Sophisticated prompt engineering for detailed and informative responses

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Vector Database**: Qdrant
- **Embeddings**: Jina Embeddings
- **In-Memory Database**: Redis
- **LLM**: Google Gemini API
- **Web Scraping**: Axios, Cheerio, xml2js

## 📋 Prerequisites

- Node.js (v14+)
- Redis server
- Qdrant server
- Google Gemini API key

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/newsbot-backend.git
   cd newsbot-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   REDIS_URL=redis://localhost:6379
   QDRANT_HOST=http://localhost:6333
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start Redis and Qdrant servers:
   ```bash
   # Start Redis (if not already running)
   redis-server

   # Start Qdrant (if not already running)
   docker run -p 6333:6333 qdrant/qdrant
   ```

## 🚀 Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Initialize the vector database with news articles:
   ```bash
   node scripts/resetVectorDb.js
   node scripts/embedNews.js
   ```

3. View the contents of the vector database:
   ```bash
   node scripts/viewVectorDb.js
   ```

## 📚 API Endpoints

### Chat Endpoints

- **POST /api/chat/message**
  - Send a message to the chatbot
  - Request body: `{ sessionId: string, message: string }`
  - Response: `{ response: string }`

- **GET /api/chat/history/:sessionId**
  - Get chat history for a specific session
  - Response: `Array<{ role: string, content: string }>`

- **POST /api/chat/reset**
  - Reset a chat session
  - Request body: `{ sessionId: string }`
  - Response: `{ success: boolean, message: string }`

## 🏗️ Project Structure

```
backend/
├── routes/            # API route definitions
│   └── chat.js        # Chat-related endpoints
├── scripts/           # Utility scripts
│   ├── embedNews.js   # Script to fetch and embed news articles
│   ├── resetVectorDb.js # Script to reset the vector database
│   └── viewVectorDb.js # Script to view vector database contents
├── services/          # Core business logic
│   ├── chatService.js # Chat processing logic
│   ├── embeddingService.js # Embedding generation
│   ├── newsIngestion.js # News fetching and processing
│   └── vectorDbService.js # Vector database operations
├── utils/             # Utility functions
│   └── sessionManager.js # Redis session management
├── app.js             # Express application setup
├── server.js          # Server entry point
└── package.json       # Project dependencies
```

## 💡 Design Decisions

### News Ingestion Strategy

The system fetches news from BBC RSS feeds, which provides reliable access to current news articles without authentication requirements:

1. It fetches articles from multiple BBC RSS feeds (world, business, technology, science, etc.)
2. It processes and validates the articles to ensure they have sufficient content
3. If fetching fails for any reason, it falls back to a set of sample news articles

We chose BBC RSS feeds over Reuters sitemap scraping because:
- No authentication required (Reuters returned 401 errors)
- More reliable access without being blocked by Cloudflare
- Simpler parsing with structured RSS feeds vs. HTML scraping
- Consistent content format with proper article summaries

This approach ensures the system remains functional for demonstration purposes even when external APIs are unavailable.

### Caching & Performance

- **Session Management**: Chat histories are stored in Redis with a 1-hour TTL by default
- **Vector Database**: Qdrant is used for efficient similarity search of article embeddings
- **Error Handling**: Robust error handling with retries for news fetching and embedding

### TTL Configuration

The system uses a 1-hour TTL for Redis session data. This can be adjusted based on expected user engagement patterns:

```javascript
// In sessionManager.js
await client.set(`session:${id}`, JSON.stringify(history), { EX: 3600 }); // 1 hr TTL
```

For production, you might consider:
- Shorter TTLs (15-30 minutes) for high-traffic applications
- Longer TTLs (2-4 hours) for applications with longer user engagement
- Implementing a sliding window TTL that extends based on user activity

## 🔍 Potential Improvements

1. **Authentication**: Add user authentication for personalized experiences
2. **Scheduled Ingestion**: Implement periodic news fetching using cron jobs
3. **Caching Layer**: Add response caching for common queries
4. **Analytics**: Track user interactions and query patterns
5. **Streaming Responses**: Implement SSE or WebSockets for streaming bot responses
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Premium News API Integration**: Use paid news APIs for higher quality content
8. **Database Persistence**: Store chat histories in a SQL database for long-term storage
9. **Content Filtering**: Add moderation for inappropriate queries
10. **Multi-language Support**: Expand to handle queries in multiple languages

## 🚀 Deployment

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service with these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all variables from your `.env` file

### Required External Services

1. **Redis**: Set up a Redis instance (Render offers Redis as an add-on)
   - Add the Redis URL to your environment variables

2. **Qdrant**: Deploy a Qdrant instance
   - Option 1: Use Qdrant Cloud (https://cloud.qdrant.io/)
   - Option 2: Deploy Qdrant on Render using Docker
   - Add the Qdrant URL to your environment variables

3. **Google Gemini API**: Ensure your API key is added to environment variables

## 📄 License

[MIT](LICENSE)
