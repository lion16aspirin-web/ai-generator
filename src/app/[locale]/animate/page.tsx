'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PhotoAnimator } from '@/components/animation';

interface AnimatePageProps {
  params: Promise<{ locale: string }>;
}

export default function AnimatePage({ params }: AnimatePageProps) {
  const { locale } = React.use(params);

  return (
    <MainLayout locale={locale}>
      <div className="h-[calc(100vh-8rem)]">
        <PhotoAnimator />
      </div>
    </MainLayout>
  );
}
