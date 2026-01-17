/**
 * AI Types - Типи для всіх AI операцій
 */

// ============================================
// ПРОВАЙДЕРИ
// ============================================

export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'deepseek' 
  | 'xai' 
  | 'replicate'
  | 'ideogram'
  | 'recraft'
  | 'openrouter';

// ============================================
// ТЕКСТОВІ МОДЕЛІ
// ============================================

export interface TextModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow: number;
  maxOutput: number;
  inputPrice: number;  // за 1M токенів
  outputPrice: number; // за 1M токенів
  capabilities: TextCapability[];
  isAvailable: boolean;
}

export type TextCapability = 'text' | 'vision' | 'code' | 'reasoning' | 'realtime';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[]; // base64 або URLs
  createdAt: Date;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: Tool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolResponse {
  toolCallId: string;
  role: 'tool';
  name: string;
  content: string;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'error';
  chatId?: string;
  toolCalls?: ToolCall[];
}

export interface StreamChunk {
  content: string;
  done: boolean;
  chatId?: string;
}

// ============================================
// ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ
// ============================================

export interface ImageModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  sizes: ImageSize[];
  styles?: string[];
  pricePerImage: number;
  features: ImageFeature[];
  isAvailable: boolean;
}

export type ImageSize = 
  | '512x512'
  | '1024x1024' 
  | '1024x1536' 
  | '1536x1024'
  | '1536x1536'
  | '1024x1792' 
  | '1792x1024'
  | '2048x2048';

export type ImageFeature = 'hd' | 'edit' | 'variations' | 'fast' | 'text';

export interface ImageRequest {
  model: string;
  prompt: string;
  negativePrompt?: string;
  size?: ImageSize;
  style?: string;
  n?: number; // кількість зображень
  quality?: 'standard' | 'hd';
}

export interface ImageResponse {
  id: string;
  images: GeneratedImage[];
  model: string;
  usage: TokenUsage;
}

export interface GeneratedImage {
  url: string;
  base64?: string;
  revisedPrompt?: string;
}

// ============================================
// ГЕНЕРАЦІЯ ВІДЕО
// ============================================

export interface VideoModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  maxDuration: number; // секунди
  resolutions: VideoResolution[];
  pricePerSecond: number;
  modes: VideoMode[];
  isAvailable: boolean;
}

export type VideoResolution = '480p' | '720p' | '1080p' | '4k';
export type VideoMode = 'text-to-video' | 'image-to-video' | 'video-to-video';

export interface VideoRequest {
  model: string;
  prompt: string;
  mode: VideoMode;
  duration?: number;
  resolution?: VideoResolution;
  sourceImage?: string; // для image-to-video
  sourceVideo?: string; // для video-to-video
}

export interface VideoJob {
  id: string;
  status: VideoJobStatus;
  progress?: number; // 0-100
  estimatedTime?: number; // секунди
  result?: VideoResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoJobStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed'
  | 'cancelled';

export interface VideoResult {
  url: string;
  duration: number;
  resolution: VideoResolution;
  thumbnailUrl?: string;
}

// ============================================
// АНІМАЦІЯ ФОТО
// ============================================

export interface AnimationModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  maxDuration: number;
  pricePerAnimation: number;
  isAvailable: boolean;
}

export interface AnimationRequest {
  model: string;
  image: string; // base64 або URL
  prompt?: string;
  duration?: number;
}

export interface AnimationJob {
  id: string;
  status: VideoJobStatus;
  progress?: number;
  result?: AnimationResult;
  error?: string;
}

export interface AnimationResult {
  url: string;
  duration: number;
  thumbnailUrl?: string;
}

// ============================================
// ТОКЕНИ ТА ВИКОРИСТАННЯ
// ============================================

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // в USD
  platformTokens: number; // наші токени
}

export interface UserTokens {
  available: number;
  used: number;
  total: number;
  plan: string;
}

// ============================================
// ПОМИЛКИ
// ============================================

export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public provider?: AIProvider,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export type AIErrorCode = 
  | 'INVALID_REQUEST'
  | 'INVALID_STYLE'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'INSUFFICIENT_TOKENS'
  | 'MODEL_UNAVAILABLE'
  | 'CONTENT_FILTERED'
  | 'TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'UNKNOWN';

// ============================================
// КОНФІГУРАЦІЯ
// ============================================

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIConfig {
  defaultTextModel: string;
  defaultImageModel: string;
  defaultVideoModel: string;
  defaultAnimationModel: string;
  providers: Partial<Record<AIProvider, ProviderConfig>>;
}
