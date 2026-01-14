/**
 * Video Generation - Роутер для генерації відео
 */

import { 
  VideoRequest, 
  VideoJob, 
  VideoResult,
  VideoJobStatus,
  AIError 
} from '../types';
import { getVideoModel, VIDEO_MODELS } from '../config';
import { calculateVideoCost } from '../pricing';

// ============================================
// ГЕНЕРАЦІЯ ВІДЕО
// ============================================

/**
 * Створення завдання на генерацію відео
 */
export async function createVideoJob(request: VideoRequest): Promise<VideoJob> {
  const model = getVideoModel(request.model);
  
  if (!model) {
    throw new AIError(
      `Video model ${request.model} not found`,
      'MODEL_UNAVAILABLE'
    );
  }

  if (!model.isAvailable) {
    throw new AIError(
      `Video model ${request.model} is currently unavailable`,
      'MODEL_UNAVAILABLE'
    );
  }

  // Роутинг до відповідного провайдера
  switch (model.provider) {
    case 'openai':
      return createSoraJob(request);
    case 'google':
      return createVeoJob(request);
    case 'replicate':
      return createReplicateVideoJob(request, model.id);
    default:
      throw new AIError(
        `Provider ${model.provider} not supported for video`,
        'PROVIDER_ERROR'
      );
  }
}

/**
 * Перевірка статусу завдання
 */
export async function checkVideoJob(
  jobId: string, 
  provider: string
): Promise<VideoJob> {
  switch (provider) {
    case 'openai':
      return checkSoraJob(jobId);
    case 'google':
      return checkVeoJob(jobId);
    case 'replicate':
      return checkReplicateJob(jobId);
    default:
      throw new AIError(`Unknown provider: ${provider}`, 'PROVIDER_ERROR');
  }
}

// ============================================
// OPENAI SORA
// ============================================

async function createSoraJob(request: VideoRequest): Promise<VideoJob> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIError('OPENAI_API_KEY not configured', 'UNAUTHORIZED', 'openai');
  }

  // Sora API (коли стане доступним)
  const response = await fetch('https://api.openai.com/v1/video/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model === 'sora-2-pro' ? 'sora-2-pro' : 'sora-2',
      prompt: request.prompt,
      duration: request.duration || 10,
      resolution: request.resolution || '1080p',
      image: request.sourceImage,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AIError(
      error.error?.message || 'Sora generation failed',
      'PROVIDER_ERROR',
      'openai'
    );
  }

  const data = await response.json();

  return {
    id: data.id,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function checkSoraJob(jobId: string): Promise<VideoJob> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIError('OPENAI_API_KEY not configured', 'UNAUTHORIZED', 'openai');
  }

  const response = await fetch(`https://api.openai.com/v1/video/generations/${jobId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new AIError('Failed to check Sora job', 'PROVIDER_ERROR', 'openai');
  }

  const data = await response.json();

  return {
    id: data.id,
    status: mapStatus(data.status),
    progress: data.progress,
    result: data.video_url ? {
      url: data.video_url,
      duration: data.duration,
      resolution: data.resolution,
    } : undefined,
    error: data.error,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(),
  };
}

// ============================================
// GOOGLE VEO
// ============================================

async function createVeoJob(request: VideoRequest): Promise<VideoJob> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new AIError('GOOGLE_AI_API_KEY not configured', 'UNAUTHORIZED', 'google');
  }

  // Google Veo API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateVideo?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: request.prompt,
        duration: request.duration || 8,
        aspectRatio: getAspectRatio(request.resolution),
        image: request.sourceImage,
      }),
    }
  );

  if (!response.ok) {
    throw new AIError('Veo generation failed', 'PROVIDER_ERROR', 'google');
  }

  const data = await response.json();

  return {
    id: data.name,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function checkVeoJob(jobId: string): Promise<VideoJob> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new AIError('GOOGLE_AI_API_KEY not configured', 'UNAUTHORIZED', 'google');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${jobId}?key=${apiKey}`
  );

  if (!response.ok) {
    throw new AIError('Failed to check Veo job', 'PROVIDER_ERROR', 'google');
  }

  const data = await response.json();

  return {
    id: jobId,
    status: data.done ? 'completed' : 'processing',
    result: data.response?.videoUrl ? {
      url: data.response.videoUrl,
      duration: data.response.duration,
      resolution: '1080p',
    } : undefined,
    error: data.error?.message,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// REPLICATE (Kling, PixVerse, etc)
// ============================================

async function createReplicateVideoJob(
  request: VideoRequest,
  modelId: string
): Promise<VideoJob> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    throw new AIError('REPLICATE_API_TOKEN not configured', 'UNAUTHORIZED', 'replicate');
  }

  const modelVersions: Record<string, string> = {
    'kling-2.1-pro': 'kuaishou-video/kling-v2.1-pro',
    'pixverse-v4': 'pixverse/pixverse-v4',
    'minimax-hailuo': 'minimax/hailuo-ai',
    'wan-2.0': 'wan/wan-2.0',
  };

  const version = modelVersions[modelId];
  if (!version) {
    throw new AIError(`Model ${modelId} mapping not found`, 'MODEL_UNAVAILABLE', 'replicate');
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version,
      input: {
        prompt: request.prompt,
        duration: request.duration || 5,
        image: request.sourceImage,
      },
    }),
  });

  if (!response.ok) {
    throw new AIError('Failed to create Replicate prediction', 'PROVIDER_ERROR', 'replicate');
  }

  const data = await response.json();

  return {
    id: data.id,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function checkReplicateJob(jobId: string): Promise<VideoJob> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    throw new AIError('REPLICATE_API_TOKEN not configured', 'UNAUTHORIZED', 'replicate');
  }

  const response = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
    headers: { 'Authorization': `Token ${apiKey}` },
  });

  if (!response.ok) {
    throw new AIError('Failed to check Replicate job', 'PROVIDER_ERROR', 'replicate');
  }

  const data = await response.json();

  return {
    id: jobId,
    status: mapReplicateStatus(data.status),
    progress: data.logs ? parseProgress(data.logs) : undefined,
    result: data.output ? {
      url: Array.isArray(data.output) ? data.output[0] : data.output,
      duration: 5,
      resolution: '1080p',
    } : undefined,
    error: data.error,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(),
  };
}

// ============================================
// ХЕЛПЕРИ
// ============================================

function mapStatus(status: string): VideoJobStatus {
  const map: Record<string, VideoJobStatus> = {
    'pending': 'pending',
    'processing': 'processing',
    'succeeded': 'completed',
    'failed': 'failed',
    'cancelled': 'cancelled',
  };
  return map[status] || 'pending';
}

function mapReplicateStatus(status: string): VideoJobStatus {
  const map: Record<string, VideoJobStatus> = {
    'starting': 'pending',
    'processing': 'processing',
    'succeeded': 'completed',
    'failed': 'failed',
    'canceled': 'cancelled',
  };
  return map[status] || 'pending';
}

function getAspectRatio(resolution?: string): string {
  if (resolution === '1080p' || resolution === '4k') return '16:9';
  if (resolution === '720p') return '16:9';
  return '16:9';
}

function parseProgress(logs: string): number {
  const match = logs.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Отримати доступні моделі відео
 */
export function getAvailableVideoModels() {
  return VIDEO_MODELS.filter(m => m.isAvailable);
}

export { VIDEO_MODELS } from '../config';
