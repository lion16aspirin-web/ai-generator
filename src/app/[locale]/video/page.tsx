'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VideoGenerator } from '@/components/video';
import { PageMetadata } from '@/components/seo/PageMetadata';

interface VideoPageProps {
  params: Promise<{ locale: string }>;
}

export default function VideoPage({ params }: VideoPageProps) {
  const { locale } = React.use(params);

  return (
    <MainLayout locale={locale}>
      <PageMetadata 
        title={locale === 'uk' ? 'Генерація відео' : 'Video Generation'}
        description={locale === 'uk' 
          ? 'Створюй відео за допомогою Sora 2, Veo 3.1, Kling та інших AI моделей. Високоякісні результати за секунди.'
          : 'Create videos with Sora 2, Veo 3.1, Kling and other AI models. High-quality results in seconds.'
        }
        path={`/${locale}/video`}
      />
      <div className="h-[calc(100vh-8rem)]">
        <VideoGenerator />
      </div>
    </MainLayout>
  );
}
