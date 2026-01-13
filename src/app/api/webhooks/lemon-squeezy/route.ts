import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// import { prisma } from '@/lib/prisma'; // TODO: Enable after DB setup

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
      case 'order_created':
        // New subscription/purchase
        const userId = customData?.user_id;
        const planId = customData?.plan_id;
        
        if (userId && planId) {
          // Token amounts by plan
          const tokensByPlan: Record<string, number> = {
            'starter': 5000,
            'pro': 25000,
            'unlimited': 1000000,
          };

          const tokens = tokensByPlan[planId] || 0;

          // TODO: Add tokens to user after DB setup
          console.log(`Would add ${tokens} tokens to user ${userId}`);
        }
        break;

      case 'subscription_created':
      case 'subscription_updated':
        console.log('Subscription event:', event.data);
        break;

      case 'subscription_cancelled':
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
