'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Zap, Crown, Infinity } from 'lucide-react';

interface PricingPageProps {
  params: Promise<{ locale: string }>;
}

export default function PricingPage({ params }: PricingPageProps) {
  const { locale } = React.use(params);
  const t = useTranslations('Pricing');

  const plans = [
    {
      key: 'free',
      icon: Sparkles,
      gradient: 'from-slate-500 to-slate-600',
      popular: false
    },
    {
      key: 'starter',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      popular: false
    },
    {
      key: 'pro',
      icon: Crown,
      gradient: 'from-violet-500 to-purple-500',
      popular: true
    },
    {
      key: 'unlimited',
      icon: Infinity,
      gradient: 'from-amber-500 to-orange-500',
      popular: false
    },
  ];

  return (
    <MainLayout locale={locale}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-lg text-slate-400">{t('subtitle')}</p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card 
              key={plan.key}
              className={`relative ${plan.popular ? 'border-violet-500 ring-2 ring-violet-500/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-xs font-medium text-white">
                  {t('popular')}
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                  <plan.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">
                  {t(`plans.${plan.key}.name`)}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    ${t(`plans.${plan.key}.price`)}
                  </span>
                  <span className="text-slate-400">{t('perMonth')}</span>
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {t(`plans.${plan.key}.tokens`)} {t('tokens')}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {(t.raw(`plans.${plan.key}.features`) as string[]).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'glow' : 'default'}
                >
                  {t('subscribe')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-white mb-6">
            {locale === 'uk' ? 'Способи оплати' : 'Payment methods'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-300">💳 {locale === 'uk' ? 'Картки' : 'Cards'}</span>
            </div>
            <div className="px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-300">₿ Crypto</span>
            </div>
            <div className="px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-300">⭐ Telegram Stars</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            {locale === 'uk' ? 'Часті питання' : 'FAQ'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <h3 className="font-semibold text-white mb-2">
                {locale === 'uk' ? 'Що таке токени?' : 'What are tokens?'}
              </h3>
              <p className="text-sm text-slate-400">
                {locale === 'uk' 
                  ? 'Токени - це внутрішня валюта для оплати генерацій. Різні моделі витрачають різну кількість токенів.'
                  : 'Tokens are internal currency for paying for generations. Different models consume different amounts of tokens.'
                }
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <h3 className="font-semibold text-white mb-2">
                {locale === 'uk' ? 'Чи можна скасувати підписку?' : 'Can I cancel subscription?'}
              </h3>
              <p className="text-sm text-slate-400">
                {locale === 'uk' 
                  ? 'Так, ви можете скасувати підписку в будь-який момент. Токени залишаться до кінця періоду.'
                  : 'Yes, you can cancel subscription at any time. Tokens will remain until the end of the period.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
