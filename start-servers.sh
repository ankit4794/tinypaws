#!/bin/bash

# More aggressive process cleanup
echo "Stopping any existing servers..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
kill $(lsof -t -i:5000 2>/dev/null) 2>/dev/null || true
kill $(lsof -t -i:3000 2>/dev/null) 2>/dev/null || true
ps aux | grep "tsx server/index.ts" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Even longer delay to ensure ports are released
sleep 5

# Start the Express API server first
echo "Starting Express API server..."
cd $(dirname "$0")
NODE_ENV=development tsx server/index.ts &
EXPRESS_PID=$!

# Wait for Express to start
sleep 5

# Start the Next.js development server
echo "Starting Next.js server..."

# Set environment variables for Next.js
export NODE_OPTIONS="--max-old-space-size=4096"
export HOSTNAME="0.0.0.0"
export NEXT_TELEMETRY_DISABLED=1
export PORT=3000

# Start Next.js with proper binding to 0.0.0.0
npx next dev -p 3000 -H 0.0.0.0 &
NEXT_PID=$!

echo "Both servers started!"
echo "Express API: http://localhost:5000"
echo "Next.js: http://0.0.0.0:3000"

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