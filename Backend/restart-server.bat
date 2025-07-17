@echo off
echo Stopping existing server...
taskkill /f /im node.exe >nul 2>&1

echo Compiling TypeScript...
tsc simple-server.ts

echo Starting server...
start "SafeSwap Server" node simple-server.js

echo Server started! Health check: http://localhost:3000/health
timeout /t 3 >nul
curl http://localhost:3000/health
