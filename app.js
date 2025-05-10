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

// Simple route for health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handle all other routes by serving the React app
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
