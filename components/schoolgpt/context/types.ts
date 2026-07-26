export type SchoolGPTRole = 'teacher' | 'parent' | 'student' | 'admin' | 'driver' | 'gate' | 'vendor';
export type SchoolGPTModule = 'attendance' | 'marks' | 'homework' | 'growth' | 'ptm' | 'safety' | 'general';

export interface DomainContext {
  role: SchoolGPTRole;
  module: SchoolGPTModule;
  studentId?: string;
  studentName?: string;
  classGrade?: string;
  classSection?: string;
  subject?: string;
  assessment?: string;
  dateRange?: string;
  filters?: Record<string, any>;
}
