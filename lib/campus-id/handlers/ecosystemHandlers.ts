import { eventBus, type ScanEventPayload, type ScanRejectedPayload } from '../eventBus';
import { createClient } from '@/lib/supabase/client';
import {
  createEcosystemNotifications,
  getStudentCareTeamRecipients,
  recordEcosystemEvent,
} from '@/lib/ecosystem';

export function registerEcosystemHandlers(): void {
  eventBus.on('scan.validated', async (event) => {
    if (event.type !== 'scan.validated') return;
    const payload = event.payload as ScanEventPayload;
    const supabase = createClient();

    try {
      // 1. Ecosystem Event (audit log)
      await recordEcosystemEvent(supabase, {
        eventType: 'scan.validated',
        studentId: payload.studentId,
        actorId: payload.scannerIdentity,
        actorRole: payload.scannerPortal as any,
        title: `Scan validated — ${payload.studentName}`,
        body: `${payload.studentName} scanned via ${payload.scannerPortal} (mode: ${payload.mode})`,
        metadata: {
          eventId: payload.eventId,
          cardId: payload.cardId,
          mode: payload.mode,
          scannerPortal: payload.scannerPortal,
          scannedAt: payload.scannedAt.toISOString(),
        },
      });

      // 2. Notify care team
      const recipients = await getStudentCareTeamRecipients(supabase, payload.studentId, {
        includeGuardians: true,
        includeTeacher: payload.mode !== 'transport_board' && payload.mode !== 'transport_deboard',
        includeAdmins: payload.mode === 'gate_entry' || payload.mode === 'gate_exit',
      });

      await createEcosystemNotifications(supabase, recipients, {
        studentId: payload.studentId,
        title: `Scan alert: ${payload.studentName}`,
        body: `${payload.studentName} scanned at ${payload.scannerPortal} (${payload.mode}) at ${new Date(payload.scannedAt).toLocaleTimeString()}.`,
        category: 'safety',
      });

      // 3. Analytics update — increment daily counters
      // Handled by the analytics module reading scan_events directly

      // 4. Mission Control update — realtime propagation (triggered via DB changes)

      // 5. Activity Timeline update — handled by ecosystem_events table + realtime subscriptions

      console.log(`[EcosystemHandler] scan.validated processed for ${payload.studentName} (event: ${payload.eventId})`);
    } catch (error) {
      console.error('[EcosystemHandler] Failed to process scan.validated:', error);
    }
  });

  eventBus.on('scan.rejected', async (event) => {
    if (event.type !== 'scan.rejected') return;
    const payload = event.payload as ScanRejectedPayload;
    const supabase = createClient();

    try {
      // 1. Ecosystem Event (audit log — always)
      await recordEcosystemEvent(supabase, {
        eventType: 'scan.rejected',
        studentId: payload.studentId || undefined,
        actorId: payload.scannerIdentity,
        actorRole: payload.scannerPortal as any,
        title: `Scan rejected — ${payload.result}`,
        body: payload.errorDetail,
        metadata: {
          eventId: payload.eventId,
          cardId: payload.cardId,
          mode: payload.mode,
          result: payload.result,
          errorDetail: payload.errorDetail,
          scannedAt: payload.scannedAt.toISOString(),
        },
      });

      // 2. Security alert for certain failure types
      const securityRelevant = [
        'unauthorized_scanner',
        'replay_detected',
        'revoked_card',
        'inactive_card',
      ];
      if (securityRelevant.includes(payload.result)) {
        const adminRecipients = await getStudentCareTeamRecipients(supabase, payload.studentId || '', {
          includeGuardians: false,
          includeTeacher: false,
          includeAdmins: true,
        });

        await createEcosystemNotifications(supabase, adminRecipients, {
          studentId: payload.studentId || undefined,
          title: `Security alert: ${payload.result}`,
          body: `Suspicious scan attempt at ${payload.scannerPortal}: ${payload.errorDetail}`,
          category: 'safety',
        });
      }

      // 3. Analytics — rejected scan counter (handled via scan_events table reads)

      console.log(`[EcosystemHandler] scan.rejected processed: ${payload.result} at ${payload.scannerPortal}`);
    } catch (error) {
      console.error('[EcosystemHandler] Failed to process scan.rejected:', error);
    }
  });
}
