#!/bin/bash

set +e

WORKER_PID=""
SERVER_PID=""
WORKER_RESTART_COUNT=0
SERVER_RESTART_COUNT=0
MAX_RESTARTS=5
HEALTH_CHECK_INTERVAL=30

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_redis() {
  log "Checking Redis connectivity..."
  if uv run python -c "from exports.redis import redis_client; redis_client.ping()" 2>/dev/null; then
    log "Redis OK"
    return 0
  else
    log "Redis FAILED"
    return 1
  fi
}

check_database() {
  log "Checking Database connectivity..."
  if uv run python -c "from db.database import get_session; next(get_session())" 2>/dev/null; then
    log "Database OK"
    return 0
  else
    log "Database FAILED"
    return 1
  fi
}

get_worker_python_pid() {
  pgrep -f "python.*Workers/index.py" | head -1
}

check_worker_health() {
  local python_pid=$(get_worker_python_pid)
  if [ -z "$python_pid" ]; then
    log "Worker Python process not found"
    return 1
  fi

  if ! kill -0 "$python_pid" 2>/dev/null; then
    log "Worker Python process $python_pid is dead"
    return 1
  fi

  log "Worker Python process $python_pid is alive"
  return 0
}

start_worker() {
  log "Starting worker..."

  pkill -f "python.*Workers/index.py" 2>/dev/null || true
  sleep 2

  PYTHONUNBUFFERED=1 uv run python Workers/index.py > /tmp/worker.log 2>&1 &
  WORKER_PID=$!
  log "Worker UV process started with PID: $WORKER_PID"

  sleep 5

  if check_worker_health; then
    log "Worker started successfully"
    WORKER_RESTART_COUNT=0
    return 0
  else
    log "Worker failed to start"
    log "Worker logs:"
    tail -20 /tmp/worker.log 2>/dev/null || log "No worker logs available"
    return 1
  fi
}

start_server() {
  log "Starting server..."

  pkill -f "uvicorn.*server.main:app" 2>/dev/null || true
  sleep 2

  PYTHONUNBUFFERED=1 uv run uvicorn server.main:app --host 0.0.0.0 --port 8000 > /tmp/server.log 2>&1 &
  SERVER_PID=$!
  log "Server started with PID: $SERVER_PID"

  sleep 3

  if kill -0 $SERVER_PID 2>/dev/null; then
    log "Server started successfully"
    SERVER_RESTART_COUNT=0
    return 0
  else
    log "Server failed to start"
    log "Server logs:"
    tail -20 /tmp/server.log 2>/dev/null || log "No server logs available"
    return 1
  fi
}

monitor_processes() {
  log "Starting process monitor..."

  while true; do
    sleep $HEALTH_CHECK_INTERVAL

    if ! check_worker_health; then
      log "WARNING: Worker is not healthy!"
      WORKER_RESTART_COUNT=$((WORKER_RESTART_COUNT + 1))

      if [ $WORKER_RESTART_COUNT -le $MAX_RESTARTS ]; then
        log "Attempting to restart worker (attempt $WORKER_RESTART_COUNT/$MAX_RESTARTS)..."
        if start_worker; then
          log "Worker restarted successfully"
        else
          log "Worker restart failed"
        fi
      else
        log "CRITICAL: Worker has failed $MAX_RESTARTS times. Stopping container."
        exit 1
      fi
    fi

    if ! kill -0 $SERVER_PID 2>/dev/null; then
      log "WARNING: Server process has died!"
      SERVER_RESTART_COUNT=$((SERVER_RESTART_COUNT + 1))

      if [ $SERVER_RESTART_COUNT -le $MAX_RESTARTS ]; then
        log "Attempting to restart server (attempt $SERVER_RESTART_COUNT/$MAX_RESTARTS)..."
        if start_server; then
          log "Server restarted successfully"
        else
          log "Server restart failed"
        fi
      else
        log "CRITICAL: Server has failed $MAX_RESTARTS times. Stopping container."
        exit 1
      fi
    fi
  done
}

cleanup() {
  log "Shutting down..."
  pkill -f "python.*Workers/index.py" 2>/dev/null || true
  pkill -f "uvicorn.*server.main:app" 2>/dev/null || true
  kill $WORKER_PID 2>/dev/null || true
  kill $SERVER_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGTERM SIGINT

log "Performing initial health checks..."
check_redis || log "WARNING: Redis not accessible at startup"
check_database || log "WARNING: Database not accessible at startup"

if ! start_worker; then
  log "CRITICAL: Initial worker startup failed!"
  log "Waiting 10 seconds before retry..."
  sleep 10
  if ! start_worker; then
    log "CRITICAL: Worker startup failed after retry. Exiting."
    exit 1
  fi
fi

if ! start_server; then
  log "CRITICAL: Initial server startup failed!"
  exit 1
fi

monitor_processes &
MONITOR_PID=$!
log "Process monitor started with PID: $MONITOR_PID"

log "Container is running. Monitoring processes..."
wait $SERVER_PID
log "Server process exited. Shutting down container."
