/**
 * Chat Export API - Експорт чату
 * GET /api/chats/[id]/export?format=md|json
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/chats/[id]/export - Експорт чату
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
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'md';

    const chat = await prisma.chat.findFirst({
      where: { id, userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
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

    if (format === 'json') {
      return NextResponse.json({
        title: chat.title,
        model: chat.model,
        createdAt: chat.createdAt.toISOString(),
        messages: chat.messages.map(m => ({
          role: m.role,
          content: m.content,
          model: m.model,
          timestamp: m.createdAt.toISOString(),
        }))
      });
    }

    // Markdown format
    const markdown = formatAsMarkdown(chat);
    
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(chat.title)}.md"`,
      }
    });

  } catch (error) {
    console.error('Export chat error:', error);
    return NextResponse.json(
      { error: 'Internal Error', message: 'Помилка експорту чату' },
      { status: 500 }
    );
  }
}

/**
 * Форматування чату як Markdown
 */
function formatAsMarkdown(chat: {
  title: string;
  model: string;
  createdAt: Date;
  messages: Array<{
    role: string;
    content: string;
    model: string | null;
    createdAt: Date;
  }>;
}): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`# ${chat.title}`);
  lines.push('');
  lines.push(`**Модель:** ${chat.model}`);
  lines.push(`**Дата створення:** ${chat.createdAt.toLocaleDateString('uk-UA')}`);
  lines.push(`**Кількість повідомлень:** ${chat.messages.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Messages
  for (const msg of chat.messages) {
    const roleLabel = msg.role === 'user' ? '👤 **Користувач**' : '🤖 **Асистент**';
    const timestamp = msg.createdAt.toLocaleString('uk-UA');
    
    lines.push(`### ${roleLabel}`);
    lines.push(`*${timestamp}*`);
    lines.push('');
    lines.push(msg.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Очищення імені файлу
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}
