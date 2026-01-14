'use client';

/**
 * useImageGeneration - Хук для генерації зображень
 */

import { useState, useCallback } from 'react';
import { GeneratedImage, ImageSize } from '@/lib/ai/types';
import { useTokens } from './useTokens';

interface ImageGenerationState {
  images: GeneratedImage[];
  isGenerating: boolean;
  error: string | null;
  currentModel: string;
  history: GeneratedImage[];
}

interface GenerateOptions {
  negativePrompt?: string;
  size?: ImageSize;
  style?: string;
  n?: number;
  quality?: 'standard' | 'hd';
}

interface UseImageGenerationReturn extends ImageGenerationState {
  generate: (prompt: string, options?: GenerateOptions) => Promise<void>;
  setModel: (modelId: string) => void;
  clearImages: () => void;
  downloadImage: (url: string, filename?: string) => Promise<void>;
}

export function useImageGeneration(
  initialModel: string = 'flux-pro'
): UseImageGenerationReturn {
  const [state, setState] = useState<ImageGenerationState>({
    images: [],
    isGenerating: false,
    error: null,
    currentModel: initialModel,
    history: [],
  });

  const { deduct, hasEnough } = useTokens();

  // Генерація зображення
  const generate = useCallback(async (
    prompt: string,
    options: GenerateOptions = {}
  ) => {
    if (!prompt.trim()) return;

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: state.currentModel,
          prompt,
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        images: data.images,
        history: [...data.images, ...prev.history].slice(0, 50), // Зберігаємо останні 50
        isGenerating: false,
      }));
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

  // Очищення зображень
  const clearImages = useCallback(() => {
    setState(prev => ({ ...prev, images: [], error: null }));
  }, []);

  // Завантаження зображення
  const downloadImage = useCallback(async (
    url: string, 
    filename: string = 'generated-image.png'
  ) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, []);

  return {
    ...state,
    generate,
    setModel,
    clearImages,
    downloadImage,
  };
}
