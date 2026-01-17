'use client';

/**
 * ModelStatusDashboard - Дашборд статусу моделей
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Brain,
  Image as ImageIcon,
  Video,
  Sparkles,
  Activity,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ModelStatus {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'image' | 'video' | 'animation';
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  error?: string;
  lastChecked?: string;
}

interface ModelsStatusResponse {
  models: ModelStatus[];
  byProvider: Record<string, ModelStatus[]>;
  stats: {
    total: number;
    connected: number;
    disconnected: number;
    error: number;
    byType: {
      text: number;
      image: number;
      video: number;
      animation: number;
    };
    byProvider: Record<string, {
      total: number;
      connected: number;
      disconnected: number;
    }>;
  };
  timestamp: string;
}

const TYPE_ICONS = {
  text: Brain,
  image: ImageIcon,
  video: Video,
  animation: Sparkles,
};

const TYPE_COLORS = {
  text: 'text-blue-400',
  image: 'text-purple-400',
  video: 'text-red-400',
  animation: 'text-pink-400',
};

const STATUS_COLORS = {
  connected: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  disconnected: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  testing: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
};

// Посилання на отримання API ключів
const API_KEY_LINKS: Record<string, { url: string; label: string }> = {
  openai: { url: 'https://platform.openai.com/api-keys', label: 'OpenAI API Keys' },
  anthropic: { url: 'https://console.anthropic.com/settings/keys', label: 'Anthropic Console' },
  google: { url: 'https://makersuite.google.com/app/apikey', label: 'Google AI Studio' },
  replicate: { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  dalle: { url: 'https://platform.openai.com/api-keys', label: 'OpenAI API Keys' },
  sora: { url: 'https://platform.openai.com/api-keys', label: 'OpenAI API Keys' },
  veo: { url: 'https://makersuite.google.com/app/apikey', label: 'Google AI Studio' },
  ideogram: { url: 'https://ideogram.ai/api', label: 'Ideogram API' },
  recraft: { url: 'https://recraft.ai/api', label: 'Recraft API' },
  runway: { url: 'https://runwayml.com/api', label: 'Runway API' },
  luma: { url: 'https://lumalabs.ai/api', label: 'Luma API' },
  kling: { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  pixverse: { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  minimax: { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  wan: { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  flux: { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  midjourney: { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  'stable-diffusion': { url: 'https://replicate.com/account/api-tokens', label: 'Replicate API Tokens' },
  kandinsky: { url: 'https://kandinsky.ai/api', label: 'Kandinsky API' },
  serper: { url: 'https://serper.dev/api-key', label: 'Serper API Key' },
  deepseek: { url: 'https://platform.deepseek.com/api_keys', label: 'DeepSeek API Keys' },
  xai: { url: 'https://console.x.ai/api-keys', label: 'xAI Console' },
  moonshot: { url: 'https://platform.moonshot.cn/api-keys', label: 'Moonshot API Keys' },
};

export function ModelStatusDashboard() {
  const [data, setData] = useState<ModelsStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/models/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching models status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Завантаження статусу моделей...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            Помилка завантаження статусу моделей
          </div>
        </CardContent>
      </Card>
    );
  }

  const { models, byProvider, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header з кнопкою оновлення */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-400" />
            Статус підключень до нейромереж
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Останнє оновлення: {new Date(data.timestamp).toLocaleString('uk-UA')}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Оновити
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Brain className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Всього моделей</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.connected}</p>
                <p className="text-xs text-slate-400">Підключено</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-500/10">
                <XCircle className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.disconnected}</p>
                <p className="text-xs text-slate-400">Не підключено</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.error}</p>
                <p className="text-xs text-slate-400">Помилки</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статус по провайдерах */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Статус по провайдерах</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(byProvider).map(([provider, providerModels]) => {
            const providerStats = stats.byProvider[provider];
            const isConnected = providerStats.connected > 0;
            
            return (
              <Card key={provider} className={isConnected ? 'border-emerald-500/30' : 'border-slate-700'}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="capitalize">{provider}</span>
                    {isConnected ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Підключено:</span>
                      <span className="text-white font-medium">
                        {providerStats.connected} / {providerStats.total}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${(providerStats.connected / providerStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Детальний список моделей */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Детальний статус моделей</h3>
        <div className="space-y-2">
          {models.map((model) => {
            const TypeIcon = TYPE_ICONS[model.type];
            const typeColor = TYPE_COLORS[model.type];
            const statusColor = STATUS_COLORS[model.status];
            const apiLink = API_KEY_LINKS[model.provider.toLowerCase()];

            return (
              <div
                key={model.id}
                className={`p-4 rounded-lg border ${statusColor} flex items-center gap-4`}
              >
                <div className={`p-2 rounded-lg ${typeColor.replace('text-', 'bg-').replace('-400', '-500/10')}`}>
                  <TypeIcon className={`h-5 w-5 ${typeColor}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">{model.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 capitalize">
                      {model.provider}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 capitalize">
                      {model.type}
                    </span>
                  </div>
                  {model.error && (
                    <p className="text-xs text-red-400 mt-1">{model.error}</p>
                  )}
                  {apiLink && (
                    <a
                      href={apiLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-xs mt-2 transition-colors ${
                        model.status === 'disconnected' || model.status === 'error'
                          ? 'text-violet-400 hover:text-violet-300 font-medium'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {model.status === 'disconnected' || model.status === 'error'
                        ? `Отримати API ключ: ${apiLink.label}`
                        : `API ключ: ${apiLink.label}`
                      }
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {model.status === 'connected' && (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                  {model.status === 'disconnected' && (
                    <XCircle className="h-5 w-5 text-slate-400" />
                  )}
                  {model.status === 'testing' && (
                    <RefreshCw className="h-5 w-5 text-amber-400 animate-spin" />
                  )}
                  {model.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
