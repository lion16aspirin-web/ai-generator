import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Token amounts by plan (Telegram Stars pricing)
const TOKENS_BY_PLAN: Record<string, number> = {
  'starter': 5000,    // 50 Stars
  'pro': 25000,       // 200 Stars
  'unlimited': 1000000 // 500 Stars
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log('Telegram webhook:', JSON.stringify(payload, null, 2));

    // Handle pre_checkout_query
    if (payload.pre_checkout_query) {
      const query = payload.pre_checkout_query;
      
      // Confirm the payment can proceed
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: query.id,
          ok: true
        })
      });

      return NextResponse.json({ ok: true });
    }

    // Handle successful payment
    if (payload.message?.successful_payment) {
      const payment = payload.message.successful_payment;
      const telegramUserId = payload.message.from.id;
      
      // Parse invoice payload (format: planId_userId)
      const [planId, userId] = (payment.invoice_payload || '').split('_');
      
      const tokens = TOKENS_BY_PLAN[planId] || 0;

      if (userId && tokens > 0) {
        // Add tokens to user
        await prisma.user.update({
          where: { id: userId },
          data: {
            tokens: { increment: tokens },
          },
        });

        // Log token purchase
        await prisma.token.create({
          data: {
            userId,
            amount: tokens,
            type: 'TELEGRAM_STARS',
            metadata: {
              planId,
              telegramUserId,
              totalAmount: payment.total_amount,
              currency: payment.currency,
            },
          },
        });

        // Create/update subscription
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: planId,
            status: 'ACTIVE',
            provider: 'telegram_stars',
          },
          create: {
            userId,
            plan: planId,
            status: 'ACTIVE',
            provider: 'telegram_stars',
          },
        });

        console.log(`Added ${tokens} tokens to user ${userId} via Telegram Stars`);

        // Send confirmation to user
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramUserId,
            text: `✅ Дякуємо за покупку! Вам нараховано ${tokens.toLocaleString()} токенів.\n\nThank you for your purchase! You've received ${tokens.toLocaleString()} tokens.`,
            parse_mode: 'HTML'
          })
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
