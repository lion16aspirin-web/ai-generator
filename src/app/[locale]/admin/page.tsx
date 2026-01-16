'use client';

import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import { ModelStatusDashboard } from '@/components/admin/ModelStatusDashboard';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

interface ApiKeyConfig {
  id: string;
  service: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'testing';
}

const SERVICES = [
  { value: 'openai', label: 'OpenAI (GPT, DALL-E, Sora)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google AI (Gemini, Veo)' },
  { value: 'replicate', label: 'Replicate (Flux, SD)' },
  { value: 'runway', label: 'Runway' },
  { value: 'luma', label: 'Luma Dream Machine' },
  { value: 'kling', label: 'Kling' },
  { value: 'pixverse', label: 'PixVerse' },
  { value: 'minimax', label: 'Minimax' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'serper', label: 'Serper (Web Search)' },
];

export default function AdminPage({ params }: AdminPageProps) {
  const { locale } = React.use(params);
  const t = useTranslations('Admin');
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([
    { id: '1', service: 'openai', name: 'Main OpenAI Key', key: 'sk-...hidden', status: 'active' },
    { id: '2', service: 'anthropic', name: 'Claude API', key: 'sk-ant-...hidden', status: 'active' },
  ]);
  const [newKey, setNewKey] = useState({ service: '', name: '', key: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleAddKey = () => {
    if (!newKey.service || !newKey.name || !newKey.key) return;
    
    setApiKeys(prev => [...prev, {
      id: Date.now().toString(),
      ...newKey,
      status: 'inactive'
    }]);
    setNewKey({ service: '', name: '', key: '' });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const handleTestKey = async (id: string) => {
    setTestingId(id);
    // Simulate API test
    setTimeout(() => {
      setApiKeys(prev => prev.map(k => 
        k.id === id ? { ...k, status: 'active' } : k
      ));
      setTestingId(null);
    }, 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
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
                />
                <Input
                  placeholder={t('apiKeys.name')}
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="password"
                  placeholder={t('apiKeys.key')}
                  value={newKey.key}
                  onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                />
                <Button onClick={handleAddKey}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('apiKeys.save')}
                </Button>
              </div>
            </div>

            {/* Keys List */}
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="p-4 rounded-xl bg-slate-800/30 border border-slate-700 flex items-center gap-4"
                >
                  <div className="flex-1 grid gap-4 md:grid-cols-4 items-center">
                    <div>
                      <p className="text-sm font-medium text-white">{apiKey.name}</p>
                      <p className="text-xs text-slate-400">
                        {SERVICES.find(s => s.value === apiKey.service)?.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showKeys[apiKey.id] ? 'text' : 'password'}
                        value={apiKey.key}
                        readOnly
                        className="text-xs"
                      />
                      <button
                        onClick={() => toggleShowKey(apiKey.id)}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiKey.status === 'active' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                          {t('apiKeys.active')}
                        </span>
                      )}
                      {apiKey.status === 'inactive' && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <XCircle className="h-4 w-4" />
                          {t('apiKeys.inactive')}
                        </span>
                      )}
                      {apiKey.status === 'testing' && (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Testing...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestKey(apiKey.id)}
                        disabled={testingId === apiKey.id}
                      >
                        {testingId === apiKey.id ? (
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
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
