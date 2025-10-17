#!/bin/bash

# Starting the worker in the background
uv run python Workers/index.py &

# Starting the FastAPI server in the foreground
uv run uvicorn server.main:app --host 0.0.0.0 --port 8000
