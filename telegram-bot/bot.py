"""
Telegram Bot for AI Generator - Telegram Stars Payment

This bot handles payments via Telegram Stars (XTR currency).
Run separately from the main Next.js app.

Requirements:
    pip install aiogram aiohttp python-dotenv
"""

import os
import asyncio
import aiohttp
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import (
    LabeledPrice,
    PreCheckoutQuery,
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)
from aiogram.enums import ParseMode

load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN not set")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Plans with prices in Telegram Stars
PLANS = {
    "trial": {
        "name_uk": "🎁 Пробний",
        "name_en": "🎁 Trial",
        "description_uk": "50,000 токенів на місяць",
        "description_en": "50,000 tokens per month",
        "stars": 50,  # ~$0.99
        "tokens": 50000,
    },
    "standard": {
        "name_uk": "⭐ Стандартний",
        "name_en": "⭐ Standard",
        "description_uk": "150,000 токенів на місяць",
        "description_en": "150,000 tokens per month",
        "stars": 100,  # ~$1.99
        "tokens": 150000,
    },
    "optimal": {
        "name_uk": "🌟 Оптимальний",
        "name_en": "🌟 Optimal",
        "description_uk": "500,000 токенів на місяць",
        "description_en": "500,000 tokens per month",
        "stars": 250,  # ~$4.99
        "tokens": 500000,
    },
    "extended": {
        "name_uk": "💫 Розширений",
        "name_en": "💫 Extended",
        "description_uk": "1,500,000 токенів на місяць",
        "description_en": "1,500,000 tokens per month",
        "stars": 500,  # ~$9.99
        "tokens": 1500000,
    },
}


@dp.message(Command("start"))
async def cmd_start(message: Message):
    """Welcome message"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Перейти на сайт", url=APP_URL)],
            [InlineKeyboardButton(text="💳 Купити токени", callback_data="buy_tokens")],
            [InlineKeyboardButton(text="📊 Мій баланс", callback_data="check_balance")],
        ]
    )
    
    await message.answer(
        "👋 Ласкаво просимо до **AI Generator**!\n\n"
        "🤖 ChatGPT, Claude, Gemini та інші нейромережі в одному місці.\n\n"
        "Що ви хочете зробити?",
        reply_markup=keyboard,
        parse_mode=ParseMode.MARKDOWN,
    )


@dp.callback_query(F.data == "buy_tokens")
async def show_plans(callback: types.CallbackQuery):
    """Show available plans"""
    buttons = []
    for plan_id, plan in PLANS.items():
        buttons.append([
            InlineKeyboardButton(
                text=f"{plan['name_uk']} - {plan['stars']} ⭐",
                callback_data=f"plan_{plan_id}",
            )
        ])
    
    buttons.append([InlineKeyboardButton(text="« Назад", callback_data="back_to_start")])
    
    await callback.message.edit_text(
        "💳 **Оберіть тарифний план:**\n\n"
        "Оплата здійснюється через Telegram Stars ⭐\n"
        "Токени будуть зараховані миттєво!\n\n"
        f"🎁 Пробний: 50,000 токенів - 50 ⭐\n"
        f"⭐ Стандартний: 150,000 токенів - 100 ⭐\n"
        f"🌟 Оптимальний: 500,000 токенів - 250 ⭐\n"
        f"💫 Розширений: 1,500,000 токенів - 500 ⭐",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons),
        parse_mode=ParseMode.MARKDOWN,
    )
    await callback.answer()


@dp.callback_query(F.data.startswith("plan_"))
async def process_plan_selection(callback: types.CallbackQuery):
    """Process plan selection and send invoice"""
    plan_id = callback.data.replace("plan_", "")
    plan = PLANS.get(plan_id)
    
    if not plan:
        await callback.answer("План не знайдено", show_alert=True)
        return
    
    # Create invoice with Telegram Stars (XTR)
    prices = [LabeledPrice(label=plan["name_uk"], amount=plan["stars"])]
    
    await bot.send_invoice(
        chat_id=callback.from_user.id,
        title=plan["name_uk"],
        description=plan["description_uk"],
        payload=f"{plan_id}|{callback.from_user.id}",
        provider_token="",  # Empty for Telegram Stars
        currency="XTR",  # Telegram Stars currency
        prices=prices,
        start_parameter=f"plan_{plan_id}",
    )
    
    await callback.answer()


@dp.pre_checkout_query()
async def process_pre_checkout(pre_checkout: PreCheckoutQuery):
    """Approve payment before checkout"""
    # Here you can add additional validation
    await bot.answer_pre_checkout_query(pre_checkout.id, ok=True)


@dp.message(F.successful_payment)
async def process_successful_payment(message: Message):
    """Handle successful payment"""
    payment = message.successful_payment
    
    # Parse payload
    payload_parts = payment.invoice_payload.split("|")
    plan_id = payload_parts[0]
    user_id = payload_parts[1] if len(payload_parts) > 1 else str(message.from_user.id)
    
    plan = PLANS.get(plan_id)
    if not plan:
        await message.answer("❌ Помилка: невідомий план")
        return
    
    tokens = plan["tokens"]
    stars = payment.total_amount
    
    # Notify backend API about successful payment
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{APP_URL}/api/webhooks/telegram-stars",
                json={
                    "telegram_user_id": message.from_user.id,
                    "telegram_username": message.from_user.username,
                    "plan_id": plan_id,
                    "tokens": tokens,
                    "stars_paid": stars,
                    "telegram_payment_charge_id": payment.telegram_payment_charge_id,
                    "provider_payment_charge_id": payment.provider_payment_charge_id,
                },
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    await message.answer(
                        f"✅ **Оплата успішна!**\n\n"
                        f"💰 Зараховано: **{tokens:,}** токенів\n"
                        f"⭐ Сплачено: **{stars}** Telegram Stars\n\n"
                        f"🚀 Тепер ви можете користуватися всіма можливостями AI Generator!\n\n"
                        f"[Перейти на сайт]({APP_URL})",
                        parse_mode=ParseMode.MARKDOWN,
                    )
                else:
                    # Payment received but backend error - refund may be needed
                    await message.answer(
                        f"⚠️ Оплата отримана, але виникла помилка при зарахуванні токенів.\n"
                        f"Зв'яжіться з підтримкою: {payment.telegram_payment_charge_id}",
                    )
    except Exception as e:
        print(f"Error notifying backend: {e}")
        await message.answer(
            f"✅ Оплата успішна!\n"
            f"⚠️ Токени будуть зараховані протягом кількох хвилин.\n"
            f"ID транзакції: {payment.telegram_payment_charge_id}",
        )


@dp.callback_query(F.data == "check_balance")
async def check_balance(callback: types.CallbackQuery):
    """Check user balance via API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{APP_URL}/api/user/balance",
                params={"telegram_id": callback.from_user.id},
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    tokens = data.get("tokens", 0)
                    await callback.message.edit_text(
                        f"📊 **Ваш баланс**\n\n"
                        f"💰 Токенів: **{tokens:,}**\n\n"
                        f"[Перейти на сайт]({APP_URL})",
                        reply_markup=InlineKeyboardMarkup(
                            inline_keyboard=[
                                [InlineKeyboardButton(text="💳 Поповнити", callback_data="buy_tokens")],
                                [InlineKeyboardButton(text="« Назад", callback_data="back_to_start")],
                            ]
                        ),
                        parse_mode=ParseMode.MARKDOWN,
                    )
                else:
                    await callback.answer(
                        "Акаунт не знайдено. Спочатку зареєструйтесь на сайті.",
                        show_alert=True,
                    )
    except Exception as e:
        print(f"Error checking balance: {e}")
        await callback.answer("Помилка при перевірці балансу", show_alert=True)


@dp.callback_query(F.data == "back_to_start")
async def back_to_start(callback: types.CallbackQuery):
    """Return to start menu"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Перейти на сайт", url=APP_URL)],
            [InlineKeyboardButton(text="💳 Купити токени", callback_data="buy_tokens")],
            [InlineKeyboardButton(text="📊 Мій баланс", callback_data="check_balance")],
        ]
    )
    
    await callback.message.edit_text(
        "👋 Ласкаво просимо до **AI Generator**!\n\n"
        "🤖 ChatGPT, Claude, Gemini та інші нейромережі в одному місці.\n\n"
        "Що ви хочете зробити?",
        reply_markup=keyboard,
        parse_mode=ParseMode.MARKDOWN,
    )
    await callback.answer()


async def main():
    """Run bot"""
    print("🤖 Bot is starting...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())


