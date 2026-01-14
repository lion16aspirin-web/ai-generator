/**
 * Video Models - Конфігурація моделей відео
 */

import { VideoModel, VideoMode } from '../types';
import { VIDEO_MODELS, getVideoModel } from '../config';

// ============================================
// ГРУПУВАННЯ
// ============================================

export interface VideoModelGroup {
  provider: string;
  name: string;
  models: VideoModel[];
}

export function getVideoModelsByProvider(): VideoModelGroup[] {
  const groups: Record<string, VideoModelGroup> = {};

  for (const model of VIDEO_MODELS) {
    if (!groups[model.provider]) {
      groups[model.provider] = {
        provider: model.provider,
        name: getProviderName(model.provider),
        models: [],
      };
    }
    groups[model.provider].models.push(model);
  }

  const order = ['openai', 'google', 'replicate'];
  return order.map(p => groups[p]).filter(Boolean);
}

function getProviderName(provider: string): string {
  const names: Record<string, string> = {
    openai: 'OpenAI Sora',
    google: 'Google Veo',
    replicate: 'Kling / PixVerse / Minimax',
  };
  return names[provider] || provider;
}

// ============================================
// ФІЛЬТРАЦІЯ
// ============================================

export function filterByMode(mode: VideoMode): VideoModel[] {
  return VIDEO_MODELS.filter(m => 
    m.isAvailable && m.modes.includes(mode)
  );
}

export function getTextToVideoModels(): VideoModel[] {
  return filterByMode('text-to-video');
}

export function getImageToVideoModels(): VideoModel[] {
  return filterByMode('image-to-video');
}

export function getBudgetVideoModels(): VideoModel[] {
  return VIDEO_MODELS.filter(m => m.isAvailable && m.pricePerSecond < 0.05);
}

export function getPremiumVideoModels(): VideoModel[] {
  return VIDEO_MODELS.filter(m => m.isAvailable && m.pricePerSecond >= 0.1);
}

// ============================================
// РЕКОМЕНДАЦІЇ
// ============================================

export interface VideoModelRecommendation {
  model: VideoModel;
  reason: string;
  score: number;
}

export function getVideoRecommendations(
  task: 'quality' | 'speed' | 'budget' | 'cinematic' | 'animation'
): VideoModelRecommendation[] {
  const recommendations: VideoModelRecommendation[] = [];

  for (const model of VIDEO_MODELS.filter(m => m.isAvailable)) {
    let score = 0;
    let reason = '';

    switch (task) {
      case 'quality':
        if (model.id === 'sora-2-pro') { score = 100; reason = 'Найкраща якість'; }
        else if (model.id === 'sora-2') { score = 90; reason = 'Відмінна якість'; }
        else if (model.id.includes('veo')) { score = 80; reason = 'Кінематографічна якість'; }
        else score = 50;
        break;

      case 'speed':
        if (model.id === 'kling-2.1-pro') { score = 100; reason = 'Найшвидший'; }
        else if (model.id.includes('flash')) { score = 90; reason = 'Швидка генерація'; }
        else if (model.id === 'wan-2.0') { score = 80; reason = 'Швидко та дешево'; }
        else score = 40;
        break;

      case 'budget':
        if (model.pricePerSecond < 0.03) { score = 100; reason = 'Найдешевший'; }
        else if (model.pricePerSecond < 0.05) { score = 80; reason = 'Бюджетний'; }
        else score = 30;
        break;

      case 'cinematic':
        if (model.id.includes('veo')) { score = 100; reason = 'Кінематографічний стиль'; }
        else if (model.id === 'sora-2-pro') { score = 90; reason = 'Професійна якість'; }
        else score = 50;
        break;

      case 'animation':
        if (model.id === 'pixverse-v4') { score = 100; reason = 'Стилізована анімація'; }
        else if (model.id === 'kling-2.1-pro') { score = 80; reason = 'Динамічний рух'; }
        else score = 50;
        break;
    }

    if (score > 0) {
      recommendations.push({ model, reason, score });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

// ============================================
// КАЛЬКУЛЯТОР ВАРТОСТІ
// ============================================

export function calculateEstimatedCost(
  modelId: string, 
  durationSeconds: number
): number {
  const model = getVideoModel(modelId);
  if (!model) return 0;
  return model.pricePerSecond * durationSeconds;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} сек`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins} хв ${secs} сек` : `${mins} хв`;
}

/**
 * Оцінка часу генерації по моделі
 */
export function estimateGenerationTime(
  modelId: string, 
  durationSeconds: number
): number {
  const estimates: Record<string, number> = {
    'sora-2': 180,
    'sora-2-pro': 240,
    'veo-3.1': 120,
    'veo-3.1-flash': 60,
    'kling-2.1-pro': 45,
    'pixverse-v4': 60,
    'minimax-hailuo': 90,
    'wan-2.0': 30,
  };

  const base = estimates[modelId] || 60;
  return Math.ceil(base * (durationSeconds / 5));
}

// ============================================
// ЕКСПОРТ
// ============================================

export { VIDEO_MODELS, getVideoModel };
