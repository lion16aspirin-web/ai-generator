import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { saveApiKey, deleteApiKey, testApiKey, getApiKey, ServiceType } from '@/lib/api-keys';

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'ADMIN';
}

// GET - List all API keys
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        service: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { service, name, key } = await request.json();

    if (!service || !name || !key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await saveApiKey(service as ServiceType, key, name, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save API key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove API key
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service) {
      return NextResponse.json({ error: 'Service is required' }, { status: 400 });
    }

    await deleteApiKey(service as ServiceType, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Test API key
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { service, key } = await request.json();

    if (!service) {
      return NextResponse.json({ error: 'Service is required' }, { status: 400 });
    }

    // Якщо ключ не передано, отримуємо його з БД
    let keyToTest = key;
    if (!keyToTest) {
      const apiKeyFromDb = await getApiKey(service as ServiceType);
      if (!apiKeyFromDb) {
        return NextResponse.json({ error: 'API key not found in database' }, { status: 404 });
      }
      keyToTest = apiKeyFromDb;
    }

    const valid = await testApiKey(service as ServiceType, keyToTest);

    return NextResponse.json({ valid });
  } catch (error) {
    console.error('Test API key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
