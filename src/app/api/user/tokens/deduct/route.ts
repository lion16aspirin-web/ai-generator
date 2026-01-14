/**
 * User Tokens Deduct API - Списання токенів
 * POST /api/user/tokens/deduct
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deductTokens, getUserTokens } from '@/lib/utils/tokens';

export const runtime = 'nodejs';

interface DeductRequestBody {
  amount: number;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Авторизація
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Парсинг body
    const body: DeductRequestBody = await request.json();
    const { amount, reason } = body;

    // Валідація
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Невірна кількість токенів' },
        { status: 400 }
      );
    }

    // Перевірка балансу
    const userTokens = await getUserTokens(userId);
    if (userTokens.available < amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient Tokens', 
          message: 'Недостатньо токенів',
          required: amount,
          available: userTokens.available,
        },
        { status: 402 }
      );
    }

    // Списання
    const success = await deductTokens(userId, amount, reason);

    if (!success) {
      return NextResponse.json(
        { error: 'Deduction Failed', message: 'Не вдалося списати токени' },
        { status: 500 }
      );
    }

    // Отримуємо оновлений баланс
    const updatedTokens = await getUserTokens(userId);

    return NextResponse.json({
      success: true,
      deducted: amount,
      ...updatedTokens,
    });

  } catch (error) {
    console.error('User tokens deduct API error:', error);

    return NextResponse.json(
      { error: 'Internal Error', message: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
