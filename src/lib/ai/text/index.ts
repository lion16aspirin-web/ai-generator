/**
 * Text Generation - Роутер для текстових моделей
 */

import { 
  ChatRequest, 
  ChatResponse, 
  StreamChunk, 
  AIError 
} from '../types';
import { getTextModel, TEXT_MODELS } from '../config';
import { chat as openRouterChat, chatStream as openRouterStream } from '../providers/openrouter';

// ============================================
// ГОЛОВНІ ФУНКЦІЇ
// ============================================

/**
 * Генерація тексту (без стрімінгу)
 */
export async function generateText(request: ChatRequest): Promise<ChatResponse> {
  // Валідація моделі
  const model = getTextModel(request.model);
  if (!model) {
    throw new AIError(
      `Model ${request.model} not found`,
      'MODEL_UNAVAILABLE'
    );
  }

  if (!model.isAvailable) {
    throw new AIError(
      `Model ${request.model} is currently unavailable`,
      'MODEL_UNAVAILABLE'
    );
  }

  // Використовуємо OpenRouter для всіх LLM
  return openRouterChat(request);
}

/**
 * Генерація тексту зі стрімінгом
 */
export async function* generateTextStream(
  request: ChatRequest
): AsyncGenerator<StreamChunk> {
  // Валідація моделі
  const model = getTextModel(request.model);
  if (!model) {
    throw new AIError(
      `Model ${request.model} not found`,
      'MODEL_UNAVAILABLE'
    );
  }

  if (!model.isAvailable) {
    throw new AIError(
      `Model ${request.model} is currently unavailable`,
      'MODEL_UNAVAILABLE'
    );
  }

  // Використовуємо OpenRouter для стрімінгу
  yield* openRouterStream({ ...request, stream: true });
}

// ============================================
// ХЕЛПЕРИ
// ============================================

/**
 * Отримати список доступних текстових моделей
 */
export function getAvailableModels() {
  return TEXT_MODELS.filter(m => m.isAvailable).map(m => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    description: m.description,
    capabilities: m.capabilities,
  }));
}

/**
 * Перевірити чи модель підтримує vision
 */
export function supportsVision(modelId: string): boolean {
  const model = getTextModel(modelId);
  return model?.capabilities.includes('vision') ?? false;
}

/**
 * Перевірити чи модель підтримує reasoning
 */
export function supportsReasoning(modelId: string): boolean {
  const model = getTextModel(modelId);
  return model?.capabilities.includes('reasoning') ?? false;
}

/**
 * Отримати рекомендовану модель для задачі
 */
export function getRecommendedModel(task: 'chat' | 'code' | 'analysis' | 'creative'): string {
  switch (task) {
    case 'chat':
      return 'gpt-5.1'; // Тепла та розумна
    case 'code':
      return 'deepseek-v3'; // Найкраща для коду за ціною
    case 'analysis':
      return 'claude-4.5-sonnet'; // Глибокий аналіз
    case 'creative':
      return 'gpt-5.1'; // Творчість
    default:
      return 'gpt-5.1';
  }
}

// ============================================
// ЕКСПОРТ МОДЕЛЕЙ
// ============================================

export { TEXT_MODELS } from '../config';
