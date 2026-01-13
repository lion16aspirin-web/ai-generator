import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-keys';

export async function POST(request: NextRequest) {
  try {
    const { image, prompt, model } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    let video: string | null = null;

    switch (model) {
      case 'runway':
        const runwayKey = await getApiKey('runway');
        if (!runwayKey) {
          return NextResponse.json({ error: 'Runway API key not configured' }, { status: 400 });
        }
        
        // Runway Gen-3 Image-to-Video API
        const runwayRes = await fetch('https://api.runwayml.com/v1/image-to-video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${runwayKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gen3a_turbo',
            promptImage: image,
            promptText: prompt || 'subtle natural movement',
            duration: 5,
            ratio: '16:9',
          }),
        });
        
        const runwayData = await runwayRes.json();
        
        // Poll for result
        if (runwayData.id) {
          let result = runwayData;
          let attempts = 0;
          const maxAttempts = 60; // 5 minutes max
          
          while (result.status !== 'SUCCEEDED' && result.status !== 'FAILED' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const pollRes = await fetch(`https://api.runwayml.com/v1/tasks/${runwayData.id}`, {
              headers: { 'Authorization': `Bearer ${runwayKey}` },
            });
            result = await pollRes.json();
            attempts++;
          }
          
          if (result.status === 'SUCCEEDED' && result.output) {
            video = result.output[0];
          }
        }
        break;

      case 'luma':
        const lumaKey = await getApiKey('luma');
        if (!lumaKey) {
          return NextResponse.json({ error: 'Luma API key not configured' }, { status: 400 });
        }
        
        // Luma Dream Machine Image-to-Video
        const lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lumaKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt || 'natural motion',
            keyframes: {
              frame0: {
                type: 'image',
                url: image
              }
            },
          }),
        });
        
        const lumaData = await lumaRes.json();
        
        // Poll for completion
        if (lumaData.id) {
          let result = lumaData;
          let attempts = 0;
          const maxAttempts = 60;
          
          while ((result.state === 'pending' || result.state === 'processing') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const pollRes = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${lumaData.id}`, {
              headers: { 'Authorization': `Bearer ${lumaKey}` },
            });
            result = await pollRes.json();
            attempts++;
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
        
        // Kling Image-to-Video (placeholder)
        return NextResponse.json({ 
          error: 'Kling Image-to-Video API integration pending',
          video: null
        });

      default:
        return NextResponse.json({ error: 'Unknown model' }, { status: 400 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Animation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
