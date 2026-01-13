'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Download, Play, Clock, Maximize } from 'lucide-react';

interface VideoPageProps {
  params: { locale: string };
}

export default function VideoPage({ params: { locale } }: VideoPageProps) {
  const t = useTranslations('Video');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('veo');
  const [duration, setDuration] = useState('5');
  const [resolution, setResolution] = useState('1080p');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);

  const models = [
    { value: 'veo', label: t('models.veo') },
    { value: 'sora2', label: t('models.sora2') },
    { value: 'kling', label: t('models.kling') },
    { value: 'pixverse', label: t('models.pixverse') },
    { value: 'minimax', label: t('models.minimax') },
    { value: 'wan', label: t('models.wan') },
    { value: 'runway', label: t('models.runway') },
    { value: 'luma', label: t('models.luma') },
  ];

  const durations = [
    { value: '3', label: '3s' },
    { value: '5', label: '5s' },
    { value: '10', label: '10s' },
    { value: '15', label: '15s' },
  ];

  const resolutions = [
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '4k', label: '4K UHD' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, duration, resolution })
      });

      const data = await response.json();
      if (data.video) {
        setGeneratedVideos(prev => [data.video, ...prev]);
      }
    } catch (error) {
      console.error('Video generation error:', error);
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
              <Video className="h-5 w-5 text-blue-400" />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {t('duration')}
                </label>
                <Select
                  options={durations}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Maximize className="h-4 w-4 inline mr-1" />
                  {t('resolution')}
                </label>
                <Select
                  options={resolutions}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>
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
              {!isLoading && <Video className="h-4 w-4 mr-2" />}
              {t('generate')}
            </Button>

            {/* Model Info */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-sm font-medium text-blue-400 mb-2">
                {locale === 'uk' ? 'Підтримувані моделі:' : 'Supported models:'}
              </h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Google Veo - {locale === 'uk' ? 'реалістичні відео' : 'realistic videos'}</li>
                <li>• Sora 2 - {locale === 'uk' ? 'від OpenAI' : 'from OpenAI'}</li>
                <li>• Kling - {locale === 'uk' ? 'китайський аналог' : 'Chinese alternative'}</li>
                <li>• PixVerse - {locale === 'uk' ? 'стилізовані відео' : 'stylized videos'}</li>
                <li>• Minimax - {locale === 'uk' ? 'швидка генерація' : 'fast generation'}</li>
                <li>• Wan - {locale === 'uk' ? 'аніме стиль' : 'anime style'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {locale === 'uk' ? 'Згенеровані відео' : 'Generated videos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedVideos.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <Video className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-slate-400">
                  {locale === 'uk' 
                    ? 'Згенеровані відео з\'являться тут'
                    : 'Generated videos will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {generatedVideos.map((video, index) => (
                  <div key={index} className="group relative rounded-xl overflow-hidden bg-slate-800">
                    <video
                      src={video}
                      controls
                      className="w-full aspect-video"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
