/**
 * Admin Check Connections - Швидка перевірка що підключено
 * GET /api/admin/check-connections
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = 'nodejs';

interface ConnectionStatus {
  provider: string;
  hasKey: boolean;
  keyLength: number; // Довжина ключа (без показу самого ключа)
  status: 'configured' | 'missing';
}

export async function GET() {
  try {
    // Перевірка авторизації
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Перевіряємо всі можливі API ключі
    const connections: ConnectionStatus[] = [
      {
        provider: 'OpenRouter',
        hasKey: !!process.env.OPENROUTER_API_KEY,
        keyLength: process.env.OPENROUTER_API_KEY?.length || 0,
        status: process.env.OPENROUTER_API_KEY ? 'configured' : 'missing',
      },
      {
        provider: 'OpenAI',
        hasKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length || 0,
        status: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      },
      {
        provider: 'Anthropic (Claude)',
        hasKey: !!process.env.ANTHROPIC_API_KEY,
        keyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
        status: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
      },
      {
        provider: 'Google AI',
        hasKey: !!process.env.GOOGLE_AI_API_KEY,
        keyLength: process.env.GOOGLE_AI_API_KEY?.length || 0,
        status: process.env.GOOGLE_AI_API_KEY ? 'configured' : 'missing',
      },
      {
        provider: 'Replicate',
        hasKey: !!process.env.REPLICATE_API_TOKEN,
        keyLength: process.env.REPLICATE_API_TOKEN?.length || 0,
        status: process.env.REPLICATE_API_TOKEN ? 'configured' : 'missing',
      },
      {
        provider: 'Ideogram',
        hasKey: !!process.env.IDEOGRAM_API_KEY,
        keyLength: process.env.IDEOGRAM_API_KEY?.length || 0,
        status: process.env.IDEOGRAM_API_KEY ? 'configured' : 'missing',
      },
      {
        provider: 'Recraft',
        hasKey: !!process.env.RECRAFT_API_KEY,
        keyLength: process.env.RECRAFT_API_KEY?.length || 0,
        status: process.env.RECRAFT_API_KEY ? 'configured' : 'missing',
      },
    ];

    const configured = connections.filter(c => c.status === 'configured');
    const missing = connections.filter(c => c.status === 'missing');

    return NextResponse.json({
      summary: {
        total: connections.length,
        configured: configured.length,
        missing: missing.length,
      },
      configured: configured.map(c => ({
        provider: c.provider,
        keyLength: c.keyLength,
      })),
      missing: missing.map(c => ({
        provider: c.provider,
      })),
      all: connections,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Check connections error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
