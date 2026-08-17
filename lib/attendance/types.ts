/**
 * Phase G1.1 — Attendance Types & Contracts
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'medical_leave';
export type DbAttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type SyncState = 'saved_locally' | 'syncing' | 'synced' | 'sync_failed' | 'conflict';

export interface AttendanceOperationItem {
  readonly operationId: string;     // Client-generated UUID
  readonly studentId: string;
  readonly studentName?: string;
  readonly date: string;            // YYYY-MM-DD
  readonly requestedStatus: AttendanceStatus;
  readonly notes?: string;
  readonly createdAt: string;       // ISO Timestamp
  syncState: SyncState;
  retryCount: number;
  errorMessage?: string;
}

export interface AttendanceRosterStudent {
  readonly studentId: string;
  readonly displayName: string;
  readonly rollNumber?: string;
  readonly gender?: string;
  currentStatus?: AttendanceStatus;
  notes?: string;
  lastUpdated?: string;
}

export interface BatchAttendancePayload {
  readonly operations: ReadonlyArray<{
    readonly operationId: string;
    readonly studentId: string;
    readonly date: string;
    readonly status: AttendanceStatus;
    readonly notes?: string;
    readonly createdAt: string;
  }>;
}

export interface OperationResult {
  readonly operationId: string;
  readonly studentId: string;
  readonly status: 'applied' | 'duplicate' | 'conflict' | 'validation_failed' | 'authorization_failed' | 'error';
  readonly serverState?: {
    readonly status: DbAttendanceStatus;
    readonly markedAt: string;
    readonly notes?: string;
  };
  readonly error?: string;
}

export interface BatchAttendanceResponse {
  readonly success: boolean;
  readonly processedCount: number;
  readonly results: ReadonlyArray<OperationResult>;
  readonly error?: string;
}

/**
 * Maps application-level status ('medical_leave') to backward-compatible database status ('excused').
 */
export function mapStatusToDb(status: AttendanceStatus, notes?: string): { status: DbAttendanceStatus; notes: string | null } {
  if (status === 'medical_leave') {
    const combinedNotes = notes ? `[Medical Leave] ${notes}` : '[Medical Leave]';
    return { status: 'excused', notes: combinedNotes };
  }
  return { status, notes: notes || null };
}

/**
 * Maps database status + notes back to application-level status.
 */
export function mapDbToStatus(status: DbAttendanceStatus, notes?: string | null): AttendanceStatus {
  if (status === 'excused' && notes?.includes('[Medical Leave]')) {
    return 'medical_leave';
  }
  return status;
}
