@echo off
E:
cd \проекти\ai-generator
echo.
echo === Fixing vercel.json ===
echo.
git add vercel.json
git commit -m "Fix: remove prisma from build command"
git push origin main
echo.
echo === DONE! Now redeploy in Vercel ===
pause

