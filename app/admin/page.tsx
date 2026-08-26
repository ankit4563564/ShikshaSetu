import { createClient } from '@/lib/supabase/server';
import { getStudentsData } from '@/lib/supabase';
import { calculateStudentStatus } from '@/lib/rules-engine/calculateStatus';
import { getTeacherWellnessMetricsAction } from '@/app/actions/wellnessActions';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { auth, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { linkClerkUser } from '@/lib/auth/authOnboarding';
import { redirect } from 'next/navigation';
import { buildAdminOpsInsight } from '@/lib/product-intelligence';

export const revalidate = 60;

export default async function AdminPage() {
  const supabase = createClient();
  let activeAdminId: string | null = null;
  let adminName = 'Administrator';

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());
  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/login');
    }

    const { getAuthContext } = await import('@/lib/auth/getAuthContext');
    try {
      const context = await getAuthContext();
      if (context.role !== 'admin' && context.role !== 'principal') {
        redirect(`/unauthorized?portal=admin&currentRole=${context.role}`);
      }
    } catch (_err) {
      redirect('/unauthorized?reason=unconfigured_account');
    }

    const user = await currentUser();
    adminName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator';
    const email = user?.emailAddresses[0]?.emailAddress || '';
    await linkClerkUser(userId, email);

    const adminDb = createAdminClient();
    const { data: admin } = await adminDb
      .from('admins')
      .select('id')
      .eq('clerk_user_id', userId)
      .limit(1)
      .maybeSingle();

    if (admin) {
      activeAdminId = admin.id;
    }
  }

  const studentsRaw = await getStudentsData();
  const processedStudents = studentsRaw.map(s => {
    const evaluation = calculateStudentStatus(s);
    const statusOverride = s.activeStatusFlag?.isCorrected ? 'On Track' : evaluation.status;
    return { ...s, status: statusOverride };
  });

  const totalStudents = processedStudents.length;
  const needsAttention = processedStudents.filter(s => s.status === 'Needs Attention').length;
  const worthWatching = processedStudents.filter(s => s.status === 'Worth Watching').length;
  const onTrack = processedStudents.filter(s => s.status === 'On Track').length;

  let totalAttDays = 0;
  let presentAttDays = 0;
  studentsRaw.forEach(s => {
    (s.attendance || []).forEach(att => {
      totalAttDays++;
      if (att.status === 'present' || att.status === 'late') {
        presentAttDays++;
      }
    });
  });
  // ✅ C3 FIX: Round attendance rate to 1 decimal place (99.34375% → 99.3%)
  const attendanceRate = totalAttDays > 0 ? parseFloat(((presentAttDays / totalAttDays) * 100).toFixed(1)) : 96.2;

  let totalMoodScore = 0;
  let totalMoodChecks = 0;
  studentsRaw.forEach(s => {
    (s.mood || []).forEach(m => {
      totalMoodScore += m.moodValue;
      totalMoodChecks++;
    });
  });
  const moodIndex = totalMoodChecks > 0 ? totalMoodScore / totalMoodChecks : 4.2;

  const { count: activePasses } = await supabase
    .from('gate_passes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: pendingPasses } = await supabase
    .from('gate_passes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: activeTrips } = await supabase
    .from('driver_trips')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'en_route');

  // Today's scan count
  const today = new Date().toISOString().split('T')[0];
  const { count: todayScans } = await supabase
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .gte('scanned_at', `${today}T00:00:00Z`);

  // Recent scan events for timeline
  const { data: recentScans } = await supabase
    .from('scan_events')
    .select('id, student_id, mode, result, scanned_at, scanner_portal')
    .order('scanned_at', { ascending: false })
    .limit(20);

  // Scanner devices count
  const { count: activeDevices } = await supabase
    .from('scanner_devices')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Gracefully skip teacher wellness metrics in demo mode (requires Clerk auth)
  const teacherMetrics = demo?.active
    ? []
    : await getTeacherWellnessMetricsAction(30, 20).catch(() => []);

  const { count: teacherAlertCount } = await supabase
    .from('status_flags')
    .select('*', { count: 'exact', head: true });

  const stats = {
    totalStudents,
    needsAttention,
    worthWatching,
    onTrack,
    attendanceRate,
    moodIndex,
    activePasses: activePasses || 0,
    pendingPasses: pendingPasses || 0,
    activeTrips: activeTrips || 0,
    todayScans: todayScans || 0,
    activeDevices: activeDevices || 0,
    teacherAlertCount: teacherAlertCount || 0,
  };

  return (
    <AdminDashboardClient
      stats={stats}
      teacherMetrics={teacherMetrics}
      adminId={activeAdminId}
      adminName={adminName}
      opsInsight={buildAdminOpsInsight(stats)}
      recentScans={(recentScans || []) as any[]}
    />
  );
}
