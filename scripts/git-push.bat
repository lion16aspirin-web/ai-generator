@echo off
echo.
echo ========================================
echo    AI Generator - Git Push Script
echo ========================================
echo.

cd /d E:\проекти\ai-generator

echo [1/3] Adding all changes...
git add -A

echo.
echo [2/3] Creating commit...
set /p message="Enter commit message: "
git commit -m "%message%"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo    Done! Check Vercel for deployment
echo ========================================
pause

