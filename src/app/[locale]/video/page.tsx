'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VideoGenerator } from '@/components/video';

interface VideoPageProps {
  params: Promise<{ locale: string }>;
}

export default function VideoPage({ params }: VideoPageProps) {
  const { locale } = React.use(params);

  return (
    <MainLayout locale={locale}>
      <div className="h-[calc(100vh-8rem)]">
        <VideoGenerator />
      </div>
    </MainLayout>
  );
}
