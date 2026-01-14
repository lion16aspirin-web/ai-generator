'use client';

/**
 * ImageGenerator - Головний компонент генерації зображень
 */

import React, { useState } from 'react';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { useTokens, formatTokens } from '@/hooks/useTokens';
import { ImageModelSelector } from './ImageModelSelector';
import { PromptInput } from './PromptInput';
import { ImageGallery } from './ImageGallery';
import { ImageSettings } from './ImageSettings';
import { ImageSize } from '@/lib/ai/types';

export function ImageGenerator() {
  const {
    images,
    isGenerating,
    error,
    currentModel,
    history,
    generate,
    setModel,
    clearImages,
    downloadImage,
  } = useImageGeneration('flux-pro');

  const { available, loading: tokensLoading } = useTokens();

  // Налаштування
  const [settings, setSettings] = useState({
    size: '1024x1024' as ImageSize,
    style: 'vivid',
    quality: 'standard' as 'standard' | 'hd',
    n: 1,
    negativePrompt: '',
  });

  const handleGenerate = async (prompt: string) => {
    await generate(prompt, settings);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">🎨 Генерація зображень</h2>
          <ImageModelSelector
            selectedModel={currentModel}
            onModelChange={setModel}
            disabled={isGenerating}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">Токени:</span>
            <span className={`font-medium ${
              available < 100 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {tokensLoading ? '...' : formatTokens(available)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Error */}
          {error && (
            <div className="mx-4 mt-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200">
              <span className="font-medium">Помилка:</span> {error}
            </div>
          )}

          {/* Gallery */}
          <div className="flex-1 overflow-y-auto p-4">
            {images.length > 0 ? (
              <ImageGallery
                images={images}
                onDownload={downloadImage}
              />
            ) : (
              <EmptyState isGenerating={isGenerating} />
            )}
          </div>

          {/* Input */}
          <PromptInput
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            disabled={available < 100}
          />
        </div>

        {/* Sidebar - Settings */}
        <div className="w-80 border-l border-zinc-800 overflow-y-auto">
          <ImageSettings
            settings={settings}
            onSettingsChange={setSettings}
            model={currentModel}
          />

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                Історія ({history.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {history.slice(0, 9).map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={`History ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg 
                      cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(img.url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ isGenerating }: { isGenerating: boolean }) {
  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-500 
            border-t-transparent rounded-full animate-spin" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Генерація...
          </h3>
          <p className="text-zinc-400">
            Це може зайняти від 5 до 30 секунд
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🖼️</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Створіть зображення
        </h3>
        <p className="text-zinc-400 max-w-md">
          Опишіть, що хочете побачити. Чим детальніший опис — 
          тим кращий результат.
        </p>
        <div className="mt-6 text-sm text-zinc-500">
          <p>💡 Приклади промптів:</p>
          <ul className="mt-2 space-y-1">
            <li>"Космічний кіт на Місяці, цифровий арт"</li>
            <li>"Футуристичне місто на заході сонця"</li>
            <li>"Портрет молодої жінки, олійний живопис"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ImageGenerator;
