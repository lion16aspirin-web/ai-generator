'use client';

import React, { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSidebar } from '@/components/chat/ChatSidebar';

interface ChatPageProps {
  params: Promise<{ locale: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { locale } = React.use(params);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = useCallback(() => {
    setSelectedChatId(null);
    setChatKey(prev => prev + 1);
  }, []);

  const handleSelectChat = useCallback((chatId: string | null) => {
    setSelectedChatId(chatId);
    setChatKey(prev => prev + 1);
  }, []);

  const handleChatCreated = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  return (
    <MainLayout locale={locale}>
      <div className="flex h-[calc(100vh-4rem)]">
        <ChatSidebar
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 min-w-0">
          <ChatInterface
            key={chatKey}
            initialModel="gpt-4o"
            chatId={selectedChatId}
            onChatCreated={handleChatCreated}
          />
        </div>
      </div>
    </MainLayout>
  );
}
