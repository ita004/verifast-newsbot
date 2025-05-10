# NewsBot Frontend - RAG-Powered News Chatbot UI

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-v18+-blue.svg)
![Tailwind](https://img.shields.io/badge/tailwind-v3.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

This repository contains the frontend implementation of a RAG-powered chatbot for news websites. The application provides a clean, responsive interface for users to interact with a chatbot that answers queries based on news articles.

## 🚀 Features

- **Responsive Chat Interface**: Clean, modern UI built with React and Tailwind CSS
- **Session Management**: Maintains chat sessions with unique identifiers
- **Message History**: Displays past messages in a conversation thread
- **Session Reset**: Allows users to clear their chat history and start fresh
- **API Integration**: Connects to backend services for message processing and retrieval
- **Enhanced UI Components**:
  - User and bot avatars for better visual distinction
  - Typing indicators for better user experience
  - Auto-expanding text input with multi-line support
  - Suggestion buttons for common queries
  - Responsive design for mobile and desktop

## 🛠️ Tech Stack

- **Framework**: React
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **UUID Generation**: uuid

## 📋 Prerequisites

- Node.js (v14+)
- Backend server running (see the backend repository)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/newsbot-frontend.git
   cd newsbot-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

## 🚀 Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Preview the production build:
   ```bash
   npm run preview
   ```

## 🏗️ Project Structure

```
frontend/
├── public/            # Static assets
├── src/               # Source files
│   ├── api/           # API client
│   │   └── api.js     # API service functions
│   ├── components/    # React components
│   │   ├── ChatWindow.jsx   # Main chat interface
│   │   ├── MessageBubble.jsx # Individual message display
│   │   └── MessageInput.jsx  # User input component
│   ├── App.jsx        # Main application component
│   ├── index.css      # Global styles
│   └── main.jsx       # Application entry point
├── tailwind.config.js # Tailwind CSS configuration
└── package.json       # Project dependencies
```

## 💡 Design Decisions

### Component Architecture

The application follows a component-based architecture for better maintainability and reusability:

- **ChatWindow**: Manages the overall chat interface, including message history and user input
- **MessageBubble**: Displays individual messages with appropriate styling based on sender
- **MessageInput**: Handles user input and message submission

### State Management

- React's built-in state management is used for this application's scope
- Session IDs are generated using UUID and stored in local state
- Message history is fetched from the backend on initial load

### Styling Approach

- Tailwind CSS is used for utility-first styling
- Custom CSS is minimized to maintain consistency
- Responsive design ensures usability across devices

## 🔍 Potential Improvements

1. **Error Handling**: Implement more robust error handling with retry mechanisms
2. **Theming**: Support light/dark mode and customizable themes
3. **Markdown Support**: Add markdown rendering for formatted responses
4. **Voice Input**: Add speech-to-text for voice queries
5. **Response Feedback**: Allow users to rate bot responses for quality improvement
6. **Offline Support**: Implement service workers for offline functionality
7. **Accessibility**: Enhance keyboard navigation and screen reader support
8. **File Attachments**: Allow users to upload relevant documents for context
9. **Message Search**: Add ability to search through chat history
10. **Export Functionality**: Allow users to export their conversation history

## 🚀 Deployment

### Deploying to Render

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure the service with these settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_BASE_URL` pointing to your deployed backend

### Deploying to Netlify

1. Connect your GitHub repository to Netlify
2. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_BASE_URL` pointing to your deployed backend

### Deploying to Vercel

1. Import your GitHub repository to Vercel
2. The build settings should be auto-detected
3. Add the environment variable `VITE_API_BASE_URL` pointing to your deployed backend

## 📹 Demo Video Preparation

For your assignment submission, consider including these key points in your demo video:

1. **Application Overview**: Brief introduction to the NewsBot application
2. **UI Walkthrough**: Show the chat interface and its features
3. **Sample Queries**: Demonstrate the chatbot answering questions about:
   - India-Pakistan relations
   - The new Pope
   - Space exploration (moon dust)
   - Gaza aid delivery
4. **RAG Explanation**: Briefly explain how the RAG system retrieves relevant articles
5. **Session Management**: Show how to reset a session and start fresh
6. **Responsive Design**: Demonstrate the UI on different screen sizes

## 📄 License

[MIT](LICENSE)
