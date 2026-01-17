/**
 * Video API - Генерація відео
 * POST /api/video
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createVideoJob } from '@/lib/ai/video';
import { calculateVideoCost } from '@/lib/ai/pricing';
import { deductTokens, getUserTokens } from '@/lib/utils/tokens';
import { AIError, VideoMode, VideoResolution } from '@/lib/ai/types';

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

    const { 
      model, 
      prompt, 
      mode = 'text-to-video', 
      duration = 5, 
      resolution = '1080p',
      sourceImage,
      sourceVideo,
    } = body;

    console.log('Video API Request:', { model, prompt: prompt?.substring(0, 50), mode, duration, resolution });

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

    if (duration < 2 || duration > 60) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Тривалість має бути від 2 до 60 секунд' },
        { status: 400 }
      );
    }

    // Перевірка чи модель існує
    try {
      const estimatedCost = calculateVideoCost(model, duration);
      
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
      await deductTokens(userId, estimatedCost.platformTokens, `video:${model}`);

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
