import { getStudentsData } from '@/lib/supabase';
import { calculateStudentStatus } from '@/lib/rules-engine/calculateStatus';
import { generateOfflineFallback } from '@/lib/ai-narration/generateExplanation';
import TeacherDashboardClient from '@/components/teacher/TeacherDashboardClient';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { auth, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { linkClerkUser } from '@/lib/auth/authOnboarding';
import { redirect } from 'next/navigation';
import { buildStudentProductInsight } from '@/lib/product-intelligence';
import { shouldSuppressAlerts } from '@/lib/calendar/checkCalendar';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Ensure the page is rendered dynamically to fetch fresh DB data
export const revalidate = 60;

export default async function TeacherPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let activeTeacherId = 'a1000000-0000-4000-8000-000000000001'; // Default seeded Ananya Mehra

  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  // 1. Clerk Authentication Check & Onboarding Link
  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress || '';

      // Idempotent account onboarding linking on first login
      const onboarding = await linkClerkUser(userId, email);
      if (!onboarding.success) {
        console.warn('[Teacher Onboarding] Warning:', onboarding.error);
      }

      // Query database to fetch linked teacher record (admin client bypasses RLS)
      const adminDb = createAdminClient();
      const { data: teacher } = await adminDb
        .from('teachers')
        .select('id')
        .eq('clerk_user_id', userId)
        .limit(1)
        .maybeSingle();

      if (teacher) {
        activeTeacherId = teacher.id;
      }
    }
  }

  // 2. Fetch raw student data from Supabase (falls back to seeds if connection offline)
  const studentsRaw = await getStudentsData();

  // 3. Fetch latest morning context notes (Parent heads-up per Section 16)
  const supabase = createClient();
  const { data: dbNotes } = await supabase
    .from('chat_messages')
    .select('student_id, content')
    .eq('is_context_flag', true)
    .order('created_at', { ascending: false });

  const morningNotesMap: Record<string, string> = {};
  if (dbNotes) {
    dbNotes.forEach((note: any) => {
      if (!morningNotesMap[note.student_id]) {
        morningNotesMap[note.student_id] = note.content;
      }
    });
  }

  // If Clerk key is defined and a teacher record is found, we filter students to only show their assigned class students
  const filteredRawStudents = clerkKey
    ? studentsRaw.filter((s) => s.classTeacherId === activeTeacherId || !s.classTeacherId)
    : studentsRaw;

  // 4.5 Fetch gate pass requests for class students
  const { data: dbPasses } = await supabase
    .from('gate_passes')
    .select(`
      id,
      student_id,
      status,
      pickup_window_start,
      pickup_window_end,
      reason,
      pass_code,
      used_at,
      students (
        display_name
      ),
      guardians (
        first_name,
        last_name
      )
    `)
    .in('student_id', filteredRawStudents.map((s) => s.studentId))
    .order('created_at', { ascending: false });

  const passesByStudent = new Map<string, any[]>();
  (dbPasses || []).forEach((pass: any) => {
    const existing = passesByStudent.get(pass.student_id) || [];
    existing.push(pass);
    passesByStudent.set(pass.student_id, existing);
  });

  // 4. Check if alerts should be suppressed (exam period/holiday)
  const suppressAlerts = await shouldSuppressAlerts();

  // 5. Fetch all evidence_logs in one batch query (FIX: N+1 queries resolved)
  // VERIFIED: This batches all evidence logs in a single query instead of per-student
  const studentIds = filteredRawStudents.map((s) => s.studentId);
  const { data: allDbLogs } = await supabase
    .from('evidence_logs')
    .select('id, source_type, headline, bullets, student_id')
    .in('student_id', studentIds)
    .order('generated_at', { ascending: false });

  // Group logs by student for O(1) lookup
  const logsByStudent = new Map<string, any[]>();
  (allDbLogs || []).forEach((log: any) => {
    const existing = logsByStudent.get(log.student_id) || [];
    existing.push(log);
    logsByStudent.set(log.student_id, existing);
  });

  // 6. Evaluate rules engine and trigger AI narration generator
  const processedStudents = filteredRawStudents.map((student) => {
    const evaluation = calculateStudentStatus(student, suppressAlerts);

    const dbLogs = logsByStudent.get(student.studentId) || [];

    const customEvidenceItems = (dbLogs || []).map((log: any) => ({
      id: `db-log-${log.id}`,
      status: (log.source_type === 'academic' || log.source_type === 'homework') ? 'on-track' as 'on-track' | 'worth-watching' | 'needs-attention' : 'worth-watching' as 'on-track' | 'worth-watching' | 'needs-attention',
      headline: log.headline,
      bullets: Array.isArray(log.bullets) ? log.bullets : [log.bullets],
    }));

    const combinedEvidence = [...customEvidenceItems, ...evaluation.evidence];

    const explanation = generateOfflineFallback(student.displayName, combinedEvidence);

    const statusOverride = student.activeStatusFlag?.isCorrected ? 'On Track' : evaluation.status;
    const finalEvaluation = { ...evaluation, status: statusOverride };

    return {
      ...student,
      ...evaluation,
      evidence: combinedEvidence,
      status: statusOverride,
      photoUrl: null,
      explanation,
      activeStatusFlag: student.activeStatusFlag || null,
      morningNote: morningNotesMap[student.studentId] || null,
      productInsight: buildStudentProductInsight({
        student,
        evaluation: finalEvaluation,
        evidence: combinedEvidence,
        gatePasses: passesByStudent.get(student.studentId) || [],
        morningNote: morningNotesMap[student.studentId] || null,
      }),
    };
  });

  // 7. Render client dashboard grid
  return (
    <ErrorBoundary portalName="Teacher Portal">
      <TeacherDashboardClient 
        initialStudents={processedStudents} 
        rawStudentsData={filteredRawStudents} 
        teacherId={activeTeacherId}
        gatePasses={dbPasses || []}
      />
    </ErrorBoundary>
  );
}
