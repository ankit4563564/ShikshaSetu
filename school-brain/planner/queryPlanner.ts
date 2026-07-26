import type { Intent, ClassifiedIntent, SchoolBrainContext } from '../models/index';
import type { ConversationState } from '../memory/conversationMemory';
import { getRoleObjective, type RoleObjectiveConfig } from '../roles/objectiveEngine';

export type UserGoal = 'lookup' | 'comparison' | 'diagnostic' | 'pedagogical' | 'action_plan';
export type ResponseStrategy = 'QuickFact' | 'AnalyticalReport' | 'ComparisonDashboard' | 'TimelineView' | 'PedagogicalGuide' | 'DirectToolResponse';
export type DomainSkill = 'StudentAnalyst' | 'AttendanceAnalyst' | 'HomeworkCoach' | 'ParentCommunicator' | 'LessonPlanner' | 'BehaviourAdvisor' | 'GeneralAssistant';

export interface QueryPlan {
  userGoal: UserGoal;
  requiredDatasets: string[];
  responseStrategy: ResponseStrategy;
  domainSkill: DomainSkill;
  roleObjective: RoleObjectiveConfig;
  isDeterministic: boolean;
  needsComparison: boolean;
  needsCharts: boolean;
  targetEntities: string[];
  detailLevel: 'brief' | 'medium' | 'detailed';
}

export function planQueryExecution(
  classified: ClassifiedIntent,
  query: string,
  context: SchoolBrainContext,
  state?: ConversationState
): QueryPlan {
  const lowerQuery = query.toLowerCase();
  const intent = classified.intent;
  const targetEntities = classified.entities || [];
  const roleObjective = getRoleObjective(context.role || 'teacher');


  // 1. Detect if this is a comparative query
  const isComparison =
    classified.action === 'compare' ||
    lowerQuery.includes('compare') ||
    lowerQuery.includes('versus') ||
    lowerQuery.includes(' vs ') ||
    (targetEntities.length >= 2 && (intent === 'marks' || intent === 'student_performance' || intent === 'attendance'));

  // 2. Detect deterministic query (fast direct bypass without LLM overhead)
  const isDeterministic =
    intent === 'canteen' ||
    (intent === 'timetable' && (lowerQuery.includes('today') || lowerQuery.includes('period') || lowerQuery.includes('tomorrow'))) ||
    intent === 'bus';

  // 3. Determine Goal
  let userGoal: UserGoal = 'lookup';
  if (isComparison) {
    userGoal = 'comparison';
  } else if (intent === 'who_needs_attention' || intent === 'student_performance' || lowerQuery.includes('why') || lowerQuery.includes('falling behind')) {
    userGoal = 'diagnostic';
  } else if (intent === 'general_education' || intent === 'subject_explanation' || lowerQuery.includes('explain') || lowerQuery.includes('how to teach')) {
    userGoal = 'pedagogical';
  } else if (lowerQuery.includes('draft') || lowerQuery.includes('message') || lowerQuery.includes('remind') || intent === 'ptm') {
    userGoal = 'action_plan';
  }

  // 4. Select Strategy & Detail Level
  let responseStrategy: ResponseStrategy = 'QuickFact';
  let detailLevel: 'brief' | 'medium' | 'detailed' = 'medium';

  if (isDeterministic) {
    responseStrategy = 'DirectToolResponse';
    detailLevel = 'brief';
  } else if (isComparison) {
    responseStrategy = 'ComparisonDashboard';
    detailLevel = 'detailed';
  } else if (userGoal === 'diagnostic' || intent === 'ptm' || (intent === 'homework' && (lowerQuery.includes('overdue') || lowerQuery.includes('pending') || lowerQuery.includes('which')))) {
    responseStrategy = 'AnalyticalReport';
    detailLevel = 'detailed';
  } else if (userGoal === 'pedagogical') {
    responseStrategy = 'PedagogicalGuide';
    detailLevel = 'medium';
  } else if (intent === 'greeting' || intent === 'small_talk' || (lowerQuery.split(' ').length <= 4 && !lowerQuery.includes('bus') && !lowerQuery.includes('overdue'))) {
    responseStrategy = 'QuickFact';
    detailLevel = 'brief';
  } else {
    responseStrategy = 'AnalyticalReport';
    detailLevel = 'medium';
  }

  // 5. Select Domain Skill
  let domainSkill: DomainSkill = 'GeneralAssistant';
  switch (intent) {
    case 'who_needs_attention':
    case 'student_performance':
    case 'marks':
      domainSkill = 'StudentAnalyst';
      break;
    case 'attendance':
      domainSkill = 'AttendanceAnalyst';
      break;
    case 'homework':
      domainSkill = 'HomeworkCoach';
      break;
    case 'ptm':
    case 'announcements':
      domainSkill = 'ParentCommunicator';
      break;
    case 'general_education':
    case 'subject_explanation':
      domainSkill = 'LessonPlanner';
      break;
    case 'behaviour':
      domainSkill = 'BehaviourAdvisor';
      break;
    default:
      domainSkill = 'GeneralAssistant';
  }

  // 6. Targeted Minimal Datasets selection
  const requiredDatasets: string[] = [];
  switch (intent) {
    case 'attendance':
      requiredDatasets.push('attendance');
      if (userGoal === 'diagnostic') requiredDatasets.push('behaviour');
      break;
    case 'homework':
      requiredDatasets.push('homework');
      break;
    case 'timetable':
      requiredDatasets.push('timetable');
      break;
    case 'exams':
      requiredDatasets.push('exams');
      break;
    case 'marks':
      requiredDatasets.push('marks');
      if (isComparison) requiredDatasets.push('class_averages');
      break;
    case 'bus':
      requiredDatasets.push('bus');
      break;
    case 'library':
      requiredDatasets.push('library');
      break;
    case 'who_needs_attention':
      requiredDatasets.push('status_flags', 'attendance', 'marks', 'homework', 'behaviour');
      break;
    case 'student_performance':
      requiredDatasets.push('marks', 'attendance', 'homework', 'behaviour');
      break;
    case 'behaviour':
      requiredDatasets.push('behaviour');
      break;
    case 'ptm':
      requiredDatasets.push('ptm_responses', 'parent_notices');
      break;
    case 'events':
    case 'sports':
      requiredDatasets.push('calendar_events');
      break;
    case 'canteen':
      requiredDatasets.push('canteen_menu');
      break;
    case 'rules':
      requiredDatasets.push('school_rules');
      break;
    default:
      requiredDatasets.push('general_knowledge');
  }

  return {
    userGoal,
    requiredDatasets,
    responseStrategy,
    domainSkill,
    roleObjective,
    isDeterministic,
    needsComparison: isComparison,
    needsCharts: isComparison || userGoal === 'diagnostic',
    targetEntities,
    detailLevel,
  };
}

