'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Rocket, 
  MessageSquare, 
  Image, 
  Video, 
  Wand2, 
  Code 
} from 'lucide-react';

interface DocsPageProps {
  params: Promise<{ locale: string }>;
}

export default function DocsPage({ params }: DocsPageProps) {
  const { locale } = React.use(params);
  const t = useTranslations('Docs');

  const sections = [
    { 
      key: 'getting-started', 
      icon: Rocket,
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      key: 'chat', 
      icon: MessageSquare,
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      key: 'images', 
      icon: Image,
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      key: 'video', 
      icon: Video,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      key: 'animate', 
      icon: Wand2,
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      key: 'api', 
      icon: Code,
      gradient: 'from-indigo-500 to-blue-500'
    },
  ];

  return (
    <MainLayout locale={locale}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-lg text-slate-400">{t('subtitle')}</p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Card 
              key={section.key} 
              className="group hover:border-violet-500/50 transition-all duration-300 cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="group-hover:text-violet-400 transition-colors">
                  {t(`sections.${section.key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  {t(`sections.${section.key}.content`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            {locale === 'uk' ? 'Потрібна допомога?' : 'Need help?'}
          </h2>
          <p className="text-slate-400 mb-4">
            {locale === 'uk' 
              ? 'Зв\'яжіться з нашою підтримкою через Telegram або email для швидкої відповіді.'
              : 'Contact our support via Telegram or email for a quick response.'
            }
          </p>
          <div className="flex gap-4">
            <a 
              href="https://t.me/support" 
              className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              Telegram
            </a>
            <a 
              href="mailto:support@example.com"
              className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}



