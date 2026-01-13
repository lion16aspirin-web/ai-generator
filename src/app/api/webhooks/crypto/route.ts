import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// Verify NOWPayments IPN signature
function verifyNOWPaymentsSignature(payload: Record<string, unknown>, signature: string, secret: string): boolean {
  const sortedPayload = Object.keys(payload)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: payload[key] }), {});
  
  const hmac = crypto.createHmac('sha512', secret);
  const digest = hmac.update(JSON.stringify(sortedPayload)).digest('hex');
  return digest === signature;
}

// Token amounts by plan
const TOKENS_BY_PLAN: Record<string, number> = {
  'starter': 5000,
  'pro': 25000,
  'unlimited': 1000000,
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-nowpayments-sig') || '';
    const secret = process.env.NOWPAYMENTS_IPN_SECRET || '';

    // Verify signature
    if (secret && !verifyNOWPaymentsSignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('NOWPayments webhook:', payload);

    const {
      payment_status,
      order_id,
      payment_id,
    } = payload;

    // Parse order_id for user info (format: userId_planId_timestamp)
    const [userId, planId] = (order_id || '').split('_');

    if (payment_status === 'finished' && userId && planId) {
      const tokens = TOKENS_BY_PLAN[planId] || 0;

      if (tokens > 0) {
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
            type: 'CRYPTO_PURCHASE',
            metadata: {
              planId,
              paymentId: payment_id,
              provider: 'nowpayments',
            },
          },
        });

        // Create/update subscription
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: planId,
            status: 'ACTIVE',
            provider: 'crypto',
            externalId: payment_id?.toString(),
          },
          create: {
            userId,
            plan: planId,
            status: 'ACTIVE',
            provider: 'crypto',
            externalId: payment_id?.toString(),
          },
        });

        console.log(`Added ${tokens} tokens to user ${userId} via crypto payment`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Crypto webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
