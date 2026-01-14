'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatInterface } from '@/components/chat';

interface ChatPageProps {
  params: Promise<{ locale: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { locale } = React.use(params);

  return (
    <MainLayout locale={locale}>
      <div className="h-[calc(100vh-8rem)]">
        <ChatInterface initialModel="gpt-5.1" />
      </div>
    </MainLayout>
  );
}
