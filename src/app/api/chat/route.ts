/**
 * Chat API - Чат з AI моделями
 * POST /api/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateText, generateTextStream } from '@/lib/ai/text';
import { createSSEResponse } from '@/lib/ai/text/stream';
import { calculateTextCost, estimateTextCost } from '@/lib/ai/pricing';
import { deductTokens, getUserTokens } from '@/lib/utils/tokens';
import { ChatMessage, AIError } from '@/lib/ai/types';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatRequestBody {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  chatId?: string; // ID існуючого чату або undefined для нового
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
    const body: ChatRequestBody = await request.json();
    const { model, messages, stream = true, temperature, maxTokens, systemPrompt, chatId } = body;

    // Отримуємо або створюємо чат
    let chat = chatId 
      ? await prisma.chat.findFirst({
          where: { id: chatId, userId },
        })
      : null;

    if (!chat) {
      // Створюємо новий чат
      const firstMessage = messages.find(m => m.role === 'user');
      chat = await prisma.chat.create({
        data: {
          userId,
          model,
          title: firstMessage?.content.substring(0, 50) || 'Новий чат',
        },
      });
    } else {
      // Оновлюємо модель чату якщо змінилася
      if (chat.model !== model) {
        await prisma.chat.update({
          where: { id: chat.id },
          data: { model },
        });
      }
    }

    // Валідація
    if (!model) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Модель не вказана' },
        { status: 400 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Повідомлення відсутні' },
        { status: 400 }
      );
    }

    // Оцінка вартості
    const lastMessage = messages[messages.length - 1];
    const inputLength = messages.reduce((acc, m) => acc + m.content.length, 0);
    const estimatedCost = estimateTextCost(model, inputLength);

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

    // Зберігаємо повідомлення користувача (lastMessage вже визначено вище)
    if (lastMessage.role === 'user') {
      await prisma.message.create({
        data: {
          chatId: chat.id,
          role: 'user',
          content: lastMessage.content,
          images: lastMessage.images ? JSON.stringify(lastMessage.images) : null,
        },
      });
    }

    // Streaming response
    if (stream) {
      const generator = generateTextStream({
        model,
        messages,
        stream: true,
        temperature,
        maxTokens,
        systemPrompt,
      });

      // Списуємо токени (оцінка)
      await deductTokens(userId, estimatedCost.platformTokens, `chat:${model}`);

      // Обгортаємо generator для збереження відповіді
      return createSSEResponse(saveStreamingResponse(generator, chat.id, model, estimatedCost.platformTokens));
    }

    // Regular response
    const response = await generateText({
      model,
      messages,
      stream: false,
      temperature,
      maxTokens,
      systemPrompt,
    });

    // Зберігаємо відповідь асистента
    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: response.content,
        model,
        tokens: response.usage.totalTokens,
      },
    });

    // Списуємо реальну кількість токенів
    await deductTokens(userId, response.usage.platformTokens, `chat:${model}`);

    return NextResponse.json({ ...response, chatId: chat.id });

  } catch (error) {
    console.error('Chat API error:', error);

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

/**
 * Збереження streaming відповіді
 */
async function* saveStreamingResponse(
  generator: AsyncGenerator<{ content: string; done: boolean }>,
  chatId: string,
  model: string,
  estimatedTokens: number
): AsyncGenerator<{ content: string; done: boolean }> {
  let fullContent = '';
  
  for await (const chunk of generator) {
    if (!chunk.done) {
      fullContent += chunk.content;
    }
    yield chunk;
  }

  // Зберігаємо повну відповідь після завершення
  if (fullContent) {
    try {
      await prisma.message.create({
        data: {
          chatId,
          role: 'assistant',
          content: fullContent,
          model,
          tokens: estimatedTokens,
        },
      });
    } catch (error) {
      // Не блокуємо відповідь якщо збереження не вдалося
      console.error('Failed to save streaming message:', error);
    }
  }
}
