/**
 * Canonical Data Access Layer
 * 
 * This module provides the authoritative source for Aarav Sharma's demo data.
 * All portals should use these functions to access canonical student state.
 * 
 * Canonical Student ID: 00000000-0000-4000-8000-000000000001
 * Canonical Teacher ID: 00000000-0000-4000-8000-000000000002
 * Canonical Guardian ID: 00000000-0000-4000-8000-000000000003
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Canonical IDs
export const CANONICAL_STUDENT_ID = '00000000-0000-4000-8000-000000000001';
export const CANONICAL_TEACHER_ID = '00000000-0000-4000-8000-000000000002';
export const CANONICAL_GUARDIAN_ID = '00000000-0000-4000-8000-000000000003';

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
  date_of_birth: string;
  class_teacher_id: string;
}

export async function getCanonicalStudent(): Promise<CanonicalStudent | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', CANONICAL_STUDENT_ID)
    .single();
  
  if (error) {
    console.error('[Canonical] Failed to fetch student:', error);
    return null;
  }
  
  return data;
}

// ============================================================================
// Canonical Attendance
// ============================================================================

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  rate: number; // 0-1
  recentTrend: 'improving' | 'declining' | 'stable';
}

export async function getCanonicalAttendance(days: number = 30): Promise<AttendanceRecord[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', CANONICAL_STUDENT_ID)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false });
  
  if (error) {
    console.error('[Canonical] Failed to fetch attendance:', error);
    return [];
  }
  
  return data || [];
}

export async function getCanonicalAttendanceSummary(days: number = 30): Promise<AttendanceSummary> {
  const records = await getCanonicalAttendance(days);
  
  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const rate = totalDays > 0 ? presentDays / totalDays : 0;
  
  // Calculate trend by comparing first half vs second half
  const midPoint = Math.floor(records.length / 2);
  const firstHalf = records.slice(midPoint);
  const secondHalf = records.slice(0, midPoint);
  
  const firstHalfPresent = firstHalf.filter(r => r.status === 'present').length / (firstHalf.length || 1);
  const secondHalfPresent = secondHalf.filter(r => r.status === 'present').length / (secondHalf.length || 1);
  
  let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (secondHalfPresent > firstHalfPresent + 0.1) recentTrend = 'improving';
  else if (secondHalfPresent < firstHalfPresent - 0.1) recentTrend = 'declining';
  
  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    rate,
    recentTrend,
  };
}

// ============================================================================
// Canonical Homework
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

export async function getCanonicalHomework(days: number = 30): Promise<HomeworkRecord[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .eq('student_id', CANONICAL_STUDENT_ID)
    .gte('due_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('due_date', { ascending: false });
  
  if (error) {
    console.error('[Canonical] Failed to fetch homework:', error);
    return [];
  }
  
  return data || [];
}

export async function getCanonicalHomeworkSummary(days: number = 30): Promise<HomeworkSummary> {
  const records = await getCanonicalHomework(days);
  
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
// Canonical Grades
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

export async function getCanonicalGrades(): Promise<GradeRecord[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', CANONICAL_STUDENT_ID)
    .order('assessment_date', { ascending: false });
  
  if (error) {
    console.error('[Canonical] Failed to fetch grades:', error);
    return [];
  }
  
  return (data || []).map(g => ({
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

export async function getCanonicalMoodCheckins(days: number = 30): Promise<MoodCheckin[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('mood_checkins')
    .select('*')
    .eq('student_id', CANONICAL_STUDENT_ID)
    .gte('checked_in_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('checked_in_at', { ascending: false });
  
  if (error) {
    console.error('[Canonical] Failed to fetch mood check-ins:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// Canonical Evidence Logs
// ============================================================================

export interface EvidenceLog {
  id: string;
  source_type: string;
  headline: string;
  bullets: string[];
  raw_data: any;
  generated_at: string;
}

export async function getCanonicalEvidenceLogs(): Promise<EvidenceLog[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('evidence_logs')
    .select('*')
    .eq('student_id', CANONICAL_STUDENT_ID)
    .order('generated_at', { ascending: false });
  
  if (error) {
    console.error('[Canonical] Failed to fetch evidence logs:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// Canonical Status Flag
// ============================================================================

export interface StatusFlag {
  id: string;
  status: 'on_track' | 'worth_watching' | 'needs_attention';
  action_status: 'unseen' | 'seen' | 'action_taken' | 'resolved';
  created_at: string;
}

export async function getCanonicalStatusFlag(): Promise<StatusFlag | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('status_flags')
    .select('*')
    .eq('student_id', CANONICAL_STUDENT_ID)
    .is('resolved_at', null)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No active flag
      return null;
    }
    console.error('[Canonical] Failed to fetch status flag:', error);
    return null;
  }
  
  return data;
}

// ============================================================================
// Canonical Bus Location
// ============================================================================

export interface BusLocation {
  bus_identifier: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
  next_stop: string;
  eta_minutes: number;
  recorded_at: string;
  last_updated: string;
}

export async function getCanonicalBusLocation(): Promise<BusLocation | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('bus_locations')
    .select('*')
    .eq('bus_identifier', 'BUS-001')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('[Canonical] Failed to fetch bus location:', error);
    return null;
  }
  
  // Map database fields to interface, providing defaults for new fields
  return {
    bus_identifier: data.bus_identifier,
    latitude: data.latitude,
    longitude: data.longitude,
    speed_kmh: data.speed_kmh,
    heading: data.heading,
    next_stop: (data as any).next_stop || 'School Gate',
    eta_minutes: (data as any).eta_minutes || 5,
    recorded_at: data.recorded_at,
    last_updated: (data as any).last_updated || data.recorded_at,
  };
}


// ============================================================================
// Canonical Complete State (for portals)
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

export async function getCanonicalStudentState(): Promise<CanonicalStudentState> {
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
    getCanonicalStudent(),
    getCanonicalAttendance(30),
    getCanonicalAttendanceSummary(30),
    getCanonicalHomework(30),
    getCanonicalHomeworkSummary(30),
    getCanonicalGrades(),
    getCanonicalMoodCheckins(30),
    getCanonicalEvidenceLogs(),
    getCanonicalStatusFlag(),
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
