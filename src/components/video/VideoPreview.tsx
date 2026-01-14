'use client';

/**
 * VideoPreview - Перегляд згенерованого відео
 */

import React, { useRef, useState } from 'react';

interface VideoPreviewProps {
  url: string;
}

export function VideoPreview({ url }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `video-${Date.now()}.mp4`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Success message */}
      <div className="mb-4 px-4 py-2 rounded-full bg-emerald-900/50 border border-emerald-700">
        <span className="text-emerald-400">✅ Відео готове!</span>
      </div>

      {/* Video player */}
      <div className="relative max-w-3xl w-full rounded-xl overflow-hidden bg-black group">
        <video
          ref={videoRef}
          src={url}
          className="w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          controls
        />

        {/* Custom overlay (shown when not playing) */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center
              bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm
              flex items-center justify-center text-4xl
              hover:bg-white/30 transition-colors">
              ▶️
            </div>
          </div>
        )}
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
            text-white font-medium transition-colors flex items-center gap-2"
        >
          🔗 Відкрити в новій вкладці
        </button>
      </div>

      {/* Info */}
      <p className="mt-4 text-sm text-zinc-500">
        Відео буде доступне протягом 24 годин
      </p>
    </div>
  );
}

export default VideoPreview;
