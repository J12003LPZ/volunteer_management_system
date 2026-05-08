# Starts Serena MCP via Docker on Windows PowerShell.
param(
  [string]$Port = "8765",
  [string]$Project = "$PWD"
)

Write-Host "Starting Serena MCP on port $Port with project $Project"
docker run --rm -p ${Port}:8765 -v ${Project}:/workspace ghcr.io/oraios/serena:latest mcp --mode http --port 8765 --project /workspace

