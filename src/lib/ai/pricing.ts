/**
 * AI Pricing - Розрахунок вартості та токенів
 */

import { 
  TokenUsage, 
  TextModel, 
  ImageModel, 
  VideoModel, 
  AnimationModel 
} from './types';
import { 
  getTextModel, 
  getImageModel, 
  getVideoModel, 
  getAnimationModel 
} from './config';

// ============================================
// КОНСТАНТИ
// ============================================

// 1 наш токен = $0.0001
export const PLATFORM_TOKEN_RATE = 0.0001;

// Мінімальні списання
export const MIN_CHAT_TOKENS = 10;
export const MIN_IMAGE_TOKENS = 100;
export const MIN_VIDEO_TOKENS = 1000;
export const MIN_ANIMATION_TOKENS = 500;

// ============================================
// РОЗРАХУНОК ДЛЯ ТЕКСТУ
// ============================================

/**
 * Розраховує вартість текстової генерації
 */
export function calculateTextCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): TokenUsage {
  const model = getTextModel(modelId);
  
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  // Вартість в USD (ціни за 1M токенів)
  const inputCost = (inputTokens / 1_000_000) * model.inputPrice;
  const outputCost = (outputTokens / 1_000_000) * model.outputPrice;
  const totalCost = inputCost + outputCost;

  // Конвертація в наші токени
  const platformTokens = Math.max(
    Math.ceil(totalCost / PLATFORM_TOKEN_RATE),
    MIN_CHAT_TOKENS
  );

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    cost: totalCost,
    platformTokens,
  };
}

/**
 * Оцінює вартість до генерації (приблизно)
 */
export function estimateTextCost(
  modelId: string,
  inputLength: number, // символів
  expectedOutputLength: number = 1000
): TokenUsage {
  // Приблизно 4 символи = 1 токен
  const estimatedInputTokens = Math.ceil(inputLength / 4);
  const estimatedOutputTokens = Math.ceil(expectedOutputLength / 4);
  
  return calculateTextCost(modelId, estimatedInputTokens, estimatedOutputTokens);
}

// ============================================
// РОЗРАХУНОК ДЛЯ ЗОБРАЖЕНЬ
// ============================================

/**
 * Розраховує вартість генерації зображень
 */
export function calculateImageCost(
  modelId: string,
  count: number = 1,
  isHD: boolean = false
): TokenUsage {
  const model = getImageModel(modelId);
  
  if (!model) {
    throw new Error(`Image model ${modelId} not found`);
  }

  // HD коштує в 2 рази дорожче
  const priceMultiplier = isHD && model.features.includes('hd') ? 2 : 1;
  const totalCost = model.pricePerImage * count * priceMultiplier;

  const platformTokens = Math.max(
    Math.ceil(totalCost / PLATFORM_TOKEN_RATE),
    MIN_IMAGE_TOKENS * count
  );

  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: totalCost,
    platformTokens,
  };
}

// ============================================
// РОЗРАХУНОК ДЛЯ ВІДЕО
// ============================================

/**
 * Розраховує вартість генерації відео
 */
export function calculateVideoCost(
  modelId: string,
  durationSeconds: number
): TokenUsage {
  const model = getVideoModel(modelId);
  
  if (!model) {
    throw new Error(`Video model ${modelId} not found`);
  }

  const totalCost = model.pricePerSecond * durationSeconds;

  const platformTokens = Math.max(
    Math.ceil(totalCost / PLATFORM_TOKEN_RATE),
    MIN_VIDEO_TOKENS
  );

  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: totalCost,
    platformTokens,
  };
}

// ============================================
// РОЗРАХУНОК ДЛЯ АНІМАЦІЇ
// ============================================

/**
 * Розраховує вартість анімації фото
 */
export function calculateAnimationCost(modelId: string): TokenUsage {
  const model = getAnimationModel(modelId);
  
  if (!model) {
    throw new Error(`Animation model ${modelId} not found`);
  }

  const totalCost = model.pricePerAnimation;

  const platformTokens = Math.max(
    Math.ceil(totalCost / PLATFORM_TOKEN_RATE),
    MIN_ANIMATION_TOKENS
  );

  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: totalCost,
    platformTokens,
  };
}

// ============================================
// ХЕЛПЕРИ
// ============================================

/**
 * Форматує вартість для відображення
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Форматує токени для відображення
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Конвертує USD в наші токени
 */
export function usdToPlatformTokens(usd: number): number {
  return Math.ceil(usd / PLATFORM_TOKEN_RATE);
}

/**
 * Конвертує наші токени в USD
 */
export function platformTokensToUsd(tokens: number): number {
  return tokens * PLATFORM_TOKEN_RATE;
}

/**
 * Перевіряє чи достатньо токенів
 */
export function hasEnoughTokens(
  available: number, 
  required: number
): boolean {
  return available >= required;
}

// ============================================
// ТАРИФНІ ПЛАНИ
// ============================================

export interface PricingPlan {
  id: string;
  name: string;
  tokens: number;
  price: number;
  pricePerToken: number;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tokens: 100,
    price: 0,
    pricePerToken: 0,
    features: ['Базові моделі', 'Обмежена генерація'],
  },
  {
    id: 'starter',
    name: 'Starter',
    tokens: 50_000,
    price: 9.99,
    pricePerToken: 0.0002,
    features: ['Всі моделі', '50K токенів', 'Email підтримка'],
  },
  {
    id: 'standard',
    name: 'Standard',
    tokens: 150_000,
    price: 19.99,
    pricePerToken: 0.000133,
    features: ['Всі моделі', '150K токенів', 'Пріоритетна підтримка'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tokens: 500_000,
    price: 49.99,
    pricePerToken: 0.0001,
    features: ['Всі моделі', '500K токенів', 'API доступ', 'Пріоритет'],
  },
  {
    id: 'business',
    name: 'Business',
    tokens: 1_500_000,
    price: 99.99,
    pricePerToken: 0.000067,
    features: ['Всі моделі', '1.5M токенів', 'API доступ', 'SLA', 'Менеджер'],
  },
];

export function getPlan(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.id === id);
}
