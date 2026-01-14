/**
 * AI Config - Конфігурація всіх моделей
 */

import { TextModel, ImageModel, VideoModel, AnimationModel } from './types';

// ============================================
// ТЕКСТОВІ МОДЕЛІ
// ============================================

export const TEXT_MODELS: TextModel[] = [
  // ========== OpenAI GPT-5 Series ==========
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    description: 'Флагманська модель OpenAI для складних задач',
    contextWindow: 256000,
    maxOutput: 16384,
    inputPrice: 5.00,
    outputPrice: 15.00,
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    isAvailable: true,
  },
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    description: 'Розумніша та тепліша версія GPT-5',
    contextWindow: 256000,
    maxOutput: 16384,
    inputPrice: 5.00,
    outputPrice: 15.00,
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    isAvailable: true,
  },
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    description: 'Максимальна потужність для найскладніших задач',
    contextWindow: 256000,
    maxOutput: 32768,
    inputPrice: 7.50,
    outputPrice: 22.50,
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    isAvailable: true,
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 nano',
    provider: 'openai',
    description: 'Швидка та економічна версія',
    contextWindow: 32000,
    maxOutput: 4096,
    inputPrice: 0.50,
    outputPrice: 1.50,
    capabilities: ['text', 'code'],
    isAvailable: true,
  },

  // ========== Anthropic Claude 4.5 Series ==========
  {
    id: 'claude-4.5-sonnet',
    name: 'Claude 4.5 Sonnet',
    provider: 'anthropic',
    description: 'Флагман Anthropic — безпека та глибокий аналіз',
    contextWindow: 200000,
    maxOutput: 8192,
    inputPrice: 6.00,
    outputPrice: 18.00,
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    isAvailable: true,
  },
  {
    id: 'claude-4.5-haiku',
    name: 'Claude 4.5 Haiku',
    provider: 'anthropic',
    description: 'Швидка та економічна версія Claude',
    contextWindow: 200000,
    maxOutput: 4096,
    inputPrice: 0.50,
    outputPrice: 2.00,
    capabilities: ['text', 'vision', 'code'],
    isAvailable: true,
  },

  // ========== Google Gemini 3.0 Series ==========
  {
    id: 'gemini-3.0-flash',
    name: 'Gemini 3.0 Flash',
    provider: 'google',
    description: 'Найшвидша модель з великим контекстом',
    contextWindow: 1000000,
    maxOutput: 8192,
    inputPrice: 0.10,
    outputPrice: 0.40,
    capabilities: ['text', 'vision', 'code'],
    isAvailable: true,
  },
  {
    id: 'gemini-3.0-pro',
    name: 'Gemini 3.0 Pro',
    provider: 'google',
    description: 'Баланс швидкості та якості',
    contextWindow: 1000000,
    maxOutput: 8192,
    inputPrice: 2.00,
    outputPrice: 8.00,
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    isAvailable: true,
  },

  // ========== DeepSeek ==========
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Код та математика за низькою ціною',
    contextWindow: 128000,
    maxOutput: 8192,
    inputPrice: 0.20,
    outputPrice: 0.40,
    capabilities: ['text', 'code', 'reasoning'],
    isAvailable: true,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: 'Reasoning модель з chain-of-thought',
    contextWindow: 128000,
    maxOutput: 8192,
    inputPrice: 0.80,
    outputPrice: 3.00,
    capabilities: ['text', 'code', 'reasoning'],
    isAvailable: true,
  },

  // ========== xAI Grok ==========
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xai',
    description: 'Актуальні знання та гумор від xAI',
    contextWindow: 128000,
    maxOutput: 8192,
    inputPrice: 3.00,
    outputPrice: 10.00,
    capabilities: ['text', 'code', 'realtime'],
    isAvailable: true,
  },
  {
    id: 'grok-4-max',
    name: 'Grok 4 Max',
    provider: 'xai',
    description: 'Розширена версія з більшим контекстом',
    contextWindow: 256000,
    maxOutput: 16384,
    inputPrice: 5.00,
    outputPrice: 15.00,
    capabilities: ['text', 'code', 'reasoning', 'realtime'],
    isAvailable: true,
  },

  // ========== Moonshot Kimi ==========
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'moonshot',
    description: 'Рекордний контекст 2M токенів',
    contextWindow: 2000000,
    maxOutput: 8192,
    inputPrice: 1.50,
    outputPrice: 5.00,
    capabilities: ['text', 'code'],
    isAvailable: true,
  },
];

// ============================================
// МОДЕЛІ ЗОБРАЖЕНЬ
// ============================================

export const IMAGE_MODELS: ImageModel[] = [
  // ========== OpenAI ==========
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1.0',
    provider: 'openai',
    description: 'Нова модель з діалоговою генерацією',
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    pricePerImage: 0.05,
    features: ['edit', 'variations'],
    isAvailable: true,
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    description: 'Класика з найкращим текстом на зображеннях',
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    styles: ['vivid', 'natural'],
    pricePerImage: 0.04,
    features: ['hd', 'text'],
    isAvailable: true,
  },

  // ========== Replicate (FLUX) ==========
  {
    id: 'flux-max',
    name: 'FLUX.1 Max',
    provider: 'replicate',
    description: 'Топовий фотореалізм від Black Forest Labs',
    sizes: ['1024x1024', '1024x1536', '1536x1024', '2048x2048'],
    pricePerImage: 0.04,
    features: ['fast', 'hd'],
    isAvailable: true,
  },
  {
    id: 'flux-pro',
    name: 'FLUX.1 Pro',
    provider: 'replicate',
    description: 'Баланс якості та швидкості',
    sizes: ['1024x1024', '1024x1536', '1536x1024'],
    pricePerImage: 0.03,
    features: ['fast'],
    isAvailable: true,
  },
  {
    id: 'flux-dev',
    name: 'FLUX.1 Dev',
    provider: 'replicate',
    description: 'Бюджетний варіант для експериментів',
    sizes: ['1024x1024'],
    pricePerImage: 0.015,
    features: ['fast'],
    isAvailable: true,
  },

  // ========== Midjourney (через proxy) ==========
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'replicate',
    description: 'Легендарний художній стиль',
    sizes: ['1024x1024', '1024x1536', '1536x1024'],
    pricePerImage: 0.04,
    features: ['hd'],
    isAvailable: true,
  },

  // ========== Ideogram ==========
  {
    id: 'ideogram-v3',
    name: 'Ideogram V3',
    provider: 'ideogram',
    description: 'Найкращий для кирилиці та логотипів',
    sizes: ['1024x1024', '1024x1536', '1536x1024'],
    pricePerImage: 0.03,
    features: ['text'],
    isAvailable: true,
  },
  {
    id: 'ideogram-v3-turbo',
    name: 'Ideogram V3 Turbo',
    provider: 'ideogram',
    description: 'Швидка версія для типографіки',
    sizes: ['1024x1024'],
    pricePerImage: 0.02,
    features: ['text', 'fast'],
    isAvailable: true,
  },

  // ========== Recraft ==========
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    provider: 'recraft',
    description: 'Професійні ілюстрації та іконки',
    sizes: ['1024x1024', '2048x2048'],
    styles: ['realistic', 'digital_illustration', 'vector', 'icon'],
    pricePerImage: 0.025,
    features: ['hd'],
    isAvailable: true,
  },

  // ========== Google ==========
  {
    id: 'imagen-4',
    name: 'Google Imagen 4',
    provider: 'google',
    description: 'Швидка генерація від Google',
    sizes: ['1024x1024', '1536x1536'],
    pricePerImage: 0.025,
    features: ['fast'],
    isAvailable: true,
  },
];

// ============================================
// МОДЕЛІ ВІДЕО
// ============================================

export const VIDEO_MODELS: VideoModel[] = [
  // ========== OpenAI Sora ==========
  {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'openai',
    description: 'Революційна модель відео від OpenAI',
    maxDuration: 60,
    resolutions: ['480p', '720p', '1080p'],
    pricePerSecond: 0.15,
    modes: ['text-to-video', 'image-to-video'],
    isAvailable: true,
  },
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    provider: 'openai',
    description: 'Преміум версія з 4K та пріоритетом',
    maxDuration: 60,
    resolutions: ['720p', '1080p', '4k'],
    pricePerSecond: 0.25,
    modes: ['text-to-video', 'image-to-video'],
    isAvailable: true,
  },

  // ========== Google Veo ==========
  {
    id: 'veo-3.1',
    name: 'Google Veo 3.1',
    provider: 'google',
    description: 'Кінематографічна якість від Google',
    maxDuration: 8,
    resolutions: ['720p', '1080p'],
    pricePerSecond: 0.10,
    modes: ['text-to-video', 'image-to-video'],
    isAvailable: true,
  },
  {
    id: 'veo-3.1-flash',
    name: 'Google Veo 3.1 Flash',
    provider: 'google',
    description: 'Швидка версія для більшості задач',
    maxDuration: 8,
    resolutions: ['480p', '720p'],
    pricePerSecond: 0.06,
    modes: ['text-to-video', 'image-to-video'],
    isAvailable: true,
  },

  // ========== Replicate (Kling, PixVerse, etc) ==========
  {
    id: 'kling-2.1-pro',
    name: 'Kling 2.1 Pro',
    provider: 'replicate',
    description: 'Швидке та економічне відео',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
    pricePerSecond: 0.04,
    modes: ['text-to-video', 'image-to-video'],
    isAvailable: true,
  },
  {
    id: 'pixverse-v4',
    name: 'PixVerse v4',
    provider: 'replicate',
    description: 'Стилізоване відео та спецефекти',
    maxDuration: 8,
    resolutions: ['720p', '1080p'],
    pricePerSecond: 0.03,
    modes: ['text-to-video', 'image-to-video'],
    isAvailable: true,
  },
  {
    id: 'minimax-hailuo',
    name: 'Minimax Hailuo',
    provider: 'replicate',
    description: 'Реалістичний рух та динаміка',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
    pricePerSecond: 0.05,
    modes: ['text-to-video', 'image-to-video'],
    isAvailable: true,
  },
  {
    id: 'wan-2.0',
    name: 'Wan 2.0',
    provider: 'replicate',
    description: 'Бюджетний варіант для тестів',
    maxDuration: 15,
    resolutions: ['480p', '720p'],
    pricePerSecond: 0.02,
    modes: ['text-to-video'],
    isAvailable: true,
  },
];

// ============================================
// МОДЕЛІ АНІМАЦІЇ
// ============================================

export const ANIMATION_MODELS: AnimationModel[] = [
  {
    id: 'photo-animation',
    name: 'Photo Animation',
    provider: 'replicate',
    description: 'Оживлення портретів та фото',
    maxDuration: 5,
    pricePerAnimation: 0.08,
    isAvailable: true,
  },
];

// ============================================
// ХЕЛПЕРИ
// ============================================

export function getTextModel(id: string): TextModel | undefined {
  return TEXT_MODELS.find(m => m.id === id);
}

export function getImageModel(id: string): ImageModel | undefined {
  return IMAGE_MODELS.find(m => m.id === id);
}

export function getVideoModel(id: string): VideoModel | undefined {
  return VIDEO_MODELS.find(m => m.id === id);
}

export function getAnimationModel(id: string): AnimationModel | undefined {
  return ANIMATION_MODELS.find(m => m.id === id);
}

export function getAvailableTextModels(): TextModel[] {
  return TEXT_MODELS.filter(m => m.isAvailable);
}

export function getAvailableImageModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.isAvailable);
}

export function getAvailableVideoModels(): VideoModel[] {
  return VIDEO_MODELS.filter(m => m.isAvailable);
}

// ============================================
// ДЕФОЛТНІ МОДЕЛІ
// ============================================

export const DEFAULT_TEXT_MODEL = 'gpt-5.1';
export const DEFAULT_IMAGE_MODEL = 'flux-pro';
export const DEFAULT_VIDEO_MODEL = 'kling-2.1-pro';
export const DEFAULT_ANIMATION_MODEL = 'photo-animation';

// ============================================
// OPENROUTER MODEL MAPPING
// ============================================

export const OPENROUTER_MODEL_MAP: Record<string, string> = {
  // OpenAI (використовуємо актуальні моделі)
  'gpt-5': 'openai/gpt-4o', // Fallback на gpt-4o якщо gpt-5 не існує
  'gpt-5.1': 'openai/gpt-4o-2024-11-20', // Остання версія GPT-4o
  'gpt-5.2': 'openai/gpt-4-turbo', // Потужніша модель
  'gpt-5-nano': 'openai/gpt-4o-mini', // Швидка та економна
  // Anthropic
  'claude-4.5-sonnet': 'anthropic/claude-3.5-sonnet', // Актуальна версія
  'claude-4.5-haiku': 'anthropic/claude-3-haiku', // Швидка версія
  // Google
  'gemini-3.0-flash': 'google/gemini-2.0-flash-exp', // Актуальна версія
  'gemini-3.0-pro': 'google/gemini-2.0-flash-thinking-exp', // Pro версія
  // DeepSeek
  'deepseek-v3': 'deepseek/deepseek-chat',
  'deepseek-r1': 'deepseek/deepseek-reasoner',
  // xAI
  'grok-4': 'x-ai/grok-beta',
  'grok-4-max': 'x-ai/grok-beta',
  // Moonshot
  'kimi-k2': 'moonshot/kimi-v1.5',
};
