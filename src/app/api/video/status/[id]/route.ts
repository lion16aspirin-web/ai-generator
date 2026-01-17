/**
 * Video Status API - Перевірка статусу генерації
 * GET /api/video/status/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkVideoJob } from '@/lib/ai/video';
import { AIError } from '@/lib/ai/types';
import { prisma } from '@/lib/prisma';

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

    // Оновлюємо статус в БД якщо є запис
    try {
      const jobIdStr = id;
      // Шукаємо записи VIDEO для користувача та фільтруємо по jobId в result
      const recentGenerations = await prisma.generation.findMany({
        where: {
          userId: session.user.id,
          type: 'VIDEO',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Останні 7 днів
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Останні 50 записів
      });

      // Знаходимо запис з відповідним jobId
      const generation = recentGenerations.find(gen => {
        if (!gen.result) return false;
        try {
          const result = JSON.parse(gen.result);
          return result.jobId === jobIdStr;
        } catch {
          return false;
        }
      });

      if (generation) {
        // Маппінг статусів
        const dbStatus = job.status === 'completed' ? 'COMPLETED' 
          : job.status === 'failed' ? 'FAILED'
          : job.status === 'processing' ? 'PROCESSING'
          : 'PENDING';

        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: dbStatus,
            result: JSON.stringify({ 
              jobId: job.id, 
              status: job.status,
              ...(job.result && { result: job.result }),
            }),
          },
        });
      }
    } catch (dbError) {
      console.error('Failed to update video generation status in DB:', dbError);
      // Не блокуємо відповідь
    }

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
