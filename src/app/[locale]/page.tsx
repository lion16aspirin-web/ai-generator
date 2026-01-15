'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageMetadata } from '@/components/seo/PageMetadata';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Image, 
  Video, 
  Wand2,
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = React.use(params);
  const t = useTranslations('Home');

  const features = [
    {
      key: 'chat',
      icon: MessageSquare,
      href: `/${locale}/chat`,
      gradient: 'from-violet-500 to-purple-500',
      shadow: 'shadow-violet-500/25'
    },
    {
      key: 'images',
      icon: Image,
      href: `/${locale}/images`,
      gradient: 'from-pink-500 to-rose-500',
      shadow: 'shadow-pink-500/25'
    },
    {
      key: 'video',
      icon: Video,
      href: `/${locale}/video`,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25'
    },
    {
      key: 'animate',
      icon: Wand2,
      href: `/${locale}/animate`,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/25'
    },
  ];

  return (
    <MainLayout locale={locale}>
      <PageMetadata 
        title={locale === 'uk' ? 'Головна' : 'Home'}
        description={locale === 'uk' 
          ? 'AI Generator - платформа для генерації тексту, зображень, відео та анімацій. GPT-5, Claude, Gemini, Sora, DALL-E 3.'
          : 'AI Generator - platform for generating text, images, videos and animations. GPT-5, Claude, Gemini, Sora, DALL-E 3.'
        }
        path={`/${locale}`}
      />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm text-violet-400">AI Generator 2.0</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('title')}
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/register`}>
              <Button variant="glow" size="xl">
                {t('getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/pricing`}>
              <Button variant="outline" size="xl">
                {locale === 'uk' ? 'Переглянути тарифи' : 'View pricing'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.key} href={feature.href}>
              <Card className="group h-full hover:border-violet-500/50 transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 text-center">
            <div className="text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-slate-400">{locale === 'uk' ? 'AI моделей' : 'AI models'}</div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 text-center">
            <div className="text-4xl font-bold text-white mb-2">1M+</div>
            <div className="text-slate-400">{locale === 'uk' ? 'Генерацій' : 'Generations'}</div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 text-center">
            <div className="text-4xl font-bold text-white mb-2">10k+</div>
            <div className="text-slate-400">{locale === 'uk' ? 'Користувачів' : 'Users'}</div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {locale === 'uk' ? 'Блискавична швидкість' : 'Lightning fast'}
              </h3>
              <p className="text-slate-400 text-sm">
                {locale === 'uk' 
                  ? 'Отримуйте результати за секунди завдяки оптимізованій інфраструктурі'
                  : 'Get results in seconds thanks to optimized infrastructure'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {locale === 'uk' ? 'Найкращі моделі' : 'Best models'}
              </h3>
              <p className="text-slate-400 text-sm">
                {locale === 'uk' 
                  ? 'Доступ до GPT-5, Claude 3, Sora 2, DALL-E 3 та інших топових моделей'
                  : 'Access to GPT-5, Claude 3, Sora 2, DALL-E 3 and other top models'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {locale === 'uk' ? 'Безпека даних' : 'Data security'}
              </h3>
              <p className="text-slate-400 text-sm">
                {locale === 'uk' 
                  ? 'Ваші дані захищені та не використовуються для навчання моделей'
                  : 'Your data is protected and not used for model training'
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
