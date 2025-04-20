#!/bin/bash

# Install concurrent dependency if not installed
npm install --no-save concurrently

# Start MongoDB server
echo "Starting MongoDB server..."
# The MongoDB server is already running on Replit

# Start both API server (port 5000) and Next.js app (port 3000)
echo "Starting API server and Next.js application..."
npx concurrently "NODE_ENV=development tsx server/index.ts" "npx next dev -p 3000"