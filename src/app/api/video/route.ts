import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-keys';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, duration, resolution } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let video: string | null = null;

    switch (model) {
      case 'runway':
        const runwayKey = await getApiKey('runway');
        if (!runwayKey) {
          return NextResponse.json({ error: 'Runway API key not configured' }, { status: 400 });
        }
        
        // Runway Gen-3 API
        const runwayRes = await fetch('https://api.runwayml.com/v1/text-to-video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${runwayKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            duration: parseInt(duration) || 5,
            resolution: resolution || '1080p',
          }),
        });
        
        const runwayData = await runwayRes.json();
        video = runwayData.video_url || null;
        break;

      case 'luma':
        const lumaKey = await getApiKey('luma');
        if (!lumaKey) {
          return NextResponse.json({ error: 'Luma API key not configured' }, { status: 400 });
        }
        
        // Luma Dream Machine API
        const lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lumaKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            aspect_ratio: '16:9',
          }),
        });
        
        const lumaData = await lumaRes.json();
        
        // Poll for completion
        if (lumaData.id) {
          let result = lumaData;
          while (result.state === 'pending' || result.state === 'processing') {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const pollRes = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${lumaData.id}`, {
              headers: { 'Authorization': `Bearer ${lumaKey}` },
            });
            result = await pollRes.json();
          }
          
          if (result.state === 'completed' && result.assets?.video) {
            video = result.assets.video;
          }
        }
        break;

      case 'kling':
        const klingKey = await getApiKey('kling');
        if (!klingKey) {
          return NextResponse.json({ error: 'Kling API key not configured' }, { status: 400 });
        }
        
        // Kling video generation (placeholder - actual API may differ)
        return NextResponse.json({ 
          error: 'Kling API integration pending',
          video: null
        });

      case 'veo':
        const googleKey = await getApiKey('google');
        if (!googleKey) {
          return NextResponse.json({ error: 'Google AI API key not configured' }, { status: 400 });
        }
        
        // Google Veo API (placeholder)
        return NextResponse.json({ 
          error: 'Google Veo API integration pending',
          video: null
        });

      case 'sora2':
        const openaiKey = await getApiKey('openai');
        if (!openaiKey) {
          return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 400 });
        }
        
        // Sora 2 API (placeholder - not publicly available yet)
        return NextResponse.json({ 
          error: 'Sora 2 API not publicly available',
          video: null
        });

      case 'pixverse':
      case 'minimax':
      case 'wan':
        // These models would need their specific API integrations
        return NextResponse.json({ 
          error: `${model} API integration pending`,
          video: null
        });

      default:
        return NextResponse.json({ error: 'Unknown model' }, { status: 400 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
