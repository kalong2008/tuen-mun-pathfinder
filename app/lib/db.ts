import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please set it in your .env.local file or Vercel environment variables.');
}

const sql = neon(process.env.DATABASE_URL);

export async function saveSubscription(subscription: string) {
  return sql`INSERT INTO push_subscriptions (subscription) VALUES (${subscription})`;
}

export async function getSubscriptions() {
  return sql`SELECT subscription FROM push_subscriptions`;
}

export async function deleteSubscription(subscription: string) {
  return sql`DELETE FROM push_subscriptions WHERE subscription = ${subscription}`;
}

export async function saveExpoPushToken(token: string, platform?: string | null) {
  return sql`
    INSERT INTO expo_push_tokens (token, platform, updated_at)
    VALUES (${token}, ${platform ?? null}, NOW())
    ON CONFLICT (token) DO UPDATE
    SET platform = EXCLUDED.platform,
        updated_at = NOW()
  `;
}

export async function getExpoPushTokens() {
  return sql`SELECT token FROM expo_push_tokens ORDER BY updated_at DESC`;
}

export async function deleteExpoPushToken(token: string) {
  return sql`DELETE FROM expo_push_tokens WHERE token = ${token}`;
} 