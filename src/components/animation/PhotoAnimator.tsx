'use client';

/**
 * PhotoAnimator - Головний компонент анімації фото
 */

import React, { useState, useRef } from 'react';
import { useAnimation } from '@/hooks/useAnimation';
import { useTokens, formatTokens } from '@/hooks/useTokens';
import { PhotoUploader } from './PhotoUploader';
import { AnimationPreview } from './AnimationPreview';
import { ANIMATION_PRESETS, AnimationPreset, AnimationType } from '@/lib/ai/animation/models';

export function PhotoAnimator() {
  const {
    currentJob,
    isAnimating,
    error,
    history,
    animate,
    cancelJob,
  } = useAnimation();

  const { available, loading: tokensLoading } = useTokens();

  const [image, setImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<AnimationPreset | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [duration, setDuration] = useState(3);

  const handleAnimate = async () => {
    if (!image) return;
    
    await animate(image, {
      prompt: selectedPreset?.prompt || customPrompt,
      duration,
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">✨ Анімація фото</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">Токени:</span>
            <span className={`font-medium ${
              available < 500 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {tokensLoading ? '...' : formatTokens(available)}
            </span>
          </div>

          {isAnimating && (
            <button
              onClick={cancelJob}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-500 
                text-white transition-colors"
            >
              ⏹ Скасувати
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200">
              <span className="font-medium">Помилка:</span> {error}
            </div>
          )}

          {/* Preview */}
          {currentJob?.result?.url ? (
            <AnimationPreview url={currentJob.result.url} />
          ) : isAnimating && currentJob ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 border-4 border-emerald-500 
                  border-t-transparent rounded-full animate-spin" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Анімація в процесі...
                </h3>
                <p className="text-zinc-400">
                  {currentJob.progress ? `${currentJob.progress}%` : 'Підготовка...'}
                </p>
              </div>
            </div>
          ) : (
            <PhotoUploader 
              image={image}
              onImageChange={setImage}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-zinc-800 overflow-y-auto">
          <div className="p-4 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Налаштування
            </h3>

            {/* Presets */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Тип анімації
              </label>
              <div className="space-y-2">
                {(['portrait', 'landscape', 'artistic'] as AnimationType[]).map(type => (
                  <div key={type}>
                    <p className="text-xs text-zinc-500 mb-1 capitalize">{type}</p>
                    <div className="flex flex-wrap gap-1">
                      {ANIMATION_PRESETS.filter(p => p.type === type).map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPreset(preset);
                            setCustomPrompt('');
                          }}
                          className={`
                            px-2 py-1 text-xs rounded-lg transition-colors
                            ${selectedPreset?.id === preset.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }
                          `}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom prompt */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Або свій опис
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  setSelectedPreset(null);
                }}
                placeholder="Опишіть бажаний ефект..."
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg
                  text-white placeholder-zinc-500 resize-none text-sm
                  focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Тривалість: {duration} сек
              </label>
              <input
                type="range"
                min={2}
                max={5}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleAnimate}
              disabled={!image || isAnimating || available < 500}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 
                text-white font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnimating ? 'Анімація...' : '✨ Анімувати'}
            </button>

            {/* Cost */}
            <div className="p-3 rounded-lg bg-zinc-800/50 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Вартість:</span>
                <span className="text-emerald-400">~500 токенів</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoAnimator;
