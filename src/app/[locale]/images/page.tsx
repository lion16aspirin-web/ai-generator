'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ImageGenerator } from '@/components/image';
import { PageMetadata } from '@/components/seo/PageMetadata';

interface ImagesPageProps {
  params: Promise<{ locale: string }>;
}

export default function ImagesPage({ params }: ImagesPageProps) {
  const { locale } = React.use(params);

  return (
    <MainLayout locale={locale}>
      <PageMetadata 
        title={locale === 'uk' ? 'Генерація зображень' : 'Image Generation'}
        description={locale === 'uk' 
          ? 'Створюй унікальні зображення за допомогою DALL-E 3, FLUX, Midjourney, Ideogram та інших AI моделей.'
          : 'Create unique images with DALL-E 3, FLUX, Midjourney, Ideogram and other AI models.'
        }
        path={`/${locale}/images`}
      />
      <div className="h-[calc(100vh-8rem)]">
        <ImageGenerator />
      </div>
    </MainLayout>
  );
}
