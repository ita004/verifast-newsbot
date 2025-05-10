const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/chat', chatRoutes);

// Serve static files from the React app
const frontendPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(frontendPath));

// Health check routes - both for custom checks and Render's default root check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route for Render's health check
app.get('/', (req, res) => {
  // If it's an API request, return OK status
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ status: 'ok' });
  }
  // Otherwise serve the frontend
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
