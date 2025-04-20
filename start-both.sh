#!/bin/bash

# Start both the Express server and Next.js
echo "Starting Express API server and Next.js..."

# Install concurrently if not present
npm install --no-save concurrently

# Run both services
npx concurrently "NODE_ENV=development tsx server/index.ts" "npx next dev"