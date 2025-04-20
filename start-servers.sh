#!/bin/bash

# Kill any existing processes on port 5000
echo "Stopping any existing servers..."
kill $(lsof -t -i:5000) 2>/dev/null || true

# Small delay to ensure ports are released
sleep 2

# Start the Express API server
echo "Starting Express API server..."
NODE_ENV=development tsx server/index.ts &
EXPRESS_PID=$!

# Small delay to ensure Express server is up
sleep 2

# Start the Next.js development server
echo "Starting Next.js server..."
npx next dev -p 3000 &
NEXT_PID=$!

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