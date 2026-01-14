/**
 * Animation - Модуль для анімації фото
 */

import { 
  AnimationRequest, 
  AnimationJob, 
  AnimationResult,
  AIError 
} from '../types';
import { getAnimationModel, ANIMATION_MODELS } from '../config';
import { calculateAnimationCost } from '../pricing';

// ============================================
// ГЕНЕРАЦІЯ АНІМАЦІЇ
// ============================================

/**
 * Створення завдання на анімацію фото
 */
export async function createAnimationJob(request: AnimationRequest): Promise<AnimationJob> {
  const model = getAnimationModel(request.model);
  
  if (!model) {
    throw new AIError(
      `Animation model ${request.model} not found`,
      'MODEL_UNAVAILABLE'
    );
  }

  if (!model.isAvailable) {
    throw new AIError(
      `Animation model ${request.model} is currently unavailable`,
      'MODEL_UNAVAILABLE'
    );
  }

  // Використовуємо Replicate для анімації
  return createReplicateAnimation(request);
}

/**
 * Перевірка статусу анімації
 */
export async function checkAnimationJob(jobId: string): Promise<AnimationJob> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    throw new AIError('REPLICATE_API_TOKEN not configured', 'UNAUTHORIZED', 'replicate');
  }

  const response = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
    headers: { 'Authorization': `Token ${apiKey}` },
  });

  if (!response.ok) {
    throw new AIError('Failed to check animation job', 'PROVIDER_ERROR', 'replicate');
  }

  const data = await response.json();

  return {
    id: jobId,
    status: mapStatus(data.status),
    progress: data.logs ? parseProgress(data.logs) : undefined,
    result: data.output ? {
      url: Array.isArray(data.output) ? data.output[0] : data.output,
      duration: 3,
    } : undefined,
    error: data.error,
  };
}

// ============================================
// REPLICATE ANIMATION
// ============================================

async function createReplicateAnimation(request: AnimationRequest): Promise<AnimationJob> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    throw new AIError('REPLICATE_API_TOKEN not configured', 'UNAUTHORIZED', 'replicate');
  }

  // Моделі для анімації фото
  const models: Record<string, string> = {
    'photo-animation': 'lucataco/animate-diff:latest',
  };

  const version = models[request.model] || models['photo-animation'];

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version,
      input: {
        image: request.image,
        prompt: request.prompt || 'animate this image, smooth motion',
        num_frames: (request.duration || 3) * 8,
        fps: 8,
      },
    }),
  });

  if (!response.ok) {
    throw new AIError('Failed to create animation', 'PROVIDER_ERROR', 'replicate');
  }

  const data = await response.json();

  return {
    id: data.id,
    status: 'pending',
  };
}

// ============================================
// ХЕЛПЕРИ
// ============================================

function mapStatus(status: string): AnimationJob['status'] {
  const map: Record<string, AnimationJob['status']> = {
    'starting': 'pending',
    'processing': 'processing',
    'succeeded': 'completed',
    'failed': 'failed',
    'canceled': 'cancelled',
  };
  return map[status] || 'pending';
}

function parseProgress(logs: string): number {
  const match = logs.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Отримати доступні моделі анімації
 */
export function getAvailableAnimationModels() {
  return ANIMATION_MODELS.filter(m => m.isAvailable);
}

export { ANIMATION_MODELS } from '../config';
