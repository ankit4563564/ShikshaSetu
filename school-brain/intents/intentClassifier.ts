import type { ClassifiedIntent, Intent, Entity, Action } from '../models/index';

const INTENT_PATTERNS: Record<Intent, { keywords: string[]; patterns: RegExp[] }> = {
  who_needs_attention: {
    keywords: ['attention', 'struggling', 'weak student', 'who needs help', 'at risk', 'failing', 'lagging', 'who needs attention'],
    patterns: [/who\s+(?:needs|requires)\s+attention/i, /students?\s+(?:at\s+risk|struggling|failing|needing\s+help)/i, /who\s+is\s+falling\s+behind/i],
  },
  attendance: {
    keywords: ['attendance', 'absent', 'present', 'late', 'absence', 'truancy', 'missing', 'bunked', 'leave'],
    patterns: [/attend/i, /miss(?:ed|ing)\s+(?:class|school)/i, /how\s+(?:many|often)\s+(?:days|times)\s+(?:absent|present|missed)/i, /who\s+(?:is|was)\s+absent/i],
  },
  homework: {
    keywords: ['homework', 'assignment', 'due', 'pending', 'submitted', 'task', 'project', 'worksheet'],
    patterns: [/homework/i, /assign(?:ment)?/i, /due\s+(?:date|tomorrow|today|this\s+week)/i, /submit(?:ted)?/i, /who\s+missed\s+.*homework/i],
  },
  timetable: {
    keywords: ['timetable', 'schedule', 'period', 'class today', 'next class', 'free period', 'bell', 'timing', 'slot', 'classroom'],
    patterns: [/timetable/i, /schedul/i, /period/i, /what(?:'s|\s+is)\s+(?:my|the|tomorrow'?s?)\s+(?:class|timetable|schedule)/i, /next\s+(?:class|period)/i, /free\s+(?:period|time)/i],
  },
  exams: {
    keywords: ['exam', 'test', 'assessment', 'midterm', 'final', 'date sheet', 'exam schedule', 'unit test'],
    patterns: [/exam/i, /test/i, /assess/i, /date\s*sheet/i, /when\s+is\s+the\s+.*exam/i, /tomorrow'?s?\s+exams?/i],
  },
  marks: {
    keywords: ['marks', 'score', 'percentage', 'rank', 'topper', 'pass', 'fail', 'grade', 'result', 'report card'],
    patterns: [/mark/i, /score/i, /percent/i, /rank/i, /topper/i, /result/i, /grade/i],
  },
  behaviour: {
    keywords: ['behaviour', 'behavior', 'discipline', 'conduct', 'note', 'observation', 'disruption', 'praise', 'demerit', 'warning'],
    patterns: [/behav/i, /disciplin/i, /conduct/i, /teacher\s+note/i, /observation/i],
  },
  bus: {
    keywords: ['bus', 'transport', 'route', 'stop', 'pickup', 'drop', 'driver', 'vehicle', 'van', 'bus number', 'bus 1', 'bus 2', 'bus 3', 'bus 4', 'bus 5'],
    patterns: [/bus/i, /transport/i, /route/i, /stop/i, /pickup/i, /drop/i, /driver/i, /how\s+many\s+students\s+use\s+bus/i],
  },
  fees: {
    keywords: ['fee', 'fees', 'payment', 'dues', 'bill', 'receipt', 'charge', 'tuition', 'fine', 'pending fee'],
    patterns: [/fee/i, /payment/i, /dues?/i, /bill/i, /receipt/i, /unpaid/i, /tuition/i],
  },
  ptm: {
    keywords: ['ptm', 'parent teacher', 'meeting', 'conference', 'parent meeting', 'ptm summary'],
    patterns: [/ptm/i, /parent.{0,5}teacher.{0,5}meeting/i, /meeting/i, /conference/i, /parent\s+replied/i, /ptm\s+summary/i],
  },
  health: {
    keywords: ['health', 'medical', 'nurse', 'sick', 'fever', 'medicine', 'infirmary', 'first aid', 'doctor', 'allergy'],
    patterns: [/health/i, /medic/i, /nurse/i, /sick/i, /fever/i, /injury/i, /infirmary/i],
  },
  library: {
    keywords: ['library', 'book', 'borrow', 'read', 'return', 'catalogue', 'shelf', 'author', 'due book', 'library dues'],
    patterns: [/library/i, /book/i, /borrow/i, /read/i, /return/i, /who\s+has\s+library\s+dues/i, /what\s+books\s+has\s+.*borrowed/i],
  },
  sports: {
    keywords: ['sports', 'cricket', 'football', 'basketball', 'swimming', 'athletics', 'gym', 'sports day', 'match', 'tournament'],
    patterns: [/sport/i, /cricket/i, /football/i, /basketball/i, /swim/i, /athletic/i, /sports\s+day/i],
  },
  events: {
    keywords: ['event', 'calendar', 'annual day', 'science fair', 'competition', 'celebration', 'function', 'exhibition'],
    patterns: [/event/i, /calendar/i, /fair/i, /celebrat/i, /compet/i, /when\s+is\s+.*day/i],
  },
  announcements: {
    keywords: ['notice', 'announcement', 'circular', 'important', 'update', 'bulletin'],
    patterns: [/notice/i, /announ/i, /circular/i, /important/i, /update/i],
  },
  teacher_workload: {
    keywords: ['workload', 'teaching load', 'free periods', 'periods per day', 'substitute', 'staff room', 'assigned classes', 'teach per day'],
    patterns: [/workload/i, /teaching\s+hours/i, /free\s+period/i, /staff\s+room/i, /periods\s+per\s+day/i, /periods\s+does/i, /teach\s+per\s+day/i],
  },
  student_performance: {
    keywords: ['performance', 'progress', 'how is', 'doing', 'report', 'analysis', 'overall grade', 'compare', 'versus', 'vs'],
    patterns: [/perform/i, /progress/i, /how\s+is\s+[a-z]+\s+doing/i, /report/i, /analys/i, /compare\s+[a-z]+\s+and/i, /compare\s+him/i],
  },
  clubs: {
    keywords: ['club', 'robotics', 'drama', 'art', 'music', 'chess', 'debate', 'activity', 'extracurricular'],
    patterns: [/club/i, /robot/i, /drama/i, /art\s+club/i, /music/i, /chess/i, /debate/i],
  },
  canteen: {
    keywords: ['canteen', 'menu', 'food', 'lunch', 'snack', 'meal', 'cafeteria', 'today\'s menu'],
    patterns: [/canteen/i, /menu/i, /food/i, /lunch/i, /snack/i, /meal/i, /cafeteria/i, /canteen\s+menu/i],
  },
  achievements: {
    keywords: ['achievement', 'award', 'prize', 'winner', 'trophy', 'medal', 'certificate', 'honor'],
    patterns: [/achiev/i, /award/i, /prize/i, /winner/i, /trophy/i, /medal/i],
  },
  rules: {
    keywords: ['rule', 'policy', 'regulation', 'guideline', 'code of conduct', 'uniform', 'dress code', 'visitor policy', 'discipline policy'],
    patterns: [/rule/i, /polic/i, /regulat/i, /guideline/i, /uniform/i, /dress\s*code/i, /visitor/i],
  },
  faculty: {
    keywords: ['teacher', 'faculty', 'staff', 'who teaches', 'class teacher', 'subject teacher', 'principal', 'headmaster'],
    patterns: [/teacher/i, /facult/i, /staff/i, /who\s+teaches/i, /class\s+teacher/i, /principal/i],
  },
  general_education: {
    keywords: ['explain', 'what is', 'how does', 'why', 'define', 'teach', 'learn', 'concept', 'formula', 'bloom\'s taxonomy', 'pedagogy'],
    patterns: [/what\s+is/i, /how\s+(?:does|do)/i, /why\s+(?:is|does|do)/i, /explain\s+newton/i, /bloom'?s\s+taxonomy/i, /define/i],
  },
  motivation: {
    keywords: ['motivate', 'inspire', 'encourage', 'confidence', 'stress', 'anxiety', 'pressure', 'weak students'],
    patterns: [/motivat/i, /inspir/i, /encourag/i, /confiden/i, /stress/i, /how\s+do\s+i\s+motivate/i],
  },
  career_guidance: {
    keywords: ['career', 'future', 'college', 'university', 'profession', 'job', 'stream selection', 'engineering', 'medical'],
    patterns: [/career/i, /future/i, /college/i, /university/i, /profession/i, /stream/i],
  },
  subject_explanation: {
    keywords: ['explain subject', 'math concept', 'physics law', 'grammer rule', 'history event', 'chemistry reaction'],
    patterns: [/explain\s+the\s+concept/i, /how\s+to\s+solve/i, /derivation/i, /meaning\s+of/i],
  },
  small_talk: {
    keywords: ['how are you', 'what can you do', 'who created you', 'thanks', 'thank you', 'cool', 'awesome'],
    patterns: [/how\s+are\s+you/i, /what\s+can\s+you\s+do/i, /help\s+me/i, /thank/i, /who\s+are\s+you/i],
  },
  greeting: {
    keywords: ['hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'hey', 'greetings'],
    patterns: [/^(?:hi|hello|hey|good\s+(?:morning|afternoon|evening))\b/i],
  },
  administrative: {
    keywords: ['admission', 'transfer', 'certificate', 'document', 'tc', 'bonafide', 'office timings', 'school timings'],
    patterns: [/admission/i, /transfer/i, /certificate/i, /document/i, /timing/i, /office\s+hours/i],
  },
  unknown: { keywords: [], patterns: [] },
};

const ENTITY_PATTERNS: Record<Entity, string[]> = {
  student: ['student', 'pupil', 'kid', 'child', 'boy', 'girl', 'aarav', 'diya', 'rohan', 'sneha', 'kabir', 'ananya', 'vivaan'],
  teacher: ['teacher', 'faculty', 'staff', 'sir', 'ma\'am', 'mam', 'mehra', 'sharma', 'gupta', 'verma', 'iyer'],
  class: ['class', 'grade', 'section', 'batch', '8a', '8b', '9a', '9b', '10a', '7a'],
  subject: ['math', 'maths', 'science', 'english', 'hindi', 'social studies', 'computer', 'art', 'music', 'physics', 'chemistry', 'biology'],
  homework: ['homework', 'assignment', 'task', 'project', 'worksheet'],
  exam: ['exam', 'test', 'assessment', 'midterm', 'final', 'unit test'],
  assignment: ['assignment', 'homework', 'task', 'project'],
  book: ['book', 'novel', 'textbook', 'reference', 'physics', 'harry potter'],
  bus: ['bus', 'vehicle', 'transport', 'route', 'bus 1', 'bus 2', 'bus 3', 'bus 4', 'bus 5'],
  route: ['route', 'path', 'way'],
  stop: ['stop', 'station', 'pickup', 'drop'],
  club: ['club', 'group', 'team', 'society', 'robotics', 'chess', 'drama'],
  event: ['event', 'function', 'program', 'celebration', 'sports day', 'annual day', 'science fair'],
  holiday: ['holiday', 'vacation', 'break', 'leave'],
  policy: ['policy', 'rule', 'regulation', 'guideline'],
  rule: ['rule', 'regulation', 'policy', 'uniform', 'dress code'],
  meal: ['meal', 'food', 'lunch', 'breakfast', 'snack', 'canteen'],
  sport: ['sport', 'game', 'match', 'tournament', 'cricket', 'football'],
  competition: ['competition', 'contest', 'olympiad'],
  achievement: ['achievement', 'award', 'prize', 'trophy'],
  parent: ['parent', 'guardian', 'father', 'mother', 'mom', 'dad'],
  notice: ['notice', 'announcement', 'circular'],
  fee: ['fee', 'fees', 'payment', 'bill', 'dues'],
  timetable_entry: ['period', 'class', 'timetable', 'schedule'],
  none: [],
};

const ACTION_PATTERNS: Record<Action, string[]> = {
  list: ['list', 'show', 'display', 'give me', 'tell me all', 'which', 'who'],
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
      if (lower.includes(keyword)) score += 0.35;
    }

    for (const pattern of config.patterns) {
      if (pattern.test(text)) score += 0.55;
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
