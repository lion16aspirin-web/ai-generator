import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Verify Lemon Squeezy webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('X-Signature') || '';
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

    // Verify webhook signature
    if (!verifySignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventName = event.meta?.event_name;
    const customData = event.meta?.custom_data;

    console.log('Lemon Squeezy webhook:', eventName);

    switch (eventName) {
      case 'order_created':
        // New subscription/purchase
        const order = event.data;
        const userId = customData?.user_id;
        const planId = customData?.plan_id;
        
        if (userId && planId) {
          // Token amounts by plan
          const tokensByPlan: Record<string, number> = {
            'starter': 5000,
            'pro': 25000,
            'unlimited': 1000000, // Effectively unlimited
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
              type: 'PURCHASE'
            }
          });
        }
        break;

      case 'subscription_created':
      case 'subscription_updated':
        // Handle subscription changes
        console.log('Subscription event:', event.data);
        break;

      case 'subscription_cancelled':
        // Handle cancellation
        console.log('Subscription cancelled:', event.data);
        break;

      default:
        console.log('Unhandled event:', eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
