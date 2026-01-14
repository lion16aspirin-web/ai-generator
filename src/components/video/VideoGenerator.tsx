'use client';

/**
 * VideoGenerator - Головний компонент генерації відео
 */

import React, { useState } from 'react';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';
import { useTokens, formatTokens } from '@/hooks/useTokens';
import { VideoModelSelector } from './VideoModelSelector';
import { VideoSettings } from './VideoSettings';
import { VideoProgress } from './VideoProgress';
import { VideoPreview } from './VideoPreview';
import { VideoResolution } from '@/lib/ai/types';

export function VideoGenerator() {
  const {
    currentJob,
    isGenerating,
    error,
    currentModel,
    history,
    generate,
    setModel,
    cancelJob,
  } = useVideoGeneration('kling-2.1-pro');

  const { available, loading: tokensLoading } = useTokens();

  // Налаштування
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState({
    duration: 5,
    resolution: '1080p' as VideoResolution,
    sourceImage: undefined as string | undefined,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generate(prompt, settings);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">🎬 Генерація відео</h2>
          <VideoModelSelector
            selectedModel={currentModel}
            onModelChange={setModel}
            disabled={isGenerating}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">Токени:</span>
            <span className={`font-medium ${
              available < 1000 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {tokensLoading ? '...' : formatTokens(available)}
            </span>
          </div>

          {isGenerating && (
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
        <div className="flex-1 flex flex-col">
          {/* Error */}
          {error && (
            <div className="mx-4 mt-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200">
              <span className="font-medium">Помилка:</span> {error}
            </div>
          )}

          {/* Preview area */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentJob?.result?.url ? (
              <VideoPreview url={currentJob.result.url} />
            ) : isGenerating && currentJob ? (
              <VideoProgress 
                status={currentJob.status}
                progress={currentJob.progress}
                model={currentModel}
              />
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex gap-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={available < 1000 ? 'Недостатньо токенів...' : 'Опишіть відео...'}
                disabled={isGenerating || available < 1000}
                rows={2}
                className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl resize-none
                  text-white placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating || available < 1000}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 
                  text-white font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎬 Створити
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Settings */}
        <div className="w-80 border-l border-zinc-800 overflow-y-auto">
          <VideoSettings
            settings={settings}
            onSettingsChange={setSettings}
            model={currentModel}
            disabled={isGenerating}
          />

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                Історія ({history.length})
              </h3>
              <div className="space-y-2">
                {history.slice(0, 5).map((job, i) => (
                  <div
                    key={job.id}
                    className="p-2 rounded-lg bg-zinc-800 cursor-pointer 
                      hover:bg-zinc-700 transition-colors"
                    onClick={() => job.result?.url && window.open(job.result.url, '_blank')}
                  >
                    <div className="text-sm text-white truncate">
                      {job.status === 'completed' ? '✅' : '❌'} Відео #{history.length - i}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {new Date(job.createdAt).toLocaleString('uk')}
                    </div>
                  </div>
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

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎥</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Створіть відео
        </h3>
        <p className="text-zinc-400 max-w-md">
          Опишіть сцену або завантажте зображення для анімації.
          Генерація займає від 30 секунд до 5 хвилин.
        </p>
        <div className="mt-6 text-sm text-zinc-500">
          <p>💡 Приклади промптів:</p>
          <ul className="mt-2 space-y-1">
            <li>"Космічний корабель пролітає над планетою"</li>
            <li>"Тигр біжить по савані на заході сонця"</li>
            <li>"Дівчина танцює в дощі, кінематографічний стиль"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VideoGenerator;
