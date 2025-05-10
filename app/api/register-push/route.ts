import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import Expo from 'expo-server-sdk';

// Ensure the DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token; // Expect 'token' field in the request body

    // --- Input Validation ---
    if (!token) {
      return NextResponse.json({ error: 'Push token is required' }, { status: 400 });
    }

    if (typeof token !== 'string') {
        return NextResponse.json({ error: 'Push token must be a string' }, { status: 400 });
    }

    if (!Expo.isExpoPushToken(token)) {
      console.warn(`Received invalid Expo push token format: ${token}`);
      return NextResponse.json({ error: 'Invalid Expo push token format' }, { status: 400 });
    }

    // --- Database Operation (Upsert) ---
    // Use INSERT ... ON CONFLICT to handle cases where the token already exists.
    // Assumes "exponentPushToken" column has a UNIQUE constraint.
    // Adjust table and column names if they differ in your schema.
    const sql = `
      INSERT INTO push_subscriptions ("exponentPushToken") 
      VALUES ($1) 
      ON CONFLICT ("exponentPushToken") 
      DO NOTHING; 
    `;
    // Consider adding a timestamp column update here if needed, e.g., 
    // ON CONFLICT ("exponentPushToken") DO UPDATE SET "updatedAt" = NOW();

    await pool.query(sql, [token]);

    // --- Success Response ---
    // Status 200 indicates success, regardless of whether it was an insert or conflict/update.
    return NextResponse.json({ message: 'Push token registered successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to register push token:', error);
    
    // Avoid sending detailed internal errors to the client in production
    const errorMessage = 'Internal Server Error'; 
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 