@echo off
E:
cd \проекти\ai-generator
echo.
echo === Pushing next.config.ts fix ===
echo.
git add -A
git commit -m "Fix: NextConfig type annotation"
git push origin main
echo.
echo === DONE! Check Vercel ===
pause

