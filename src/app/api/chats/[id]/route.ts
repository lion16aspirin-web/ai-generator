/**
 * Chat API - Операції з окремим чатом
 * GET /api/chats/[id] - отримати чат
 * PATCH /api/chats/[id] - перейменувати
 * DELETE /api/chats/[id] - видалити
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/chats/[id] - Отримати чат
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const chat = await prisma.chat.findFirst({
      where: { id, userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            model: true,
            createdAt: true,
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Чат не знайдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });

  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Помилка отримання чату' },
      { status: 500 }
    );
  }
}

// PATCH /api/chats/[id] - Перейменувати чат
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Назва не може бути порожньою' },
        { status: 400 }
      );
    }

    // Перевіряємо чи чат належить користувачу
    const existingChat = await prisma.chat.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Чат не знайдено' },
        { status: 404 }
      );
    }

    const chat = await prisma.chat.update({
      where: { id },
      data: { title: title.trim() }
    });

    return NextResponse.json({ 
      chat: {
        id: chat.id,
        title: chat.title,
      }
    });

  } catch (error) {
    console.error('Rename chat error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Помилка перейменування чату' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[id] - Видалити чат
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Потрібна авторизація' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Перевіряємо чи чат належить користувачу
    const existingChat = await prisma.chat.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Чат не знайдено' },
        { status: 404 }
      );
    }

    // Видаляємо чат (повідомлення видаляться каскадно)
    await prisma.chat.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Помилка видалення чату' },
      { status: 500 }
    );
  }
}
