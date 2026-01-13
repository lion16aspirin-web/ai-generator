import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-keys';

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get API key for the selected model
    let apiKey: string | null = null;
    let provider: 'openai' | 'anthropic' | 'google' = 'openai';

    if (model.startsWith('gpt') || model === 'gpt5nano' || model === 'gpt41' || model === 'gpt5') {
      apiKey = await getApiKey('openai');
      provider = 'openai';
    } else if (model.startsWith('claude')) {
      apiKey = await getApiKey('anthropic');
      provider = 'anthropic';
    } else if (model.startsWith('gemini')) {
      apiKey = await getApiKey('google');
      provider = 'google';
    }

    if (!apiKey) {
      return NextResponse.json({ 
        response: 'API ключ для цієї моделі не налаштовано. Зверніться до адміністратора.',
        error: 'API key not configured'
      });
    }

    // Model mapping
    const modelMap: Record<string, string> = {
      'gpt5nano': 'gpt-4o-mini',
      'gpt41': 'gpt-4-turbo',
      'gpt5': 'gpt-4o',
      'claude3opus': 'claude-3-opus-20240229',
      'claude3sonnet': 'claude-3-sonnet-20240229',
      'gemini15pro': 'gemini-1.5-pro',
      'llama3': 'llama-3-70b-instruct',
    };

    const actualModel = modelMap[model] || model;

    let response: string;

    switch (provider) {
      case 'openai':
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: actualModel,
            messages: [{ role: 'user', content: message }],
            max_tokens: 2048,
          }),
        });
        const openaiData = await openaiRes.json();
        response = openaiData.choices?.[0]?.message?.content || 'Error generating response';
        break;

      case 'anthropic':
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: actualModel,
            max_tokens: 2048,
            messages: [{ role: 'user', content: message }],
          }),
        });
        const anthropicData = await anthropicRes.json();
        response = anthropicData.content?.[0]?.text || 'Error generating response';
        break;

      case 'google':
        const googleRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${actualModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: message }] }],
            }),
          }
        );
        const googleData = await googleRes.json();
        response = googleData.candidates?.[0]?.content?.parts?.[0]?.text || 'Error generating response';
        break;

      default:
        response = 'Unknown provider';
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      response: 'Сталася помилка. Спробуйте пізніше.'
    }, { status: 500 });
  }
}
