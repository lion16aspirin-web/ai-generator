'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Image,
  Video,
  Sparkles,
  CreditCard,
  Settings,
  LogOut,
  Home,
  FileText,
  Wand2
} from 'lucide-react';

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const navigation = [
    { name: t('home'), href: `/${locale}`, icon: Home },
    { name: t('chat'), href: `/${locale}/chat`, icon: MessageSquare },
    { name: t('images'), href: `/${locale}/images`, icon: Image },
    { name: t('video'), href: `/${locale}/video`, icon: Video },
    { name: t('animate'), href: `/${locale}/animate`, icon: Wand2 },
    { name: t('pricing'), href: `/${locale}/pricing`, icon: CreditCard },
    { name: t('docs'), href: `/${locale}/docs`, icon: FileText },
  ];

  const bottomNav = [
    { name: t('settings'), href: `/${locale}/settings`, icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          AI Generator
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col h-[calc(100vh-4rem)] justify-between p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white border border-violet-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-violet-400')} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-800/50">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
            <LogOut className="h-5 w-5" />
            {t('logout')}
          </button>
        </div>
      </nav>
    </aside>
  );
}




