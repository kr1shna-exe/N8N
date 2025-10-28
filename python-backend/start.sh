#!/bin/bash

# Exit on error
set -e

# Function to handle cleanup on exit
cleanup() {
    echo "Shutting down..."
    kill $WORKER_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Starting the worker in the background with unbuffered output
echo "Starting worker..."
PYTHONUNBUFFERED=1 uv run python Workers/index.py &
WORKER_PID=$!
echo "Worker started with PID: $WORKER_PID"

# Give worker a moment to start
sleep 2

# Check if worker is still running
if ! kill -0 $WORKER_PID 2>/dev/null; then
    echo "ERROR: Worker failed to start!"
    exit 1
fi

# Starting the FastAPI server in the foreground
echo "Starting server..."
PYTHONUNBUFFERED=1 uv run uvicorn server.main:app --host 0.0.0.0 --port 8000
