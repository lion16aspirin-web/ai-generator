@echo off
cd /d "E:\проекти\ai-generator"

echo Creating .env file...

(
echo # Database - Neon PostgreSQL ^(https://neon.tech^)
echo DATABASE_URL="postgresql://username:password@hostname:5432/ai_generator?sslmode=require"
echo.
echo # NextAuth.js
echo NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
echo NEXTAUTH_URL="http://localhost:3000"
echo.
echo # OAuth Providers
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

echo .env file created successfully!
echo.
echo Please edit the .env file with your actual values.
pause



