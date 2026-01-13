'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Upload, Download, Play, ImageIcon, X } from 'lucide-react';

interface AnimatePageProps {
  params: { locale: string };
}

export default function AnimatePage({ params: { locale } }: AnimatePageProps) {
  const t = useTranslations('Animate');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('runway');
  const [isLoading, setIsLoading] = useState(false);
  const [animatedVideo, setAnimatedVideo] = useState<string | null>(null);

  const models = [
    { value: 'runway', label: t('models.runway') },
    { value: 'luma', label: t('models.luma') },
    { value: 'kling', label: t('models.kling') },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnimate = async () => {
    if (!selectedImage || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage, prompt, model })
      });

      const data = await response.json();
      if (data.video) {
        setAnimatedVideo(data.video);
      }
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout locale={locale}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-slate-400">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-amber-400" />
                {t('upload')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  selectedImage 
                    ? 'border-amber-500/50 bg-amber-500/5' 
                    : 'border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                        setAnimatedVideo(null);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-amber-400" />
                    </div>
                    <p className="text-slate-400 mb-1">{t('uploadHint')}</p>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP</p>
                  </>
                )}
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('selectModel')}
                </label>
                <Select
                  options={models}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              {/* Motion Prompt */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('prompt')}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('promptPlaceholder')}
                  className="min-h-[100px]"
                />
              </div>

              {/* Animate Button */}
              <Button
                onClick={handleAnimate}
                disabled={!selectedImage || isLoading}
                className="w-full"
                variant="glow"
                isLoading={isLoading}
              >
                {!isLoading && <Wand2 className="h-4 w-4 mr-2" />}
                {t('animate')}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-emerald-400" />
                {locale === 'uk' ? 'Результат' : 'Result'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {animatedVideo ? (
                <div className="space-y-4">
                  <video
                    src={animatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full rounded-xl"
                  />
                  <Button variant="secondary" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    {locale === 'uk' ? 'Завантажити відео' : 'Download video'}
                  </Button>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                    <Wand2 className="h-10 w-10 text-emerald-400" />
                  </div>
                  <p className="text-slate-400">
                    {locale === 'uk' 
                      ? 'Оживлене відео з\'явиться тут'
                      : 'Animated video will appear here'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Model Info Cards */}
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
            <h3 className="font-semibold text-white mb-2">Runway Gen-3</h3>
            <p className="text-sm text-slate-400">
              {locale === 'uk' 
                ? 'Найпопулярніший інструмент для анімації фото з високою якістю'
                : 'Most popular tool for photo animation with high quality'
              }
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <h3 className="font-semibold text-white mb-2">Luma Dream Machine</h3>
            <p className="text-sm text-slate-400">
              {locale === 'uk' 
                ? 'Швидка генерація з реалістичними рухами та деталями'
                : 'Fast generation with realistic movements and details'
              }
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <h3 className="font-semibold text-white mb-2">Kling</h3>
            <p className="text-sm text-slate-400">
              {locale === 'uk' 
                ? 'Китайська модель з унікальним стилем анімації'
                : 'Chinese model with unique animation style'
              }
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
