@echo off
E:
cd \проекти\ai-generator
echo.
echo === Pushing Next.js 15 params fix ===
echo.
git add -A
git commit -m "Fix: Next.js 15 async params for all pages"
git push origin main
echo.
echo === DONE! Check Vercel ===
pause

