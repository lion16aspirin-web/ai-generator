/**
 * Images API - Генерація зображень
 * POST /api/images
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateImage } from '@/lib/ai/image';
import { calculateImageCost } from '@/lib/ai/pricing';
import { deductTokens, getUserTokens, addTokens } from '@/lib/utils/tokens';
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
  // Змінні для використання в catch блоці
  let userId: string | undefined;
  let model: string | undefined;
  let estimatedCost: ReturnType<typeof calculateImageCost> | null = null;
  let tokensDeducted = false;

  try {
    // Авторизація
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    userId = session.user.id;

    // Парсинг body
    let body: ImageRequestBody;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Images API: Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Bad Request', message: 'Невірний формат запиту' },
        { status: 400 }
      );
    }

    ({ model, prompt, negativePrompt, size, style, n = 1, quality = 'standard' } = body);

    console.log('Images API Request:', { model, prompt: prompt?.substring(0, 50), size, style, n, quality });

    // Валідація
    if (!model) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Модель не вказана' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
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

    // Перевірка чи модель існує та розрахунок вартості
    
    try {
      estimatedCost = calculateImageCost(model, n, quality === 'hd');

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
      const deducted = await deductTokens(userId, estimatedCost.platformTokens, `image:${model}`);
      if (!deducted) {
        return NextResponse.json(
          { 
            error: 'Insufficient Tokens', 
            message: 'Недостатньо токенів для генерації',
          },
          { status: 402 }
        );
      }
      tokensDeducted = true;

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
    } catch (costError) {
      // Якщо помилка в розрахунку вартості (модель не знайдена)
      if (costError instanceof Error && costError.message.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Bad Request', 
            message: `Модель ${model} не знайдена або недоступна`,
          },
          { status: 400 }
        );
      }
      throw costError; // Інші помилки прокидаємо далі
    }

  } catch (error) {
    console.error('Images API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Повертаємо токени при помилці генерації (якщо вони були списані)
    if (tokensDeducted && estimatedCost && userId && model) {
      try {
        await addTokens(userId, estimatedCost.platformTokens, `refund:image:${model}:error`);
        console.log(`Refunded ${estimatedCost.platformTokens} tokens to user ${userId} due to generation error`);
      } catch (refundError) {
        console.error('Failed to refund tokens:', refundError);
        // Логуємо помилку, але продовжуємо обробку основної помилки
      }
    }

    if (error instanceof AIError) {
      // Маппінг кодів помилок на HTTP статуси
      let httpStatus: number;
      
      // Якщо провайдер повернув статус - використовуємо його
      if (error.statusCode) {
        httpStatus = error.statusCode;
      } else {
        // Інакше маппимо код помилки на HTTP статус
        switch (error.code) {
          case 'UNAUTHORIZED':
            httpStatus = 401;
            break;
          case 'INSUFFICIENT_TOKENS':
            httpStatus = 402;
            break;
          case 'INVALID_REQUEST':
          case 'INVALID_STYLE':
            httpStatus = 400;
            break;
          case 'RATE_LIMITED':
            httpStatus = 429;
            break;
          case 'CONTENT_FILTERED':
            httpStatus = 422;
            break;
          case 'MODEL_UNAVAILABLE':
            httpStatus = 503;
            break;
          case 'TIMEOUT':
            httpStatus = 504;
            break;
          case 'PROVIDER_ERROR':
            httpStatus = 502; // Bad Gateway для помилок провайдера
            break;
          default:
            httpStatus = 500;
        }
      }

      // Детальне логування для діагностики
      console.error('AIError details:', {
        code: error.code,
        message: error.message,
        provider: error.provider,
        statusCode: error.statusCode,
        mappedHttpStatus: httpStatus,
      });

      return NextResponse.json(
        { 
          error: error.code, 
          message: error.message,
          provider: error.provider,
        },
        { status: httpStatus }
      );
    }

    // Неочікувані помилки
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    console.error('Unexpected error in Images API:', errorMessage);

    return NextResponse.json(
      { 
        error: 'Internal Error', 
        message: errorMessage || 'Внутрішня помилка сервера',
      },
      { status: 500 }
    );
  }
}
