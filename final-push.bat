@echo off
E:
cd \проекти\ai-generator
echo Current directory:
cd
echo.
echo Git status:
git status
echo.
echo Adding all files...
git add -A
echo.
echo Committing...
git commit -m "Fix build command - remove prisma"
echo.
echo Pushing...
git push origin main
echo.
echo === DONE ===
pause

