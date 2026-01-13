import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasGitHubId: !!process.env.GITHUB_ID,
        hasGitHubSecret: !!process.env.GITHUB_SECRET,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

