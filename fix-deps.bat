@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Installing missing dependencies...
call npm install class-variance-authority
echo.
echo Done! Restart the dev server.
pause



