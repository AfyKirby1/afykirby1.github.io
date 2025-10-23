@echo off
echo ⚔️ Starting DCS Main Server with War Room...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if package.json exists, if not copy from war-room-package.json
if not exist package.json (
    echo 📦 Setting up DCS Server dependencies...
    copy war-room-package.json package.json
    npm install
    echo ✅ Dependencies installed!
    echo.
)

REM Start the integrated server
echo 🚀 Launching DCS Main Server...
echo 🌐 Main Website: http://localhost:3001
echo 🎮 Runes of Tir na Nog: http://localhost:3001/RunesOfTirNaNog/
echo 🛠️ Blocky Builder: http://localhost:3001/Blocky-Builder/
echo ⚔️ The War Room: http://localhost:3001/war-room.html
echo 🔐 Admin Panel: http://localhost:3001/admin.html
echo.
echo 🎨 Tile Palette Upload: Upload custom tile textures via API
echo 💾 World Management: Save/load worlds via API endpoints
echo 📁 Tile textures saved to: ./Blocky-Builder/assets/tiles/
echo 💾 Worlds saved to: ./Blocky-Builder/worlds/
echo.
echo Press Ctrl+C to stop the server
echo.

node dcs-main-server.js

pause

