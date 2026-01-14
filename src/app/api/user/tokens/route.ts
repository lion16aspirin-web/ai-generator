/**
 * User Tokens API - Баланс токенів
 * GET /api/user/tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserTokens } from '@/lib/utils/tokens';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

    // Отримуємо баланс
    const tokens = await getUserTokens(userId);

    return NextResponse.json(tokens);

  } catch (error) {
    console.error('User tokens API error:', error);

    return NextResponse.json(
      { error: 'Internal Error', message: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
