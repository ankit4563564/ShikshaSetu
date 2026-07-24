export type SchoolRole =
  | 'student'
  | 'parent'
  | 'teacher'
  | 'admin'
  | 'driver'
  | 'gate'
  | 'vendor'
  | 'principal';

export type Intent =
  | 'attendance'
  | 'homework'
  | 'timetable'
  | 'exams'
  | 'marks'
  | 'behaviour'
  | 'bus'
  | 'fees'
  | 'ptm'
  | 'health'
  | 'library'
  | 'sports'
  | 'events'
  | 'announcements'
  | 'teacher_workload'
  | 'student_performance'
  | 'clubs'
  | 'canteen'
  | 'achievements'
  | 'rules'
  | 'faculty'
  | 'general_education'
  | 'motivation'
  | 'career_guidance'
  | 'subject_explanation'
  | 'small_talk'
  | 'greeting'
  | 'administrative'
  | 'who_needs_attention'
  | 'unknown';

export type Entity =
  | 'student'
  | 'teacher'
  | 'class'
  | 'subject'
  | 'homework'
  | 'exam'
  | 'assignment'
  | 'book'
  | 'bus'
  | 'route'
  | 'stop'
  | 'club'
  | 'event'
  | 'holiday'
  | 'policy'
  | 'rule'
  | 'meal'
  | 'sport'
  | 'competition'
  | 'achievement'
  | 'parent'
  | 'notice'
  | 'fee'
  | 'timetable_entry'
  | 'none';

export type Action =
  | 'list'
  | 'detail'
  | 'count'
  | 'trend'
  | 'compare'
  | 'explain'
  | 'draft'
  | 'suggest'
  | 'schedule'
  | 'search'
  | 'summarize'
  | 'analyze'
  | 'none';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'GENERAL' | 'LIMITED';

export interface ClassifiedIntent {
  intent: Intent;
  confidence: number;
  entity: Entity;
  action: Action;
  entities: string[];
}

export interface SchoolBrainContext {
  role: SchoolRole;
  studentId?: string;
  teacherId?: string;
  guardianId?: string;
  studentName?: string;
  teacherName?: string;
  childrenIds?: string[];
  classGrade?: string;
  classSection?: string;
  userName?: string;
}

export interface RetrievalResult {
  data: string;
  sourceType: 'database' | 'knowledge' | 'llm' | 'capability_fallback' | 'reasoning';
  confidence: ConfidenceLevel;
  modulesConsulted: string[];
  metadata?: Record<string, any>;
}

export interface BrainResponse {
  text: string;
  sources: string[];
  suggestedFollowUps: string[];
  source: string;
  confidence: ConfidenceLevel;
}

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  grade: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  classTeacherId: string;
  classTeacherName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  busRoute?: string;
  busStop?: string;
  busNumber?: string;
  clubs: string[];
  housePoints: number;
  houseName: 'Vayu' | 'Agni' | 'Jal' | 'Prithvi';
  bloodGroup?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  feeDueAmount: number;
  libraryIssuedBooksCount: number;
  attendanceRate: number; // percentage
}

export interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone: string;
  subjects: string[];
  isClassTeacher: boolean;
  classTeacherOf?: string; // e.g. "8A"
  classesTaught?: { grade: string; section: string; subject: string }[];
  classes?: { grade: string; section: string }[];
  staffRoom?: string;
  officeHours?: string;
  dailyPeriodsCount?: number;
}

export interface GuardianProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  children: { id: string; name: string; grade: string; section: string }[];
  preferredLanguage: string;
  feePaymentStatus: 'Paid' | 'Pending' | 'Overdue';
  ptmAttendanceStatus: 'Confirmed' | 'Pending' | 'Declined';
  lastNoticeAcknowledged: boolean;
}

export interface TimetableEntry {
  id: string;
  grade: string;
  section: string;
  dayOfWeek: number; // 0=Mon, 4=Fri
  dayName: string;
  periodNumber: number;
  subject: string;
  teacherId: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface HomeworkAssignment {
  id: string;
  grade: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  assignedByTeacherId: string;
  assignedByTeacherName: string;
  pendingStudentIds: string[];
  submittedStudentIds: string[];
}

export interface ExamSchedule {
  id: string;
  grade: string;
  subject: string;
  examName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  maxScore: number;
  topics: string[];
}

export interface StudentMarks {
  studentId: string;
  studentName: string;
  subject: string;
  examName: string;
  score: number;
  maxScore: number;
  percentage: number;
  gradeLetter: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
}

export interface IssuedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issuedDate: string;
  dueDate: string;
  isOverdue: boolean;
  fineAmount: number;
}

export interface ClubInfo {
  id: string;
  name: string;
  description: string;
  teacherInCharge?: string;
  teacherName?: string;
  meetingDay: string | number;
  meetingTime: string;
  location?: string;
  meetingLocation?: string;
  memberCount?: number;
  members?: string[];
}

export interface EventInfo {
  id: string;
  name: string;
  category: 'Academic' | 'Sports' | 'Cultural' | 'Holiday' | 'PTM';
  startDate: string;
  endDate: string;
  description: string;
  venue: string;
  targetAudience: string;
}

export interface NoticeInfo {
  id: string;
  title: string;
  category: string;
  body: string;
  postedBy: string;
  postedAt: string;
  targetAudience: string[];
}

export interface PolicyInfo {
  category: string;
  title: string;
  summary: string;
  details: string[];
}

export interface CanteenMenuItem {
  day: string;
  category: 'Breakfast' | 'Lunch' | 'Snacks';
  items: string[];
  specialItem: string;
}

export interface BehaviourRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  date: string;
  type: 'Praise' | 'Concern' | 'Discipline';
  note: string;
  teacherName: string;
}

export interface BusRouteInfo {
  routeId: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  capacity: number;
  studentCount: number;
  stops: { stopName: string; morningPickupTime: string; eveningDropTime: string }[];
}

export interface AttentionRequiredSummary {
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  attendancePct: number;
  failingSubjects: string[];
  pendingHomeworkCount: number;
  behaviourConcernsCount: number;
  primaryConcernReason: string;
  recommendedActions: string[];
}
