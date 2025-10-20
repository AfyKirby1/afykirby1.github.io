@echo off
echo ========================================
echo   GitHub Pages Local Test Server
echo ========================================
echo.
echo Starting local server to test GitHub Pages routing...
echo.
echo This will serve files exactly like GitHub Pages would:
echo - Main site: http://localhost:8080/
echo - Runes of Tir Na Nog: http://localhost:8080/RunesOfTirNaNog/landing.html
echo - Blocky Builder: http://localhost:8080/Blocky-Builder/
echo - Blocky Builder Direct: http://localhost:8080/Blocky-Builder/public/index.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python HTTP server...
    python -m http.server 8080
) else (
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Using Node.js HTTP server...
        npx http-server -p 8080 -c-1
    ) else (
        echo Neither Python nor Node.js found!
        echo Please install Python or Node.js to run the test server.
        pause
        exit /b 1
    )
)
