/**
 * Chats API - Список чатів користувача
 * GET /api/chats - отримати список
 * POST /api/chats - створити новий
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/chats - Список чатів
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        model: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    const formattedChats = chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      model: chat.model,
      messageCount: chat._count.messages,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }));

    return NextResponse.json({ chats: formattedChats });

  } catch (error) {
    console.error('Chats API error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Помилка отримання чатів' },
      { status: 500 }
    );
  }
}

// POST /api/chats - Створити новий чат
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const { title, model } = await request.json();

    const chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: title || 'Новий чат',
        model: model || 'gpt-4o',
      },
    });

    return NextResponse.json({ 
      chat: {
        id: chat.id,
        title: chat.title,
        model: chat.model,
        messageCount: 0,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Помилка створення чату' },
      { status: 500 }
    );
  }
}
