import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/routeGuard';
import { getDemoSessionFromRequest, createSignedSessionValue, COOKIE_NAME } from '@/lib/demo/session';
import { 
  createDemoSession, 
  cleanupDemoData, 
  resetDemoStudent,
  demoStep1GateEntry, 
  demoStep2Attendance,
  demoStep3TeacherDashboard,
  demoStep4ParentNotified,
  demoStep5BusBoarding,
  demoStep6ParentBusNotified,
  demoStep7HomeworkAssigned,
  demoStep8AwardCoins,
  demoStep9RedeemReward,
  demoStep10QRGenerated,
  demoStep11VendorScan,
  demoStep12InventoryUpdate,
  demoStep13AnalyticsUpdate,
  demoStep14Deboard,
  demoStep15HomeSafe,
} from '@/app/actions/demoRunnerActions';

// Simple in-memory session storage (for demo purposes)
const sessionStore = new Map<string, { createdAt: number; redemptionId?: string }>();

function getSession(sessionId: string) {
  const session = sessionStore.get(sessionId);
  if (!session) return null;
  // Auto-expire after 30 minutes
  if (Date.now() - session.createdAt > 30 * 60 * 1000) {
    sessionStore.delete(sessionId);
    return null;
  }
  return session;
}

function setSession(sessionId: string, data: Partial<{ redemptionId: string }>) {
  const existing = sessionStore.get(sessionId);
  if (existing) {
    sessionStore.set(sessionId, { ...existing, ...data });
  }
}

function deleteSession(sessionId: string) {
  sessionStore.delete(sessionId);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, stepIndex } = body;
    const demo = await getDemoSessionFromRequest(request);
    const isDemoAdmin = demo?.active && demo.session.role === 'admin';
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

    if (!isDemoAdmin) {
      const auth = await requireRole(['admin']);
      if (auth instanceof NextResponse && !(action === 'create_session' && isDemoMode)) return auth;
    }

    // Handle session creation
    if (action === 'create_session') {
      const result = await createDemoSession();
      if (result.sessionId) {
        sessionStore.set(result.sessionId, { createdAt: Date.now() });
      }
      const response = NextResponse.json({ success: true, sessionId: result.sessionId });
      if (!isDemoAdmin && isDemoMode) {
        const value = await createSignedSessionValue('admin', 24 * 60 * 60);
        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        response.headers.set('Set-Cookie', `${COOKIE_NAME}=${value}; Path=/; Max-Age=${24 * 60 * 60}; HttpOnly${secure}; SameSite=Lax`);
      }
      return response;
    }

    // Handle cleanup
    if (action === 'cleanup' && sessionId) {
      const result = await cleanupDemoData(sessionId);
      deleteSession(sessionId);
      return NextResponse.json(result);
    }

    // Handle student reset
    if (action === 'reset_student') {
      const result = await resetDemoStudent();
      return NextResponse.json(result);
    }

    // Handle step execution
    if (typeof stepIndex === 'number' && sessionId) {
      const session = getSession(sessionId);
      if (!session) {
        return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 400 });
      }

      let result: any = { success: false, error: 'Unknown step' };

      switch (stepIndex) {
        case 0: // Student arrives - Gate QR Scan
          result = await demoStep1GateEntry(sessionId);
          break;
        case 1: // Attendance Marked
          result = await demoStep2Attendance(sessionId);
          break;
        case 2: // Teacher Dashboard Updates
          result = await demoStep3TeacherDashboard(sessionId);
          break;
        case 3: // Parent Notified
          result = await demoStep4ParentNotified(sessionId);
          break;
        case 4: // Bus Boarding
          result = await demoStep5BusBoarding(sessionId);
          break;
        case 5: // Parent: Bus Tracking
          result = await demoStep6ParentBusNotified(sessionId);
          break;
        case 6: // Homework Assigned
          result = await demoStep7HomeworkAssigned(sessionId);
          break;
        case 7: // Teacher Awards Campus Coins
          result = await demoStep8AwardCoins(sessionId);
          break;
        case 8: // Student Redeems Reward
          result = await demoStep9RedeemReward(sessionId);
          if (result.success && result.redemptionId) {
            setSession(sessionId, { redemptionId: result.redemptionId });
          }
          break;
        case 9: // QR Generated
          const redemptionIdForQR = getSession(sessionId)?.redemptionId || '';
          result = await demoStep10QRGenerated(sessionId, redemptionIdForQR);
          break;
        case 10: // Vendor Scans QR
          const redemptionIdForScan = getSession(sessionId)?.redemptionId || '';
          result = await demoStep11VendorScan(sessionId, redemptionIdForScan);
          break;
        case 11: // Inventory Updates
          result = await demoStep12InventoryUpdate(sessionId);
          break;
        case 12: // Analytics Update
          result = await demoStep13AnalyticsUpdate(sessionId);
          break;
        case 13: // Student Deboards
          result = await demoStep14Deboard(sessionId);
          break;
        case 14: // Home Safe Confirmed
          result = await demoStep15HomeSafe(sessionId);
          break;
      }

      return NextResponse.json({ success: result.success, data: result, error: result.error });
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch (e: any) {
    console.error('[Demo Runner API] Error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
