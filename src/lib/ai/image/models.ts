/**
 * Image Models - Конфігурація моделей зображень
 */

import { ImageModel, ImageFeature } from '../types';
import { IMAGE_MODELS, getImageModel } from '../config';

// ============================================
// ГРУПУВАННЯ
// ============================================

export interface ImageModelGroup {
  provider: string;
  name: string;
  models: ImageModel[];
}

export function getImageModelsByProvider(): ImageModelGroup[] {
  const groups: Record<string, ImageModelGroup> = {};

  for (const model of IMAGE_MODELS) {
    if (!groups[model.provider]) {
      groups[model.provider] = {
        provider: model.provider,
        name: getProviderName(model.provider),
        models: [],
      };
    }
    groups[model.provider].models.push(model);
  }

  const order = ['openai', 'replicate', 'ideogram', 'recraft', 'google'];
  return order.map(p => groups[p]).filter(Boolean);
}

function getProviderName(provider: string): string {
  const names: Record<string, string> = {
    openai: 'OpenAI',
    replicate: 'FLUX / Replicate',
    ideogram: 'Ideogram',
    recraft: 'Recraft',
    google: 'Google',
  };
  return names[provider] || provider;
}

// ============================================
// ФІЛЬТРАЦІЯ
// ============================================

export function filterByFeature(feature: ImageFeature): ImageModel[] {
  return IMAGE_MODELS.filter(m => 
    m.isAvailable && m.features.includes(feature)
  );
}

export function getHDModels(): ImageModel[] {
  return filterByFeature('hd');
}

export function getFastModels(): ImageModel[] {
  return filterByFeature('fast');
}

export function getTextCapableModels(): ImageModel[] {
  return filterByFeature('text');
}

export function getBudgetModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.isAvailable && m.pricePerImage < 0.03);
}

// ============================================
// РЕКОМЕНДАЦІЇ
// ============================================

export interface ImageModelRecommendation {
  model: ImageModel;
  reason: string;
  score: number;
}

export function getImageRecommendations(
  task: 'photo' | 'art' | 'text' | 'logo' | 'budget' | 'fast'
): ImageModelRecommendation[] {
  const recommendations: ImageModelRecommendation[] = [];

  for (const model of IMAGE_MODELS.filter(m => m.isAvailable)) {
    let score = 0;
    let reason = '';

    switch (task) {
      case 'photo':
        if (model.id === 'flux-max') { score = 100; reason = 'Найкращий фотореалізм'; }
        else if (model.id.includes('flux')) { score = 80; reason = 'Відмінна якість фото'; }
        else if (model.id === 'dall-e-3') { score = 70; reason = 'Класична якість'; }
        else score = 40;
        break;

      case 'art':
        if (model.id === 'midjourney') { score = 100; reason = 'Легендарний арт стиль'; }
        else if (model.id === 'dall-e-3') { score = 80; reason = 'Творчі зображення'; }
        else score = 50;
        break;

      case 'text':
        if (model.id.includes('ideogram')) { score = 100; reason = 'Найкращий для тексту'; }
        else if (model.features.includes('text')) { score = 70; reason = 'Підтримує текст'; }
        else score = 20;
        break;

      case 'logo':
        if (model.id === 'recraft-v3') { score = 100; reason = 'Ідеальний для логотипів'; }
        else if (model.id.includes('ideogram')) { score = 80; reason = 'Чіткий текст'; }
        else score = 30;
        break;

      case 'budget':
        if (model.pricePerImage < 0.02) { score = 100; reason = 'Найдешевший'; }
        else if (model.pricePerImage < 0.03) { score = 80; reason = 'Бюджетний'; }
        else score = 30;
        break;

      case 'fast':
        if (model.features.includes('fast')) { score = 90; reason = 'Швидка генерація'; }
        else if (model.id.includes('turbo')) { score = 100; reason = 'Турбо режим'; }
        else score = 40;
        break;
    }

    if (score > 0) {
      recommendations.push({ model, reason, score });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

// ============================================
// СТИЛІ
// ============================================

export const IMAGE_STYLES = [
  { id: 'vivid', name: 'Яскравий', description: 'Насичені кольори та контраст' },
  { id: 'natural', name: 'Природний', description: 'Реалістичні тони' },
  { id: 'realistic', name: 'Реалістичний', description: 'Фотографічна якість' },
  { id: 'digital_illustration', name: 'Цифрова ілюстрація', description: 'Художній стиль' },
  { id: 'vector', name: 'Вектор', description: 'Для масштабування' },
  { id: 'icon', name: 'Іконка', description: 'Мінімалістичний дизайн' },
];

export function getStylesForModel(modelId: string): typeof IMAGE_STYLES {
  const model = getImageModel(modelId);
  if (!model?.styles) return [];
  
  return IMAGE_STYLES.filter(s => model.styles?.includes(s.id));
}

// ============================================
// ЕКСПОРТ
// ============================================

export { IMAGE_MODELS, getImageModel };
