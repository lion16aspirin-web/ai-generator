/**
 * Web Search API - Пошук в інтернеті через Serper API
 * POST /api/web/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getApiKey } from '@/lib/api-keys';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface SearchRequestBody {
  query: string;
  num?: number; // Кількість результатів (1-10)
  gl?: string; // Країна (ua, us, etc.)
  hl?: string; // Мова (uk, en, etc.)
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  answerBox?: {
    answer?: string;
    snippet?: string;
    title?: string;
    link?: string;
  };
  knowledgeGraph?: {
    title?: string;
    type?: string;
    description?: string;
    website?: string;
  };
}

/**
 * POST /api/web/search
 * Виконання веб-пошуку через Serper API
 */
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

    const body: SearchRequestBody = await request.json();
    const { query, num = 5, gl, hl } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Пошуковий запит не може бути порожнім' },
        { status: 400 }
      );
    }

    // Отримуємо API ключ Serper
    const apiKey = await getApiKey('serper');
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Configuration Error', 
          message: 'Serper API ключ не налаштований. Налаштуйте його в адмін панелі.' 
        },
        { status: 500 }
      );
    }

    // Виконуємо пошук через Serper API
    const serperResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(Math.max(num, 1), 10), // Обмежуємо 1-10
        gl: gl || 'ua', // За замовчуванням Україна
        hl: hl || 'uk', // За замовчуванням українська
      }),
    });

    if (!serperResponse.ok) {
      const errorData = await serperResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Search Error', 
          message: errorData.message || 'Помилка при виконанні пошуку',
          status: serperResponse.status,
        },
        { status: serperResponse.status }
      );
    }

    const serperData = await serperResponse.json();

    // Форматуємо відповідь
    const results: SearchResult[] = (serperData.organic || []).map((item: any, index: number) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      position: index + 1,
    }));

    const response: SearchResponse = {
      query,
      results,
    };

    // Додаємо answerBox якщо є
    if (serperData.answerBox) {
      response.answerBox = {
        answer: serperData.answerBox.answer,
        snippet: serperData.answerBox.snippet,
        title: serperData.answerBox.title,
        link: serperData.answerBox.link,
      };
    }

    // Додаємо knowledgeGraph якщо є
    if (serperData.knowledgeGraph) {
      response.knowledgeGraph = {
        title: serperData.knowledgeGraph.title,
        type: serperData.knowledgeGraph.type,
        description: serperData.knowledgeGraph.description,
        website: serperData.knowledgeGraph.website,
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Web search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Error', 
        message: error instanceof Error ? error.message : 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
