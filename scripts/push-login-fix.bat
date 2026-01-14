@echo off
cd /d E:\проекти\ai-generator

echo === Pushing Login fix with NextAuth ===

git add -A
git commit -m "fix: Implement NextAuth login functionality"
git push origin main

echo === DONE! ===
pause


