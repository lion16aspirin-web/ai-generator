@echo off
chcp 65001 >nul
echo ========================================
echo    Git Setup for AI Generator
echo ========================================
echo.

cd /d "E:\проекти\ai-generator"

echo [1/4] Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo ERROR: git init failed
    pause
    exit /b 1
)

echo.
echo [2/4] Adding all files...
git add .
if %errorlevel% neq 0 (
    echo ERROR: git add failed
    pause
    exit /b 1
)

echo.
echo [3/4] Creating initial commit...
git commit -m "Initial commit: AI Generator Platform"
if %errorlevel% neq 0 (
    echo ERROR: git commit failed
    pause
    exit /b 1
)

echo.
echo [4/4] Adding remote origin...
git remote add origin https://github.com/lion16aspirin-web/ai-generator.git
git branch -M main

echo.
echo ========================================
echo    Git setup complete!
echo ========================================
echo.
echo Now create repository on GitHub:
echo https://github.com/new
echo.
echo Repository name: ai-generator
echo Make it Private or Public
echo DO NOT add README (we have one)
echo.
echo After creating repo, run: git-push.bat
echo.
pause

