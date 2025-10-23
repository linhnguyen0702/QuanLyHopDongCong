@echo off
REM Simple Blockchain System Startup Script for Windows
REM This script starts the contract management system with Simple Blockchain Service

echo ========================================
echo  Contract Management System Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version

echo.
echo [INFO] Starting Backend Server (Port 5000)...
echo.

REM Start backend server
cd server
start "Backend Server" cmd /k "npm start"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

echo [INFO] Backend server started
echo [INFO] Starting Frontend (Port 3000)...
echo.

REM Go back to root directory and start frontend
cd ..
start "Frontend Server" cmd /k "npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  System Started Successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend:     http://localhost:3000
echo Blockchain:  http://localhost:5000/api/blockchain/status
echo.
echo Press any key to open the application...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo [INFO] Application opened in browser
echo [INFO] To stop the system, close both terminal windows
echo.
pause
