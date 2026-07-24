export type SchoolGPTRole = 'student' | 'parent' | 'teacher' | 'admin' | 'driver' | 'gate' | 'vendor';

export interface SchoolGPTContext {
  role: SchoolGPTRole;
  studentId?: string;
  teacherId?: string;
  guardianId?: string;
  studentName?: string;
  teacherName?: string;
  childrenIds?: string[];
  classGrade?: string;
  classSection?: string;
}

export interface SchoolGPTMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: string[];
  suggestedFollowUps?: string[];
}

export interface RetrievedData {
  domain: string;
  data: Record<string, unknown>;
  summary: string;
}

export interface SchoolQueryParams {
  studentId?: string;
  teacherId?: string;
  classGrade?: string;
  classSection?: string;
  date?: string;
  limit?: number;
}
