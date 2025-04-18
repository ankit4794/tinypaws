#!/bin/bash

# Install dependencies if needed
echo "Checking Next.js dependencies..."

# Build Next.js application
echo "Building Next.js application..."
npx next build

# Start Next.js server
echo "Starting Next.js server..."
npx next start -p 3000