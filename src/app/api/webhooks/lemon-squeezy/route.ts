import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// Verify Lemon Squeezy webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

// Token amounts by plan
const TOKENS_BY_PLAN: Record<string, number> = {
  'starter': 5000,
  'pro': 25000,
  'unlimited': 1000000,
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('X-Signature') || '';
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

    // Verify webhook signature (skip if no secret configured)
    if (secret && !verifySignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventName = event.meta?.event_name;
    const customData = event.meta?.custom_data;

    console.log('Lemon Squeezy webhook:', eventName);

    switch (eventName) {
      case 'order_created': {
        const userId = customData?.user_id;
        const planId = customData?.plan_id;
        
        if (userId && planId) {
          const tokens = TOKENS_BY_PLAN[planId] || 0;

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
              type: 'PURCHASE',
              metadata: {
                planId,
                orderId: event.data?.id,
                provider: 'lemon_squeezy',
              },
            },
          });

          // Create/update subscription
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: planId,
              status: 'ACTIVE',
              provider: 'lemon_squeezy',
              externalId: event.data?.id?.toString(),
              currentPeriodEnd: event.data?.attributes?.renews_at 
                ? new Date(event.data.attributes.renews_at) 
                : null,
            },
            create: {
              userId,
              plan: planId,
              status: 'ACTIVE',
              provider: 'lemon_squeezy',
              externalId: event.data?.id?.toString(),
              currentPeriodEnd: event.data?.attributes?.renews_at 
                ? new Date(event.data.attributes.renews_at) 
                : null,
            },
          });

          console.log(`Added ${tokens} tokens to user ${userId}`);
        }
        break;
      }

      case 'subscription_updated': {
        const userId = customData?.user_id;
        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: event.data?.attributes?.status === 'active' ? 'ACTIVE' : 'CANCELLED',
              currentPeriodEnd: event.data?.attributes?.renews_at 
                ? new Date(event.data.attributes.renews_at) 
                : null,
            },
          });
        }
        break;
      }

      case 'subscription_cancelled': {
        const userId = customData?.user_id;
        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: 'CANCELLED',
            },
          });
        }
        break;
      }

      default:
        console.log('Unhandled event:', eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
