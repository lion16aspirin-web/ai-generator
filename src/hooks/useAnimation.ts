'use client';

/**
 * useAnimation - Хук для анімації фото
 */

import { useState, useCallback } from 'react';
import { AnimationJob } from '@/lib/ai/types';
import { useTokens } from './useTokens';

interface AnimationState {
  currentJob: AnimationJob | null;
  isAnimating: boolean;
  error: string | null;
  history: AnimationJob[];
}

interface AnimateOptions {
  prompt?: string;
  duration?: number;
  presetId?: string;
}

interface UseAnimationReturn extends AnimationState {
  animate: (image: string, options?: AnimateOptions) => Promise<void>;
  cancelJob: () => void;
}

export function useAnimation(): UseAnimationReturn {
  const [state, setState] = useState<AnimationState>({
    currentJob: null,
    isAnimating: false,
    error: null,
    history: [],
  });

  const { deduct, hasEnough } = useTokens();

  // Анімація фото
  const animate = useCallback(async (
    image: string,
    options: AnimateOptions = {}
  ) => {
    setState(prev => ({
      ...prev,
      isAnimating: true,
      error: null,
      currentJob: null,
    }));

    try {
      const response = await fetch('/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'photo-animation',
          image,
          prompt: options.prompt,
          duration: options.duration || 3,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start animation');
      }

      const job: AnimationJob = await response.json();

      setState(prev => ({
        ...prev,
        currentJob: job,
      }));

      // Polling для статусу
      pollAnimationStatus(job.id);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnimating: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  // Polling статусу
  const pollAnimationStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/animate/status/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const job: AnimationJob = await response.json();

        setState(prev => ({
          ...prev,
          currentJob: job,
          isAnimating: job.status === 'pending' || job.status === 'processing',
          error: job.error || null,
          history: job.status === 'completed' && job.result
            ? [job, ...prev.history].slice(0, 20)
            : prev.history,
        }));

        // Продовжуємо polling якщо не завершено
        if (job.status === 'pending' || job.status === 'processing') {
          setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  // Скасування
  const cancelJob = useCallback(async () => {
    if (!state.currentJob) return;

    try {
      await fetch(`/api/animate/cancel/${state.currentJob.id}`, {
        method: 'POST',
      });

      setState(prev => ({
        ...prev,
        currentJob: prev.currentJob ? {
          ...prev.currentJob,
          status: 'cancelled',
        } : null,
        isAnimating: false,
      }));
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  }, [state.currentJob]);

  return {
    ...state,
    animate,
    cancelJob,
  };
}
