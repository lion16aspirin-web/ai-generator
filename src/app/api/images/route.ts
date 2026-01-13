import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-keys';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, size } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let images: string[] = [];

    switch (model) {
      case 'dalle3':
        const openaiKey = await getApiKey('openai');
        if (!openaiKey) {
          return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 400 });
        }

        const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: size || '1024x1024',
            quality: 'standard',
          }),
        });
        
        const dalleData = await dalleRes.json();
        images = dalleData.data?.map((img: { url: string }) => img.url) || [];
        break;

      case 'flux':
      case 'sdxl':
      case 'kandinsky3':
        const replicateKey = await getApiKey('replicate');
        if (!replicateKey) {
          return NextResponse.json({ error: 'Replicate API key not configured' }, { status: 400 });
        }

        // Model versions for Replicate
        const replicateModels: Record<string, string> = {
          'flux': 'black-forest-labs/flux-schnell',
          'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          'kandinsky3': 'ai-forever/kandinsky-2:ea1addaab376f4dc227f5368bbd8eff901820fd1cc14ed8cad63b29249e9d463',
        };

        const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${replicateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: replicateModels[model],
            input: { prompt },
          }),
        });

        const prediction = await replicateRes.json();
        
        // Poll for result
        if (prediction.id) {
          let result = prediction;
          while (result.status !== 'succeeded' && result.status !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
              headers: { 'Authorization': `Token ${replicateKey}` },
            });
            result = await pollRes.json();
          }
          
          if (result.status === 'succeeded' && result.output) {
            images = Array.isArray(result.output) ? result.output : [result.output];
          }
        }
        break;

      case 'midjourney6':
        // Midjourney doesn't have direct API, would need proxy service
        return NextResponse.json({ 
          error: 'Midjourney requires special integration',
          images: []
        });

      default:
        return NextResponse.json({ error: 'Unknown model' }, { status: 400 });
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
