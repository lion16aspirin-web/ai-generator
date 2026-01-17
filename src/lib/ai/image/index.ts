/**
 * Image Generation - Роутер для генерації зображень
 */

import { 
  ImageRequest, 
  ImageResponse, 
  GeneratedImage,
  AIError 
} from '../types';
import { getImageModel, IMAGE_MODELS } from '../config';
import { calculateImageCost } from '../pricing';
import { getApiKey } from '@/lib/api-keys';

// ============================================
// ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ
// ============================================

/**
 * Генерація зображення
 */
export async function generateImage(request: ImageRequest): Promise<ImageResponse> {
  const model = getImageModel(request.model);
  
  if (!model) {
    throw new AIError(
      `Image model ${request.model} not found`,
      'MODEL_UNAVAILABLE'
    );
  }

  if (!model.isAvailable) {
    throw new AIError(
      `Image model ${request.model} is currently unavailable`,
      'MODEL_UNAVAILABLE'
    );
  }

  // Валідація стилю для моделі
  if (request.style && model.styles && model.styles.length > 0) {
    if (!model.styles.includes(request.style)) {
      throw new AIError(
        `Invalid image style "${request.style}" for model ${model.name}. Available styles: ${model.styles.join(', ')}`,
        'INVALID_STYLE',
        model.provider
      );
    }
  }

  // Роутинг до відповідного провайдера
  switch (model.provider) {
    case 'openai':
      return generateOpenAIImage(request, model.id);
    case 'replicate':
      return generateReplicateImage(request, model.id);
    case 'ideogram':
      return generateIdeogramImage(request, model.id);
    case 'google':
      return generateGoogleImage(request, model.id);
    case 'recraft':
      return generateRecraftImage(request, model.id);
    default:
      throw new AIError(
        `Provider ${model.provider} not supported for images`,
        'PROVIDER_ERROR'
      );
  }
}

// ============================================
// OPENAI (DALL-E / GPT Image)
// ============================================

async function generateOpenAIImage(
  request: ImageRequest, 
  modelId: string
): Promise<ImageResponse> {
  // Спочатку пробуємо dalle ключ, якщо немає - fallback на openai
  let apiKey = await getApiKey('dalle');
  if (!apiKey) {
    apiKey = await getApiKey('openai');
  }
  if (!apiKey) {
    throw new AIError('OpenAI API key not configured. Add it in admin panel (dalle or openai).', 'UNAUTHORIZED', 'openai');
  }

  // OpenAI DALL-E 3 підтримує тільки 'vivid' та 'natural'
  let openAIStyle: 'vivid' | 'natural' | undefined = undefined;
  if (request.style) {
    if (request.style === 'vivid' || request.style === 'natural') {
      openAIStyle = request.style;
    } else {
      // Маппінг інших стилів на natural
      openAIStyle = 'natural';
    }
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId === 'gpt-image-1' ? 'gpt-image-1' : 'dall-e-3',
      prompt: request.prompt,
      n: request.n || 1,
      size: request.size || '1024x1024',
      quality: request.quality || 'standard',
      style: openAIStyle,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'OpenAI image generation failed';
    try {
      const errorData = await response.json();
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new AIError(errorMessage, 'PROVIDER_ERROR', 'openai', response.status);
  }

  const data = await response.json();
  const usage = calculateImageCost(modelId, request.n || 1, request.quality === 'hd');

  return {
    id: crypto.randomUUID(),
    images: data.data.map((item: any) => ({
      url: item.url,
      revisedPrompt: item.revised_prompt,
    })),
    model: modelId,
    usage,
  };
}

// ============================================
// REPLICATE (FLUX, Midjourney, etc)
// ============================================

async function generateReplicateImage(
  request: ImageRequest,
  modelId: string
): Promise<ImageResponse> {
  const apiKey = await getApiKey('replicate');
  if (!apiKey) {
    throw new AIError('Replicate API key not configured. Add it in admin panel.', 'UNAUTHORIZED', 'replicate');
  }

  // Мапінг моделей
  const modelVersions: Record<string, string> = {
    'flux-max': 'black-forest-labs/flux-1.1-pro',
    'flux-pro': 'black-forest-labs/flux-pro',
    'flux-dev': 'black-forest-labs/flux-dev',
    'midjourney': 'tstramer/midjourney-diffusion:latest',
  };

  const version = modelVersions[modelId];
  if (!version) {
    throw new AIError(`Model ${modelId} mapping not found`, 'MODEL_UNAVAILABLE', 'replicate');
  }

  // Створюємо prediction
  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version,
      input: {
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        width: parseInt(request.size?.split('x')[0] || '1024'),
        height: parseInt(request.size?.split('x')[1] || '1024'),
        num_outputs: request.n || 1,
      },
    }),
  });

  if (!createResponse.ok) {
    let errorMessage = 'Failed to create Replicate prediction';
    try {
      const errorData = await createResponse.json();
      if (errorData.detail) {
        // Replicate повертає помилки в форматі { detail: string } або { detail: [...messages] }
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((d: any) => d.msg || d).join(', ');
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (errorData.error || errorData.message) {
        errorMessage = errorData.error || errorData.message;
      }
    } catch {
      // Якщо не вдалося парсити JSON, використовуємо текст відповіді
      errorMessage = `HTTP ${createResponse.status}: ${createResponse.statusText}`;
    }
    throw new AIError(errorMessage, 'PROVIDER_ERROR', 'replicate', createResponse.status);
  }

  const prediction = await createResponse.json();
  
  // Чекаємо на результат (polling)
  const result = await pollReplicatePrediction(prediction.id, apiKey);
  const usage = calculateImageCost(modelId, request.n || 1);

  return {
    id: prediction.id,
    images: result.output.map((url: string) => ({ url })),
    model: modelId,
    usage,
  };
}

async function pollReplicatePrediction(
  id: string, 
  apiKey: string, 
  maxAttempts = 60
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });

    const data = await response.json();

    if (data.status === 'succeeded') {
      return data;
    }
    if (data.status === 'failed') {
      throw new AIError(data.error || 'Prediction failed', 'PROVIDER_ERROR', 'replicate');
    }

    // Чекаємо 1 секунду
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new AIError('Prediction timeout', 'TIMEOUT', 'replicate');
}

// ============================================
// IDEOGRAM
// ============================================

async function generateIdeogramImage(
  request: ImageRequest,
  modelId: string
): Promise<ImageResponse> {
  const apiKey = await getApiKey('ideogram');
  if (!apiKey) {
    throw new AIError('Ideogram API key not configured. Add it in admin panel.', 'UNAUTHORIZED', 'ideogram');
  }

  const response = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_request: {
        prompt: request.prompt,
        aspect_ratio: getAspectRatio(request.size),
        model: modelId === 'ideogram-v3-turbo' ? 'V_2_TURBO' : 'V_2',
        magic_prompt_option: 'AUTO',
      },
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Ideogram generation failed';
    try {
      const errorData = await response.json();
      if (errorData.detail || errorData.error || errorData.message) {
        errorMessage = errorData.detail || errorData.error || errorData.message;
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new AIError(errorMessage, 'PROVIDER_ERROR', 'ideogram', response.status);
  }

  const data = await response.json();
  const usage = calculateImageCost(modelId, 1);

  return {
    id: crypto.randomUUID(),
    images: data.data.map((item: any) => ({
      url: item.url,
      revisedPrompt: item.prompt,
    })),
    model: modelId,
    usage,
  };
}

// ============================================
// GOOGLE IMAGEN
// ============================================

async function generateGoogleImage(
  request: ImageRequest,
  modelId: string
): Promise<ImageResponse> {
  const apiKey = await getApiKey('google');
  if (!apiKey) {
    throw new AIError('Google AI API key not configured. Add it in admin panel.', 'UNAUTHORIZED', 'google');
  }

  // TODO: Implement Google Imagen API when available
  throw new AIError('Google Imagen not yet implemented', 'MODEL_UNAVAILABLE', 'google');
}

// ============================================
// RECRAFT
// ============================================

async function generateRecraftImage(
  request: ImageRequest,
  modelId: string
): Promise<ImageResponse> {
  const apiKey = await getApiKey('recraft');
  if (!apiKey) {
    throw new AIError('Recraft API key not configured. Add it in admin panel.', 'UNAUTHORIZED', 'recraft');
  }

  // Recraft API - мінімальний формат запиту згідно документації
  const requestBody: any = {
    prompt: request.prompt,
    model: 'recraftv3',
    style: request.style || 'realistic_image',
  };

  // Додаємо розмір якщо вказано (Recraft може приймати як width/height так і size)
  if (request.size) {
    const [width, height] = request.size.split('x').map(Number);
    // Спробуємо обидва формати
    requestBody.width = width;
    requestBody.height = height;
    // Альтернативно: requestBody.size = request.size;
  }

  // Додаємо num_outputs тільки якщо більше 1
  if (request.n && request.n > 1) {
    requestBody.num_outputs = request.n;
  }

  console.log('Recraft API Request:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Recraft API Response Status:', response.status, response.statusText);

  if (!response.ok) {
    let errorMessage = 'Recraft generation failed';
    let errorData: any = null;
    
    try {
      const responseText = await response.text();
      console.error('Recraft API Error Response:', responseText);
      
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
      }
      
      if (errorData) {
        if (errorData.detail) {
          errorMessage = Array.isArray(errorData.detail) 
            ? errorData.detail.map((d: any) => d.msg || d).join(', ')
            : errorData.detail;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : errorData.error.message || JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      }
    } catch (err) {
      console.error('Error parsing Recraft error response:', err);
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new AIError(errorMessage, 'PROVIDER_ERROR', 'recraft', response.status);
  }

  const responseText = await response.text();
  console.log('Recraft API Success Response:', responseText.substring(0, 500));
  
  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error('Error parsing Recraft response:', err);
    throw new AIError(
      'Recraft API returned invalid JSON response',
      'PROVIDER_ERROR',
      'recraft'
    );
  }
  
  console.log('Recraft API Parsed Data:', JSON.stringify(data, null, 2));
  
  const usage = calculateImageCost(modelId, request.n || 1);

  // Recraft може повертати результат в різних форматах
  let images: Array<{ url: string }> = [];
  
  if (data.data && Array.isArray(data.data)) {
    // Стандартний формат: { data: [{ url: ... }] }
    images = data.data.map((item: any) => ({ 
      url: item.url || item.image_url || item 
    }));
  } else if (data.images && Array.isArray(data.images)) {
    // Альтернативний формат: { images: [{ url: ... }] }
    images = data.images.map((item: any) => ({ 
      url: item.url || item.image_url || item 
    }));
  } else if (data.url) {
    // Одиночне зображення: { url: ... }
    images = [{ url: data.url }];
  } else if (Array.isArray(data)) {
    // Масив URL: [url1, url2, ...]
    images = data.map((url: string) => ({ url }));
  }

  if (images.length === 0) {
    // Якщо не вдалося розпарсити відповідь, показуємо детальну помилку
    console.error('Recraft API response:', JSON.stringify(data, null, 2));
    throw new AIError(
      `Recraft API returned no images. Response format: ${JSON.stringify(Object.keys(data))}`,
      'PROVIDER_ERROR',
      'recraft'
    );
  }

  return {
    id: data.id || crypto.randomUUID(),
    images,
    model: modelId,
    usage,
  };
}

// ============================================
// ХЕЛПЕРИ
// ============================================

function getAspectRatio(size?: string): string {
  if (!size) return 'ASPECT_1_1';
  
  const [w, h] = size.split('x').map(Number);
  const ratio = w / h;
  
  if (ratio > 1.5) return 'ASPECT_16_9';
  if (ratio > 1.2) return 'ASPECT_4_3';
  if (ratio < 0.7) return 'ASPECT_9_16';
  if (ratio < 0.8) return 'ASPECT_3_4';
  return 'ASPECT_1_1';
}

/**
 * Отримати рекомендовану модель
 */
export function getRecommendedImageModel(
  task: 'photo' | 'art' | 'text' | 'logo' | 'budget'
): string {
  switch (task) {
    case 'photo':
      return 'flux-max';
    case 'art':
      return 'midjourney';
    case 'text':
      return 'ideogram-v3';
    case 'logo':
      return 'recraft-v3';
    case 'budget':
      return 'flux-dev';
    default:
      return 'flux-pro';
  }
}

export { IMAGE_MODELS } from '../config';
