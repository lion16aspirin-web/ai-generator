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
import { WEB_SEARCH_TOOL } from '@/lib/ai/tools/web-search';
import { getApiKey } from '@/lib/api-keys';
import crypto from 'crypto';

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
  enableWebSearch?: boolean; // Увімкнути веб-пошук
}

// Дефолтний системний промпт для якісних відповідей
const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant.

CRITICAL RULE: Always respond in the SAME LANGUAGE the user writes in.
- If user writes in Ukrainian → respond in Ukrainian
- If user writes in English → respond in English  
- If user writes in Russian → respond in Russian
- And so on for any language

Other rules:
- Be specific and helpful
- For code questions - provide working examples
- Structure long responses (lists, headers)
- If you don't know - say honestly
- Be friendly but professional`;

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
    const { model, messages, stream = true, temperature, maxTokens, systemPrompt, chatId, enableWebSearch = true } = body;

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
          images: lastMessage.images ? JSON.stringify(lastMessage.images) : undefined,
        },
      });
    }

    // Використовуємо дефолтний промпт якщо не вказано інший
    const effectiveSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

    // Додаємо веб-пошук tool якщо увімкнено
    const tools = enableWebSearch ? [WEB_SEARCH_TOOL] : undefined;

    // Streaming response
    if (stream) {
      const generator = generateTextStream({
        model,
        messages,
        stream: true,
        temperature,
        maxTokens,
        systemPrompt: effectiveSystemPrompt,
        tools,
      });

      // Списуємо токени (оцінка)
      await deductTokens(userId, estimatedCost.platformTokens, `chat:${model}`);

      // Обгортаємо generator для збереження відповіді
      return createSSEResponse(saveStreamingResponse(generator, chat.id, model, estimatedCost.platformTokens));
    }

    // Regular response
    let response = await generateText({
      model,
      messages,
      stream: false,
      temperature,
      maxTokens,
      systemPrompt: effectiveSystemPrompt,
      tools,
    });

    // Обробка tool calls (якщо є)
    if (response.toolCalls && response.toolCalls.length > 0) {
      // Створюємо новий масив повідомлень з tool responses
      const updatedMessages = [...messages];
      
      // Виконуємо tool calls
      for (const toolCall of response.toolCalls) {
        if (toolCall.function.name === 'web_search') {
          const args = JSON.parse(toolCall.function.arguments);
          const searchResult = await executeWebSearchServer(args.query, args.num);
          
          // Додаємо assistant message з tool call
          updatedMessages.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.content,
            createdAt: new Date(),
          });
          
          // Додаємо tool response
          updatedMessages.push({
            id: crypto.randomUUID(),
            role: 'assistant', // В тих моделях що підтримують tool messages було б 'tool'
            content: `[tool: ${toolCall.function.name}]\n${searchResult}`,
            createdAt: new Date(),
          });
        }
      }
      
      // Повторний запит з tool responses
      response = await generateText({
        model,
        messages: updatedMessages,
        stream: false,
        temperature,
        maxTokens,
        systemPrompt: effectiveSystemPrompt,
        tools,
      });
    }

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
 * Виконання веб-пошуку на сервері
 */
async function executeWebSearchServer(query: string, num: number = 5): Promise<string> {
  try {
    const apiKey = await getApiKey('serper');
    if (!apiKey) {
      return 'Помилка: Serper API ключ не налаштований';
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(Math.max(num, 1), 10),
        gl: 'ua',
        hl: 'uk',
      }),
    });

    if (!response.ok) {
      return `Помилка при виконанні пошуку: ${response.statusText}`;
    }

    const data = await response.json();
    let result = `🔍 Результати пошуку для "${query}":\n\n`;

    if (data.answerBox) {
      result += `💡 Швидка відповідь:\n`;
      if (data.answerBox.answer) result += `${data.answerBox.answer}\n`;
      if (data.answerBox.snippet) result += `${data.answerBox.snippet}\n`;
      if (data.answerBox.link) result += `Джерело: ${data.answerBox.link}\n`;
      result += `\n`;
    }

    if (data.knowledgeGraph) {
      result += `📊 ${data.knowledgeGraph.title || 'Інформація'}:\n`;
      if (data.knowledgeGraph.description) result += `${data.knowledgeGraph.description}\n`;
      if (data.knowledgeGraph.website) result += `Джерело: ${data.knowledgeGraph.website}\n`;
      result += `\n`;
    }

    if (data.organic && data.organic.length > 0) {
      result += `📰 Результати пошуку:\n\n`;
      data.organic.forEach((item: any, index: number) => {
        result += `${index + 1}. ${item.title}\n`;
        result += `   ${item.snippet}\n`;
        result += `   ${item.link}\n\n`;
      });
    }

    return result.trim();
  } catch (error) {
    return `Помилка при виконанні веб-пошуку: ${error instanceof Error ? error.message : 'Невідома помилка'}`;
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
): AsyncGenerator<{ content: string; done: boolean; chatId?: string }> {
  let fullContent = '';
  
  for await (const chunk of generator) {
    if (!chunk.done) {
      fullContent += chunk.content;
      yield chunk;
    } else {
      // Зберігаємо відповідь ПЕРЕД останнім yield
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
          console.error('Failed to save streaming message:', error);
        }
      }
      // Останній чанк - додаємо chatId
      yield { ...chunk, chatId };
    }
  }
}
