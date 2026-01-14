/**
 * Update Chat Model API - Оновлення моделі чату
 * PATCH /api/chat/[chatId]/model
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    
    // Авторизація
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { model } = body;

    if (!model) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Модель не вказана' },
        { status: 400 }
      );
    }

    // Оновлюємо модель чату
    const chat = await prisma.chat.updateMany({
      where: { id: chatId, userId },
      data: { model },
    });

    if (chat.count === 0) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Чат не знайдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, model });

  } catch (error) {
    console.error('Update chat model error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
