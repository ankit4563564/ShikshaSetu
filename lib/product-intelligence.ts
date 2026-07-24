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

export function buildStudentProductInsight(params: {
  student: StudentInputData;
  evaluation: Pick<StatusResult, 'status' | 'riskScore' | 'homeworkGap' | 'gradeDrop' | 'moodSignal'>;
  evidence?: EvidenceItem[];
  gatePasses?: GatePassLike[];
  journeyStatus?: string | null;
  morningNote?: string | null;
}): StudentProductInsight {
  const { student, evaluation, evidence = [], gatePasses = [], journeyStatus, morningNote } = params;
  const firstName = student.displayName.split(' ')[0] || student.displayName;
  const missedHomework = student.homework.filter((item) => !item.isSubmitted).length;
  const absences = student.attendance.filter((item) => item.status === 'absent').length;
  const lowMoodCheckins = student.mood.filter((item) => item.moodValue <= 2).length;
  const pendingPass = gatePasses.find((pass) => pass.status === 'pending');
  const approvedPass = gatePasses.find((pass) => pass.status === 'approved');

  const missingInformation: string[] = [];
  if (!latestDate(student.attendance, (item) => item.date)) missingInformation.push('Latest attendance has not been recorded.');
  if (!latestDate(student.homework, (item) => item.dueDate)) missingInformation.push('Homework roster is empty.');
  if (!latestDate(student.mood, (item) => item.checkedInAt)) missingInformation.push('No wellness check-in is available.');
  if (!journeyStatus) missingInformation.push('Transport journey status is not available yet.');

  const strongestEvidence =
    evidence.find((item) => item.status === 'needs-attention') ||
    evidence.find((item) => item.status === 'worth-watching') ||
    evidence[0];

  if (evaluation.status === 'Needs Attention') {
    return {
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
  }

  if (evaluation.status === 'Worth Watching') {
    return {
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
  }

  return {
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
    headline: 'School operations are in routine state.',
    recommendation: 'No urgent action. Keep data capture current across attendance, homework, wellness, transport, and gate security.',
    queue: queue.length ? queue : ['No operational blockers detected.'],
  };
}
