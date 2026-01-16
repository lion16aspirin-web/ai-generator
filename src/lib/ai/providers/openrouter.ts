/**
 * OpenRouter Provider - Unified API для всіх LLM
 */

import { 
  ChatRequest, 
  ChatResponse, 
  ChatMessage,
  StreamChunk,
  AIError,
  TokenUsage
} from '../types';
import { OPENROUTER_MODEL_MAP, getTextModel } from '../config';
import { calculateTextCost } from '../pricing';

// ============================================
// КОНФІГУРАЦІЯ
// ============================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterConfig {
  apiKey: string;
  siteUrl?: string;
  siteName?: string;
}

// ============================================
// OPENROUTER PROVIDER
// ============================================

export class OpenRouterProvider {
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.siteUrl = config.siteUrl || 'https://ai-generator.com';
    this.siteName = config.siteName || 'AI Generator';
  }

  /**
   * Звичайний чат (без стрімінгу)
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const openRouterModel = this.mapModel(request.model);
    
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: openRouterModel,
        messages: this.formatMessages(request.messages, request.systemPrompt),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: false,
        ...(request.tools && request.tools.length > 0 && {
          tools: request.tools,
          tool_choice: request.toolChoice || 'auto',
        }),
      }),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const data = await response.json();
    
    return this.formatResponse(data, request.model);
  }

  /**
   * Стрімінг чат
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const openRouterModel = this.mapModel(request.model);
    
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: openRouterModel,
        messages: this.formatMessages(request.messages, request.systemPrompt),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
        ...(request.tools && request.tools.length > 0 && {
          tools: request.tools,
          tool_choice: request.toolChoice || 'auto',
        }),
      }),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new AIError('No response body', 'PROVIDER_ERROR', 'openrouter');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          yield { content: '', done: true };
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              
              if (content) {
                yield { content, done: false };
              }
            } catch {
              // Ігноруємо невалідний JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Отримати заголовки
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.siteUrl,
      'X-Title': this.siteName,
    };
  }

  /**
   * Мапінг моделі на OpenRouter формат
   */
  private mapModel(modelId: string): string {
    const mapped = OPENROUTER_MODEL_MAP[modelId];
    if (!mapped) {
      throw new AIError(
        `Model ${modelId} not supported by OpenRouter`,
        'MODEL_UNAVAILABLE',
        'openrouter'
      );
    }
    return mapped;
  }

  /**
   * Форматування повідомлень
   */
  private formatMessages(
    messages: ChatMessage[], 
    systemPrompt?: string
  ): Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> {
    const formatted: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [];

    // Додаємо системний промпт
    if (systemPrompt) {
      formatted.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Форматуємо повідомлення
    for (const msg of messages) {
      if (msg.images && msg.images.length > 0) {
        // Мультимодальне повідомлення
        formatted.push({
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            ...msg.images.map(img => ({
              type: 'image_url' as const,
              image_url: { url: img },
            })),
          ],
        });
      } else {
        formatted.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return formatted;
  }

  /**
   * Форматування відповіді
   */
  private formatResponse(data: any, modelId: string): ChatResponse {
    const message = data.choices?.[0]?.message || {};
    const content = message.content || '';
    const toolCalls = message.tool_calls || [];
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };

    const tokenUsage = calculateTextCost(
      modelId,
      usage.prompt_tokens,
      usage.completion_tokens
    );

    // Якщо є tool calls, додаємо інформацію про них в content
    let finalContent = content;
    if (toolCalls.length > 0) {
      finalContent += `\n\n[Викликано ${toolCalls.length} інструментів для пошуку актуальної інформації]`;
    }

    return {
      id: data.id || crypto.randomUUID(),
      content: finalContent,
      model: modelId,
      usage: tokenUsage,
      finishReason: data.choices?.[0]?.finish_reason === 'stop' ? 'stop' : 'length',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }

  /**
   * Обробка помилок
   */
  private async handleError(response: Response): Promise<AIError> {
    let errorMessage = 'Unknown error';
    let errorCode: any = 'PROVIDER_ERROR';

    try {
      const data = await response.json();
      errorMessage = data.error?.message || data.message || errorMessage;
      
      if (response.status === 401) {
        errorCode = 'UNAUTHORIZED';
      } else if (response.status === 429) {
        errorCode = 'RATE_LIMITED';
      } else if (response.status === 400) {
        errorCode = 'INVALID_REQUEST';
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    return new AIError(errorMessage, errorCode, 'openrouter', response.status);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let openRouterInstance: OpenRouterProvider | null = null;

export function getOpenRouterProvider(): OpenRouterProvider {
  if (!openRouterInstance) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new AIError(
        'OPENROUTER_API_KEY not configured',
        'UNAUTHORIZED',
        'openrouter'
      );
    }

    openRouterInstance = new OpenRouterProvider({
      apiKey,
      siteUrl: process.env.NEXTAUTH_URL || 'https://ai-generator.com',
      siteName: 'AI Generator',
    });
  }

  return openRouterInstance;
}

// ============================================
// ЕКСПОРТ ФУНКЦІЙ
// ============================================

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const provider = getOpenRouterProvider();
  return provider.chat(request);
}

export async function* chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
  const provider = getOpenRouterProvider();
  yield* provider.chatStream(request);
}
