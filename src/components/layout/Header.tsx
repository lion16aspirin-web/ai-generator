'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Coins, 
  Globe,
  Bell,
  Search
} from 'lucide-react';

interface HeaderProps {
  locale: string;
  tokens?: number;
}

export function Header({ locale, tokens = 0 }: HeaderProps) {
  const t = useTranslations('Header');
  const pathname = usePathname();
  
  const otherLocale = locale === 'uk' ? 'en' : 'uk';
  const newPathname = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder={t('search')}
            className="w-full h-10 rounded-xl bg-slate-800/50 border border-slate-700 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Tokens */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              {tokens.toLocaleString()} {t('tokens')}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-500" />
          </button>

          {/* Language Switcher */}
          <Link
            href={newPathname}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium uppercase">{otherLocale}</span>
          </Link>

          {/* User */}
          <Link href={`/${locale}/login`}>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              {t('login')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}


