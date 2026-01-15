'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PhotoAnimator } from '@/components/animation';
import { PageMetadata } from '@/components/seo/PageMetadata';

interface AnimatePageProps {
  params: Promise<{ locale: string }>;
}

export default function AnimatePage({ params }: AnimatePageProps) {
  const { locale } = React.use(params);

  return (
    <MainLayout locale={locale}>
      <PageMetadata 
        title={locale === 'uk' ? 'Анімація фото' : 'Photo Animation'}
        description={locale === 'uk' 
          ? 'Оживляй фото та портрети за допомогою AI. Створюй динамічні анімації зі статичних зображень.'
          : 'Animate photos and portraits with AI. Create dynamic animations from static images.'
        }
        path={`/${locale}/animate`}
      />
      <div className="h-[calc(100vh-8rem)]">
        <PhotoAnimator />
      </div>
    </MainLayout>
  );
}
