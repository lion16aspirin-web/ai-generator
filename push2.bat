@echo off
E:
cd \проекти\ai-generator
echo Adding changes...
git add -A
echo.
echo Committing...
git commit -m "Update README version for fresh deployment"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo DONE! Check Vercel for new deployment.
pause

