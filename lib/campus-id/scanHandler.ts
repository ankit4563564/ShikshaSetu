import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { decodeQrContent, isTokenExpired, consumeNonce, isNonceConsumed } from './qrToken';
import { getCardById } from './campusCard';
import { eventBus, type ScanEventPayload, type ScanRejectedPayload } from './eventBus';
import { validateDevice } from './deviceAuth';
import type {
  ScanMode, ScanResult, ScannerPortal,
  DeviceMetadata, ScanValidationResult, ScanOutput, ScanAction, QrTokenPayload,
} from './types';

interface ProcessScanInput {
  qrContent: string;
  mode: ScanMode;
  scannerPortal: ScannerPortal;
  scannerIdentity: string;
  deviceMetadata?: Partial<DeviceMetadata>;
}

const MODE_PERMISSIONS: Record<ScanMode, ScannerPortal[]> = {
  transport_board: ['driver'],
  transport_deboard: ['driver'],
  gate_entry: ['gate', 'teacher', 'admin'],
  gate_exit: ['gate', 'teacher', 'admin'],
  attendance: ['teacher', 'admin'],
  library_entry: ['teacher', 'admin'],
  sports_entry: ['teacher', 'admin'],
  event_entry: ['teacher', 'admin'],
  lab_entry: ['teacher', 'admin'],
  hostel_entry: ['teacher', 'admin'],
  canteen_entry: ['teacher', 'admin'],
};

let handlerRegistered = false;

export async function processScan(input: ProcessScanInput): Promise<ScanOutput> {
  const actions: ScanAction[] = [];
  const scannedAt = new Date();

  // 0. Device validation (if deviceId provided)
  const deviceId = input.deviceMetadata?.deviceId as string | undefined;
  if (deviceId) {
    const deviceResult = await validateDevice(deviceId, input.mode);
    if (!deviceResult.valid) {
      await recordFailedScan(null, null, input.mode, 'unauthorized_scanner', input, deviceResult.error || 'Device not authorized', scannedAt);
      return { validation: { valid: false, result: 'unauthorized_scanner', errorDetail: deviceResult.error }, actions };
    }
    if (!input.deviceMetadata) input.deviceMetadata = {};
    input.deviceMetadata.deviceName = deviceResult.device?.deviceName;
    input.deviceMetadata.deviceType = deviceResult.device?.deviceType;
  }

  // 1. Decode and verify QR token
  const { payload, error: decodeError } = decodeQrContent(input.qrContent);
  if (decodeError || !payload) {
    await recordFailedScan(null, null, input.mode, 'invalid_qr', input, decodeError || 'Invalid QR', scannedAt);
    return { validation: { valid: false, result: 'invalid_qr', errorDetail: decodeError }, actions };
  }

  // 2. Check expiry
  if (isTokenExpired(payload)) {
    await recordFailedScan(null, payload.cid, input.mode, 'expired_token', input, 'QR token has expired', scannedAt);
    return { validation: { valid: false, result: 'expired_token', errorDetail: 'QR token has expired' }, actions };
  }

  // 3. Check replay (nonce consumed)
  const nonceUsed = await isNonceConsumed(payload.nonce);
  if (nonceUsed) {
    await recordFailedScan(null, payload.cid, input.mode, 'replay_detected', input, 'Nonce already consumed — replay attack detected', scannedAt);
    return { validation: { valid: false, result: 'replay_detected', errorDetail: 'This QR has already been used' }, actions };
  }

  // 4. Look up card
  const card = await getCardById(payload.cid);
  if (!card) {
    await recordFailedScan(null, payload.cid, input.mode, 'card_not_found', input, 'Card not found in registry', scannedAt);
    return { validation: { valid: false, result: 'card_not_found', errorDetail: 'Card not found' }, actions };
  }

  // 5. Check card status
  if (card.status !== 'active') {
    const result: ScanResult = card.status === 'revoked' ? 'revoked_card' : 'inactive_card';
    await recordFailedScan(null, card.id, input.mode, result, input, `Card is ${card.status}`, scannedAt);
    return { validation: { valid: false, result, card, errorDetail: `Card is ${card.status}` }, actions };
  }

  // 6. Check mode permissions
  const allowedPortals = MODE_PERMISSIONS[input.mode];
  if (!allowedPortals.includes(input.scannerPortal)) {
    await recordFailedScan(null, card.id, input.mode, 'unauthorized_scanner', input, `Scanner portal '${input.scannerPortal}' not authorized for mode '${input.mode}'`, scannedAt);
    return { validation: { valid: false, result: 'unauthorized_scanner', card, errorDetail: 'Scanner not authorized for this mode' }, actions };
  }

  // 7. Check mode authorization for this card type
  if (!isModeAllowedForCardType(input.mode, card.cardType)) {
    await recordFailedScan(null, card.id, input.mode, 'mode_unauthorized', input, `Card type '${card.cardType}' not allowed for mode '${input.mode}'`, scannedAt);
    return { validation: { valid: false, result: 'mode_unauthorized', card, errorDetail: 'Card type not allowed for this operation' }, actions };
  }

  // 8. Consume nonce (atomically prevent replay)
  const consumed = await consumeNonce(payload.nonce);
  if (!consumed) {
    await recordFailedScan(null, card.id, input.mode, 'replay_detected', input, 'Nonce already consumed by another request', scannedAt);
    return { validation: { valid: false, result: 'replay_detected', card, errorDetail: 'This QR has already been used' }, actions };
  }

  // 9. Fetch student details
  const supabase = createClient();
  const { data: student } = await supabase
    .from('students')
    .select('id, display_name, grade, section, roll_number, avatar_url, house, blood_group, emergency_contact')
    .eq('id', card.studentId)
    .single();

  if (!student) {
    await recordFailedScan(null, card.id, input.mode, 'card_not_found', input, 'Student record not found', scannedAt);
    return { validation: { valid: false, result: 'card_not_found', card, errorDetail: 'Student not found' }, actions };
  }

  // Fetch guardian name, bus route, medical flags, and academic year
  const [guardianResult, busRouteResult, medicalResult, academicResult] = await Promise.all([
    supabase.from('guardian_access')
      .select('guardians!inner(first_name, last_name)')
      .eq('student_id', student.id)
      .eq('is_primary', true)
      .limit(1)
      .maybeSingle(),
    supabase.from('student_stops')
      .select('bus_stops!inner(bus_identifier, stop_name)')
      .eq('student_id', student.id)
      .limit(1)
      .maybeSingle(),
    supabase.from('medical_flags')
      .select('id, flag_type, description, severity, is_active')
      .eq('student_id', student.id)
      .eq('is_active', true),
    supabase.from('students')
      .select('academic_year')
      .eq('id', student.id)
      .single(),
  ]);

  const guardianName = guardianResult.data
    ? `${(guardianResult.data as any).guardians?.first_name || ''} ${(guardianResult.data as any).guardians?.last_name || ''}`.trim() || null
    : null;

  const busRoute = busRouteResult.data
    ? (busRouteResult.data as any).bus_stops?.bus_identifier || null
    : null;

  const rawFlags = medicalResult.data || [];
  const medicalFlags = rawFlags.map((f: any) => ({
    id: f.id,
    flagType: f.flag_type,
    description: f.description,
    severity: f.severity as 'info' | 'warning' | 'critical',
    isActive: f.is_active,
  }));

  const academicYear = academicResult.data
    ? (academicResult.data as any).academic_year || null
    : null;

  // 10. Record successful scan event + get event ID
  const scanEventId = await recordSuccessfulScan(card.id, card.studentId, input.mode, payload, input, scannedAt);

  // 11. Emit event on internal bus (decouples scan from downstream actions)
  const scanPayload: ScanEventPayload = {
    eventId: scanEventId || crypto.randomUUID(),
    cardId: card.id,
    studentId: student.id,
    studentName: student.display_name,
    mode: input.mode,
    result: 'success',
    scannerPortal: input.scannerPortal,
    scannerIdentity: input.scannerIdentity,
    deviceMetadata: (input.deviceMetadata || {}) as DeviceMetadata,
    scannedAt,
    metadata: { cardType: card.cardType },
  };

  await eventBus.emit({ type: `scan:${input.mode}`, payload: scanPayload });
  await eventBus.emit({ type: 'scan.validated', payload: scanPayload });

  return {
    validation: {
      valid: true,
      result: 'success',
      card,
      student: {
        id: student.id,
        displayName: student.display_name,
        grade: student.grade,
        section: student.section,
        rollNumber: student.roll_number,
        avatarUrl: student.avatar_url,
        house: student.house,
        emergencyContact: student.emergency_contact,
        academicYear,
        guardianName,
        busRoute,
        medicalFlags,
      },
    },
    eventId: scanEventId || undefined,
    actions,
  };
}

export function registerScanHandler(actionType: string, handler: (payload: ScanEventPayload) => Promise<ScanAction>): void {
  eventBus.on(`scan:${actionType}`, async (event) => {
    if (event.type.startsWith('scan:') && 'eventId' in event.payload) {
      const action = await handler(event.payload as ScanEventPayload);
    }
  });
}

function isModeAllowedForCardType(mode: ScanMode, cardType: string): boolean {
  const cardModeMap: Record<string, ScanMode[]> = {
    student_id: ['transport_board', 'transport_deboard', 'gate_entry', 'gate_exit', 'attendance', 'library_entry', 'sports_entry', 'event_entry', 'lab_entry', 'canteen_entry'],
    library_card: ['library_entry'],
    bus_pass: ['transport_board', 'transport_deboard'],
    sports_card: ['sports_entry'],
    hostel_card: ['hostel_entry', 'gate_entry', 'gate_exit'],
  };
  const allowed = cardModeMap[cardType] || [];
  return allowed.includes(mode);
}

async function recordSuccessfulScan(
  cardId: string,
  studentId: string,
  mode: ScanMode,
  payload: QrTokenPayload,
  input: ProcessScanInput,
  scannedAt: Date,
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('scan_events')
    .insert({
      card_id: cardId,
      student_id: studentId,
      mode,
      result: 'success',
      scanner_portal: input.scannerPortal,
      scanner_identity: input.scannerIdentity,
      device_metadata: input.deviceMetadata || {},
      scanned_at: scannedAt.toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[ScanHandler] Failed to record scan event:', error.message);
    return null;
  }
  return data?.id || null;
}

async function recordFailedScan(
  qrTokenId: string | null,
  cardId: string | null,
  mode: ScanMode,
  result: Exclude<ScanResult, 'success'>,
  input: ProcessScanInput,
  errorDetail: string,
  scannedAt: Date,
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('scan_events')
    .insert({
      qr_token_id: qrTokenId,
      card_id: cardId,
      mode,
      result,
      scanner_portal: input.scannerPortal,
      scanner_identity: input.scannerIdentity,
      device_metadata: input.deviceMetadata || {},
      error_detail: errorDetail,
      scanned_at: scannedAt.toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[ScanHandler] Failed to record scan failure:', error.message);
    return null;
  }

  const rejectedPayload: ScanRejectedPayload = {
    eventId: data?.id || crypto.randomUUID(),
    cardId,
    studentId: null,
    mode,
    result,
    scannerPortal: input.scannerPortal,
    scannerIdentity: input.scannerIdentity,
    errorDetail,
    scannedAt,
  };

  await eventBus.emit({ type: 'scan.rejected', payload: rejectedPayload });
  return data?.id || null;
}
