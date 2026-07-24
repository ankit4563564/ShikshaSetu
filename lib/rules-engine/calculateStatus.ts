import type { EvidenceStatus, EvidenceItem } from '@/types';
import { shouldSuppressAlerts } from '@/lib/calendar/checkCalendar';

export interface HomeworkRecord {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  submittedAt: string | null;
  isSubmitted: boolean;
}

export interface GradeRecord {
  id: string;
  subject: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  assessmentDate: string;
}

export interface MoodRecord {
  id: string;
  moodValue: number;
  moodLabel: string;
  note: string | null;
  checkedInAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
}

export interface StudentInputData {
  studentId: string;
  displayName: string;
  homework: HomeworkRecord[];
  grades: GradeRecord[];
  mood: MoodRecord[];
  attendance: AttendanceRecord[];
}

export interface StatusResult {
  studentId: string;
  displayName: string;
  status: 'On Track' | 'Worth Watching' | 'Needs Attention';
  riskScore: number;
  homeworkGap: number;
  gradeDrop: number;
  moodSignal: number;
  hasMinDataSignals: boolean;
  hasConsecutivePattern: boolean;
  evidence: EvidenceItem[];
}

/**
 * Calculates the overall status and risk factors of a student based on academic, wellness,
 * and attendance data per PRD Section 5.1 and Section 6.2.
 */
export function calculateStudentStatus(data: StudentInputData, suppressAlerts: boolean = false): StatusResult {
  const { homework, grades, mood, attendance } = data;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Homework Gap Calculation
  // ──────────────────────────────────────────────────────────────────────────
  let homeworkGap = 0;
  let homeworkBullets: string[] = [];
  let hasConsecutiveMissedHomework = false;
  let maxConsecutiveMissedHomework = 0;

  if (homework.length > 0) {
    const totalHw = homework.length;
    const missedHw = homework.filter((h) => !h.isSubmitted).length;
    homeworkGap = missedHw / totalHw;

    // Sort homework by due date ascending to check consecutive patterns
    const sortedHw = [...homework].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    let currentConsecutive = 0;
    for (const hw of sortedHw) {
      if (!hw.isSubmitted) {
        currentConsecutive++;
        if (currentConsecutive > maxConsecutiveMissedHomework) {
          maxConsecutiveMissedHomework = currentConsecutive;
        }
      } else {
        currentConsecutive = 0;
      }
    }

    if (maxConsecutiveMissedHomework >= 3) {
      hasConsecutiveMissedHomework = true;
    }

    homeworkBullets.push(`${missedHw} of ${totalHw} assignments missed (${Math.round(homeworkGap * 100)}% gap)`);
    if (maxConsecutiveMissedHomework > 0) {
      homeworkBullets.push(`Longest streak of missed homework: ${maxConsecutiveMissedHomework} in a row`);
    }
  } else {
    homeworkBullets.push('No homework assignments recorded');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Grade Drop Calculation
  // ──────────────────────────────────────────────────────────────────────────
  let averageGradeDrop = 0;
  let maxGradeDropAcrossSubjects = 0;
  let gradeBullets: string[] = [];
  let hasConsecutiveDecliningGrades = false;

  // Group grades by subject
  const gradesBySubject: Record<string, GradeRecord[]> = {};
  for (const grade of grades) {
    if (!gradesBySubject[grade.subject]) {
      gradesBySubject[grade.subject] = [];
    }
    gradesBySubject[grade.subject].push(grade);
  }

  const subjectDrops: number[] = [];
  for (const subject in gradesBySubject) {
    const subjectGrades = [...gradesBySubject[subject]].sort((a, b) =>
      a.assessmentDate.localeCompare(b.assessmentDate)
    );

    if (subjectGrades.length >= 2) {
      const firstPct = subjectGrades[0].score / subjectGrades[0].maxScore;
      const latestPct = subjectGrades[subjectGrades.length - 1].score / subjectGrades[subjectGrades.length - 1].maxScore;
      const drop = firstPct - latestPct; // Positive means grades fell
      subjectDrops.push(drop);

      if (drop > maxGradeDropAcrossSubjects) {
        maxGradeDropAcrossSubjects = drop;
      }

      gradeBullets.push(
        `${subject} scores: initial ${Math.round(firstPct * 100)}% → latest ${Math.round(latestPct * 100)}% (${drop >= 0 ? 'dropped' : 'gained'} ${Math.abs(Math.round(drop * 100))} pts)`
      );

      // Check for 3+ consecutive declining grades
      if (subjectGrades.length >= 3) {
        let consecutiveDeclines = 0;
        for (let i = 1; i < subjectGrades.length; i++) {
          const prevPct = subjectGrades[i - 1].score / subjectGrades[i - 1].maxScore;
          const currPct = subjectGrades[i].score / subjectGrades[i].maxScore;
          if (currPct < prevPct) {
            consecutiveDeclines++;
          } else {
            consecutiveDeclines = 0;
          }
          if (consecutiveDeclines >= 2) { // 2 drops in a row means 3 consecutive data points declining
            hasConsecutiveDecliningGrades = true;
          }
        }
      }
    } else if (subjectGrades.length === 1) {
      const pct = subjectGrades[0].score / subjectGrades[0].maxScore;
      gradeBullets.push(`${subject} score: ${Math.round(pct * 100)}% (only 1 score recorded)`);
    }
  }

  if (subjectDrops.length > 0) {
    // Average positive drop (bound at 0)
    const validDrops = subjectDrops.map((d) => Math.max(0, d));
    const sumDrops = validDrops.reduce((sum, d) => sum + d, 0);
    averageGradeDrop = sumDrops / validDrops.length;
  }

  // Normalize grade_drop parameter to [0, 1] range
  // A 25% average grade drop is mapped to 1.0 (extreme concern)
  const normalizedGradeDrop = Math.min(1.0, averageGradeDrop / 0.25);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Mood Signal Calculation
  // ──────────────────────────────────────────────────────────────────────────
  let moodSignal = 0;
  let averageMood = 5.0;
  let moodBullets: string[] = [];
  let hasConsecutiveLowMood = false;
  let maxConsecutiveLowMood = 0;

  if (mood.length > 0) {
    const totalMoodVal = mood.reduce((sum, m) => sum + m.moodValue, 0);
    averageMood = totalMoodVal / mood.length;

    // Mood signal: 0 is perfect (5/5), 1 is extreme distress (1/5)
    moodSignal = (5.0 - averageMood) / 4.0;

    // Check consecutive low mood (<= 3, which is "okay" or worse)
    const sortedMood = [...mood].sort((a, b) => a.checkedInAt.localeCompare(b.checkedInAt));
    let currentConsecutive = 0;
    for (const m of sortedMood) {
      if (m.moodValue <= 3) {
        currentConsecutive++;
        if (currentConsecutive > maxConsecutiveLowMood) {
          maxConsecutiveLowMood = currentConsecutive;
        }
      } else {
        currentConsecutive = 0;
      }
    }

    if (maxConsecutiveLowMood >= 3) {
      hasConsecutiveLowMood = true;
    }

    moodBullets.push(`Average mood rating: ${averageMood.toFixed(1)}/5`);
    const lowCheckins = mood.filter((m) => m.moodValue <= 2).length;
    if (lowCheckins > 0) {
      moodBullets.push(`Had ${lowCheckins} check-ins marked as low or sad`);
    }
  } else {
    moodBullets.push('No mood check-ins recorded');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Attendance Signals (Supplemental Evidence)
  // ──────────────────────────────────────────────────────────────────────────
  let attendanceBullets: string[] = [];
  let attendanceRate = 1.0;
  let hasConsecutiveAbsences = false;

  if (attendance.length > 0) {
    const totalDays = attendance.length;
    const absences = attendance.filter((a) => a.status === 'absent').length;
    const lates = attendance.filter((a) => a.status === 'late').length;
    attendanceRate = (totalDays - absences) / totalDays;

    attendanceBullets.push(
      `${totalDays - absences}/${totalDays} days present (${Math.round(attendanceRate * 100)}% attendance)`
    );
    if (absences > 0 || lates > 0) {
      attendanceBullets.push(`Missed ${absences} days, arrived late ${lates} times`);
    }

    // Check for 3 consecutive absences
    const sortedAttendance = [...attendance].sort((a, b) => a.date.localeCompare(b.date));
    let currentConsecutiveAbs = 0;
    let maxConsecutiveAbs = 0;
    for (const att of sortedAttendance) {
      if (att.status === 'absent') {
        currentConsecutiveAbs++;
        if (currentConsecutiveAbs > maxConsecutiveAbs) {
          maxConsecutiveAbs = currentConsecutiveAbs;
        }
      } else {
        currentConsecutiveAbs = 0;
      }
    }
    if (maxConsecutiveAbs >= 3) {
      hasConsecutiveAbsences = true;
    }
  } else {
    attendanceBullets.push('No attendance records found');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Core Rules & Minimum Data Checks
  // ──────────────────────────────────────────────────────────────────────────
  // risk_score = (homework_gap * 0.3) + (grade_drop * 0.3) + (mood_signal * 0.4)
  const rawRiskScore = (homeworkGap * 0.3) + (normalizedGradeDrop * 0.3) + (moodSignal * 0.4);
  const riskScore = Math.round(rawRiskScore * 100) / 100;

  // Determine signals showing concern (warning thresholds)
  const isHwConcern = homeworkGap > 0.3;
  const isGradeConcern = normalizedGradeDrop > 0.3;
  const isMoodConcern = moodSignal > 0.4;
  const isAttendanceConcern = attendanceRate < 0.90;

  let concernedSignalsCount = 0;
  if (isHwConcern) concernedSignalsCount++;
  if (isGradeConcern) concernedSignalsCount++;
  if (isMoodConcern) concernedSignalsCount++;
  if (isAttendanceConcern) concernedSignalsCount++;

  const hasMinDataSignals = concernedSignalsCount >= 2;
  const hasConsecutivePattern =
    hasConsecutiveMissedHomework ||
    hasConsecutiveDecliningGrades ||
    hasConsecutiveLowMood ||
    hasConsecutiveAbsences;

  // Determine base status before minimum-data checks
  let rawStatus: 'on-track' | 'worth-watching' | 'needs-attention' = 'on-track';
  if (riskScore >= 0.50) {
    rawStatus = 'needs-attention';
  } else if (riskScore >= 0.20) {
    rawStatus = 'worth-watching';
  }

  // Apply Section 6.2 Minimum Data Threshold:
  // "require at least 2 independent signal types AND a pattern held over at least 3 consecutive data points
  // before status can change from 'On Track'."
  let finalStatus: 'on-track' | 'worth-watching' | 'needs-attention' = 'on-track';
  if (rawStatus !== 'on-track') {
    if (hasMinDataSignals && hasConsecutivePattern) {
      finalStatus = rawStatus;
    } else {
      finalStatus = 'on-track'; // Fall back to On Track due to insufficient pattern/signals
    }
  }

  // Apply School Calendar Suppression (PRD §16):
  // Suppress or downgrade flags during exam periods, holidays, and breaks
  // to avoid false-alarm floods during predictable high-stress periods
  if (suppressAlerts && finalStatus !== 'on-track') {
    // Downgrade "needs-attention" to "worth-watching" during suppression periods
    if (finalStatus === 'needs-attention') {
      finalStatus = 'worth-watching';
    }
    // Keep "worth-watching" as is (don't suppress completely, just reduce severity)
  }

  // Map back to display labels
  const statusLabels: Record<'on-track' | 'worth-watching' | 'needs-attention', 'On Track' | 'Worth Watching' | 'Needs Attention'> = {
    'on-track': 'On Track',
    'worth-watching': 'Worth Watching',
    'needs-attention': 'Needs Attention',
  };

  const displayStatus = statusLabels[finalStatus];

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Generate Supporting EvidenceItems
  // ──────────────────────────────────────────────────────────────────────────
  const evidence: EvidenceItem[] = [];

  // Attendance evidence
  evidence.push({
    id: `eval-attendance-${data.studentId}`,
    status: attendanceRate >= 0.95 ? 'on-track' : attendanceRate >= 0.85 ? 'worth-watching' : 'needs-attention',
    headline: attendanceRate >= 0.95 ? 'Attendance is on track' : `Missed ${attendance.filter(a => a.status === 'absent').length} days recently`,
    bullets: attendanceBullets,
  });

  // Homework evidence
  evidence.push({
    id: `eval-homework-${data.studentId}`,
    status: homeworkGap <= 0.15 ? 'on-track' : homeworkGap <= 0.40 ? 'worth-watching' : 'needs-attention',
    headline: homeworkGap <= 0.15 ? 'Homework completion is high' : `Missing ${homework.filter(h => !h.isSubmitted).length} assignments`,
    bullets: homeworkBullets,
  });

  // Grades evidence
  const gradeStatus: EvidenceStatus = averageGradeDrop <= 0.05 ? 'on-track' : averageGradeDrop <= 0.15 ? 'worth-watching' : 'needs-attention';
  evidence.push({
    id: `eval-grades-${data.studentId}`,
    status: gradeStatus,
    headline: averageGradeDrop <= 0.05 ? 'Academic performance is steady' : `Grade drop observed across assessments`,
    bullets: gradeBullets,
  });

  // Mood evidence
  const moodStatus: EvidenceStatus = averageMood >= 4.0 ? 'on-track' : averageMood >= 3.0 ? 'worth-watching' : 'needs-attention';
  evidence.push({
    id: `eval-mood-${data.studentId}`,
    status: moodStatus,
    headline: averageMood >= 4.0 ? 'Wellness signals are positive' : averageMood >= 3.0 ? 'Mixed wellness patterns' : 'Wellness check-ins are concerning',
    bullets: moodBullets,
  });

  return {
    studentId: data.studentId,
    displayName: data.displayName,
    status: displayStatus,
    riskScore,
    homeworkGap,
    gradeDrop: averageGradeDrop,
    moodSignal,
    hasMinDataSignals,
    hasConsecutivePattern,
    evidence,
  };
}
