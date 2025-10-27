@echo off
echo ========================================
echo    Creality Helper GUI - Quick Start
echo ========================================
echo.

echo [INFO] Starting application...
electron .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start the application.
    pause
    exit /b %errorlevel%
)

pause