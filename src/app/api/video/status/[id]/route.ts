/**
 * Video Status API - Перевірка статусу генерації
 * GET /api/video/status/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkVideoJob } from '@/lib/ai/video';
import { AIError } from '@/lib/ai/types';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Авторизація
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'ID не вказано' },
        { status: 400 }
      );
    }

    // Отримуємо provider з query параметрів
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'replicate';

    // Перевіряємо статус
    const job = await checkVideoJob(id, provider);

    return NextResponse.json(job);

  } catch (error) {
    console.error('Video status API error:', error);

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
