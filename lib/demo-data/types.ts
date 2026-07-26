export interface StudentRecord {
  id: string;
  name: string;
  photo: string;
  rollNumber: string;
  admissionNumber: string;
  classGrade: string;
  section: string;
  parentName: string;
  parentPhone: string;
  busRoute: string;
  busStop: string;
  attendancePct: number;
  attendanceStreak: number;
  homeworkCompletionPct: number;
  overallTerm3Average: number;
  growthTrendPct: number;
  participationLevel: 'High' | 'Medium' | 'Low';
  behaviourStatus: 'Exemplary' | 'Good' | 'Needs Attention';
  status: 'Healthy' | 'Needs Attention' | 'Worth Watching';
  storySnippet: string;
}

export interface TeacherRecord {
  id: string;
  name: string;
  photo: string;
  role: string;
  subjects: string[];
  classes: string[];
  officeHours: string;
  avgResponseTime: string;
  classroomNumber: string;
}

export interface ParentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  childrenIds: string[];
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  gateScanTime?: string;
  busBoardTime?: string;
}

export interface HomeworkRecord {
  id: string;
  studentId: string;
  subject: string;
  title: string;
  dueDate: string;
  estimatedEffort: string;
  isCompleted: boolean;
  score?: number;
  teacherFeedback?: string;
}

export interface MarksRecord {
  studentId: string;
  subject: string;
  term1Score: number;
  term2Score: number;
  term3Score: number;
  latestQuizScore: number;
  strongestTopic: string;
  weakestTopic: string;
}

export interface SupportRadarSignal {
  studentId: string;
  studentName: string;
  priority: 'urgent' | 'watching' | 'routine';
  confidencePct: number;
  recommendation: string;
  evidence: {
    homeworkDrop: string;
    libraryVisits: string;
    participation: string;
    attendance: string;
  };
  suggestedAction: string;
  whyGenerated: string;
}

export interface GuardianJourneyStep {
  studentId: string;
  timestamp: string;
  stepName: string;
  location: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  icon: string;
  details: string;
}
