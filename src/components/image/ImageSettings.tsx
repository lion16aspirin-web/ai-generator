'use client';

/**
 * ImageSettings - Налаштування генерації
 */

import React from 'react';
import { ImageSize } from '@/lib/ai/types';
import { getStylesForModel } from '@/lib/ai/image/models';

interface Settings {
  size: ImageSize;
  style: string;
  quality: 'standard' | 'hd';
  n: number;
  negativePrompt: string;
}

interface ImageSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  model: string;
}

const SIZES: { value: ImageSize; label: string }[] = [
  { value: '1024x1024', label: '1:1 (1024×1024)' },
  { value: '1024x1536', label: '2:3 (1024×1536)' },
  { value: '1536x1024', label: '3:2 (1536×1024)' },
  { value: '1024x1792', label: '9:16 (1024×1792)' },
  { value: '1792x1024', label: '16:9 (1792×1024)' },
];

export function ImageSettings({
  settings,
  onSettingsChange,
  model,
}: ImageSettingsProps) {
  const styles = getStylesForModel(model);

  const update = (key: keyof Settings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
        Налаштування
      </h3>

      {/* Size */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Розмір
        </label>
        <select
          value={settings.size}
          onChange={(e) => update('size', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg
            text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {SIZES.map(size => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Style */}
      {styles.length > 0 && (
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Стиль
          </label>
          <select
            value={settings.style}
            onChange={(e) => update('style', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg
              text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {styles.map(style => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quality */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Якість
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => update('quality', 'standard')}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${settings.quality === 'standard'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }
            `}
          >
            Стандарт
          </button>
          <button
            onClick={() => update('quality', 'hd')}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${settings.quality === 'hd'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }
            `}
          >
            HD (×2 ціна)
          </button>
        </div>
      </div>

      {/* Count */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Кількість: {settings.n}
        </label>
        <input
          type="range"
          min={1}
          max={4}
          value={settings.n}
          onChange={(e) => update('n', parseInt(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>1</span>
          <span>4</span>
        </div>
      </div>

      {/* Negative prompt */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Негативний промпт
        </label>
        <textarea
          value={settings.negativePrompt}
          onChange={(e) => update('negativePrompt', e.target.value)}
          placeholder="Чого уникати..."
          rows={2}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg
            text-white placeholder-zinc-500 resize-none text-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-zinc-500 mt-1">
          Наприклад: blurry, ugly, deformed
        </p>
      </div>
    </div>
  );
}

export default ImageSettings;
