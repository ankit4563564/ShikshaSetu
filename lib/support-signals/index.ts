/**
 * Support Signal Engine
 * 
 * Deterministic rules-based engine that generates support signals from actual student records.
 * No AI/ML - uses clear, explainable rules on real data.
 */

import { createClient } from '@/lib/supabase/client';
import { getCanonicalStudentState } from '@/lib/canonical';

// ============================================================================
// Types
// ============================================================================

export interface SupportSignal {
  id: string;
  studentId: string;
  studentName: string;
  signalType: 'homework_gap' | 'attendance_decline' | 'grade_drop' | 'wellness_concern' | 'composite';
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
  evidence: EvidenceItem[];
  recommendedActions: RecommendedAction[];
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
}

export interface EvidenceItem {
  source: string;
  description: string;
  value: any;
  timestamp: string;
}

export interface RecommendedAction {
  id: string;
  action: string;
  category: 'academic' | 'wellness' | 'communication' | 'intervention';
  priority: 'low' | 'medium' | 'high';
  description: string;
}

// ============================================================================
// Rule Functions
// ============================================================================

/**
 * Rule: Detect consecutive homework misses
 * Threshold: 3+ consecutive missed assignments
 */
async function detectHomeworkGap(studentId: string, studentName: string): Promise<SupportSignal | null> {
  const supabase = createClient();
  
  console.log('[Homework Gap] Checking for student:', studentId);
  
  // Get homework records, sorted by due date
  const { data: homework, error } = await supabase
    .from('homework')
    .select('*')
    .eq('student_id', studentId)
    .gte('due_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('due_date', { ascending: false });

  console.log('[Homework Gap] Homework query result:', { error, count: homework?.length, homework });
  
  if (error || !homework) {
    console.error('[Homework Gap] Query failed or no homework found');
    return null;
  }

  // Find consecutive missed assignments
  let consecutiveMissed = 0;
  const missedAssignments: any[] = [];
  
  for (const hw of homework) {
    console.log('[Homework Gap] Checking assignment:', hw.title, 'submitted_at:', hw.submitted_at, 'is_submitted:', hw.is_submitted, 'due_date:', hw.due_date);
    if (!hw.is_submitted && new Date(hw.due_date) < new Date()) {
      consecutiveMissed++;
      missedAssignments.push(hw);
    } else {
      break;
    }
  }

  console.log('[Homework Gap] Consecutive missed:', consecutiveMissed, 'Required: 3');
  
  if (consecutiveMissed < 3) {
    console.log('[Homework Gap] Not enough consecutive misses');
    return null;
  }

  // Build evidence
  const evidence: EvidenceItem[] = missedAssignments.map(hw => ({
    source: 'homework',
    description: `${hw.subject}: ${hw.title} - missed (due ${new Date(hw.due_date).toLocaleDateString()})`,
    value: { subject: hw.subject, title: hw.title, dueDate: hw.due_date },
    timestamp: hw.due_date,
  }));

  // Build recommended actions
  const recommendedActions: RecommendedAction[] = [
    {
      id: 'act-1',
      action: 'Send parent update about missed homework',
      category: 'communication',
      priority: 'high',
      description: 'Inform parent about consecutive homework misses and request support at home',
    },
    {
      id: 'act-2',
      action: 'Assign recovery practice sheet',
      category: 'academic',
      priority: 'medium',
      description: 'Provide additional practice materials for missed topics',
    },
    {
      id: 'act-3',
      action: 'Schedule teacher check-in',
      category: 'intervention',
      priority: 'medium',
      description: 'Meet with student to understand barriers to homework completion',
    },
  ];

  return {
    id: `signal-${Date.now()}`,
    studentId,
    studentName,
    signalType: 'homework_gap',
    severity: consecutiveMissed >= 5 ? 'high' : 'medium',
    detectedAt: new Date().toISOString(),
    evidence,
    recommendedActions,
    status: 'pending',
  };
}

/**
 * Rule: Detect attendance decline
 * Threshold: Attendance dropped by 10%+ in recent week vs previous weeks
 */
async function detectAttendanceDecline(studentId: string, studentName: string): Promise<SupportSignal | null> {
  const supabase = createClient();
  
  // Get attendance for last 30 days
  const { data: attendance, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error || !attendance || attendance.length < 14) return null;

  // Calculate rates
  const recentWeek = attendance.slice(0, 7);
  const previousWeeks = attendance.slice(7);

  const recentPresent = recentWeek.filter(a => a.status === 'present').length;
  const previousPresent = previousWeeks.filter(a => a.status === 'present').length;

  const recentRate = recentPresent / recentWeek.length;
  const previousRate = previousPresent / previousWeeks.length;

  const decline = previousRate - recentRate;

  if (decline < 0.10) return null; // Less than 10% decline

  // Build evidence
  const evidence: EvidenceItem[] = [
    {
      source: 'attendance',
      description: `Attendance declined from ${Math.round(previousRate * 100)}% to ${Math.round(recentRate * 100)}%`,
      value: { previousRate, recentRate, decline },
      timestamp: new Date().toISOString(),
    },
    ...recentWeek.filter(a => a.status !== 'present').map(a => ({
      source: 'attendance',
      description: `Absent on ${new Date(a.date).toLocaleDateString()} (${a.notes || 'no note'})`,
      value: { date: a.date, status: a.status, notes: a.notes },
      timestamp: a.date,
    })),
  ];

  // Build recommended actions
  const recommendedActions: RecommendedAction[] = [
    {
      id: 'act-1',
      action: 'Contact parent about attendance pattern',
      category: 'communication',
      priority: 'high',
      description: 'Discuss recent absences and identify any underlying issues',
    },
    {
      id: 'act-2',
      action: 'Check for wellness concerns',
      category: 'wellness',
      priority: 'medium',
      description: 'Review recent mood check-ins for signs of distress',
    },
  ];

  return {
    id: `signal-${Date.now()}`,
    studentId,
    studentName,
    signalType: 'attendance_decline',
    severity: decline >= 0.20 ? 'high' : 'medium',
    detectedAt: new Date().toISOString(),
    evidence,
    recommendedActions,
    status: 'pending',
  };
}

/**
 * Rule: Detect grade drop
 * Threshold: Grade dropped by 15%+ in recent assessment
 */
async function detectGradeDrop(studentId: string, studentName: string): Promise<SupportSignal | null> {
  const supabase = createClient();
  
  // Get recent grades
  const { data: grades, error } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', studentId)
    .order('assessment_date', { ascending: false })
    .limit(10);

  if (error || !grades || grades.length < 2) return null;

  // Compare most recent with previous
  const mostRecent = grades[0];
  const previous = grades[1];

  if (mostRecent.subject !== previous.subject) return null; // Different subjects, not comparable

  const recentPercentage = (mostRecent.score / mostRecent.max_score) * 100;
  const previousPercentage = (previous.score / previous.max_score) * 100;

  const drop = previousPercentage - recentPercentage;

  if (drop < 15) return null; // Less than 15% drop

  // Build evidence
  const evidence: EvidenceItem[] = [
    {
      source: 'grades',
      description: `${mostRecent.subject}: ${previous.assessment_name} (${Math.round(previousPercentage)}%) → ${mostRecent.assessment_name} (${Math.round(recentPercentage)}%)`,
      value: { subject: mostRecent.subject, previous: previousPercentage, recent: recentPercentage, drop },
      timestamp: mostRecent.assessment_date,
    },
  ];

  // Build recommended actions
  const recommendedActions: RecommendedAction[] = [
    {
      id: 'act-1',
      action: 'Review assessment with student',
      category: 'academic',
      priority: 'medium',
      description: 'Identify specific topics where student struggled',
    },
    {
      id: 'act-2',
      action: 'Provide targeted remediation',
      category: 'academic',
      priority: 'medium',
      description: 'Assign practice materials for identified weak areas',
    },
  ];

  return {
    id: `signal-${Date.now()}`,
    studentId,
    studentName,
    signalType: 'grade_drop',
    severity: drop >= 25 ? 'high' : 'medium',
    detectedAt: new Date().toISOString(),
    evidence,
    recommendedActions,
    status: 'pending',
  };
}

/**
 * Rule: Detect wellness concern
 * Threshold: 2+ consecutive low mood check-ins (mood_value <= 2)
 */
async function detectWellnessConcern(studentId: string, studentName: string): Promise<SupportSignal | null> {
  const supabase = createClient();
  
  // Get recent mood check-ins
  const { data: moods, error } = await supabase
    .from('mood_checkins')
    .select('*')
    .eq('student_id', studentId)
    .order('checked_in_at', { ascending: false })
    .limit(7);

  if (error || !moods || moods.length < 2) return null;

  // Count consecutive low moods
  let consecutiveLow = 0;
  const lowMoods: any[] = [];
  
  for (const mood of moods) {
    if (mood.mood_value <= 2) {
      consecutiveLow++;
      lowMoods.push(mood);
    } else {
      break;
    }
  }

  if (consecutiveLow < 2) return null;

  // Build evidence
  const evidence: EvidenceItem[] = lowMoods.map(m => ({
    source: 'mood',
    description: `Mood check-in: ${m.mood_label} (${m.note || 'no note'})`,
    value: { moodValue: m.mood_value, moodLabel: m.mood_label, note: m.note },
    timestamp: m.checked_in_at,
  }));

  // Build recommended actions - wellness-focused
  const recommendedActions: RecommendedAction[] = [
    {
      id: 'act-1',
      action: 'Wellness check-in with school counselor',
      category: 'wellness',
      priority: consecutiveLow >= 4 ? 'high' : 'medium',
      description: 'Schedule a brief wellness check-in to understand mood patterns',
    },
    {
      id: 'act-2',
      action: 'Inform parent about wellness concern',
      category: 'communication',
      priority: consecutiveLow >= 4 ? 'high' : 'low',
      description: 'Share wellness concern with parent for home support',
    },
    {
      id: 'act-3',
      action: 'Monitor daily mood check-ins',
      category: 'wellness',
      priority: 'medium',
      description: 'Encourage daily mood check-ins to track improvement',
    },
  ];

  return {
    id: `signal-${Date.now()}`,
    studentId,
    studentName,
    signalType: 'wellness_concern',
    severity: consecutiveLow >= 4 ? 'high' : 'medium',
    detectedAt: new Date().toISOString(),
    evidence,
    recommendedActions,
    status: 'pending',
  };
}

/**
 * Composite signal: Multiple concerning patterns detected
 */
async function detectCompositeSignal(studentId: string, studentName: string): Promise<SupportSignal | null> {
  const signals = await Promise.all([
    detectHomeworkGap(studentId, studentName),
    detectAttendanceDecline(studentId, studentName),
    detectGradeDrop(studentId, studentName),
    detectWellnessConcern(studentId, studentName),
  ]);

  const activeSignals = signals.filter(s => s !== null);

  if (activeSignals.length < 2) return null;

  // Combine evidence from all signals
  const evidence: EvidenceItem[] = activeSignals.flatMap(s => s!.evidence);

  // Build composite recommended actions
  const recommendedActions: RecommendedAction[] = [
    {
      id: 'act-1',
      action: 'Comprehensive intervention plan',
      category: 'intervention',
      priority: 'high',
      description: 'Address multiple concerning patterns with coordinated support',
    },
    {
      id: 'act-2',
      action: 'Parent-teacher conference',
      category: 'communication',
      priority: 'high',
      description: 'Schedule meeting to discuss comprehensive support plan',
    },
  ];

  return {
    id: `signal-${Date.now()}`,
    studentId,
    studentName,
    signalType: 'composite',
    severity: 'high',
    detectedAt: new Date().toISOString(),
    evidence,
    recommendedActions,
    status: 'pending',
  };
}

// ============================================================================
// Main Signal Detection Function
// ============================================================================

export async function detectSupportSignals(studentId: string, studentName: string): Promise<SupportSignal[]> {
  const signals = await Promise.all([
    detectHomeworkGap(studentId, studentName),
    detectAttendanceDecline(studentId, studentName),
    detectGradeDrop(studentId, studentName),
    detectWellnessConcern(studentId, studentName),
    detectCompositeSignal(studentId, studentName),
  ]);

  return signals.filter(s => s !== null);
}

/**
 * Get support signals for canonical demo student (Aarav)
 */
export async function getCanonicalSupportSignal(): Promise<SupportSignal | null> {
  const state = await getCanonicalStudentState();
  if (!state.student) {
    console.error('[Support Signals] No canonical student found');
    return null;
  }

  console.log('[Support Signals] Detecting signals for:', state.student.id, state.student.display_name);
  const signals = await detectSupportSignals(state.student.id, state.student.display_name);
  console.log('[Support Signals] Detected signals:', signals.length, signals);
  
  // Return highest severity signal, or composite if available
  const composite = signals.find(s => s.signalType === 'composite');
  if (composite) return composite;

  const highSeverity = signals.find(s => s.severity === 'high');
  if (highSeverity) return highSeverity;

  return signals[0] || null;
}
