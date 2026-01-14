/**
 * Images API - Генерація зображень
 * POST /api/images
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateImage } from '@/lib/ai/image';
import { calculateImageCost } from '@/lib/ai/pricing';
import { deductTokens, getUserTokens } from '@/lib/utils/tokens';
import { AIError, ImageSize } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 хвилини для генерації

interface ImageRequestBody {
  model: string;
  prompt: string;
  negativePrompt?: string;
  size?: ImageSize;
  style?: string;
  n?: number;
  quality?: 'standard' | 'hd';
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
    const body: ImageRequestBody = await request.json();
    const { model, prompt, negativePrompt, size, style, n = 1, quality = 'standard' } = body;

    // Валідація
    if (!model) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Модель не вказана' },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Промпт не вказано' },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Промпт занадто довгий (макс. 4000 символів)' },
        { status: 400 }
      );
    }

    // Розрахунок вартості
    const estimatedCost = calculateImageCost(model, n, quality === 'hd');

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
    await deductTokens(userId, estimatedCost.platformTokens, `image:${model}`);

    // Генерація
    const response = await generateImage({
      model,
      prompt,
      negativePrompt,
      size,
      style,
      n,
      quality,
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Images API error:', error);

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
