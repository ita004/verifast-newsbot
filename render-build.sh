#!/bin/bash
# Build script for Render deployment

# Install backend dependencies
npm install

# Install frontend dependencies and build
cd client
npm install
npm run build
cd ..

# Set environment variables for Render
export NODE_ENV=production
export RENDER=true

# Don't start the server in the build script
# The server will be started by Render after the build completes
echo "Build completed successfully!"
