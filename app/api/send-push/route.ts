import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { deleteExpoPushToken, getExpoPushTokens } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
};

type ExpoPushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
};

function getUserRole(user: Awaited<ReturnType<typeof currentUser>>): string | null {
  const metadata = user?.publicMetadata;
  if (!metadata || typeof metadata !== 'object' || !('role' in metadata)) {
    return null;
  }

  const { role } = metadata;
  return typeof role === 'string' ? role : null;
}

async function sendExpoPushMessages(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const payload = (await response.json()) as { data?: ExpoPushTicket[]; errors?: unknown[] };

  if (!response.ok) {
    throw new Error(
      payload.errors ? JSON.stringify(payload.errors) : `Expo push API failed (${response.status})`,
    );
  }

  return payload.data ?? [];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    if (!userId || getUserRole(user) !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const messageBody = typeof body.body === 'string' ? body.body.trim() : '';
    const data =
      body.data && typeof body.data === 'object' && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : undefined;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
    }

    const rows = await getExpoPushTokens();
    const tokens = rows
      .map((row) => (typeof row.token === 'string' ? row.token : null))
      .filter((token): token is string => Boolean(token));

    if (tokens.length === 0) {
      return NextResponse.json({ message: 'No registered Expo push tokens found', sent: 0 });
    }

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title,
      body: messageBody,
      data,
      sound: 'default',
    }));

    const tickets = await sendExpoPushMessages(messages);
    const invalidTokens: string[] = [];

    tickets.forEach((ticket, index) => {
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        invalidTokens.push(tokens[index]);
      }
    });

    await Promise.all(invalidTokens.map((token) => deleteExpoPushToken(token)));

    const sent = tickets.filter((ticket) => ticket.status === 'ok').length;
    const failed = tickets.length - sent;

    return NextResponse.json({
      message: `Sent ${sent} notification${sent === 1 ? '' : 's'}${failed > 0 ? ` (${failed} failed)` : ''}`,
      sent,
      failed,
      removedInvalidTokens: invalidTokens.length,
    });
  } catch (error) {
    console.error('Send push notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send push notification' },
      { status: 500 },
    );
  }
}
