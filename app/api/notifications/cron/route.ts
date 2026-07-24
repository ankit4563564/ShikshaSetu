import { NextRequest, NextResponse } from 'next/server';
import { processNotificationQueueAction } from '@/app/actions/notificationActions';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processNotificationQueueAction();
    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
