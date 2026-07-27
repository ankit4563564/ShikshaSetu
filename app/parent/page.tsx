import { getStudentsData } from '@/lib/supabase';
import { calculateStudentStatus } from '@/lib/rules-engine/calculateStatus';
import { generateParentOfflineFallback } from '@/lib/ai-narration/generateParentNote';
import ParentTodayClient from '@/components/parent/ParentTodayClientRefactored';
import LanguageToggle from '@/components/shared/LanguageToggle';
import { LanguageProvider } from '@/components/shared/LanguageContext';
import { auth, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { linkClerkUser } from '@/lib/auth/authOnboarding';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { buildStudentProductInsight } from '@/lib/product-intelligence';
import { shouldSuppressAlerts } from '@/lib/calendar/checkCalendar';

export const revalidate = 60;

export default async function ParentPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let guardianId: string | null = null;
  let guardianName: string = 'Sunita Sharma';
  let guardianEmail: string = '';
  let linkedStudentIds: string[] = [];
  const cookieStore = cookies();
  const langCookie = cookieStore.get('shikshasetu-lang')?.value;
  let parentLanguage: string = langCookie || 'en';

  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  // 1. Clerk Authentication Check & Onboarding Link
  // 1. Clerk Authentication Check & Onboarding Link
  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress || '';

      // Idempotent account onboarding linking on first login
      const onboarding = await linkClerkUser(userId, email);
      if (!onboarding.success) {
        console.warn('[Parent Onboarding] Warning:', onboarding.error);
      }

      // Query database to fetch linked guardian (admin client bypasses RLS)
      const adminDb = createAdminClient();
      const { data: guardian } = await adminDb
        .from('guardians')
        .select('id, first_name, last_name, email, preferred_language')
        .eq('clerk_user_id', userId)
        .limit(1)
        .maybeSingle();

      if (guardian) {
        guardianId = guardian.id;
        guardianName = `${guardian.first_name} ${guardian.last_name}`;
        guardianEmail = guardian.email;
        parentLanguage = guardian.preferred_language || 'en';

        // Fetch linked children from guardian_access table
        const { data: access } = await adminDb
          .from('guardian_access')
          .select('student_id')
          .eq('guardian_id', guardian.id);

        linkedStudentIds = (access || []).map((a: any) => a.student_id);
      }
    }
  }

  // 2. Fetch raw student data from Supabase (or fallback seed mock data)
  const studentsRaw = await getStudentsData();

  // 3. Filter to only this parent's linked children
  const myStudents = linkedStudentIds.length > 0
    ? studentsRaw.filter((s) => linkedStudentIds.includes(s.studentId))
    : studentsRaw;

  // 4. Check if alerts should be suppressed (exam period/holiday)
  const suppressAlerts = await shouldSuppressAlerts();

  // 5. Batch fetch evidence_logs and gate_passes for all students (fix N+1)
  const supabase = createClient();
  const studentIdsList = myStudents.map((s) => s.studentId);
  const [{ data: allDbLogs }, { data: allGatePasses }] = await Promise.all([
    supabase.from('evidence_logs').select('id, source_type, headline, bullets, raw_data, student_id').in('student_id', studentIdsList).order('generated_at', { ascending: false }),
    supabase.from('gate_passes').select('id, status, pickup_window_start, pickup_window_end, pass_code, reason, used_at, rejection_reason, student_id').in('student_id', studentIdsList).order('created_at', { ascending: false }),
  ]);

  const logsByStudent = new Map<string, any[]>();
  (allDbLogs || []).forEach((log: any) => {
    const existing = logsByStudent.get(log.student_id) || [];
    existing.push(log);
    logsByStudent.set(log.student_id, existing);
  });

  const gatePassesByStudent = new Map<string, any[]>();
  (allGatePasses || []).forEach((gp: any) => {
    const existing = gatePassesByStudent.get(gp.student_id) || [];
    existing.push(gp);
    gatePassesByStudent.set(gp.student_id, existing);
  });

  // 6. Evaluate academic rules and build parent summaries for each student
  const processedStudents = myStudents.map((student) => {
    const evaluation = calculateStudentStatus(student, suppressAlerts);

    const finalStatus = student.activeStatusFlag?.isCorrected ? 'On Track' : evaluation.status;
    const finalEvaluation = { ...evaluation, status: finalStatus };

    const dbLogs = logsByStudent.get(student.studentId) || [];
    const gatePasses = gatePassesByStudent.get(student.studentId) || [];

    const customEvidenceItems = (dbLogs || []).map((log: any) => {
      const raw = log.raw_data as any;
      const bullets = [...(Array.isArray(log.bullets) ? log.bullets : [log.bullets])];

      if (raw?.parentTranslations && parentLanguage && raw.parentTranslations[parentLanguage]) {
        bullets.push(`Translation (${parentLanguage}): ${raw.parentTranslations[parentLanguage]}`);
      }

      return {
        id: `db-log-${log.id}`,
        status: 'on-track' as 'on-track' | 'worth-watching' | 'needs-attention',
        headline: log.headline,
        bullets,
      };
    });

    const combinedEvidence = [...customEvidenceItems, ...evaluation.evidence];

    const noteResult = generateParentOfflineFallback(student.displayName, finalStatus);

    return {
      studentId: student.studentId,
      displayName: student.displayName,
      parentName: guardianName,
      parentEmail: guardianEmail,
      parentType: 'sunita' as 'sunita' | 'kavita',
      noteResult,
      homework: student.homework,
      attendance: student.attendance,
      gatePasses: gatePasses || [],
      evidence: combinedEvidence,
      productInsight: buildStudentProductInsight({
        student,
        evaluation: finalEvaluation,
        evidence: combinedEvidence,
        gatePasses: gatePasses || [],
      }),
    };
  });

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-0 sm:p-4">
        <ParentTodayClient
          studentsData={processedStudents}
          initialParentType={'sunita'}
          isClerkActive={!!clerkKey}
          guardianId={guardianId}
        />
      </div>
    </LanguageProvider>
  );
}
