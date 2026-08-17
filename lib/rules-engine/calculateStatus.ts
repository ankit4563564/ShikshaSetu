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
  studentId?: string;
  id?: string;
  displayName?: string;
  homework?: HomeworkRecord[];
  grades?: GradeRecord[];
  mood?: MoodRecord[];
  attendance?: AttendanceRecord[];
}

export interface StatusResult {
  studentId: string;
  displayName: string;
  status: 'On Track' | 'Worth Watching' | 'Needs Attention';
  finalStatus?: 'On Track' | 'Worth Watching' | 'Needs Attention';
  reasons?: string[];
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
 * Supports both object parameter `{ attendance, homework, grades, mood }` and positional parameters.
 */
export function calculateStudentStatus(
  inputOrAttendance: any,
  homeworkArg?: any,
  gradesArg?: any,
  moodArg?: any,
  suppressAlertsArg: boolean = false
): StatusResult & { finalStatus: 'On Track' | 'Worth Watching' | 'Needs Attention'; reasons: string[] } {
  let homework: HomeworkRecord[] = [];
  let grades: GradeRecord[] = [];
  let mood: MoodRecord[] = [];
  let attendance: AttendanceRecord[] = [];
  let studentId = 'student-id';
  let displayName = 'Student';
  let suppressAlerts = suppressAlertsArg;

  if (Array.isArray(inputOrAttendance)) {
    attendance = inputOrAttendance || [];
    homework = Array.isArray(homeworkArg) ? homeworkArg : [];
    grades = Array.isArray(gradesArg) ? gradesArg : [];
    mood = Array.isArray(moodArg) ? moodArg : [];
  } else if (inputOrAttendance && typeof inputOrAttendance === 'object') {
    attendance = Array.isArray(inputOrAttendance.attendance) ? inputOrAttendance.attendance : [];
    homework = Array.isArray(inputOrAttendance.homework) ? inputOrAttendance.homework : [];
    grades = Array.isArray(inputOrAttendance.grades) ? inputOrAttendance.grades : [];
    mood = Array.isArray(inputOrAttendance.mood) ? inputOrAttendance.mood : [];
    studentId = inputOrAttendance.studentId || inputOrAttendance.id || 'student-id';
    displayName = inputOrAttendance.displayName || 'Student';
    if (typeof homeworkArg === 'boolean') {
      suppressAlerts = homeworkArg;
    }
  }

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
    const sortedHw = [...homework].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
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
    const subj = grade.subject || 'General';
    if (!gradesBySubject[subj]) {
      gradesBySubject[subj] = [];
    }
    gradesBySubject[subj].push(grade);
  }

  const subjectDrops: number[] = [];
  for (const subject in gradesBySubject) {
    const subjectGrades = [...gradesBySubject[subject]].sort((a, b) =>
      (a.assessmentDate || '').localeCompare(b.assessmentDate || '')
    );

    if (subjectGrades.length >= 2) {
      const firstPct = subjectGrades[0].maxScore ? subjectGrades[0].score / subjectGrades[0].maxScore : 0;
      const latestPct = subjectGrades[subjectGrades.length - 1].maxScore ? subjectGrades[subjectGrades.length - 1].score / subjectGrades[subjectGrades.length - 1].maxScore : 0;
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
          const prevPct = subjectGrades[i - 1].maxScore ? subjectGrades[i - 1].score / subjectGrades[i - 1].maxScore : 0;
          const currPct = subjectGrades[i].maxScore ? subjectGrades[i].score / subjectGrades[i].maxScore : 0;
          if (currPct < prevPct) {
            consecutiveDeclines++;
          } else {
            consecutiveDeclines = 0;
          }
          if (consecutiveDeclines >= 2) {
            hasConsecutiveDecliningGrades = true;
          }
        }
      }
    } else if (subjectGrades.length === 1) {
      const pct = subjectGrades[0].maxScore ? subjectGrades[0].score / subjectGrades[0].maxScore : 0;
      gradeBullets.push(`${subject} score: ${Math.round(pct * 100)}% (only 1 score recorded)`);
    }
  }

  if (subjectDrops.length > 0) {
    const validDrops = subjectDrops.map((d) => Math.max(0, d));
    const sumDrops = validDrops.reduce((sum, d) => sum + d, 0);
    averageGradeDrop = sumDrops / validDrops.length;
  }

  const normalizedGradeDrop = Math.min(1.0, averageGradeDrop / 0.25);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Mood Signal Calculation
  // ──────────────────────────────────────────────────────────────────────────
  let moodSignal = 0;
  let averageMood = 5.0;
  let moodBullets: string[] = [];
  let hasConsecutiveLowMood = false;

  if (mood.length > 0) {
    const sortedMood = [...mood].sort((a, b) => (a.checkedInAt || '').localeCompare(b.checkedInAt || ''));
    const totalMood = sortedMood.reduce((sum, m) => sum + m.moodValue, 0);
    averageMood = totalMood / sortedMood.length;

    moodSignal = Math.max(0, (5.0 - averageMood) / 4.0);

    let consecutiveLow = 0;
    let maxConsecutiveLow = 0;
    for (const m of sortedMood) {
      if (m.moodValue <= 2) {
        consecutiveLow++;
        if (consecutiveLow > maxConsecutiveLow) {
          maxConsecutiveLow = consecutiveLow;
        }
      } else {
        consecutiveLow = 0;
      }
    }

    if (maxConsecutiveLow >= 3) {
      hasConsecutiveLowMood = true;
    }

    moodBullets.push(`Average mood check-in: ${averageMood.toFixed(1)} / 5.0`);
    if (maxConsecutiveLow > 0) {
      moodBullets.push(`Consecutive low mood check-ins (<= 2): ${maxConsecutiveLow} times`);
    }
  } else {
    moodBullets.push('No mood check-ins recorded');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Attendance Rate Calculation
  // ──────────────────────────────────────────────────────────────────────────
  let attendanceRate = 1.0;
  let attendanceBullets: string[] = [];
  let hasConsecutiveAbsences = false;

  if (attendance.length > 0) {
    const totalAtt = attendance.length;
    const presentAtt = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    attendanceRate = presentAtt / totalAtt;

    const sortedAtt = [...attendance].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    let consecutiveAbs = 0;
    let maxConsecutiveAbs = 0;
    for (const a of sortedAtt) {
      if (a.status === 'absent') {
        consecutiveAbs++;
        if (consecutiveAbs > maxConsecutiveAbs) {
          maxConsecutiveAbs = consecutiveAbs;
        }
      } else {
        consecutiveAbs = 0;
      }
    }

    if (maxConsecutiveAbs >= 3) {
      hasConsecutiveAbsences = true;
    }

    attendanceBullets.push(`Attendance rate: ${Math.round(attendanceRate * 100)}% (${presentAtt} of ${totalAtt} present)`);
    if (maxConsecutiveAbs > 0) {
      attendanceBullets.push(`Consecutive absences: ${maxConsecutiveAbs} days`);
    }
  } else {
    attendanceBullets.push('No attendance records found');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Core Rules & Minimum Data Checks
  // ──────────────────────────────────────────────────────────────────────────
  const rawRiskScore = (homeworkGap * 0.3) + (normalizedGradeDrop * 0.3) + (moodSignal * 0.4);
  const riskScore = Math.round(rawRiskScore * 100) / 100;

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

  let rawStatus: 'on-track' | 'worth-watching' | 'needs-attention' = 'on-track';
  if (riskScore >= 0.50) {
    rawStatus = 'needs-attention';
  } else if (riskScore >= 0.20) {
    rawStatus = 'worth-watching';
  }

  let finalStatus: 'on-track' | 'worth-watching' | 'needs-attention' = 'on-track';
  if (rawStatus !== 'on-track') {
    if (hasMinDataSignals && hasConsecutivePattern) {
      finalStatus = rawStatus;
    } else {
      finalStatus = 'on-track';
    }
  }

  if (suppressAlerts && finalStatus !== 'on-track') {
    if (finalStatus === 'needs-attention') {
      finalStatus = 'worth-watching';
    }
  }

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

  evidence.push({
    id: `eval-attendance-${studentId}`,
    status: attendanceRate >= 0.95 ? 'on-track' : attendanceRate >= 0.85 ? 'worth-watching' : 'needs-attention',
    headline: attendanceRate >= 0.95 ? 'Attendance is on track' : `Missed ${attendance.filter(a => a.status === 'absent').length} days recently`,
    bullets: attendanceBullets,
  });

  evidence.push({
    id: `eval-homework-${studentId}`,
    status: homeworkGap <= 0.15 ? 'on-track' : homeworkGap <= 0.40 ? 'worth-watching' : 'needs-attention',
    headline: homeworkGap <= 0.15 ? 'Homework completion is high' : `Missing ${homework.filter(h => !h.isSubmitted).length} assignments`,
    bullets: homeworkBullets,
  });

  const gradeStatus: EvidenceStatus = averageGradeDrop <= 0.05 ? 'on-track' : averageGradeDrop <= 0.15 ? 'worth-watching' : 'needs-attention';
  evidence.push({
    id: `eval-grades-${studentId}`,
    status: gradeStatus,
    headline: averageGradeDrop <= 0.05 ? 'Academic performance is steady' : `Grade drop observed across assessments`,
    bullets: gradeBullets,
  });

  const moodStatus: EvidenceStatus = averageMood >= 4.0 ? 'on-track' : averageMood >= 3.0 ? 'worth-watching' : 'needs-attention';
  evidence.push({
    id: `eval-mood-${studentId}`,
    status: moodStatus,
    headline: averageMood >= 4.0 ? 'Wellness signals are positive' : averageMood >= 3.0 ? 'Mixed wellness patterns' : 'Wellness check-ins are concerning',
    bullets: moodBullets,
  });

  const allBullets = evidence.flatMap((e) => e.bullets);

  return {
    studentId,
    displayName,
    status: displayStatus,
    finalStatus: displayStatus,
    reasons: allBullets,
    riskScore,
    homeworkGap,
    gradeDrop: averageGradeDrop,
    moodSignal,
    hasMinDataSignals,
    hasConsecutivePattern,
    evidence,
  };
}
