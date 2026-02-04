@echo off
echo Starting Design Server...
echo.
echo Installing dependencies...
call npm install

echo.
echo Starting backend server on port 5000...
echo Run this in a separate terminal to start the frontend:
echo npm start
echo.

node server.js
pause
