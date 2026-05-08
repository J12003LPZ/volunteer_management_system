#!/usr/bin/env bash
set -euo pipefail
PORT="${1:-8765}"
PROJECT="${2:-$PWD}"
echo "Starting Serena MCP on port ${PORT} with project ${PROJECT}"
docker run --rm -p ${PORT}:8765 -v "${PROJECT}:/workspace" ghcr.io/oraios/serena:latest mcp --mode http --port 8765 --project /workspace

