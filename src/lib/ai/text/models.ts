/**
 * Text Models - Конфігурація та хелпери для текстових моделей
 */

import { TextModel, TextCapability } from '../types';
import { TEXT_MODELS, getTextModel } from '../config';

// ============================================
// ГРУПУВАННЯ МОДЕЛЕЙ
// ============================================

export interface ModelGroup {
  provider: string;
  name: string;
  models: TextModel[];
}

/**
 * Групує моделі по провайдерах
 */
export function getModelsByProvider(): ModelGroup[] {
  const groups: Record<string, ModelGroup> = {};

  for (const model of TEXT_MODELS) {
    if (!groups[model.provider]) {
      groups[model.provider] = {
        provider: model.provider,
        name: getProviderName(model.provider),
        models: [],
      };
    }
    groups[model.provider].models.push(model);
  }

  // Сортуємо по пріоритету провайдерів
  const order = ['openai', 'anthropic', 'google', 'deepseek', 'xai'];
  return order
    .map(p => groups[p])
    .filter(Boolean);
}

/**
 * Отримує назву провайдера
 */
export function getProviderName(provider: string): string {
  const names: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    deepseek: 'DeepSeek',
    xai: 'xAI',
  };
  return names[provider] || provider;
}

// ============================================
// ФІЛЬТРАЦІЯ МОДЕЛЕЙ
// ============================================

/**
 * Фільтрує моделі по можливостях
 */
export function filterByCapability(capability: TextCapability): TextModel[] {
  return TEXT_MODELS.filter(m => 
    m.isAvailable && m.capabilities.includes(capability)
  );
}

/**
 * Отримує моделі з підтримкою vision
 */
export function getVisionModels(): TextModel[] {
  return filterByCapability('vision');
}

/**
 * Отримує моделі з підтримкою reasoning
 */
export function getReasoningModels(): TextModel[] {
  return filterByCapability('reasoning');
}

/**
 * Отримує бюджетні моделі (ціна < $1/1M)
 */
export function getBudgetModels(): TextModel[] {
  return TEXT_MODELS.filter(m => 
    m.isAvailable && 
    (m.inputPrice + m.outputPrice) / 2 < 1
  );
}

/**
 * Отримує преміум моделі
 */
export function getPremiumModels(): TextModel[] {
  return TEXT_MODELS.filter(m => 
    m.isAvailable && 
    (m.inputPrice + m.outputPrice) / 2 >= 5
  );
}

// ============================================
// ПОРІВНЯННЯ МОДЕЛЕЙ
// ============================================

export interface ModelComparison {
  model: TextModel;
  avgPrice: number;
  priceRating: 'budget' | 'standard' | 'premium';
  speedRating: 'fast' | 'medium' | 'slow';
  intelligenceRating: 'basic' | 'good' | 'excellent';
}

/**
 * Отримує порівняння моделей
 */
export function compareModels(): ModelComparison[] {
  return TEXT_MODELS.filter(m => m.isAvailable).map(model => {
    const avgPrice = (model.inputPrice + model.outputPrice) / 2;
    
    let priceRating: 'budget' | 'standard' | 'premium';
    if (avgPrice < 1) priceRating = 'budget';
    else if (avgPrice < 5) priceRating = 'standard';
    else priceRating = 'premium';

    let speedRating: 'fast' | 'medium' | 'slow';
    if (model.id.includes('flash') || model.id.includes('nano') || model.id.includes('haiku')) {
      speedRating = 'fast';
    } else if (model.id.includes('pro') || model.id.includes('max')) {
      speedRating = 'slow';
    } else {
      speedRating = 'medium';
    }

    let intelligenceRating: 'basic' | 'good' | 'excellent';
    if (model.capabilities.includes('reasoning')) {
      intelligenceRating = 'excellent';
    } else if (model.capabilities.length >= 3) {
      intelligenceRating = 'good';
    } else {
      intelligenceRating = 'basic';
    }

    return {
      model,
      avgPrice,
      priceRating,
      speedRating,
      intelligenceRating,
    };
  });
}

// ============================================
// РЕКОМЕНДАЦІЇ
// ============================================

export interface ModelRecommendation {
  model: TextModel;
  reason: string;
  score: number;
}

/**
 * Отримує рекомендації для задачі
 */
export function getRecommendations(
  task: 'chat' | 'code' | 'analysis' | 'creative' | 'budget'
): ModelRecommendation[] {
  const recommendations: ModelRecommendation[] = [];

  for (const model of TEXT_MODELS.filter(m => m.isAvailable)) {
    let score = 0;
    let reason = '';

    switch (task) {
      case 'chat':
        if (model.id === 'gpt-5.1') { score = 100; reason = 'Найкращий для спілкування'; }
        else if (model.provider === 'openai') { score = 80; reason = 'Якісні відповіді'; }
        else if (model.provider === 'anthropic') { score = 75; reason = 'Безпечний та точний'; }
        else score = 50;
        break;

      case 'code':
        if (model.id === 'deepseek-v3') { score = 100; reason = 'Найкращий для коду за ціною'; }
        else if (model.id === 'gpt-5.2') { score = 95; reason = 'Максимальна якість коду'; }
        else if (model.capabilities.includes('code')) { score = 70; reason = 'Підтримує код'; }
        else score = 30;
        break;

      case 'analysis':
        if (model.id === 'claude-4.5-sonnet') { score = 100; reason = 'Глибокий аналіз документів'; }
        else if (model.capabilities.includes('reasoning')) { score = 75; reason = 'Reasoning'; }
        else score = 40;
        break;

      case 'creative':
        if (model.id === 'gpt-5.1') { score = 100; reason = 'Творчий та теплий'; }
        else if (model.provider === 'openai') { score = 80; reason = 'Креативні відповіді'; }
        else score = 50;
        break;

      case 'budget':
        const avgPrice = (model.inputPrice + model.outputPrice) / 2;
        if (avgPrice < 0.5) { score = 100; reason = 'Найдешевший'; }
        else if (avgPrice < 1) { score = 80; reason = 'Бюджетний'; }
        else if (avgPrice < 3) { score = 50; reason = 'Помірна ціна'; }
        else score = 20;
        break;
    }

    if (score > 0) {
      recommendations.push({ model, reason, score });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

// ============================================
// ЕКСПОРТ
// ============================================

export { TEXT_MODELS, getTextModel };
