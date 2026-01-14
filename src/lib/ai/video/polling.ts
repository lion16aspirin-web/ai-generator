/**
 * Video Polling - Утиліти для відстеження прогресу генерації відео
 */

import { VideoJob, VideoJobStatus } from '../types';
import { checkVideoJob } from './index';

// ============================================
// POLLING MANAGER
// ============================================

export interface PollingOptions {
  interval?: number; // мс
  maxAttempts?: number;
  onProgress?: (job: VideoJob) => void;
}

/**
 * Очікування завершення генерації відео
 */
export async function waitForVideoJob(
  jobId: string,
  provider: string,
  options: PollingOptions = {}
): Promise<VideoJob> {
  const {
    interval = 2000,
    maxAttempts = 300, // 10 хвилин при 2с інтервалі
    onProgress,
  } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const job = await checkVideoJob(jobId, provider);

    // Викликаємо callback з прогресом
    if (onProgress) {
      onProgress(job);
    }

    // Перевіряємо фінальні стани
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return job;
    }

    // Чекаємо перед наступною перевіркою
    await sleep(interval);
  }

  // Таймаут
  return {
    id: jobId,
    status: 'failed',
    error: 'Generation timeout - please try again',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// POLLING STORE (для клієнта)
// ============================================

export interface PollableJob {
  jobId: string;
  provider: string;
  model: string;
  status: VideoJobStatus;
  progress?: number;
  result?: { url: string };
  error?: string;
  createdAt: Date;
}

class VideoPollingStore {
  private jobs: Map<string, PollableJob> = new Map();
  private listeners: Map<string, Set<(job: PollableJob) => void>> = new Map();

  /**
   * Додати завдання для відстеження
   */
  addJob(job: PollableJob): void {
    this.jobs.set(job.jobId, job);
    this.notifyListeners(job.jobId, job);
  }

  /**
   * Оновити завдання
   */
  updateJob(jobId: string, update: Partial<PollableJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      const updated = { ...job, ...update };
      this.jobs.set(jobId, updated);
      this.notifyListeners(jobId, updated);
    }
  }

  /**
   * Отримати завдання
   */
  getJob(jobId: string): PollableJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Отримати всі активні завдання
   */
  getActiveJobs(): PollableJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.status === 'pending' || job.status === 'processing'
    );
  }

  /**
   * Підписатися на оновлення завдання
   */
  subscribe(jobId: string, callback: (job: PollableJob) => void): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set());
    }
    this.listeners.get(jobId)!.add(callback);

    // Повертаємо функцію відписки
    return () => {
      this.listeners.get(jobId)?.delete(callback);
    };
  }

  /**
   * Сповістити слухачів
   */
  private notifyListeners(jobId: string, job: PollableJob): void {
    this.listeners.get(jobId)?.forEach(callback => callback(job));
  }

  /**
   * Видалити завершене завдання
   */
  removeJob(jobId: string): void {
    this.jobs.delete(jobId);
    this.listeners.delete(jobId);
  }
}

// Singleton instance
export const videoPollingStore = new VideoPollingStore();

// ============================================
// CLIENT-SIDE POLLING
// ============================================

/**
 * Запуск polling на клієнті
 */
export async function startClientPolling(
  jobId: string,
  options: {
    interval?: number;
    onUpdate?: (job: PollableJob) => void;
  } = {}
): Promise<void> {
  const { interval = 3000, onUpdate } = options;

  const poll = async () => {
    try {
      const response = await fetch(`/api/video/status/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      const data = await response.json();
      const job = videoPollingStore.getJob(jobId);

      if (job) {
        videoPollingStore.updateJob(jobId, {
          status: data.status,
          progress: data.progress,
          result: data.result,
          error: data.error,
        });

        if (onUpdate) {
          onUpdate(videoPollingStore.getJob(jobId)!);
        }

        // Продовжуємо polling якщо не завершено
        if (data.status === 'pending' || data.status === 'processing') {
          setTimeout(poll, interval);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      // Retry after longer interval
      setTimeout(poll, interval * 2);
    }
  };

  poll();
}

// ============================================
// ХЕЛПЕРИ
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Форматування часу очікування
 */
export function formatEstimatedTime(seconds: number): string {
  if (seconds < 60) return `~${seconds} сек`;
  const mins = Math.floor(seconds / 60);
  return `~${mins} хв`;
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
