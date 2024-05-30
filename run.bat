@echo off
REM Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python is not installed. Please install Python to use this script.
    pause
    exit /B 1
)

REM Open HTTP server in the current directory on port 8080
echo Starting HTTP server in the current directory on port 8080...
python -m http.server 8080