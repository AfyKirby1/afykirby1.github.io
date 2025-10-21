@echo off
echo Starting Runes of Tir na nOg Web Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if ports are already in use
echo Checking if ports are available...
netstat -an | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 8000 is already in use!
    echo Please close any existing servers or restart your computer.
    echo.
    echo You can try to kill existing Python processes:
    echo taskkill /f /im python.exe
    echo.
    pause
    exit /b 1
)

netstat -an | findstr ":1234" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 1234 is already in use!
    echo Please close any existing servers or restart your computer.
    echo.
    echo You can try to kill existing Python processes:
    echo taskkill /f /im python.exe
    echo.
    pause
    exit /b 1
)

echo Ports 8000 and 1234 are available!
echo.
echo Starting HTTP server on http://localhost:8000
echo Starting WebSocket server on ws://localhost:1234
echo.
echo Open your browser and go to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Start the main server (which includes both HTTP and WebSocket servers)
python server.py

pause
