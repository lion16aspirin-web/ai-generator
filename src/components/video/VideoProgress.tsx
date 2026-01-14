'use client';

/**
 * VideoProgress - Компонент відображення прогресу генерації
 */

import React from 'react';
import { VideoJobStatus } from '@/lib/ai/types';
import { estimateGenerationTime, formatDuration } from '@/lib/ai/video/models';

interface VideoProgressProps {
  status: VideoJobStatus;
  progress?: number;
  model: string;
}

export function VideoProgress({ status, progress, model }: VideoProgressProps) {
  const estimatedTime = estimateGenerationTime(model, 5);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        {/* Animated icon */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-zinc-700 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-emerald-500 rounded-full
              animate-spin"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${progress || 50}%, 0 ${progress || 50}%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">
              {status === 'pending' ? '⏳' : '🎬'}
            </span>
          </div>
        </div>

        {/* Status text */}
        <h3 className="text-xl font-semibold text-white mb-2">
          {getStatusText(status)}
        </h3>

        {/* Progress bar */}
        {typeof progress === 'number' && (
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Progress percentage */}
        {typeof progress === 'number' && (
          <p className="text-lg font-medium text-emerald-400 mb-2">
            {progress}%
          </p>
        )}

        {/* Estimated time */}
        <p className="text-zinc-400">
          Орієнтовний час: {formatDuration(estimatedTime)}
        </p>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-lg bg-zinc-800/50 text-left">
          <p className="text-xs text-zinc-400 mb-2">💡 Поки чекаєте:</p>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>• Сторінку можна закрити — відео збережеться</li>
            <li>• Час залежить від завантаженості серверів</li>
            <li>• Складніші промпти можуть займати більше часу</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function getStatusText(status: VideoJobStatus): string {
  switch (status) {
    case 'pending':
      return 'Готуємо генерацію...';
    case 'processing':
      return 'Генерація в процесі...';
    case 'completed':
      return 'Готово!';
    case 'failed':
      return 'Помилка генерації';
    case 'cancelled':
      return 'Скасовано';
    default:
      return 'Обробка...';
  }
}

export default VideoProgress;
