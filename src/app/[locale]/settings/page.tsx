'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Palette,
  Save,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsPageProps {
  params: { locale: string };
}

export default function SettingsPage({ params: { locale } }: SettingsPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <MainLayout locale={locale}>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">
          {locale === 'uk' ? 'Налаштування' : 'Settings'}
        </h1>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-violet-400" />
              {locale === 'uk' ? 'Профіль' : 'Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {locale === 'uk' ? 'Ім\'я' : 'Name'}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={locale === 'uk' ? 'Ваше ім\'я' : 'Your name'}
                  icon={<User className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              {locale === 'uk' ? 'Зберегти' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-400" />
              {locale === 'uk' ? 'Безпека' : 'Security'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {locale === 'uk' ? 'Новий пароль' : 'New password'}
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {locale === 'uk' ? 'Підтвердіть пароль' : 'Confirm password'}
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
              />
            </div>
            <Button variant="outline">
              {locale === 'uk' ? 'Змінити пароль' : 'Change password'}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-400" />
              {locale === 'uk' ? 'Налаштування' : 'Preferences'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-white">
                    {locale === 'uk' ? 'Сповіщення' : 'Notifications'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {locale === 'uk' ? 'Email про нові функції' : 'Email about new features'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-violet-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-slate-400" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-400" />
                )}
                <div>
                  <p className="font-medium text-white">
                    {locale === 'uk' ? 'Тема' : 'Theme'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {theme === 'dark' 
                      ? (locale === 'uk' ? 'Темна' : 'Dark')
                      : (locale === 'uk' ? 'Світла' : 'Light')
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'light' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-white">
                    {locale === 'uk' ? 'Мова' : 'Language'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {locale === 'uk' ? 'Українська' : 'English'}
                  </p>
                </div>
              </div>
              <a
                href={locale === 'uk' ? '/en/settings' : '/uk/settings'}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                {locale === 'uk' ? 'EN' : 'UK'}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">
              {locale === 'uk' ? 'Небезпечна зона' : 'Danger Zone'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              {locale === 'uk' 
                ? 'Видалення акаунту є незворотнім. Всі ваші дані будуть втрачені.'
                : 'Account deletion is irreversible. All your data will be lost.'
              }
            </p>
            <Button variant="destructive">
              {locale === 'uk' ? 'Видалити акаунт' : 'Delete account'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}



