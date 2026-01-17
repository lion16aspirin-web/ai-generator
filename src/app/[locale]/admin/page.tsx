'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Key, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Users,
  Zap,
  Coins,
  DollarSign,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { ModelStatusDashboard } from '@/components/admin/ModelStatusDashboard';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

interface ApiKeyConfig {
  id: string;
  service: string;
  name: string;
  key?: string; // Не показуємо реальний ключ
  status: 'active' | 'inactive' | 'testing';
  createdAt?: string;
  updatedAt?: string;
}

const SERVICES = [
  { value: 'openai', label: 'OpenAI (GPT, DALL-E, Sora)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google AI (Gemini, Veo, Imagen)' },
  { value: 'replicate', label: 'Replicate (FLUX, Midjourney, Kling, PixVerse)' },
  { value: 'dalle', label: 'DALL-E (OpenAI Images)' },
  { value: 'sora', label: 'Sora (OpenAI Video)' },
  { value: 'veo', label: 'Veo (Google Video)' },
  { value: 'ideogram', label: 'Ideogram (Images with text)' },
  { value: 'recraft', label: 'Recraft (Illustrations)' },
  { value: 'xai', label: 'xAI (Grok)' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'runway', label: 'Runway' },
  { value: 'luma', label: 'Luma Dream Machine' },
  { value: 'kling', label: 'Kling' },
  { value: 'pixverse', label: 'PixVerse' },
  { value: 'minimax', label: 'Minimax' },
  { value: 'wan', label: 'Wan 2.0' },
  { value: 'flux', label: 'FLUX (Replicate)' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'stable-diffusion', label: 'Stable Diffusion' },
  { value: 'kandinsky', label: 'Kandinsky' },
  { value: 'serper', label: 'Serper (Web Search)' },
];

export default function AdminPage({ params }: AdminPageProps) {
  const { locale } = React.use(params);
  const t = useTranslations('Admin');
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [newKey, setNewKey] = useState({ service: '', name: '', key: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Завантаження ключів з сервера
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/api-keys');
      
      if (!response.ok) {
        throw new Error('Failed to load API keys');
      }

      const data = await response.json();
      setApiKeys(data.apiKeys.map((k: any) => ({
        ...k,
        key: '••••••••••••••••', // Приховуємо ключ
        status: 'active' as const,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to load API keys');
      console.error('Load API keys error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKey.service || !newKey.name || !newKey.key) {
      setError('Please fill all fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save API key');
      }

      // Оновлюємо список
      await loadApiKeys();
      setNewKey({ service: '', name: '', key: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to save API key');
      console.error('Save API key error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (service: string) => {
    if (!confirm(locale === 'uk' 
      ? 'Ви впевнені, що хочете видалити цей API ключ?'
      : 'Are you sure you want to delete this API key?'
    )) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/admin/api-keys?service=${service}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete API key');
      }

      // Оновлюємо список
      await loadApiKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to delete API key');
      console.error('Delete API key error:', err);
    }
  };

  const handleTestKey = async (service: string) => {
    try {
      setTestingId(service);
      setError(null);

      // Тестуємо ключ з БД (не передаємо key, сервер сам отримає)
      const response = await fetch('/api/admin/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to test API key');
      }

      const data = await response.json();
      
      if (data.valid) {
        setError(null);
        alert(locale === 'uk' 
          ? '✅ API ключ валідний і працює!'
          : '✅ API key is valid and working!'
        );
      } else {
        setError(locale === 'uk' 
          ? '❌ API ключ невалідний або не працює'
          : '❌ API key is invalid or not working'
        );
      }
    } catch (err: any) {
      setError(err.message || (locale === 'uk' 
        ? 'Помилка при тестуванні ключа'
        : 'Error testing key'
      ));
      console.error('Test API key error:', err);
    } finally {
      setTestingId(null);
    }
  };

  const stats = [
    { label: t('stats.users'), value: '1,234', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: t('stats.generations'), value: '45,678', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: t('stats.tokens'), value: '2.5M', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: t('stats.revenue'), value: '$12,345', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <MainLayout locale={locale}>
      <div className="h-full overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Models Status Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Статус підключень до нейромереж</CardTitle>
          </CardHeader>
          <CardContent>
            <ModelStatusDashboard />
          </CardContent>
        </Card>

        {/* API Keys Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-violet-400" />
              {t('apiKeys.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Add New Key */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('apiKeys.add')}
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                <Select
                  options={SERVICES}
                  value={newKey.service}
                  onChange={(e) => setNewKey(prev => ({ ...prev, service: e.target.value }))}
                  placeholder={t('apiKeys.service')}
                  disabled={saving}
                />
                <Input
                  placeholder={t('apiKeys.name')}
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  disabled={saving}
                />
                <Input
                  type="password"
                  placeholder={t('apiKeys.key')}
                  value={newKey.key}
                  onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                  disabled={saving}
                />
                <Button onClick={handleAddKey} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {locale === 'uk' ? 'Збереження...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('apiKeys.save')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Keys List */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                  <span className="ml-2 text-slate-400">
                    {locale === 'uk' ? 'Завантаження ключів...' : 'Loading keys...'}
                  </span>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {locale === 'uk' 
                    ? 'Немає збережених API ключів. Додайте перший ключ вище.'
                    : 'No API keys saved. Add your first key above.'
                  }
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="p-4 rounded-xl bg-slate-800/30 border border-slate-700 flex items-center gap-4"
                  >
                    <div className="flex-1 grid gap-4 md:grid-cols-4 items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{apiKey.name}</p>
                        <p className="text-xs text-slate-400">
                          {SERVICES.find(s => s.value === apiKey.service)?.label || apiKey.service}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="password"
                          value={apiKey.key || '••••••••••••••••'}
                          readOnly
                          className="text-xs"
                        />
                        <span className="text-xs text-slate-500">
                          {locale === 'uk' ? 'Зашифровано' : 'Encrypted'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                          {t('apiKeys.active')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestKey(apiKey.service)}
                          disabled={testingId === apiKey.service}
                        >
                          {testingId === apiKey.service ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              {t('apiKeys.test')}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(apiKey.service)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-sm text-violet-300">
                {locale === 'uk' 
                  ? '💡 API ключі зберігаються у зашифрованому вигляді. Клієнти автоматично використовують підключені сервіси.'
                  : '💡 API keys are stored encrypted. Clients automatically use connected services.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </MainLayout>
  );
}
