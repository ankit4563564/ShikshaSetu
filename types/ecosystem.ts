import type { Portal } from './portal';

export type EcosystemEventType =
  | 'chat_message_sent'
  | 'evidence_logged'
  | 'academic_records_imported'
  | 'gate_pass_requested'
  | 'gate_pass_approved'
  | 'gate_pass_rejected'
  | 'gate_pass_cancelled'
  | 'gate_pass_used'
  | 'gate_pass_scan_failed'
  | 'student_achievement_created'
  | 'student_boarded_bus'
  | 'student_deboarded_bus'
  | 'student_home_safe_confirmed'
  | 'journey_alert_raised'
  | 'driver_trip_started'
  | 'driver_trip_completed'
  | 'school_calendar_changed'
  | 'card_scanned'
  | 'card_issued'
  | 'card_revoked'
  | 'card_token_rotated'
  | 'scan.validated'
  | 'scan.rejected'
  | 'marks_published'
  | 'attendance_marked'
  | 'voice_note_logged'
  | 'mood_submitted'
  | 'home_safe_confirmed';

export type EcosystemNotificationCategory =
  | 'academic'
  | 'wellness'
  | 'safety'
  | 'chat'
  | 'system';

export interface EcosystemEventInput {
  eventType: EcosystemEventType;
  studentId?: string | null;
  actorId?: string | null;
  actorRole?: Portal | null;
  title: string;
  body?: string | null;
  metadata?: Record<string, unknown>;
}
