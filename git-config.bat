@echo off
chcp 65001 >nul
echo ========================================
echo    Git Configuration
echo ========================================
echo.

cd /d "E:\проекти\ai-generator"

echo Setting up Git user...
git config --global user.name "lion16aspirin-web"
git config --global user.email "lion16aspirin-web@users.noreply.github.com"

echo.
echo Git user configured:
git config --global user.name
git config --global user.email

echo.
echo ========================================
echo    Now running git commit...
echo ========================================
echo.

git add .
git commit -m "Initial commit: AI Generator Platform"

if %errorlevel% neq 0 (
    echo ERROR: git commit failed
    pause
    exit /b 1
)

echo.
echo [4/4] Adding remote origin...
git remote add origin https://github.com/lion16aspirin-web/ai-generator.git 2>nul
git branch -M main

echo.
echo ========================================
echo    SUCCESS! Ready to push!
echo ========================================
echo.
echo Now:
echo 1. Create repo on GitHub: https://github.com/new
echo    Name: ai-generator
echo    DO NOT add README
echo.
echo 2. Then run: git-push.bat
echo.
pause

