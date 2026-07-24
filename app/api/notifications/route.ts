import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth/routeGuard';
import {
  fetchNotificationsPaginatedAction,
  markNotificationAsReadAction,
  archiveNotificationAction,
  unarchiveNotificationAction,
  getNotificationDeliveryLogsAction,
  getNotificationAnalyticsAction,
  getNotificationDeliveryStatsAction,
  processNotificationQueueAction,
  retryFailedNotificationsAction,
} from '@/app/actions/notificationActions';

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase.from('admins').select('id').eq('id', userId).maybeSingle();
  if (!data) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const action = sp.get('action');

    if (action === 'list') {
      const auth = await requireRole(['student', 'parent', 'teacher', 'admin']);
      if (auth instanceof NextResponse) return auth;

      const result = await fetchNotificationsPaginatedAction(auth.roleId, {
        category: (sp.get('category') as any) || 'all',
        priority: (sp.get('priority') as any) || 'all',
        status: (sp.get('status') as any) || 'all',
        search: sp.get('search') || undefined,
        limit: parseInt(sp.get('limit') || '50'),
        offset: parseInt(sp.get('offset') || '0'),
      });

      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'analytics') {
      const authError = await requireAdmin();
      if (authError) return authError;
      const data = await getNotificationAnalyticsAction({
        dateFrom: sp.get('dateFrom') || undefined,
        dateTo: sp.get('dateTo') || undefined,
        channel: sp.get('channel') || undefined,
        category: sp.get('category') || undefined,
      });
      return NextResponse.json({ success: true, data });
    }

    if (action === 'delivery-stats') {
      const authError = await requireAdmin();
      if (authError) return authError;
      const data = await getNotificationDeliveryStatsAction();
      return NextResponse.json({ success: true, data });
    }

    if (action === 'delivery-logs') {
      const notificationId = sp.get('notificationId');
      if (!notificationId) {
        return NextResponse.json({ success: false, error: 'notificationId required' }, { status: 400 });
      }
      const data = await getNotificationDeliveryLogsAction(notificationId);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationId, recipientId } = body;

    if (action === 'mark-read') {
      const auth = await requireRole(['student', 'parent', 'teacher', 'admin']);
      if (auth instanceof NextResponse) return auth;
      if (!notificationId) {
        return NextResponse.json({ success: false, error: 'notificationId required' }, { status: 400 });
      }
      const result = await markNotificationAsReadAction(notificationId, auth.roleId);
      return NextResponse.json(result);
    }

    if (action === 'archive') {
      const auth = await requireRole(['student', 'parent', 'teacher', 'admin']);
      if (auth instanceof NextResponse) return auth;
      if (!notificationId) {
        return NextResponse.json({ success: false, error: 'notificationId required' }, { status: 400 });
      }
      const result = await archiveNotificationAction(notificationId, auth.roleId);
      return NextResponse.json(result);
    }

    if (action === 'unarchive') {
      const auth = await requireRole(['student', 'parent', 'teacher', 'admin']);
      if (auth instanceof NextResponse) return auth;
      if (!notificationId) {
        return NextResponse.json({ success: false, error: 'notificationId required' }, { status: 400 });
      }
      const result = await unarchiveNotificationAction(notificationId, auth.roleId);
      return NextResponse.json(result);
    }

    if (action === 'process-queue') {
      const authError = await requireAdmin();
      if (authError) return authError;
      const result = await processNotificationQueueAction();
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'retry-failed') {
      const authError = await requireAdmin();
      if (authError) return authError;
      const result = await retryFailedNotificationsAction();
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
