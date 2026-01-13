# AI Generator Platform

🚀 AI-powered platform for text, image, video generation and photo animation.

> **Version:** 1.0.0 | **Last Updated:** January 13, 2026

## Features

- 💬 **AI Chat** - GPT-5, Claude 4.5, Gemini 3.0, DeepSeek, Grok and more
- 🖼️ **Image Generation** - DALL-E 3, Midjourney, Stable Diffusion, Imagen 3
- 🎬 **Video Generation** - Sora, Kling, Runway, Luma, PixVerse, Minimax
- ✨ **Photo Animation** - Bring your photos to life with AI
- 💳 **Flexible Payments** - Lemon Squeezy, Crypto (USDT), Telegram Stars
- 🌍 **Multilingual** - Ukrainian and English support
- 🔐 **Admin Panel** - Manage API keys dynamically

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **i18n**: next-intl
- **Hosting**: Vercel

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-generator.git
cd ai-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create `.env` file with:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Payments
LEMON_SQUEEZY_API_KEY=""
LEMON_SQUEEZY_WEBHOOK_SECRET=""
NOWPAYMENTS_API_KEY=""
TELEGRAM_BOT_TOKEN=""

# API Key Encryption (32 bytes)
API_KEY_ENCRYPTION_KEY="your-32-byte-encryption-key-here"
```

### 4. Setup database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Vercel

Make sure to set all environment variables in Vercel dashboard:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel deployment URL

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # i18n pages
│   │   ├── admin/         # Admin panel
│   │   ├── animate/       # Photo animation
│   │   ├── chat/          # AI Chat
│   │   ├── images/        # Image generation
│   │   ├── video/         # Video generation
│   │   └── ...
│   └── api/               # API routes
├── components/
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── i18n/                  # Internationalization
├── lib/                   # Utilities
└── messages/              # Translation files
```

## License

MIT
