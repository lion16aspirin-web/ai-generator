/**
 * Animate API - Анімація фото
 * POST /api/animate
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAnimationJob } from '@/lib/ai/animation';
import { calculateAnimationCost } from '@/lib/ai/pricing';
import { deductTokens, getUserTokens } from '@/lib/utils/tokens';
import { AIError } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface AnimateRequestBody {
  model?: string;
  image: string;
  prompt?: string;
  duration?: number;
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
    const body: AnimateRequestBody = await request.json();
    const { 
      model = 'photo-animation', 
      image, 
      prompt,
      duration = 3,
    } = body;

    // Валідація
    if (!image) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Зображення не вказано' },
        { status: 400 }
      );
    }

    // Перевірка формату зображення
    if (!image.startsWith('data:image/') && !image.startsWith('http')) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Невірний формат зображення' },
        { status: 400 }
      );
    }

    if (duration < 2 || duration > 5) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Тривалість має бути від 2 до 5 секунд' },
        { status: 400 }
      );
    }

    // Розрахунок вартості
    const estimatedCost = calculateAnimationCost(model);

    // Перевірка балансу
    const userTokens = await getUserTokens(userId);
    if (userTokens.available < estimatedCost.platformTokens) {
      return NextResponse.json(
        { 
          error: 'Insufficient Tokens', 
          message: 'Недостатньо токенів',
          required: estimatedCost.platformTokens,
          available: userTokens.available,
        },
        { status: 402 }
      );
    }

    // Списуємо токени перед генерацією
    await deductTokens(userId, estimatedCost.platformTokens, `animate:${model}`);

    // Створюємо job
    const job = await createAnimationJob({
      model,
      image,
      prompt,
      duration,
    });

    return NextResponse.json({
      ...job,
      estimatedTime: 30 + duration * 10,
    });

  } catch (error) {
    console.error('Animate API error:', error);

    if (error instanceof AIError) {
      return NextResponse.json(
        { 
          error: error.code, 
          message: error.message,
          provider: error.provider,
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Error', message: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
