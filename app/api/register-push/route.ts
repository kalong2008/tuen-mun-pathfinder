import { NextRequest, NextResponse } from 'next/server';

import { saveExpoPushToken } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

function isValidExpoPushToken(token: string): boolean {
  return /^ExponentPushToken\[[^\]]+\]$/.test(token) || /^ExpoPushToken\[[^\]]+\]$/.test(token);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const platform = typeof body.platform === 'string' ? body.platform.trim() : null;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    if (!isValidExpoPushToken(token)) {
      return NextResponse.json({ error: 'Invalid Expo push token format' }, { status: 400 });
    }

    await saveExpoPushToken(token, platform);

    return NextResponse.json({ message: 'Push token registered' });
  } catch (error) {
    console.error('Register push token error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register push token' },
      { status: 500 },
    );
  }
}
