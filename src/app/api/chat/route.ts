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

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatRequestBody {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
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
    const { model, messages, stream = true, temperature, maxTokens, systemPrompt } = body;

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

      return createSSEResponse(generator);
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

    // Списуємо реальну кількість токенів
    await deductTokens(userId, response.usage.platformTokens, `chat:${model}`);

    return NextResponse.json(response);

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
