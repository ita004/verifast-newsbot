# Verifast NewsBot - RAG-Powered News Chatbot

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-v22+-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

This repository contains the backend implementation of a RAG-powered chatbot for news websites. The system uses Jina Embeddings to convert user queries into vector representations, retrieves relevant news articles from a Qdrant vector database, and uses Google's Gemini API to generate informative responses based on the retrieved content.

## 🚀 Features

- **Vector Database**: Stores article embeddings in Qdrant for semantic search
- **Session Management**: Maintains chat history using Redis with configurable TTL
- **RAG Pipeline**: Retrieves relevant articles for user queries and generates contextual responses
- **REST API**: Provides endpoints for chat interactions and session management
- **Enhanced Prompting**: Sophisticated prompt engineering for detailed and informative responses

## 🛠️ Tech Stack

- **Runtime**: Node.js v22
- **Framework**: Express.js
- **Vector Database**: Qdrant Cloud
- **Embeddings**: Jina Embeddings
- **In-Memory Database**: Redis
- **LLM**: Google Gemini API
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js (v22+)
- Redis server (local or cloud)
- Qdrant Cloud account
- Google Gemini API key
- Jina AI API key

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
   QDRANT_HOST=https://your-qdrant-instance.cloud.qdrant.io:6333
   QDRANT_API_KEY=your_qdrant_api_key
   GEMINI_API_KEY=your_gemini_api_key
   JINA_API_KEY=your_jina_api_key
   ```

4. Start Redis server (if using locally):
   ```bash
   # Start Redis (if not already running)
   redis-server
   ```

## 🚀 Usage

1. Start the server:
   ```bash
   node server.js
   ```

2. The server will be available at http://localhost:3001

3. Use the frontend application to interact with the chatbot (see the frontend repository)

## 📚 API Endpoints

### Chat Endpoints

- **POST /api/chat**
  - Send a message to the chatbot
  - Request body: `{ message: string, session_id?: string }`
  - Response: `{ reply: string, session_id: string }`

- **GET /api/chat/session/:id**
  - Get chat history for a specific session
  - Response: `{ history: Array<{ user: string, bot: string }> }`

- **POST /api/chat/reset**
  - Reset a chat session
  - Request body: `{ session_id: string }`
  - Response: `{ message: string }`

## 🏗️ Project Structure

```
backend/
├── client/            # Frontend application (built with React)
│   ├── dist/          # Built frontend files
│   └── src/           # Frontend source code
├── routes/            # API route definitions
│   └── chat.js        # Chat-related endpoints
├── services/          # Core business logic
│   ├── embeddingService.js # Embedding generation with Jina AI
│   ├── geminiService.js    # Gemini API integration
│   ├── newsIngestion.js    # News processing utilities
│   └── vectorDbService.js  # Qdrant operations
├── utils/             # Utility functions
│   └── sessionManager.js   # Redis session management
├── app.js             # Express application setup
├── server.js          # Server entry point
├── render.yaml        # Render deployment configuration
├── render-build.sh    # Build script for Render
├── start.sh           # Start script for Render
└── package.json       # Project dependencies
```

## 💡 Design Decisions

### RAG Pipeline Implementation

The system implements a Retrieval-Augmented Generation (RAG) pipeline:

1. User queries are converted to vector embeddings using Jina AI
2. These embeddings are used to search for relevant news articles in Qdrant
3. Retrieved articles are formatted and sent to Gemini API along with the user query
4. Gemini generates a comprehensive response based on the retrieved context

This approach provides several advantages:
- More accurate and factual responses based on real news content
- Reduced hallucination compared to using LLMs without retrieval
- Ability to answer questions about current events with specific details
- Contextual awareness for follow-up questions

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

1. **News Ingestion**: Implement automated news fetching from RSS feeds or news APIs
2. **Authentication**: Add user authentication for personalized experiences
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
   - **Build Command**: `./render-build.sh`
   - **Start Command**: `./start.sh`
   - **Environment Variables**: Add all variables from your `.env` file

### Required External Services

1. **Redis**: Set up a Redis instance (Upstash Redis recommended)
   - Add the Redis URL to your environment variables
   - Enable TLS for production deployments

2. **Qdrant**: Use Qdrant Cloud (https://cloud.qdrant.io/)
   - Create a collection named "news-articles"
   - Add the Qdrant URL and API key to your environment variables

3. **API Keys**: Add the following API keys to your environment variables:
   - `GEMINI_API_KEY`: For Google Gemini API
   - `JINA_API_KEY`: For Jina AI embeddings

## 🖥️ Frontend Repository

The frontend for this application is included in the `client` directory and is built with React and Tailwind CSS. It provides a clean, responsive chat interface for interacting with the NewsBot.

Key frontend features:
- Real-time chat interface
- Session persistence across page refreshes
- Session reset functionality
- Mobile-responsive design
- Clean, modern UI with Tailwind CSS

## 📄 License

[MIT](LICENSE)
