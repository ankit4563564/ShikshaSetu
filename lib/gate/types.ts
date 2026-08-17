export type GatePassStatus =
  | 'pending'
  | 'approved'
  | 'used'
  | 'expired'
  | 'rejected'
  | 'revoked';

export interface VerifyGatePassResult {
  success: boolean;
  status:
    | 'valid'
    | 'expiring_soon'
    | 'expired'
    | 'used'
    | 'pending'
    | 'rejected'
    | 'revoked'
    | 'invalid';
  passId?: string;
  studentId?: string;
  studentName?: string;
  studentGrade?: string;
  studentSection?: string;
  studentAvatarUrl?: string;
  guardianName?: string;
  guardianPhone?: string;
  pickupReason?: string;
  usedAt?: string;
  windowEnd?: string;
  message: string;
}

export interface GateCheckoutResult {
  success: boolean;
  status: 'success' | 'already_used' | 'expired' | 'revoked' | 'invalid' | 'unauthorized';
  passId?: string;
  studentName?: string;
  guardianName?: string;
  usedAt?: string;
  message: string;
}

export interface EmergencyPickupPayload {
  studentId: string;
  guardianId: string;
  reason: string;
  operationId: string;
}

export interface EmergencyPickupResult {
  success: boolean;
  status: 'success' | 'unauthorized' | 'invalid_guardian' | 'error';
  auditId?: string;
  studentName?: string;
  guardianName?: string;
  checkedOutAt?: string;
  message: string;
}
