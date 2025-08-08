@echo off
echo Stopping existing server...
taskkill /f /im node.exe >nul 2>&1

echo Starting server...
start "SafeSwap Server" node src/server.js

echo Server started! Health check: http://localhost:5000/health
timeout /t 3 >nul
curl http://localhost:5000/health
