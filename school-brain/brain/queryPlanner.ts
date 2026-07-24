import type { ClassifiedIntent, SchoolBrainContext } from '../models';

export interface QueryPlan {
  tools: ToolCall[];
  reasoning: string;
  parallelizable: boolean;
}

export interface ToolCall {
  tool: string;
  source: 'database' | 'knowledge' | 'llm' | 'reasoning';
  params: Record<string, unknown>;
  priority: number;
}

const INTENT_TOOL_MAP: Record<string, { tools: string[]; source: 'database' | 'knowledge' | 'llm' | 'reasoning' }[]> = {
  attendance: [
    { tools: ['db_attendance', 'db_attendance_trends'], source: 'database' },
    { tools: ['kb_school_profile'], source: 'knowledge' },
  ],
  homework: [
    { tools: ['db_homework', 'db_student_performance'], source: 'database' },
    { tools: ['kb_school_profile'], source: 'knowledge' },
  ],
  timetable: [
    { tools: ['kb_timetable'], source: 'knowledge' },
    { tools: ['kb_faculty'], source: 'knowledge' },
  ],
  exams: [
    { tools: ['db_exams', 'db_grades'], source: 'database' },
    { tools: ['kb_events'], source: 'knowledge' },
  ],
  marks: [
    { tools: ['db_grades'], source: 'database' },
    { tools: ['reasoner_student_analysis'], source: 'reasoning' },
  ],
  behaviour: [
    { tools: ['kb_behaviour'], source: 'knowledge' },
    { tools: ['db_status_flags'], source: 'database' },
  ],
  bus: [
    { tools: ['db_bus_tracking'], source: 'database' },
    { tools: ['kb_bus_routes'], source: 'knowledge' },
  ],
  fees: [
    { tools: ['kb_fees'], source: 'knowledge' },
  ],
  ptm: [
    { tools: ['kb_ptm'], source: 'knowledge' },
    { tools: ['db_notifications'], source: 'database' },
  ],
  health: [
    { tools: ['kb_health_records'], source: 'knowledge' },
  ],
  library: [
    { tools: ['kb_library'], source: 'knowledge' },
  ],
  sports: [
    { tools: ['kb_sports'], source: 'knowledge' },
  ],
  events: [
    { tools: ['kb_events'], source: 'knowledge' },
    { tools: ['db_school_calendar'], source: 'database' },
  ],
  announcements: [
    { tools: ['db_notices'], source: 'database' },
    { tools: ['kb_notices'], source: 'knowledge' },
  ],
  clubs: [
    { tools: ['kb_clubs'], source: 'knowledge' },
  ],
  canteen: [
    { tools: ['kb_canteen'], source: 'knowledge' },
  ],
  achievements: [
    { tools: ['kb_achievements'], source: 'knowledge' },
  ],
  rules: [
    { tools: ['kb_policies'], source: 'knowledge' },
    { tools: ['db_school_rules'], source: 'database' },
  ],
  faculty: [
    { tools: ['kb_faculty'], source: 'knowledge' },
  ],
  student_performance: [
    { tools: ['db_attendance', 'db_homework', 'db_grades'], source: 'database' },
    { tools: ['reasoner_student_analysis'], source: 'reasoning' },
    { tools: ['kb_behaviour'], source: 'knowledge' },
  ],
  general_education: [
    { tools: ['llm_general'], source: 'llm' },
  ],
  motivation: [
    { tools: ['llm_general'], source: 'llm' },
  ],
  career_guidance: [
    { tools: ['llm_general'], source: 'llm' },
  ],
  small_talk: [
    { tools: ['kb_school_profile'], source: 'knowledge' },
    { tools: ['llm_general'], source: 'llm' },
  ],
  greeting: [
    { tools: ['kb_school_profile'], source: 'knowledge' },
  ],
  administrative: [
    { tools: ['kb_school_profile', 'kb_policies'], source: 'knowledge' },
  ],
  unknown: [
    { tools: ['kb_school_profile'], source: 'knowledge' },
    { tools: ['llm_general'], source: 'llm' },
  ],
};

export function planQuery(classifiedIntent: ClassifiedIntent, context: SchoolBrainContext): QueryPlan {
  const intentKey = classifiedIntent.intent;
  const toolConfigs = INTENT_TOOL_MAP[intentKey] || INTENT_TOOL_MAP.unknown;

  const tools: ToolCall[] = [];

  for (const config of toolConfigs) {
    for (const tool of config.tools) {
      const params: Record<string, unknown> = {};

      if (context.studentId) params.studentId = context.studentId;
      if (context.teacherId) params.teacherId = context.teacherId;
      if (context.childrenIds) params.childrenIds = context.childrenIds;
      if (context.classGrade) params.classGrade = context.classGrade;
      if (context.classSection) params.classSection = context.classSection;
      if (context.role) params.role = context.role;

      if (classifiedIntent.entities.includes('today')) params.date = 'today';
      if (classifiedIntent.entities.includes('tomorrow')) params.date = 'tomorrow';
      if (classifiedIntent.entities.includes('this_week')) params.period = 'this_week';
      if (classifiedIntent.entities.includes('last_week')) params.period = 'last_week';

      tools.push({
        tool,
        source: config.source,
        params,
        priority: tool === config.tools[0] ? 1 : 2,
      });
    }
  }

  const seen = new Set<string>();
  const uniqueTools = tools.filter(t => {
    if (seen.has(t.tool)) return false;
    seen.add(t.tool);
    return true;
  });

  return {
    tools: uniqueTools.sort((a, b) => a.priority - b.priority),
    reasoning: `Intent: ${classifiedIntent.intent} (${classifiedIntent.confidence.toFixed(2)}), Entity: ${classifiedIntent.entity}, Action: ${classifiedIntent.action}. Using ${uniqueTools.length} tools.`,
    parallelizable: true,
  };
}
