@echo off
chcp 65001 >nul
echo ========================================
echo    Pushing to GitHub
echo ========================================
echo.

cd /d "E:\проекти\ai-generator"

echo Pushing to origin main...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo If push failed, try:
    echo   git push -u origin main --force
    echo.
) else (
    echo.
    echo ========================================
    echo    SUCCESS! Code is on GitHub!
    echo ========================================
    echo.
    echo Your repo: https://github.com/lion16aspirin-web/ai-generator
    echo.
    echo Next steps:
    echo 1. Go to https://vercel.com
    echo 2. Sign in with GitHub
    echo 3. Import ai-generator repository
    echo 4. Add environment variables
    echo 5. Deploy!
    echo.
)

pause

