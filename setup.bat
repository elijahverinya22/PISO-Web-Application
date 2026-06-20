@echo off
echo ========================================================
echo Welcome to PISO (Payment Insight & Savings Optimizer)
echo ========================================================
echo.
echo Step 1: Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not added to PATH!
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b
)

echo.
echo Step 2: Installing required dependencies...
pip install -r Files\requirements.txt
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies.
    pause
    exit /b
)

echo.
echo Setup Complete! Starting the application...
echo.
call run.bat
