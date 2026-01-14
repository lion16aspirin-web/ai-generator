@echo off
cd /d E:\проекти\ai-generator
echo === Pushing Google OAuth Fix ===
git add -A
git commit -m "fix: Google OAuth redirect and callback URL"
git push origin main
echo === DONE! Redeploy on Vercel ===
pause

