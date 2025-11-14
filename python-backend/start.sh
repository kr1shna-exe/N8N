#!/bin/bash

set -e

WORKER_PID=""
SERVER_PID=""
WORKER_RESTART_COUNT=0
MAX_WORKER_RESTARTS=10

start_worker() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting worker.."
  PYTHONUNBUFFERED=1 uv run python Workers/index.py &
  WORKER_PID=$!
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Worker started with PID: $WORKER_PID"
  sleep 3

  if ! kill -0 $WORKER_PID 2>/dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Worker failed to start!"
    return 1
  fi

  WORKER_RESTART_COUNT=$((WORKER_RESTART_COUNT + 1))
  return 0
}

monitor_worker() {
  while true; do
    sleep 10

    if kill -0 $WORKER_PID 2>/dev/null; then
      WORKER_RESTART_COUNT=0
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Worker process (PID: $WORKER_PID) has died!"

      if [ $WORKER_RESTART_COUNT -lt $MAX_WORKER_RESTARTS ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Attempting to restart worker (restart count: $WORKER_RESTART_COUNT/$MAX_WORKER_RESTARTS)..."
        if start_worker; then
          echo "[$(date '+%Y-%m-%d %H:%M:%S')] Worker successfully restarted"
        else
          echo "[$(date '+%Y-%m-%d %H:%M:%S')] Worker restart failed, will retry in 10 seconds"
          sleep 10
        fi
      else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] CRITICAL: Worker has crashed $MAX_WORKER_RESTARTS times. Stopping container."
        kill $SERVER_PID 2>/dev/null || true
        exit 1
      fi
    fi
  done
}
# Function to handle cleanup on exit
cleanup() {
  echo "Shutting down..."
  kill $WORKER_PID 2>/dev/null || true
  kill $SERVER_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGTERM SIGINT

if ! start_worker; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] CRITICAL: Initial worker startup failed!"
  exit 1
fi

monitor_worker &
MONITOR_PID=$!
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Worker monitor started with PID: $MONITOR_PID"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting server..."
PYTHONUNBUFFERED=1 uv run uvicorn server.main:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server started with PID: $SERVER_PID"

wait $SERVER_PID
