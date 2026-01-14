'use client';

/**
 * AnimationPreview - Перегляд анімованого фото
 */

import React from 'react';

interface AnimationPreviewProps {
  url: string;
}

export function AnimationPreview({ url }: AnimationPreviewProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `animation-${Date.now()}.mp4`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Success badge */}
      <div className="mb-4 px-4 py-2 rounded-full bg-emerald-900/50 border border-emerald-700">
        <span className="text-emerald-400">✨ Анімація готова!</span>
      </div>

      {/* Video preview */}
      <div className="max-w-lg w-full rounded-xl overflow-hidden bg-black">
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full"
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleDownload}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 
            text-white font-medium transition-colors flex items-center gap-2"
        >
          ⬇️ Завантажити
        </button>
        
        <button
          onClick={() => window.open(url, '_blank')}
          className="px-6 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 
            text-white font-medium transition-colors"
        >
          🔗 Відкрити
        </button>
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        Файл доступний протягом 24 годин
      </p>
    </div>
  );
}

export default AnimationPreview;
