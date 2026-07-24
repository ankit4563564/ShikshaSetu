import { NextRequest, NextResponse } from 'next/server';
import { generateInsightsNowAction } from '@/app/actions/aiInsightsActions';

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.INSIGHTS_CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const date = body.date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const result = await generateInsightsNowAction(date);
    
    return NextResponse.json({
      success: result.success,
      date,
      insightsGenerated: result.count,
      error: result.error,
    });
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: e.message,
    }, { status: 500 });
  }
}