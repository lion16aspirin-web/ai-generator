@echo off
cd /d E:\проекти\ai-generator
echo Adding all changes...
git add -A
echo.
echo Committing...
git commit -m "Remove Prisma temporarily for Vercel deployment"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done!
pause

