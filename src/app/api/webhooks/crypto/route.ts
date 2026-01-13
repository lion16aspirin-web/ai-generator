import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Verify NOWPayments IPN signature
function verifyNOWPaymentsSignature(payload: any, signature: string, secret: string): boolean {
  const sortedPayload = Object.keys(payload)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: payload[key] }), {});
  
  const hmac = crypto.createHmac('sha512', secret);
  const digest = hmac.update(JSON.stringify(sortedPayload)).digest('hex');
  return digest === signature;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-nowpayments-sig') || '';
    const secret = process.env.NOWPAYMENTS_IPN_SECRET || '';

    // Verify signature
    if (!verifyNOWPaymentsSignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('NOWPayments webhook:', payload);

    const {
      payment_status,
      order_id,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
    } = payload;

    // Parse order_id for user info (format: userId_planId_timestamp)
    const [userId, planId] = order_id.split('_');

    if (payment_status === 'finished' && userId && planId) {
      // Token amounts by plan
      const tokensByPlan: Record<string, number> = {
        'starter': 5000,
        'pro': 25000,
        'unlimited': 1000000,
      };

      const tokens = tokensByPlan[planId] || 0;

      // Add tokens to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokens: { increment: tokens }
        }
      });

      // Log transaction
      await prisma.token.create({
        data: {
          userId,
          amount: tokens,
          type: 'CRYPTO_PURCHASE'
        }
      });

      console.log(`Added ${tokens} tokens to user ${userId} via crypto payment`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Crypto webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
