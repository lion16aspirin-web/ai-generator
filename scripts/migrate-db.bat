@echo off
cd /d "%~dp0.."
set DATABASE_URL=postgresql://neondb_owner:npg_pG1IFwdnHE2x@ep-tiny-voice-agiwhxml.c-2.eu-central-1.aws.neon.tech/neondb?channel_binding=require^&sslmode=require
call npx prisma db push
pause
