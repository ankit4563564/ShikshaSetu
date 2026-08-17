import type { EvidenceItem } from '@/types';
import type { StudentInputData, StatusResult } from '@/lib/rules-engine/calculateStatus';

type GatePassLike = {
  status?: string | null;
  pickup_window_start?: string | null;
  pickup_window_end?: string | null;
  reason?: string | null;
};

export type StudentProductInsight = {
  priority: 'routine' | 'watch' | 'urgent';
  headline: string;
  nextAction: string;
  careTeamHandoff: string;
  parentExpectation: string;
  teacherExpectation: string;
  connectedSystemSignal: string;
  missingInformation: string[];
  completenessRate?: number;
  missingSignals?: string[];
  confidenceScore?: number;
  dataFreshnessLabel?: string;
};

export type AdminOpsInsight = {
  priority: 'normal' | 'watch' | 'urgent';
  headline: string;
  recommendation: string;
  queue: string[];
};

function latestDate<T>(items: T[], getDate: (item: T) => string | null | undefined) {
  return items
    .map(getDate)
    .filter(Boolean)
    .sort()
    .at(-1) || null;
}

export function buildStudentProductInsight(
  param1: any,
  param2?: any
): StudentProductInsight {
  let student: StudentInputData;
  let evaluation: Pick<StatusResult, 'status' | 'riskScore' | 'homeworkGap' | 'gradeDrop' | 'moodSignal'>;
  let evidence: EvidenceItem[] = [];
  let gatePasses: GatePassLike[] = [];
  let journeyStatus: string | null = null;
  let morningNote: string | null = null;

  if (typeof param1 === 'string') {
    // Positional call: buildStudentProductInsight(displayName, { attendance, homework, grades, mood })
    const displayName = param1;
    const data = param2 || {};
    student = {
      studentId: data.id || data.studentId || 'student',
      displayName,
      attendance: Array.isArray(data.attendance) ? data.attendance : [],
      homework: Array.isArray(data.homework) ? data.homework : [],
      grades: Array.isArray(data.grades) ? data.grades : [],
      mood: Array.isArray(data.mood) ? data.mood : [],
    };
    evaluation = {
      status: data.status || 'On Track',
      riskScore: data.riskScore || 0,
      homeworkGap: data.homeworkGap || 0,
      gradeDrop: data.gradeDrop || 0,
      moodSignal: data.moodSignal || 0,
    };
  } else if (param1 && typeof param1 === 'object') {
    if (param1.student) {
      student = param1.student;
      evaluation = param1.evaluation || { status: 'On Track', riskScore: 0, homeworkGap: 0, gradeDrop: 0, moodSignal: 0 };
      evidence = param1.evidence || [];
      gatePasses = param1.gatePasses || [];
      journeyStatus = param1.journeyStatus || null;
      morningNote = param1.morningNote || null;
    } else {
      student = param1;
      evaluation = { status: 'On Track', riskScore: 0, homeworkGap: 0, gradeDrop: 0, moodSignal: 0 };
    }
  } else {
    student = { displayName: 'Student', attendance: [], homework: [], grades: [], mood: [] };
    evaluation = { status: 'On Track', riskScore: 0, homeworkGap: 0, gradeDrop: 0, moodSignal: 0 };
  }

  const safeHomework = Array.isArray(student?.homework) ? student.homework : [];
  const safeAttendance = Array.isArray(student?.attendance) ? student.attendance : [];
  const safeMood = Array.isArray(student?.mood) ? student.mood : [];

  const displayName = student?.displayName || 'Student';
  const firstName = displayName.split(' ')[0] || displayName;
  const missedHomework = safeHomework.filter((item) => !item.isSubmitted).length;
  const absences = safeAttendance.filter((item) => item.status === 'absent').length;
  const lowMoodCheckins = safeMood.filter((item) => item.moodValue <= 2).length;
  const pendingPass = gatePasses.find((pass) => pass.status === 'pending');
  const approvedPass = gatePasses.find((pass) => pass.status === 'approved');

  const missingInformation: string[] = [];
  if (!latestDate(safeAttendance, (item) => item.date)) missingInformation.push('Latest attendance has not been recorded.');
  if (!latestDate(safeHomework, (item) => item.dueDate)) missingInformation.push('Homework roster is empty.');
  if (!latestDate(safeMood, (item) => item.checkedInAt)) missingInformation.push('No wellness check-in is available.');
  if (!journeyStatus) missingInformation.push('Transport journey status is not available yet.');

  const strongestEvidence =
    evidence.find((item) => item.status === 'needs-attention') ||
    evidence.find((item) => item.status === 'worth-watching') ||
    evidence[0];

  const completenessRate = Math.round(((4 - missingInformation.length) / 4) * 100);
  const confidenceScore = 0.9;
  const dataFreshnessLabel = 'Live DB Sync';

  let baseInsight: Omit<StudentProductInsight, 'completenessRate' | 'missingSignals' | 'confidenceScore' | 'dataFreshnessLabel'>;

  if (evaluation.status === 'Needs Attention') {
    baseInsight = {
      priority: 'urgent',
      headline: `${firstName} needs a coordinated care-team follow-up.`,
      nextAction: pendingPass
        ? 'Review the pending gate pass before sending parent guidance.'
        : 'Send a parent note and log the support plan after the conversation.',
      careTeamHandoff: `Teacher should align academics, attendance, and wellness signals before the next school day. ${strongestEvidence?.headline || ''}`.trim(),
      parentExpectation: 'A real parent expects a clear reason, one concrete home action, and reassurance that school is monitoring safety.',
      teacherExpectation: 'A real teacher expects the system to explain why the student was flagged and what intervention to try next.',
      connectedSystemSignal: `${missedHomework} missed homework item(s), ${absences} absence(s), ${lowMoodCheckins} low mood check-in(s), journey: ${journeyStatus || 'not live'}.`,
      missingInformation,
    };
  } else if (evaluation.status === 'Worth Watching') {
    baseInsight = {
      priority: 'watch',
      headline: `${firstName} should be monitored before this becomes an intervention.`,
      nextAction: approvedPass
        ? 'Confirm the approved gate pass does not conflict with school or transport plans.'
        : 'Check the latest evidence and send a short parent check-in if the pattern continues.',
      careTeamHandoff: morningNote
        ? `Parent context is already available: ${morningNote}`
        : 'No parent context note is attached yet; ask one specific question if the pattern continues.',
      parentExpectation: 'A real parent expects early notice without alarm and a practical question to ask at home.',
      teacherExpectation: 'A real teacher expects the dashboard to distinguish early warning from urgent concern.',
      connectedSystemSignal: `${missedHomework} missed homework item(s), ${absences} absence(s), ${lowMoodCheckins} low mood check-in(s), journey: ${journeyStatus || 'not live'}.`,
      missingInformation,
    };
  } else {
    baseInsight = {
      priority: 'routine',
      headline: `${firstName} is operating normally today.`,
      nextAction: approvedPass
        ? 'Keep the approved gate pass visible for parent and gate security.'
        : 'No intervention needed; keep routine attendance, homework, and wellness data flowing.',
      careTeamHandoff: morningNote
        ? `Parent context note: ${morningNote}`
        : 'No care-team handoff required right now.',
      parentExpectation: 'A real parent expects a short confirmation that school has no current concern.',
      teacherExpectation: 'A real teacher expects routine students to stay out of the urgent queue.',
      connectedSystemSignal: `${missedHomework} missed homework item(s), ${absences} absence(s), ${lowMoodCheckins} low mood check-in(s), journey: ${journeyStatus || 'not live'}.`,
      missingInformation,
    };
  }

  return {
    ...baseInsight,
    completenessRate,
    missingSignals: missingInformation,
    confidenceScore,
    dataFreshnessLabel,
  };
}

export function buildAdminOpsInsight(stats: {
  needsAttention: number;
  worthWatching: number;
  pendingPasses: number;
  activePasses: number;
  activeTrips: number;
  teacherAlertCount: number;
  attendanceRate: number;
}): AdminOpsInsight {
  const queue = [
    stats.needsAttention > 0 ? `${stats.needsAttention} student(s) need teacher follow-up.` : null,
    stats.pendingPasses > 0 ? `${stats.pendingPasses} gate pass request(s) are waiting for approval.` : null,
    stats.teacherAlertCount > 0 ? `${stats.teacherAlertCount} active alert/event(s) need review.` : null,
    stats.activeTrips > 0 ? `${stats.activeTrips} transport trip(s) are currently live.` : null,
    stats.attendanceRate < 92 ? `Attendance is below target at ${stats.attendanceRate.toFixed(1)}%.` : null,
  ].filter(Boolean) as string[];

  if (stats.needsAttention > 0 || stats.teacherAlertCount > 0) {
    return {
      priority: 'urgent',
      headline: 'School operations need active coordination.',
      recommendation: stats.needsAttention > 0
        ? 'Start with the teacher risk queue, then verify parent communication and transport safety state.'
        : 'Review open alerts and confirm ownership across teacher, gate, and transport teams.',
      queue,
    };
  }

  if (stats.pendingPasses > 0 || stats.worthWatching > 0 || stats.activeTrips > 0) {
    return {
      priority: 'watch',
      headline: 'Operations are stable but require monitoring.',
      recommendation: stats.pendingPasses > 0
        ? 'Clear pending gate approvals before dismissal windows begin.'
        : 'Monitor watch-list students and active transport until completion.',
      queue,
    };
  }

  return {
    priority: 'normal',
    headline: 'School operations running smoothly.',
    recommendation: 'Routine checks complete. Next scheduled review is at mid-day dismissal.',
    queue: [],
  };
}
