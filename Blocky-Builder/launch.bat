@echo off
title Blocky Builder - World Editor Server
color 0A

echo.
echo  ===============================================
echo  🏗️  Blocky Builder - World Editor Server
echo  ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found!
    echo Please make sure you're in the Blocky Builder directory.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    echo This may take a moment...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully!
)

echo.
echo 🚀 Starting Blocky Builder Server...
echo.
echo 🌐 Server will be available at: http://localhost:3000
echo 📁 Worlds will be saved to: ./worlds/
echo.
echo 🔍 DEBUG MODE: Debug messages will appear in browser console
echo   1. Open http://localhost:3000/editor in your browser
echo   2. Press F12 to open Developer Tools
echo   3. Click on the "Console" tab
echo   4. Try drawing tiles - debug messages will appear there
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node src/server/server.js

echo.
echo 👋 Server stopped. Press any key to exit...
pause >nul
