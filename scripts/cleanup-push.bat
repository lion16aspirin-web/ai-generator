@echo off
cd /d E:\проекти\ai-generator
echo.
echo === Cleanup and push ===
echo.
git add -A
git commit -m "Cleanup: remove debug bat files, add ROADMAP.md"
git push origin main
echo.
echo === DONE! ===
pause

