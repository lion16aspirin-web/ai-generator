@echo off
E:
cd проекти\ai-generator
git add -A
git commit -m "Remove Prisma temporarily for Vercel deployment"
git push origin main
pause

