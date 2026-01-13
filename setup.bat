@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo    AI Generator - Setup Script
echo ========================================
echo.

echo [1/3] Creating .env file...
if not exist ".env" (
    (
        echo # Database - Neon PostgreSQL
        echo DATABASE_URL="postgresql://username:password@hostname:5432/ai_generator?sslmode=require"
        echo.
        echo # NextAuth.js
        echo NEXTAUTH_SECRET="change-this-secret-key-in-production"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo.
        echo # OAuth
        echo GOOGLE_CLIENT_ID=""
        echo GOOGLE_CLIENT_SECRET=""
        echo GITHUB_ID=""
        echo GITHUB_SECRET=""
        echo.
        echo # Payment - Lemon Squeezy
        echo LEMON_SQUEEZY_API_KEY=""
        echo LEMON_SQUEEZY_WEBHOOK_SECRET=""
        echo LEMON_SQUEEZY_STORE_ID=""
        echo.
        echo # Payment - Crypto
        echo NOWPAYMENTS_API_KEY=""
        echo NOWPAYMENTS_IPN_SECRET=""
        echo.
        echo # Telegram Bot
        echo TELEGRAM_BOT_TOKEN=""
        echo TELEGRAM_WEBHOOK_SECRET=""
        echo.
        echo # AI API Keys
        echo OPENAI_API_KEY=""
        echo ANTHROPIC_API_KEY=""
        echo GOOGLE_AI_API_KEY=""
        echo REPLICATE_API_TOKEN=""
        echo.
        echo # Cloudinary
        echo CLOUDINARY_CLOUD_NAME=""
        echo CLOUDINARY_API_KEY=""
        echo CLOUDINARY_API_SECRET=""
        echo.
        echo # Admin
        echo ADMIN_EMAIL="admin@example.com"
    ) > .env
    echo    .env created successfully!
) else (
    echo    .env already exists, skipping...
)
echo.

echo [2/3] Generating Prisma client...
call npx prisma generate
echo.

echo [3/3] Done!
echo.
echo ========================================
echo    Next steps:
echo ========================================
echo.
echo 1. Edit .env with your actual values:
echo    - DATABASE_URL from https://neon.tech
echo    - NEXTAUTH_SECRET ^(any random string^)
echo.
echo 2. Push database schema:
echo    npx prisma db push
echo.
echo 3. Run development server:
echo    npm run dev
echo.
echo ========================================
pause



