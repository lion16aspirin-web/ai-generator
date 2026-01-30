# Debuglist

## Непрацююче / недороблене (з коду)
- Реєстрація користувача: `register` сторінка має заглушку в `handleSubmit` і не викликає реальний API/створення користувача. 【F:src/app/[locale]/register/page.tsx†L22-L42】
- Облік використаних токенів: поле `used` завжди 0, трекінг фактичного використання не реалізований. 【F:src/lib/utils/tokens.ts†L15-L30】
- Лог транзакцій токенів: у `deductTokens` є TODO для логування транзакцій (зараз лише `console.log`). 【F:src/lib/utils/tokens.ts†L42-L69】
- Скасування відео: при cancel немає повернення частини токенів (TODO). 【F:src/app/api/video/cancel/[id]/route.ts†L46-L55】
- Адмін‑перевірка: в `GET /api/admin/models/status` немає реальної перевірки ролі адміна (TODO). 【F:src/app/api/admin/models/status/route.ts†L155-L178】

## Непрацююче / недороблене (за ROADMAP)
- Реєстрація: валідація полів, перевірка email та email‑підтвердження — не реалізовано. 【F:ROADMAP.md†L63-L72】
- AI інтеграції (images/video/animation): більшість провайдерів позначені як pending (DALL‑E, Replicate, Ideogram, Recraft, Sora, Veo, Kling, PixVerse тощо). 【F:ROADMAP.md†L135-L168】
- Монетизація: Lemon Squeezy, NOWPayments, Telegram Stars — не інтегровано. 【F:ROADMAP.md†L200-L243】
- UI для генерації: завантаження результатів — не реалізовано. 【F:ROADMAP.md†L172-L179】
