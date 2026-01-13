@echo off
cd /d E:\проекти\ai-generator

echo === Pushing Prisma + Neon integration ===

git add -A
git commit -m "feat: Add Prisma + Neon PostgreSQL integration"
git push origin main

echo === DONE! Check Vercel for deployment ===
pause

