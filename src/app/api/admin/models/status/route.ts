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
import { getApiKey } from '@/lib/api-keys';

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
 * Перевірка доступності провайдера через getApiKey() (БД або env)
 */
async function checkProvider(provider: string): Promise<{ hasKey: boolean; error?: string }> {
  // Мапінг провайдерів на ServiceType для getApiKey
  const providerToServiceMap: Record<string, string> = {
    'openrouter': 'openai', // OpenRouter використовує openai ключ
    'openai': 'openai',
    'anthropic': 'anthropic',
    'google': 'google',
    'replicate': 'replicate',
    'ideogram': 'ideogram',
    'recraft': 'recraft',
    'xai': 'xai',
    'deepseek': 'deepseek',
  };

  const service = providerToServiceMap[provider.toLowerCase()];
  
  if (!service) {
    return { hasKey: false, error: `Unknown provider: ${provider}` };
  }

  try {
    // Перевіряємо через getApiKey() - він спочатку шукає в БД, потім в env
    const apiKey = await getApiKey(service as any);
    
    if (!apiKey) {
      // Для текстових моделей через OpenRouter перевіряємо окремо
      if (provider === 'openrouter' || provider === 'openai') {
        const openRouterKey = await getApiKey('openai');
        if (!openRouterKey && !process.env.OPENROUTER_API_KEY) {
          return { hasKey: false, error: 'API key not configured' };
        }
        // Перевіряємо валідність ключа для OpenRouter
        if (process.env.OPENROUTER_API_KEY) {
          const isValid = await checkOpenRouterModel('');
          return { hasKey: isValid, error: isValid ? undefined : 'Invalid API key' };
        }
      }
      
      return { hasKey: false, error: 'API key not configured' };
    }
    
    return { hasKey: true };
  } catch (error) {
    return { hasKey: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
      
      // Визначаємо ServiceType для getApiKey
      let serviceType = model.provider.toLowerCase();
      
      // Спеціальні маппінги для провайдерів
      if (serviceType === 'openai' && type === 'image') {
        serviceType = 'dalle';
      } else if (serviceType === 'openai' && type === 'video') {
        serviceType = 'sora';
      } else if (serviceType === 'google' && type === 'video') {
        serviceType = 'veo';
      } else if (['kling', 'pixverse', 'minimax', 'wan', 'flux', 'midjourney', 'stable-diffusion'].includes(serviceType)) {
        serviceType = 'replicate';
      }
      
      // Перевіряємо наявність ключа через getApiKey()
      const checkResult = await checkProvider(model.provider);
      
      if (checkResult.hasKey) {
        status.status = 'connected';
      } else {
        status.status = 'disconnected';
        status.error = checkResult.error || `${model.provider} API key not configured`;
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
