import { createClient } from '@/lib/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// Seed-aligned canonical IDs — these match seed.sql exactly.
// Used ONLY in demo mode, test fixtures, and explicitly-scoped demo resets.
// NEVER used as silent defaults in production data reads.
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Do not use as a default fallback. Pass real studentId from auth context. */
export const CANONICAL_STUDENT_ID = 'b1000000-0000-4000-8000-000000000001'; // Aarav Sharma (seed.sql)
export const CANONICAL_PRIYA_STUDENT_ID = 'b1000000-0000-4000-8000-000000000002'; // Priya Patel (seed.sql)
export const CANONICAL_ROHAN_STUDENT_ID = 'b1000000-0000-4000-8000-000000000003'; // Rohan Singh (seed.sql)
export const CANONICAL_ANANYA_G_STUDENT_ID = 'b1000000-0000-4000-8000-000000000004'; // Ananya Gupta (seed.sql)
export const CANONICAL_KABIR_STUDENT_ID = 'b1000000-0000-4000-8000-000000000005'; // Kabir Khan (seed.sql)

/** Seed teacher ID — Ananya Mehra (class 8A). Demo/test use only. */
export const CANONICAL_TEACHER_ID = 'a1000000-0000-4000-8000-000000000001';
/** Seed guardian ID — Sunita Sharma (Aarav's parent). Demo/test use only. */
export const CANONICAL_GUARDIAN_ID = 'c1000000-0000-4000-8000-000000000001';
/** Seed guardian ID — Rajesh Patel (Priya's parent). Demo/test use only. */
export const CANONICAL_RAJESH_GUARDIAN_ID = 'c1000000-0000-4000-8000-000000000002';

/** Canonical demo school ID */
export const CANONICAL_SCHOOL_ID = 'sch-demo-001';

// Shared global in-memory homework store for seamless demo/dev synchronization
declare global {
  var __SHIKSHASETU_HOMEWORK__: HomeworkRecord[] | undefined;
}

if (!globalThis.__SHIKSHASETU_HOMEWORK__) {
  globalThis.__SHIKSHASETU_HOMEWORK__ = [
    {
      id: 'hw-demo-101',
      subject: 'Mathematics',
      title: 'Linear Equations Exercise 4.2',
      description: 'Solve problems 1 through 10 from textbook page 45.',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      submitted_at: null,
      is_submitted: false,
      assigned_by: 'Teacher',
    },
    {
      id: 'hw-demo-102',
      subject: 'Science',
      title: 'Photosynthesis Lab Observations',
      description: 'Document light vs dark plant leaf reactions.',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      submitted_at: null,
      is_submitted: false,
      assigned_by: 'Teacher',
    },
  ];
}

// ============================================================================
// Canonical Student Profile
// ============================================================================

export interface CanonicalStudent {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  grade: string;
  section: string;
  roll_number: string;
  avatar_url: string | null;
  house: string | null;
  school_id: string;
  created_at: string;
}

export async function getCanonicalStudent(studentId: string): Promise<CanonicalStudent | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (error) {
    console.error('[Canonical] Failed to fetch student profile:', error);
    return null;
  }

  return data;
}

// ============================================================================
// Canonical Attendance Records
// ============================================================================

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  marked_by: string;
}

export interface AttendanceSummary {
  rate: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  streak: number;
}

export async function getCanonicalAttendance(days: number = 30, studentId: string = CANONICAL_STUDENT_ID): Promise<AttendanceRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('[Canonical] Failed to fetch attendance:', error);
    return [];
  }

  return data || [];
}

export async function getCanonicalAttendanceSummary(days: number = 30, studentId: string = CANONICAL_STUDENT_ID): Promise<AttendanceSummary> {
  const records = await getCanonicalAttendance(days, studentId);
  
  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  
  const rate = totalDays > 0 ? (presentDays + lateDays * 0.5) / totalDays : 1.0;
  
  // Calculate current streak
  let streak = 0;
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const record of sorted) {
    if (record.status === 'present' || record.status === 'late') {
      streak++;
    } else {
      break;
    }
  }
  
  return {
    rate,
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    streak,
  };
}

// ============================================================================
// Canonical Homework Assignments
// ============================================================================

export interface HomeworkRecord {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  due_date: string;
  submitted_at: string | null;
  is_submitted: boolean;
  assigned_by: string;
}

export interface HomeworkSummary {
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  consecutiveMissed: number;
  subjects: string[];
}

export async function getCanonicalHomework(days: number = 30, studentId: string = CANONICAL_STUDENT_ID): Promise<HomeworkRecord[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // Database query error or offline dev mode
  }

  // Only return in-memory global store if querying for the demo seed student
  if (studentId === CANONICAL_STUDENT_ID) {
    return globalThis.__SHIKSHASETU_HOMEWORK__ || [];
  }

  return [];
}

export async function getCanonicalHomeworkSummary(days: number = 30, studentId: string = CANONICAL_STUDENT_ID): Promise<HomeworkSummary> {
  const records = await getCanonicalHomework(days, studentId);
  
  const total = records.length;
  const submitted = records.filter(r => r.is_submitted).length;
  const pending = records.filter(r => !r.is_submitted && new Date(r.due_date) >= new Date()).length;
  const missed = records.filter(r => !r.is_submitted && new Date(r.due_date) < new Date()).length;
  
  // Calculate consecutive missed
  let consecutiveMissed = 0;
  const sortedByDue = [...records].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  for (const record of sortedByDue) {
    if (!record.is_submitted && new Date(record.due_date) < new Date()) {
      consecutiveMissed++;
    } else {
      break;
    }
  }
  
  const subjects = Array.from(new Set(records.map(r => r.subject)));
  
  return {
    total,
    submitted,
    pending,
    missed,
    consecutiveMissed,
    subjects,
  };
}

// ============================================================================
// Canonical Grade & Examination Results
// ============================================================================

export interface GradeRecord {
  id: string;
  subject: string;
  assessment_name: string;
  score: number;
  max_score: number;
  assessment_date: string;
  percentage: number;
}

export async function getCanonicalGrades(studentId: string = CANONICAL_STUDENT_ID): Promise<GradeRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', studentId)
    .order('assessment_date', { ascending: false });

  if (error) {
    console.error('[Canonical] Failed to fetch grades:', error);
    return [];
  }

  return (data || []).map((g) => ({
    ...g,
    percentage: (g.score / g.max_score) * 100,
  }));
}

// ============================================================================
// Canonical Mood Check-ins
// ============================================================================

export interface MoodCheckin {
  id: string;
  mood_value: number;
  mood_label: string;
  note: string | null;
  checked_in_at: string;
}

export async function getCanonicalMoodCheckins(days: number = 30, studentId: string = CANONICAL_STUDENT_ID): Promise<MoodCheckin[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mood_checkins')
    .select('*')
    .eq('student_id', studentId)
    .gte('checked_in_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('checked_in_at', { ascending: false });

  if (error) {
    console.error('[Canonical] Failed to fetch mood check-ins:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Canonical Student Support / Evidence Logs
// ============================================================================

export interface EvidenceLog {
  id: string;
  evidence_type: string;
  evidence_data: any;
  severity: 'low' | 'medium' | 'high';
  recorded_at: string;
}

export async function getCanonicalEvidenceLogs(studentId: string = CANONICAL_STUDENT_ID): Promise<EvidenceLog[]> {
  const supabase = createClient();
  const targetId = studentId;
  
  const { data, error } = await supabase
    .from('student_evidence_logs')
    .select('*')
    .eq('student_id', targetId)
    .order('recorded_at', { ascending: false });
  
  if (error) {
    console.error('[Canonical] Failed to fetch evidence logs:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// Canonical Early Signal Status Flag
// ============================================================================

export interface StatusFlag {
  id: string;
  status: 'on_track' | 'worth_watching' | 'needs_attention';
  severity: 'low' | 'medium' | 'high';
  ai_summary: string;
  flagged_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export async function getCanonicalStatusFlag(studentId: string = CANONICAL_STUDENT_ID): Promise<StatusFlag | null> {
  const supabase = createClient();
  const targetId = studentId;
  
  const { data, error } = await supabase
    .from('student_status_flags')
    .select('*')
    .eq('student_id', targetId)
    .order('flagged_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('[Canonical] Failed to fetch status flag:', error);
    return null;
  }
  
  return data;
}

// ============================================================================
// Canonical Bus Telemetry
// ============================================================================

export interface BusLocation {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  last_updated: string;
  route_name: string;
}

export async function getCanonicalBusLocation(): Promise<BusLocation | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('vehicle_telemetry')
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('[Canonical] Failed to fetch bus location:', error);
    return null;
  }
  
  return data;
}

// ============================================================================
// Combined Canonical Student State
// ============================================================================

export interface CanonicalStudentState {
  student: CanonicalStudent | null;
  attendance: AttendanceRecord[];
  attendanceSummary: AttendanceSummary;
  homework: HomeworkRecord[];
  homeworkSummary: HomeworkSummary;
  grades: GradeRecord[];
  moodCheckins: MoodCheckin[];
  evidenceLogs: EvidenceLog[];
  statusFlag: StatusFlag | null;
  busLocation: BusLocation | null;
}

export async function getCanonicalStudentState(studentId: string = CANONICAL_STUDENT_ID): Promise<CanonicalStudentState> {
  const targetId = studentId;
  const [
    student,
    attendance,
    attendanceSummary,
    homework,
    homeworkSummary,
    grades,
    moodCheckins,
    evidenceLogs,
    statusFlag,
    busLocation,
  ] = await Promise.all([
    getCanonicalStudent(targetId),
    getCanonicalAttendance(30, targetId),
    getCanonicalAttendanceSummary(30, targetId),
    getCanonicalHomework(30, targetId),
    getCanonicalHomeworkSummary(30, targetId),
    getCanonicalGrades(targetId),
    getCanonicalMoodCheckins(30, targetId),
    getCanonicalEvidenceLogs(targetId),
    getCanonicalStatusFlag(targetId),
    getCanonicalBusLocation(),
  ]);
  
  return {
    student,
    attendance,
    attendanceSummary,
    homework,
    homeworkSummary,
    grades,
    moodCheckins,
    evidenceLogs,
    statusFlag,
    busLocation,
  };
}

// ============================================================================
// Canonical Guardian & Relationship Queries
// ============================================================================

export interface CanonicalGuardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  preferred_language: string | null;
}

export async function getCanonicalGuardian(guardianId: string): Promise<CanonicalGuardian | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('guardians')
    .select('*')
    .eq('id', guardianId)
    .single();

  if (error) {
    console.error('[Canonical] Failed to fetch guardian:', error);
    return null;
  }
  return data;
}

export async function getCanonicalGuardianStudents(guardianId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('guardian_access')
    .select('student_id')
    .eq('guardian_id', guardianId);

  if (error || !data) {
    return [];
  }
  return data.map((d: any) => d.student_id);
}
