/**
 * Animation Cancel API - Скасування анімації
 * POST /api/animate/cancel/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AIError } from '@/lib/ai/types';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Скасування через Replicate API
    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (apiKey) {
      await fetch(`https://api.replicate.com/v1/predictions/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${apiKey}` },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Анімацію скасовано',
      id,
    });

  } catch (error) {
    console.error('Animation cancel API error:', error);

    if (error instanceof AIError) {
      return NextResponse.json(
        { 
          error: error.code, 
          message: error.message,
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
