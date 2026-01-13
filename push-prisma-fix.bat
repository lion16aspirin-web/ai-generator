@echo off
E:
cd \проекти\ai-generator
echo.
echo === Pushing prisma.ts fix ===
echo.
git add -A
git commit -m "Fix: disable prisma.ts import"
git push origin main
echo.
echo === DONE! Check Vercel ===
pause

