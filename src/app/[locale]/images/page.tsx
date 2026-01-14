'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ImageGenerator } from '@/components/image';

interface ImagesPageProps {
  params: Promise<{ locale: string }>;
}

export default function ImagesPage({ params }: ImagesPageProps) {
  const { locale } = React.use(params);

  return (
    <MainLayout locale={locale}>
      <div className="h-[calc(100vh-8rem)]">
        <ImageGenerator />
      </div>
    </MainLayout>
  );
}
