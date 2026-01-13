# 🚀 AI Generator - План розробки

> **Проект:** AI Generator Platform  
> **URL:** https://ai-generator-lion16aspirins-projects.vercel.app  
> **GitHub:** https://github.com/lion16aspirin-web/ai-generator  
> **Дата старту:** 13 січня 2026

---

## ✅ ФАЗА 1: MVP (Завершено)

### Інфраструктура
- [x] Next.js 15 проект
- [x] TypeScript налаштування
- [x] Tailwind CSS стилізація
- [x] GitHub репозиторій
- [x] Vercel деплой
- [x] Автоматичний CI/CD

### UI/UX
- [x] Головна сторінка (Hero, Features, Stats)
- [x] Бічне меню (Sidebar)
- [x] Хедер з пошуком та токенами
- [x] Темна тема

### Сторінки
- [x] `/` - Головна
- [x] `/chat` - AI Чат
- [x] `/images` - Генерація зображень
- [x] `/video` - Генерація відео
- [x] `/animate` - Анімація фото
- [x] `/pricing` - Тарифні плани
- [x] `/docs` - Документація
- [x] `/login` - Вхід
- [x] `/register` - Реєстрація
- [x] `/settings` - Налаштування
- [x] `/admin` - Адмін панель (API ключі)

### Локалізація
- [x] Українська мова (uk)
- [x] Англійська мова (en)
- [x] next-intl інтеграція

---

## 🔄 ФАЗА 2: База даних (В процесі)

### Neon PostgreSQL
- [ ] Створити Neon акаунт
- [ ] Отримати Connection String
- [ ] Додати DATABASE_URL в Vercel

### Prisma ORM
- [ ] Повернути @prisma/client
- [ ] Налаштувати prisma generate
- [ ] Виконати prisma db push
- [ ] Створити міграції

### Схема бази даних
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  tokens        Int       @default(100)
  accounts      Account[]
  sessions      Session[]
  generations   Generation[]
  subscription  Subscription?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model ApiKey {
  id        String   @id @default(cuid())
  service   String   // openai, anthropic, replicate...
  name      String
  key       String   // encrypted
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Generation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // chat, image, video, animate
  model     String
  prompt    String
  result    String?
  tokens    Int
  createdAt DateTime @default(now())
}

model Subscription {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  plan           String   // free, starter, pro, unlimited
  tokensPerMonth Int
  expiresAt      DateTime?
  createdAt      DateTime @default(now())
}
```

---

## 🔐 ФАЗА 3: Автентифікація

### NextAuth.js v5
- [ ] Увімкнути PrismaAdapter
- [ ] Google OAuth Provider
- [ ] GitHub OAuth Provider
- [ ] Credentials Provider (email/password)
- [ ] Session management

### Налаштування OAuth
- [ ] Google Cloud Console - створити OAuth credentials
- [ ] GitHub Settings - створити OAuth App
- [ ] Додати callback URLs в Vercel

### Захист роутів
- [ ] Middleware для захисту /admin
- [ ] Middleware для захисту /chat, /images, /video, /animate
- [ ] Редірект неавторизованих на /login

---

## 🤖 ФАЗА 4: AI Інтеграції

### Текстові моделі
- [ ] OpenAI GPT-4/GPT-5
- [ ] Anthropic Claude 3
- [ ] Google Gemini 1.5 Pro
- [ ] DeepSeek
- [ ] xAI Grok
- [ ] MoonshotAI Kimi K2

### Генерація зображень
- [ ] OpenAI DALL-E 3
- [ ] Replicate (Flux, Stable Diffusion)
- [ ] Midjourney API (якщо доступний)
- [ ] Kandinsky

### Генерація відео
- [ ] Google Veo
- [ ] OpenAI Sora 2
- [ ] Kling
- [ ] PixVerse
- [ ] Minimax
- [ ] Wan
- [ ] Runway Gen-3
- [ ] Luma Dream Machine

### Анімація фото
- [ ] Runway Gen-3
- [ ] Luma Dream Machine
- [ ] Kling

### Адмін панель
- [ ] Збереження API ключів (зашифровано)
- [ ] Тестування ключів
- [ ] Увімкнення/вимкнення сервісів

---

## 💰 ФАЗА 5: Монетизація

### Lemon Squeezy (картки)
- [ ] Створити акаунт
- [ ] Створити продукти (тарифи)
- [ ] Інтегрувати Checkout
- [ ] Налаштувати Webhook

### NOWPayments (крипто)
- [ ] Створити акаунт
- [ ] Отримати API ключі
- [ ] Інтегрувати оплату
- [ ] Налаштувати IPN Webhook

### Telegram Stars
- [ ] Створити бота через @BotFather
- [ ] Налаштувати aiogram
- [ ] Інтегрувати Telegram Payments
- [ ] Webhook для підтвердження

### Тарифні плани
| План | Токенів | Ціна |
|------|---------|------|
| Free | 100 | $0 |
| Starter | 10,000 | $9.99 |
| Pro | 100,000 | $29.99 |
| Unlimited | ∞ | $99.99 |

---

## 🔧 ФАЗА 6: Оптимізація

### Performance
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Caching strategies

### SEO
- [ ] Meta tags
- [ ] Open Graph
- [ ] Sitemap
- [ ] robots.txt

### Analytics
- [ ] Vercel Analytics
- [ ] Google Analytics (опціонально)

### Моніторинг
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring

---

## 📱 ФАЗА 7: Розширення (Майбутнє)

### Mobile App
- [ ] React Native версія
- [ ] iOS публікація
- [ ] Android публікація

### API для розробників
- [ ] REST API
- [ ] API ключі для користувачів
- [ ] Rate limiting
- [ ] Документація Swagger

### Додаткові функції
- [ ] Історія генерацій
- [ ] Галерея користувача
- [ ] Шаринг результатів
- [ ] Командна робота

---

## 📂 СТРУКТУРА ПРОЕКТУ

```
ai-generator/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Локалізовані сторінки
│   │   │   ├── admin/          # Адмін панель
│   │   │   ├── animate/        # Анімація фото
│   │   │   ├── chat/           # AI чат
│   │   │   ├── docs/           # Документація
│   │   │   ├── images/         # Генерація зображень
│   │   │   ├── login/          # Вхід
│   │   │   ├── pricing/        # Тарифи
│   │   │   ├── register/       # Реєстрація
│   │   │   ├── settings/       # Налаштування
│   │   │   ├── video/          # Генерація відео
│   │   │   ├── layout.tsx      # Головний layout
│   │   │   └── page.tsx        # Головна сторінка
│   │   ├── api/                # API routes
│   │   │   ├── admin/          # Адмін API
│   │   │   ├── animate/        # Анімація API
│   │   │   ├── auth/           # NextAuth
│   │   │   ├── chat/           # Чат API
│   │   │   ├── images/         # Зображення API
│   │   │   ├── video/          # Відео API
│   │   │   └── webhooks/       # Платіжні webhooks
│   │   └── globals.css         # Глобальні стилі
│   ├── components/
│   │   ├── layout/             # Layout компоненти
│   │   └── ui/                 # UI компоненти
│   ├── i18n/                   # Інтернаціоналізація
│   ├── lib/                    # Утиліти
│   ├── auth.ts                 # NextAuth конфігурація
│   └── middleware.ts           # Middleware
├── messages/                   # Переклади
│   ├── en.json
│   └── uk.json
├── prisma/                     # Prisma схема
├── telegram-bot/               # Telegram бот
├── public/                     # Статичні файли
└── ...config files
```

---

## 🔑 ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://ai-generator-xxx.vercel.app

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# AI APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
REPLICATE_API_TOKEN=

# Payments
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_WEBHOOK_SECRET=
NOWPAYMENTS_API_KEY=
NOWPAYMENTS_IPN_SECRET=

# Telegram
TELEGRAM_BOT_TOKEN=
```

---

## 📞 КОНТАКТИ

- **Telegram:** @your_username
- **Email:** support@example.com

---

*Останнє оновлення: 13 січня 2026*

