export interface MedicalFlag {
  id: string;
  studentId: string;
  flagType: 'allergy' | 'medication' | 'condition' | 'dietary' | 'physical' | 'other';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
  recordedBy: string | null;
  recordedAt: string;
}

export type Student = {
  id: string;
  displayName: string;
  grade: string;
  section: string | null;
  rollNumber: string | null;
  avatarUrl: string | null;
  house: string | null;
  emergencyContact: string | null;
  academicYear: string | null;
  medicalFlags: MedicalFlag[];
  guardianName: string | null;
  busRoute: string | null;
};
