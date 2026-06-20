@echo off
echo ========================================================
echo Welcome to PISO (Payment Insight ^& Savings Optimizer)
echo ========================================================
echo.

:: Step 1: Check Python installation
echo Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not added to PATH!
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b
)

:: Step 2: Install dependencies
echo Installing required dependencies...
pip install -r Files\requirements.txt -q
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies.
    pause
    exit /b
)

echo.
echo Starting PISO backend server on http://127.0.0.1:8080...
:: Start the server in the background briefly
start "PISO Server" cmd /c "cd Files && python server.py"
:: Wait 2 seconds for Flask to start
timeout /t 2 /nobreak > nul
:: Open the browser to the exact IP address
start http://127.0.0.1:8080
echo.
echo Server is running! Please keep the "PISO Server" command window open.
echo You may close this window.
exit
