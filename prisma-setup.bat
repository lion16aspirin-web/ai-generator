@echo off
cd /d "E:\проекти\ai-generator"
echo Generating Prisma Client...
call npx prisma generate
echo.
echo Prisma Client generated!
echo.
echo NOTE: To push schema to database, run:
echo   npx prisma db push
echo.
pause



