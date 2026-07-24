import type { ClassifiedIntent, Intent, Entity, Action } from '../models';

const INTENT_PATTERNS: Record<Intent, { keywords: string[]; patterns: RegExp[] }> = {
  attendance: { keywords: ['attendance', 'absent', 'present', 'late', 'absence', 'truancy', 'missing'], patterns: [/attend/i, /miss(?:ed|ing)\s+(?:class|school)/i, /how\s+(?:many|often)\s+(?:days|times)\s+(?:absent|present|missed)/i] },
  homework: { keywords: ['homework', 'assignment', 'due', 'pending', 'submitted', 'task', 'project'], patterns: [/homework/i, /assign(?:ment)?/i, /due\s+(?:date|tomorrow|today)/i, /submit(?:ted)?/i] },
  timetable: { keywords: ['timetable', 'schedule', 'period', 'class today', 'next class', 'free period', 'bell'], patterns: [/timetable/i, /schedul/i, /period/i, /what(?:'s| is)\s+(?:my|the)\s+class/i, /next\s+(?:class|period)/i, /free\s+(?:period|time)/i] },
  exams: { keywords: ['exam', 'test', 'assessment', 'result', 'score', 'grade'], patterns: [/exam/i, /test/i, /assess/i, /result/i, /score/i, /grade/i] },
  marks: { keywords: ['marks', 'score', 'percentage', 'rank', 'topper', 'pass', 'fail'], patterns: [/mark/i, /score/i, /percent/i, /rank/i, /topper/i] },
  behaviour: { keywords: ['behaviour', 'behavior', 'discipline', 'conduct', 'note', 'observation'], patterns: [/behav/i, /disciplin/i, /conduct/i, /note/i, /observation/i] },
  bus: { keywords: ['bus', 'transport', 'route', 'stop', 'pickup', 'drop', 'driver', 'vehicle'], patterns: [/bus/i, /transport/i, /route/i, /stop/i, /pickup/i, /drop/i, /driver/i] },
  fees: { keywords: ['fee', 'fees', 'payment', 'dues', 'bill', 'receipt', 'charge'], patterns: [/fee/i, /payment/i, /dues?/i, /bill/i, /receipt/i] },
  ptm: { keywords: ['ptm', 'parent teacher', 'meeting', 'conference'], patterns: [/ptm/i, /parent.{0,5}teacher.{0,5}meeting/i, /meeting/i, /conference/i] },
  health: { keywords: ['health', 'medical', 'nurse', 'sick', 'fever', 'medicine', 'infirmary'], patterns: [/health/i, /medic/i, /nurse/i, /sick/i, /fever/i, /injury/i] },
  library: { keywords: ['library', 'book', 'borrow', 'read', 'return', 'catalogue', 'shelf'], patterns: [/library/i, /book/i, /borrow/i, /read/i, /return/i, /catalog/i] },
  sports: { keywords: ['sports', 'cricket', 'football', 'basketball', 'swimming', 'athletics', 'gym'], patterns: [/sport/i, /cricket/i, /football/i, /basketball/i, /swim/i, /athletic/i] },
  events: { keywords: ['event', 'calendar', 'annual day', 'science fair', 'competition', 'celebration'], patterns: [/event/i, /calendar/i, /fair/i, /celebrat/i, /compet/i] },
  announcements: { keywords: ['notice', 'announcement', 'circular', 'important', 'update'], patterns: [/notice/i, /announ/i, /circular/i, /important/i, /update/i] },
  clubs: { keywords: ['club', 'robotics', 'drama', 'art', 'music', 'chess', 'debate', 'activity'], patterns: [/club/i, /robot/i, /drama/i, /art\s+club/i, /music/i, /chess/i, /debate/i] },
  canteen: { keywords: ['canteen', 'menu', 'food', 'lunch', 'snack', 'meal', 'cafeteria'], patterns: [/canteen/i, /menu/i, /food/i, /lunch/i, /snack/i, /meal/i, /cafeteria/i] },
  achievements: { keywords: ['achievement', 'award', 'prize', 'winner', 'trophy', 'medal', 'certificate'], patterns: [/achiev/i, /award/i, /prize/i, /winner/i, /trophy/i, /medal/i] },
  rules: { keywords: ['rule', 'policy', 'regulation', 'guideline', 'code of conduct', 'uniform'], patterns: [/rule/i, /polic/i, /regulat/i, /guideline/i, /uniform/i, /dress\s*code/i] },
  faculty: { keywords: ['teacher', 'faculty', 'staff', 'who teaches', 'class teacher', 'subject teacher'], patterns: [/teacher/i, /facult/i, /staff/i, /who\s+teach/i, /class\s+teacher/i] },
  student_performance: { keywords: ['performance', 'progress', 'how is', 'doing', 'report', 'analysis'], patterns: [/perform/i, /progress/i, /how\s+(?:is|are)\s+\w+/i, /report/i, /analys/i] },
  general_education: { keywords: ['explain', 'what is', 'how does', 'why', 'define', 'teach', 'learn'], patterns: [/what\s+is/i, /how\s+(?:does|do)/i, /why\s+(?:is|does|do)/i, /explain/i, /define/i, /teach/i] },
  motivation: { keywords: ['motivate', 'inspire', 'encourage', 'confidence', 'stress', 'anxiety', 'pressure'], patterns: [/motivat/i, /inspir/i, /encourag/i, /confiden/i, /stress/i, /anxiety/i] },
  career_guidance: { keywords: ['career', 'future', 'college', 'university', 'profession', 'job'], patterns: [/career/i, /future/i, /college/i, /university/i, /profession/i] },
  small_talk: { keywords: ['how are you', 'what can you do', 'help', 'thanks', 'thank you'], patterns: [/how\s+are\s+you/i, /what\s+can\s+you/i, /help\s+me/i, /thank/i] },
  greeting: { keywords: ['greeting', 'hello', 'hi', 'good morning', 'good afternoon', 'hey'], patterns: [/^(?:hi|hello|hey|good\s+(?:morning|afternoon|evening))/i] },
  administrative: { keywords: ['admission', 'transfer', 'certificate', 'fee', 'receipt', 'document'], patterns: [/admission/i, /transfer/i, /certificate/i, /document/i] },
  teacher_workload: { keywords: ['workload', 'tasks', 'hours', 'overtime', 'busy', 'schedule', 'teaching workload'], patterns: [/workload/i, /busy/i, /overtime/i, /task/i] },
  subject_explanation: { keywords: ['explain', 'subject', 'syllabus', 'topic', 'concept', 'meaning', 'lesson'], patterns: [/explain/i, /concept/i, /syllabus/i, /topic/i] },
  who_needs_attention: { keywords: ['attention', 'who needs', 'struggling', 'failing', 'support', 'risk', 'warning'], patterns: [/attention/i, /struggl/i, /failing/i, /risk/i, /who\s+needs/i] },
  unknown: { keywords: [], patterns: [] },
};

const ENTITY_PATTERNS: Record<Entity, string[]> = {
  student: ['student', 'pupil', 'kid', 'child', 'boy', 'girl'],
  teacher: ['teacher', 'faculty', 'staff', 'sir', 'ma\'am', 'mam'],
  class: ['class', 'grade', 'section', 'batch'],
  subject: ['math', 'science', 'english', 'hindi', 'social studies', 'computer', 'art', 'music', 'pe', 'physical education'],
  homework: ['homework', 'assignment', 'task', 'project'],
  exam: ['exam', 'test', 'assessment', 'midterm', 'final'],
  assignment: ['assignment', 'homework', 'task', 'project'],
  book: ['book', 'novel', 'textbook', 'reference'],
  bus: ['bus', 'vehicle', 'transport', 'route'],
  route: ['route', 'path', 'way'],
  stop: ['stop', 'station', 'pickup', 'drop'],
  club: ['club', 'group', 'team', 'society'],
  event: ['event', 'function', 'program', 'celebration'],
  holiday: ['holiday', 'vacation', 'break', 'leave'],
  policy: ['policy', 'rule', 'regulation', 'guideline'],
  rule: ['rule', 'regulation', 'policy'],
  meal: ['meal', 'food', 'lunch', 'breakfast', 'snack'],
  sport: ['sport', 'game', 'match', 'tournament'],
  competition: ['competition', 'contest', 'olympiad'],
  achievement: ['achievement', 'award', 'prize', 'trophy'],
  parent: ['parent', 'guardian', 'father', 'mother', 'mom', 'dad'],
  notice: ['notice', 'announcement', 'circular'],
  fee: ['fee', 'fees', 'payment', 'bill'],
  timetable_entry: ['period', 'class', 'timetable', 'schedule'],
  none: [],
};

const ACTION_PATTERNS: Record<Action, string[]> = {
  list: ['list', 'show', 'display', 'give me', 'tell me all', 'how many', 'which'],
  detail: ['detail', 'about', 'tell me about', 'information', 'info', 'describe'],
  count: ['how many', 'count', 'number of', 'total'],
  trend: ['trend', 'over time', 'compared to', 'last month', 'pattern'],
  compare: ['compare', 'versus', 'vs', 'better', 'worse', 'difference'],
  explain: ['explain', 'what is', 'how does', 'why', 'describe'],
  draft: ['draft', 'write', 'compose', 'prepare', 'create a message'],
  suggest: ['suggest', 'recommend', 'advice', 'what should'],
  schedule: ['schedule', 'plan', 'arrange', 'organize', 'set up'],
  search: ['find', 'search', 'look for', 'where is'],
  summarize: ['summarize', 'summary', 'brief', 'overview', 'recap'],
  analyze: ['analyze', 'analysis', 'breakdown', 'deep dive', 'investigate'],
  none: [],
};

function detectIntent(text: string): { intent: Intent; confidence: number } {
  const lower = text.toLowerCase();
  let bestIntent: Intent = 'unknown';
  let bestScore = 0;

  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    if (intent === 'unknown') continue;

    let score = 0;

    for (const keyword of config.keywords) {
      if (lower.includes(keyword)) score += 0.3;
    }

    for (const pattern of config.patterns) {
      if (pattern.test(text)) score += 0.5;
    }

    if (score > 0 && score < 0.3) score = 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as Intent;
    }
  }

  return { intent: bestIntent, confidence: Math.min(bestScore, 1) };
}

function detectEntity(text: string): Entity {
  const lower = text.toLowerCase();
  let bestEntity: Entity = 'none';
  let bestScore = 0;

  for (const [entity, keywords] of Object.entries(ENTITY_PATTERNS)) {
    if (entity === 'none') continue;
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntity = entity as Entity;
    }
  }

  return bestEntity;
}

function detectAction(text: string): Action {
  const lower = text.toLowerCase();
  let bestAction: Action = 'none';
  let bestScore = 0;

  for (const [action, keywords] of Object.entries(ACTION_PATTERNS)) {
    if (action === 'none') continue;
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestAction = action as Action;
    }
  }

  if (bestAction === 'none') {
    if (lower.startsWith('what') || lower.startsWith('when') || lower.startsWith('where') || lower.startsWith('who') || lower.startsWith('how')) {
      bestAction = 'detail';
    }
  }

  return bestAction;
}

function extractEntities(text: string): string[] {
  const entities: string[] = [];
  const lower = text.toLowerCase();

  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  const matches = text.match(namePattern);
  if (matches) entities.push(...matches);

  if (lower.includes('my') || lower.includes('me')) entities.push('self');
  if (lower.includes('their') || lower.includes('them')) entities.push('referenced');
  if (lower.includes('all')) entities.push('all');
  if (lower.includes('today')) entities.push('today');
  if (lower.includes('tomorrow')) entities.push('tomorrow');
  if (lower.includes('this week')) entities.push('this_week');
  if (lower.includes('last week')) entities.push('last_week');

  return entities;
}

export function classifyIntent(text: string, history: { role: string; content: string }[] = []): ClassifiedIntent {
  const contextText = history.length > 0
    ? `${history.slice(-3).map(h => h.content).join(' ')} ${text}`
    : text;

  const { intent, confidence } = detectIntent(text);
  const entity = detectEntity(text);
  const action = detectAction(text);
  const entities = extractEntities(text);

  if (confidence < 0.3 && history.length > 0) {
    const contextResult = detectIntent(contextText);
    if (contextResult.confidence > confidence) {
      return {
        intent: contextResult.intent,
        confidence: contextResult.confidence,
        entity,
        action,
        entities,
      };
    }
  }

  return { intent, confidence, entity, action, entities };
}
