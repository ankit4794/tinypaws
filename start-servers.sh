#!/bin/bash

# Alternative way to kill processes without lsof
echo "Stopping any existing servers..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Small delay to ensure ports are released
sleep 3

# Start the Next.js development server first (on port 3000)
echo "Starting Next.js server..."
npx next dev -p 3000 &
NEXT_PID=$!

# Small delay before starting Express
sleep 3

# Start the Express API server
echo "Starting Express API server..."
NODE_ENV=development tsx server/index.ts &
EXPRESS_PID=$!

echo "Both servers started!"
echo "Express API: http://localhost:5000"
echo "Next.js: http://localhost:3000"

# Function to kill both processes on exit
function cleanup() {
  echo "Stopping servers..."
  kill $EXPRESS_PID 2>/dev/null || true
  kill $NEXT_PID 2>/dev/null || true
  exit
}

# Set up trap to call cleanup when script receives termination signal
trap cleanup SIGINT SIGTERM

# Keep script running
wait