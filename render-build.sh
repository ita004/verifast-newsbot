#!/bin/bash
# Build script for Render deployment

# Install backend dependencies
npm install

# Install frontend dependencies and build
cd client
npm install
npm run build
cd ..

# Start the server
node server.js
