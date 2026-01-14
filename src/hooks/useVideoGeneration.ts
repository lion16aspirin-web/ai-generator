'use client';

/**
 * useVideoGeneration - Хук для генерації відео
 */

import { useState, useCallback, useEffect } from 'react';
import { VideoJob, VideoJobStatus, VideoResolution } from '@/lib/ai/types';
import { videoPollingStore, startClientPolling } from '@/lib/ai/video/polling';
import { useTokens } from './useTokens';

interface VideoGenerationState {
  currentJob: VideoJob | null;
  isGenerating: boolean;
  error: string | null;
  currentModel: string;
  history: VideoJob[];
}

interface GenerateOptions {
  duration?: number;
  resolution?: VideoResolution;
  sourceImage?: string;
}

interface UseVideoGenerationReturn extends VideoGenerationState {
  generate: (prompt: string, options?: GenerateOptions) => Promise<void>;
  setModel: (modelId: string) => void;
  cancelJob: () => void;
}

export function useVideoGeneration(
  initialModel: string = 'kling-2.1-pro'
): UseVideoGenerationReturn {
  const [state, setState] = useState<VideoGenerationState>({
    currentJob: null,
    isGenerating: false,
    error: null,
    currentModel: initialModel,
    history: [],
  });

  const { deduct, hasEnough } = useTokens();

  // Генерація відео
  const generate = useCallback(async (
    prompt: string,
    options: GenerateOptions = {}
  ) => {
    if (!prompt.trim()) return;

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      currentJob: null,
    }));

    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: state.currentModel,
          prompt,
          mode: options.sourceImage ? 'image-to-video' : 'text-to-video',
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start video generation');
      }

      const job: VideoJob = await response.json();

      // Додаємо в store для polling
      videoPollingStore.addJob({
        jobId: job.id,
        provider: getProviderFromModel(state.currentModel),
        model: state.currentModel,
        status: job.status,
        createdAt: new Date(),
      });

      setState(prev => ({
        ...prev,
        currentJob: job,
      }));

      // Запускаємо polling
      startClientPolling(job.id, {
        onUpdate: (updated) => {
          setState(prev => ({
            ...prev,
            currentJob: {
              ...prev.currentJob!,
              status: updated.status,
              progress: updated.progress,
              result: updated.result ? {
                url: updated.result.url,
                duration: 0,
                resolution: '1080p',
              } : undefined,
              error: updated.error,
            },
            isGenerating: updated.status === 'pending' || updated.status === 'processing',
            error: updated.error || null,
            history: updated.status === 'completed' && prev.currentJob
              ? [prev.currentJob, ...prev.history].slice(0, 20)
              : prev.history,
          }));
        },
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [state.currentModel]);

  // Зміна моделі
  const setModel = useCallback((modelId: string) => {
    setState(prev => ({ ...prev, currentModel: modelId }));
  }, []);

  // Скасування завдання
  const cancelJob = useCallback(async () => {
    if (!state.currentJob) return;

    try {
      await fetch(`/api/video/cancel/${state.currentJob.id}`, {
        method: 'POST',
      });

      setState(prev => ({
        ...prev,
        currentJob: prev.currentJob ? {
          ...prev.currentJob,
          status: 'cancelled',
        } : null,
        isGenerating: false,
      }));

      videoPollingStore.removeJob(state.currentJob.id);
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  }, [state.currentJob]);

  return {
    ...state,
    generate,
    setModel,
    cancelJob,
  };
}

// ============================================
// ХЕЛПЕРИ
// ============================================

function getProviderFromModel(modelId: string): string {
  if (modelId.includes('sora')) return 'openai';
  if (modelId.includes('veo')) return 'google';
  return 'replicate';
}
