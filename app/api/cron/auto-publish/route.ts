import { NextResponse } from 'next/server';
import { getISTDateString } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow more time for AI generation

export async function GET(req: Request) {
  // 1. Secure the endpoint so only your cron service (like Vercel Cron) can trigger it
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized Cron Request' }, { status: 401 });
  }

  try {
    // Determine the base URL for internal API calls
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const passcode = process.env.ADMIN_PASSCODE || 'dailycat2026';

    console.log("CRON: Initiating automated AI passage generation...");

    // 2. Trigger the AI Generation API
    const generateRes = await fetch(`${baseUrl}/api/admin/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode })
    });
    
    if (!generateRes.ok) {
      const err = await generateRes.json();
      throw new Error(`AI Generation failed: ${err.error}`);
    }
    
    const { data: { passage, questions } } = await generateRes.json();
    
    console.log("CRON: AI generated passage successfully. Attempting to publish...");

    // Format the date properly just in case
    passage.published_date = getISTDateString();

    // 3. Publish directly to the Database
    const publishRes = await fetch(`${baseUrl}/api/admin/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode, passage, questions })
    });
    
    if (!publishRes.ok) {
      const err = await publishRes.json();
      throw new Error(`Database Publish failed: ${err.error}`);
    }
    
    console.log("CRON: Success! Daily RC automated.");
    
    return NextResponse.json({ 
      success: true, 
      message: 'Autopilot successfully generated and published the Daily RC!',
      topic: passage.topic 
    });

  } catch (error: any) {
    console.error('CRON ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
