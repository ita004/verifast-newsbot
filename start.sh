#!/bin/bash
# Start script for Render deployment

# Set environment variables for Render
export NODE_ENV=production
export RENDER=true

# Start the server
node server.js
