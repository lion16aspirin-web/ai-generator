@echo off
cd /d E:\проекти\ai-generator
echo === Pushing Session Provider Fix ===
git add -A
git commit -m "feat: Add SessionProvider and fix Header auth state"
git push origin main
echo === DONE! Check Vercel ===
pause

