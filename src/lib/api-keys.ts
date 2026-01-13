import prisma from './prisma';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'default-key-change-me';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export type ServiceType = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'replicate'
  | 'runway'
  | 'luma'
  | 'kling'
  | 'veo'
  | 'sora'
  | 'pixverse'
  | 'minimax'
  | 'wan'
  | 'flux'
  | 'midjourney'
  | 'stable-diffusion'
  | 'kandinsky'
  | 'dalle';

export async function getApiKey(service: ServiceType): Promise<string | null> {
  // First try to get from database (admin keys)
  const apiKey = await prisma.apiKey.findFirst({
    where: { service },
    orderBy: { createdAt: 'desc' },
  });

  if (apiKey) {
    return decrypt(apiKey.key);
  }

  // Fallback to env variables
  const envMap: Record<ServiceType, string | undefined> = {
    'openai': process.env.OPENAI_API_KEY,
    'anthropic': process.env.ANTHROPIC_API_KEY,
    'google': process.env.GOOGLE_AI_API_KEY,
    'replicate': process.env.REPLICATE_API_TOKEN,
    'runway': process.env.RUNWAY_API_KEY,
    'luma': process.env.LUMA_API_KEY,
    'kling': process.env.KLING_API_KEY,
    'veo': process.env.GOOGLE_AI_API_KEY,
    'sora': process.env.OPENAI_API_KEY,
    'pixverse': process.env.PIXVERSE_API_KEY,
    'minimax': process.env.MINIMAX_API_KEY,
    'wan': process.env.WAN_API_KEY,
    'flux': process.env.REPLICATE_API_TOKEN,
    'midjourney': process.env.MIDJOURNEY_API_KEY,
    'stable-diffusion': process.env.REPLICATE_API_TOKEN,
    'kandinsky': process.env.KANDINSKY_API_KEY,
    'dalle': process.env.OPENAI_API_KEY,
  };

  return envMap[service] || null;
}

export async function saveApiKey(
  service: ServiceType, 
  key: string, 
  name: string,
  userId: string
): Promise<void> {
  const encryptedKey = encrypt(key);

  await prisma.apiKey.upsert({
    where: {
      service_userId: {
        service,
        userId,
      },
    },
    update: {
      key: encryptedKey,
      name,
    },
    create: {
      service,
      key: encryptedKey,
      name,
      userId,
    },
  });
}

export async function deleteApiKey(service: ServiceType, userId: string): Promise<void> {
  await prisma.apiKey.deleteMany({
    where: {
      service,
      userId,
    },
  });
}

export async function testApiKey(service: ServiceType, key: string): Promise<boolean> {
  try {
    switch (service) {
      case 'openai':
      case 'dalle':
      case 'sora':
        const openaiRes = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        return openaiRes.ok;

      case 'anthropic':
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        return anthropicRes.ok || anthropicRes.status === 400;

      case 'google':
      case 'veo':
        const googleRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models?key=${key}`
        );
        return googleRes.ok;

      case 'replicate':
      case 'flux':
      case 'stable-diffusion':
        const replicateRes = await fetch('https://api.replicate.com/v1/models', {
          headers: { 'Authorization': `Token ${key}` }
        });
        return replicateRes.ok;

      default:
        return true;
    }
  } catch {
    return false;
  }
}
