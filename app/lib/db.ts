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