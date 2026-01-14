'use client';

/**
 * VideoSettings - Налаштування генерації відео
 */

import React, { useRef } from 'react';
import { VideoResolution } from '@/lib/ai/types';
import { getVideoModel } from '@/lib/ai/config';
import { calculateEstimatedCost, estimateGenerationTime, formatDuration } from '@/lib/ai/video/models';

interface Settings {
  duration: number;
  resolution: VideoResolution;
  sourceImage?: string;
}

interface VideoSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  model: string;
  disabled?: boolean;
}

const RESOLUTIONS: { value: VideoResolution; label: string }[] = [
  { value: '480p', label: '480p (швидко)' },
  { value: '720p', label: '720p (стандарт)' },
  { value: '1080p', label: '1080p (HD)' },
  { value: '4k', label: '4K (преміум)' },
];

export function VideoSettings({
  settings,
  onSettingsChange,
  model,
  disabled = false,
}: VideoSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoModel = getVideoModel(model);

  const update = (key: keyof Settings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        update('sourceImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const estimatedCost = calculateEstimatedCost(model, settings.duration);
  const estimatedTime = estimateGenerationTime(model, settings.duration);

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
        Налаштування
      </h3>

      {/* Duration */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Тривалість: {settings.duration} сек
        </label>
        <input
          type="range"
          min={2}
          max={videoModel?.maxDuration || 10}
          value={settings.duration}
          onChange={(e) => update('duration', parseInt(e.target.value))}
          disabled={disabled}
          className="w-full accent-emerald-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>2 сек</span>
          <span>{videoModel?.maxDuration || 10} сек</span>
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Роздільна здатність
        </label>
        <select
          value={settings.resolution}
          onChange={(e) => update('resolution', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg
            text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
            disabled:opacity-50"
        >
          {RESOLUTIONS.filter(r => 
            videoModel?.resolutions.includes(r.value)
          ).map(res => (
            <option key={res.value} value={res.value}>
              {res.label}
            </option>
          ))}
        </select>
      </div>

      {/* Source Image (Image-to-Video) */}
      {videoModel?.modes.includes('image-to-video') && (
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Початкове зображення (опціонально)
          </label>
          
          {settings.sourceImage ? (
            <div className="relative">
              <img
                src={settings.sourceImage}
                alt="Source"
                className="w-full aspect-video object-cover rounded-lg"
              />
              <button
                onClick={() => update('sourceImage', undefined)}
                disabled={disabled}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full
                  text-white flex items-center justify-center
                  disabled:opacity-50"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="w-full py-8 border-2 border-dashed border-zinc-700 rounded-lg
                text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm">Завантажити зображення</div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Estimates */}
      <div className="p-3 rounded-lg bg-zinc-800/50 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Орієнтовна вартість:</span>
          <span className="text-emerald-400 font-medium">
            ${estimatedCost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Час генерації:</span>
          <span className="text-zinc-300">
            {formatDuration(estimatedTime)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-zinc-500 space-y-1">
        <p>💡 Детальніший промпт = кращий результат</p>
        <p>⏱️ Час залежить від завантаженості серверів</p>
      </div>
    </div>
  );
}

export default VideoSettings;
