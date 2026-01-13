@echo off
cd /d "E:\проекти\ai-generator"
echo.
echo Current commits:
git log --oneline -3
echo.
echo Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Push failed! Trying force push...
    git push origin main --force
)
echo.
echo Done!
echo.
echo Now go to Vercel and check new deployment.
echo Or manually trigger: Deployments - Redeploy
pause


