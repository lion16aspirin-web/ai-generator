'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Download, Loader2, ImageIcon } from 'lucide-react';

interface ImagesPageProps {
  params: Promise<{ locale: string }>;
}

export default function ImagesPage({ params }: ImagesPageProps) {
  const { locale } = React.use(params);
  const t = useTranslations('Images');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dalle3');
  const [size, setSize] = useState('1024x1024');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const models = [
    { value: 'dalle3', label: t('models.dalle3') },
    { value: 'midjourney6', label: t('models.midjourney6') },
    { value: 'sdxl', label: t('models.sdxl') },
    { value: 'kandinsky3', label: t('models.kandinsky3') },
    { value: 'flux', label: t('models.flux') },
  ];

  const sizes = [
    { value: '512x512', label: '512×512' },
    { value: '1024x1024', label: '1024×1024' },
    { value: '1024x1792', label: '1024×1792 (Portrait)' },
    { value: '1792x1024', label: '1792×1024 (Landscape)' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, size })
      });

      const data = await response.json();
      if (data.images) {
        setGeneratedImages(prev => [...data.images, ...prev]);
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout locale={locale}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-violet-400" />
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('size')}
              </label>
              <Select
                options={sizes}
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('prompt')}
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('placeholder')}
                className="min-h-[120px]"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full"
              isLoading={isLoading}
            >
              {!isLoading && <Wand2 className="h-4 w-4 mr-2" />}
              {t('generate')}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {locale === 'uk' ? 'Результати' : 'Results'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedImages.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-4">
                  <ImageIcon className="h-10 w-10 text-pink-400" />
                </div>
                <p className="text-slate-400">
                  {locale === 'uk' 
                    ? 'Згенеровані зображення з\'являться тут'
                    : 'Generated images will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {generatedImages.map((image, index) => (
                  <div key={index} className="group relative rounded-xl overflow-hidden">
                    <img
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {locale === 'uk' ? 'Завантажити' : 'Download'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
