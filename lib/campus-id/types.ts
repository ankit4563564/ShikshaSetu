export type CampusCardType =
  | 'student_id'
  | 'library_card'
  | 'bus_pass'
  | 'sports_card'
  | 'hostel_card';

export type CampusCardStatus =
  | 'active'
  | 'inactive'
  | 'revoked'
  | 'lost'
  | 'damaged';

export type ScanMode =
  | 'transport_board'
  | 'transport_deboard'
  | 'gate_entry'
  | 'gate_exit'
  | 'attendance'
  | 'library_entry'
  | 'sports_entry'
  | 'event_entry'
  | 'lab_entry'
  | 'hostel_entry'
  | 'canteen_entry';

export type ScanResult =
  | 'success'
  | 'duplicate'
  | 'already_boarded'
  | 'already_deboarded'
  | 'invalid_qr'
  | 'expired_token'
  | 'revoked_card'
  | 'inactive_card'
  | 'unauthorized_scanner'
  | 'wrong_route'
  | 'replay_detected'
  | 'card_not_found'
  | 'mode_unauthorized';

export type ScannerPortal = 'driver' | 'gate' | 'teacher' | 'admin';

export type HolderType =
  | 'student'
  | 'visitor'
  | 'staff'
  | 'vendor'
  | 'temporary_guest'
  | 'emergency_visitor';

export interface ScannerDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  assignedRole: ScanMode;
  assignedUser: string | null;
  status: string;
  lastSeen: string | null;
  publicIdentifier: string;
}

export interface CampusCardHolder {
  id: string;
  holderType: HolderType;
  studentId: string | null;
  externalName: string | null;
  externalPhotoUrl: string | null;
  externalPhone: string | null;
  validFrom: string | null;
  validUntil: string | null;
  sponsoredBy: string | null;
  createdAt: string;
}

export interface DeviceMetadata {
  userAgent?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  platform?: string;
  deviceId?: string;
  [key: string]: unknown;
}

export interface ScanEventRecord {
  id: string;
  qrTokenId: string | null;
  cardId: string | null;
  studentId: string | null;
  mode: ScanMode;
  result: ScanResult;
  scannerPortal: string | null;
  scannerIdentity: string | null;
  deviceMetadata: DeviceMetadata;
  errorDetail: string | null;
  scannedAt: string;
}

export interface CampusCardRecord {
  id: string;
  studentId: string;
  cardType: CampusCardType;
  status: CampusCardStatus;
  displayLabel: string | null;
  issuedAt: string;
  issuedBy: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
}

export interface QrTokenRecord {
  id: string;
  cardId: string;
  nonce: string;
  expiresAt: string;
  consumedAt: string | null;
  issuedAt: string;
}

export interface MedicalFlag {
  id: string;
  flagType: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
}

export interface ScanValidationResult {
  valid: boolean;
  result: ScanResult;
  card?: CampusCardRecord;
  student?: {
    id: string;
    displayName: string;
    grade: string;
    section: string | null;
    rollNumber: string | null;
    avatarUrl: string | null;
    house: string | null;
    emergencyContact: string | null;
    academicYear: string | null;
    guardianName: string | null;
    busRoute: string | null;
    medicalFlags: MedicalFlag[];
  };
  qrToken?: QrTokenRecord;
  errorDetail?: string;
}

export interface ScanOutput {
  validation: ScanValidationResult;
  eventId?: string;
  actions: ScanAction[];
}

export interface ScanAction {
  type: string;
  status: 'pending' | 'completed' | 'skipped' | 'failed';
  detail?: string;
}

export interface QrTokenPayload {
  cid: string;
  nonce: string;
  exp: number;
}

export interface CampusIdConfig {
  tokenValidityMinutes: number;
  allowedModes: Record<CampusCardType, ScanMode[]>;
}
