/**
 * Chat History API - Отримання історії чату
 * GET /api/chat/history/[chatId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
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

    // Отримуємо чат
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Чат не знайдено' },
        { status: 404 }
      );
    }

    // Форматуємо повідомлення
    const messages = chat.messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      images: msg.images ? JSON.parse(msg.images as string) : undefined,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({
      chatId: chat.id,
      model: chat.model,
      title: chat.title,
      messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });

  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
