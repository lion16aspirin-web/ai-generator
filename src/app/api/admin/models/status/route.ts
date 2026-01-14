/**
 * Admin Models Status API - Перевірка статусу моделей
 * GET /api/admin/models/status
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  TEXT_MODELS, 
  IMAGE_MODELS, 
  VIDEO_MODELS, 
  ANIMATION_MODELS 
} from '@/lib/ai/config';
// import { getOpenRouterProvider } from '@/lib/ai/providers/openrouter'; // Не використовуємо, щоб не викидати помилку без ключа

export const runtime = 'nodejs';

interface ModelStatus {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'image' | 'video' | 'animation';
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  error?: string;
  lastChecked?: Date;
}

/**
 * Перевірка доступності моделі через OpenRouter
 */
async function checkOpenRouterModel(modelId: string): Promise<boolean> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return false;
    
    // Простий тест - перевірка чи API ключ валідний
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Перевірка доступності провайдера
 */
async function checkProvider(provider: string): Promise<boolean> {
  switch (provider) {
    case 'openrouter':
      return !!process.env.OPENROUTER_API_KEY && await checkOpenRouterModel('');
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'google':
      return !!process.env.GOOGLE_AI_API_KEY;
    case 'replicate':
      return !!process.env.REPLICATE_API_TOKEN;
    case 'ideogram':
      return !!process.env.IDEOGRAM_API_KEY;
    case 'recraft':
      return !!process.env.RECRAFT_API_KEY;
    default:
      return false;
  }
}

/**
 * Перевірка статусу моделі
 */
async function checkModelStatus(
  model: any,
  type: 'text' | 'image' | 'video' | 'animation'
): Promise<ModelStatus> {
  const status: ModelStatus = {
    id: model.id,
    name: model.name,
    provider: model.provider,
    type,
    status: 'disconnected',
    lastChecked: new Date(),
  };

  // Якщо модель не доступна в конфігурації
  if (!model.isAvailable) {
    status.status = 'disconnected';
    status.error = 'Model not available in config';
    return status;
  }

  // Перевірка провайдера
  try {
    status.status = 'testing';
    
    // Для OpenRouter перевіряємо один раз для всіх моделей
    if (model.provider === 'openrouter') {
      const isConnected = await checkProvider('openrouter');
      status.status = isConnected ? 'connected' : 'disconnected';
      if (!isConnected) {
        status.error = 'OpenRouter API key not configured or invalid';
      }
    } else {
      // Для інших провайдерів перевіряємо наявність ключа
      const hasKey = await checkProvider(model.provider);
      status.status = hasKey ? 'connected' : 'disconnected';
      if (!hasKey) {
        status.error = `${model.provider} API key not configured`;
      }
    }
  } catch (error) {
    status.status = 'error';
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return status;
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

    // Перевірка прав адміна
    // TODO: Додати перевірку ролі адміна в БД
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Forbidden' },
    //     { status: 403 }
    //   );
    // }

    // Перевіряємо всі моделі
    const textModels = await Promise.all(
      TEXT_MODELS.map(model => checkModelStatus(model, 'text'))
    );

    const imageModels = await Promise.all(
      IMAGE_MODELS.map(model => checkModelStatus(model, 'image'))
    );

    const videoModels = await Promise.all(
      VIDEO_MODELS.map(model => checkModelStatus(model, 'video'))
    );

    const animationModels = await Promise.all(
      ANIMATION_MODELS.map(model => checkModelStatus(model, 'animation'))
    );

    // Групуємо по провайдерах
    const byProvider: Record<string, ModelStatus[]> = {};
    const allModels = [...textModels, ...imageModels, ...videoModels, ...animationModels];
    
    for (const model of allModels) {
      if (!byProvider[model.provider]) {
        byProvider[model.provider] = [];
      }
      byProvider[model.provider].push(model);
    }

    // Статистика
    const stats = {
      total: allModels.length,
      connected: allModels.filter(m => m.status === 'connected').length,
      disconnected: allModels.filter(m => m.status === 'disconnected').length,
      error: allModels.filter(m => m.status === 'error').length,
      byType: {
        text: textModels.length,
        image: imageModels.length,
        video: videoModels.length,
        animation: animationModels.length,
      },
      byProvider: Object.keys(byProvider).reduce((acc, provider) => {
        const models = byProvider[provider];
        acc[provider] = {
          total: models.length,
          connected: models.filter(m => m.status === 'connected').length,
          disconnected: models.filter(m => m.status === 'disconnected').length,
        };
        return acc;
      }, {} as Record<string, { total: number; connected: number; disconnected: number }>),
    };

    return NextResponse.json({
      models: allModels,
      byProvider,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Models status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
