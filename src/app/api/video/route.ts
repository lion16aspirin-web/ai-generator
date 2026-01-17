/**
 * Video API - Генерація відео
 * POST /api/video
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createVideoJob } from '@/lib/ai/video';
import { calculateVideoCost } from '@/lib/ai/pricing';
import { deductTokens, getUserTokens, addTokens } from '@/lib/utils/tokens';
import { AIError, VideoMode, VideoResolution, TokenUsage } from '@/lib/ai/types';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 30; // Тільки створення job, не генерація

interface VideoRequestBody {
  model: string;
  prompt: string;
  mode?: VideoMode;
  duration?: number;
  resolution?: VideoResolution;
  sourceImage?: string;
  sourceVideo?: string;
}

export async function POST(request: NextRequest) {
  // Змінні для використання в catch блоці
  let userId: string | undefined;
  let model: string | undefined;
  let estimatedCost: ReturnType<typeof calculateVideoCost> | null = null;
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
    let body: VideoRequestBody;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Video API: Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Bad Request', message: 'Невірний формат запиту' },
        { status: 400 }
      );
    }

    // Деструктуризація (використовуємо окремі змінні щоб уникнути конфлікту з глобальною функцією prompt)
    model = body.model;
    const prompt = body.prompt;
    const mode = body.mode || 'text-to-video';
    const duration = body.duration || 5;
    const resolution = body.resolution || '1080p';
    const sourceImage = body.sourceImage;
    const sourceVideo = body.sourceVideo;

    console.log('Video API Request:', { model, prompt: prompt?.substring(0, 50), mode, duration, resolution });

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

    if (duration < 2 || duration > 60) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Тривалість має бути від 2 до 60 секунд' },
        { status: 400 }
      );
    }

    // Перевірка чи модель існує
    try {
      estimatedCost = calculateVideoCost(model, duration);
      
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
      const deducted = await deductTokens(userId, estimatedCost.platformTokens, `video:${model}`);
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

      // Створюємо job
      const job = await createVideoJob({
        model,
        prompt,
        mode,
        duration,
        resolution,
        sourceImage,
        sourceVideo,
      });

      // Зберігаємо job в БД
      try {
        await prisma.generation.create({
          data: {
            userId,
            type: 'VIDEO',
            model,
            prompt,
            result: JSON.stringify({ jobId: job.id, status: job.status }),
            tokens: estimatedCost.platformTokens,
            status: job.status === 'completed' ? 'COMPLETED' : 'PROCESSING',
          },
        });
      } catch (dbError) {
        console.error('Failed to save video generation to DB:', dbError);
        // Не блокуємо відповідь, якщо не вдалося зберегти в БД
      }

      return NextResponse.json({
        ...job,
        provider: getProviderFromModel(model),
        estimatedTime: getEstimatedTime(model, duration),
      });
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
    console.error('Video API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Повертаємо токени при помилці генерації (якщо вони були списані)
    if (tokensDeducted && estimatedCost !== null && userId && model) {
      try {
        // Type assertion - estimatedCost не може бути null тут
        const cost = estimatedCost as TokenUsage;
        await addTokens(userId, cost.platformTokens, `refund:video:${model}:error`);
        console.log(`Refunded ${cost.platformTokens} tokens to user ${userId} due to generation error`);
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
    console.error('Unexpected error in Video API:', errorMessage);

    return NextResponse.json(
      { 
        error: 'Internal Error', 
        message: errorMessage || 'Внутрішня помилка сервера',
      },
      { status: 500 }
    );
  }
}

function getProviderFromModel(modelId: string): string {
  if (modelId.includes('sora')) return 'openai';
  if (modelId.includes('veo')) return 'google';
  return 'replicate';
}

function getEstimatedTime(modelId: string, duration: number): number {
  const base: Record<string, number> = {
    'sora-2': 180,
    'sora-2-pro': 240,
    'veo-3.1': 120,
    'veo-3.1-flash': 60,
    'kling-2.1-pro': 45,
    'pixverse-v4': 60,
    'minimax-hailuo': 90,
    'wan-2.0': 30,
  };
  return Math.ceil((base[modelId] || 60) * (duration / 5));
}
