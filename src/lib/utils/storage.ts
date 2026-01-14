/**
 * Storage Utils - Утиліти для зберігання файлів
 */

// ============================================
// КОНФІГУРАЦІЯ
// ============================================

const STORAGE_CONFIG = {
  // Vercel Blob (рекомендовано)
  vercelBlob: {
    enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
  },
  // Cloudinary (альтернатива)
  cloudinary: {
    enabled: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  },
  // Локальне сховище (development)
  local: {
    enabled: process.env.NODE_ENV === 'development',
    path: './public/uploads',
  },
};

// ============================================
// VERCEL BLOB
// ============================================

export async function uploadToVercelBlob(
  file: Buffer | Blob,
  filename: string
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN not configured');
  }

  const { put } = await import('@vercel/blob');
  
  const blob = await put(filename, file, {
    access: 'public',
    token,
  });

  return blob.url;
}

// ============================================
// CLOUDINARY
// ============================================

export async function uploadToCloudinary(
  file: string | Buffer,
  options: {
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw';
  } = {}
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary not configured');
  }

  // Використовуємо REST API замість SDK для меншого bundle size
  const timestamp = Math.round(Date.now() / 1000);
  const signature = await generateCloudinarySignature(timestamp, apiSecret);

  const formData = new FormData();
  if (typeof file === 'string') {
    formData.append('file', file);
  } else {
    // Конвертуємо Buffer в Uint8Array для Blob
    const uint8Array = new Uint8Array(file);
    formData.append('file', new Blob([uint8Array]));
  }
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', apiKey);
  formData.append('signature', signature);
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  const resourceType = options.resource_type || 'image';
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

async function generateCloudinarySignature(
  timestamp: number,
  apiSecret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`timestamp=${timestamp}${apiSecret}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// UNIFIED UPLOAD
// ============================================

export async function uploadFile(
  file: Buffer | Blob | string,
  options: {
    filename: string;
    type?: 'image' | 'video';
    folder?: string;
  }
): Promise<string> {
  const { filename, type = 'image', folder } = options;

  // Спробуємо Vercel Blob спочатку
  if (STORAGE_CONFIG.vercelBlob.enabled) {
    const buffer = typeof file === 'string' 
      ? Buffer.from(file.split(',')[1], 'base64')
      : file instanceof Blob 
        ? Buffer.from(await file.arrayBuffer())
        : file;
    
    return uploadToVercelBlob(buffer, `${folder || 'uploads'}/${filename}`);
  }

  // Альтернатива - Cloudinary
  if (STORAGE_CONFIG.cloudinary.enabled) {
    return uploadToCloudinary(file as string | Buffer, {
      folder,
      resource_type: type,
    });
  }

  throw new Error('No storage provider configured');
}

// ============================================
// ХЕЛПЕРИ
// ============================================

/**
 * Генерація унікального імені файлу
 */
export function generateFilename(
  prefix: string,
  extension: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}.${extension}`;
}

/**
 * Отримання розширення з MIME типу
 */
export function getExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  return map[mimeType] || 'bin';
}

/**
 * Конвертація base64 в Buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  const data = base64.includes(',') ? base64.split(',')[1] : base64;
  return Buffer.from(data, 'base64');
}
