import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { event } = await request.json();
    
    if (!event) {
      return NextResponse.json({ error: 'Event parameter is required' }, { status: 400 });
    }

    const year = event.split('-')[0];
    const jsonPath = path.join(process.cwd(), 'public', 'photo', year, event, `${event}.json`);
    
    // Check if file exists
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'JSON file not found' }, { status: 404 });
    }

    // Read and parse the JSON file
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    return NextResponse.json(jsonContent);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return NextResponse.json(
      { error: 'Failed to load photos' },
      { status: 500 }
    );
  }
} 