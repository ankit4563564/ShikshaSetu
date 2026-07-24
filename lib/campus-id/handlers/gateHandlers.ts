import { eventBus, type ScanEventPayload } from '../eventBus';
import { createClient } from '@/lib/supabase/client';
import {
  createEcosystemNotifications,
  getStudentCareTeamRecipients,
  recordEcosystemEvent,
} from '@/lib/ecosystem';

export function registerGateHandlers(): void {
  eventBus.on('scan:gate_entry', async (event) => {
    if (event.type !== 'scan:gate_entry') return;
    const payload = event.payload as ScanEventPayload;

    try {
      const supabase = createClient();
      const studentId = payload.studentId;

      const { data: student } = await supabase
        .from('students')
        .select('display_name, class_teacher_id')
        .eq('id', studentId)
        .single();

      if (!student) return;

      // Gate scans record arrival events, not attendance.
      // Attendance is a separate concern. This creates a gate entry record.
      const today = new Date().toISOString().split('T')[0];

      const { data: existingArrival } = await supabase
        .from('scan_events')
        .select('id')
        .eq('student_id', studentId)
        .eq('mode', 'gate_entry')
        .gte('scanned_at', `${today}T00:00:00Z`)
        .limit(1)
        .maybeSingle();

      if (existingArrival) {
        console.log(`[GateHandler] Student ${student.display_name} already arrived today`);
        return;
      }

      // Check if student is a bus student (has bus stop assignment)
      const { data: busAssignment } = await supabase
        .from('student_stops')
        .select('student_id')
        .eq('student_id', studentId)
        .limit(1)
        .maybeSingle();

      const isBusStudent = !!busAssignment;

      // Notify care team
      await recordEcosystemEvent(supabase, {
        eventType: 'gate_pass_used',
        studentId,
        actorId: payload.scannerIdentity || undefined,
        actorRole: 'gate',
        title: 'Student entered campus',
        body: `${student.display_name} entered campus at ${new Date().toLocaleTimeString()}.`,
        metadata: {
          scanEventId: payload.eventId,
          isBusStudent,
          mode: 'gate_entry',
        },
      });

      const recipients = await getStudentCareTeamRecipients(supabase, studentId, {
        includeGuardians: true,
      });

      await createEcosystemNotifications(supabase, recipients, {
        studentId,
        title: 'Campus arrival',
        body: `${student.display_name} arrived on campus at ${new Date().toLocaleTimeString()}.`,
        category: 'safety',
      });

      console.log(`[GateHandler] Student ${student.display_name} arrival recorded (bus: ${isBusStudent})`);
    } catch (error) {
      console.error('[GateHandler] Gate entry processing failed:', error);
    }
  });

  eventBus.on('scan:gate_exit', async (event) => {
    if (event.type !== 'scan:gate_exit') return;
    const payload = event.payload as ScanEventPayload;

    try {
      const supabase = createClient();
      const studentId = payload.studentId;

      const { data: student } = await supabase
        .from('students')
        .select('display_name')
        .eq('id', studentId)
        .single();

      if (!student) return;

      await recordEcosystemEvent(supabase, {
        eventType: 'gate_pass_used',
        studentId,
        actorId: payload.scannerIdentity || undefined,
        actorRole: 'gate',
        title: 'Student exited campus',
        body: `${student.display_name} exited campus at ${new Date().toLocaleTimeString()}.`,
        metadata: {
          scanEventId: payload.eventId,
          mode: 'gate_exit',
        },
      });

      const recipients = await getStudentCareTeamRecipients(supabase, studentId, {
        includeGuardians: true,
      });

      await createEcosystemNotifications(supabase, recipients, {
        studentId,
        title: 'Campus exit',
        body: `${student.display_name} exited campus at ${new Date().toLocaleTimeString()}.`,
        category: 'safety',
      });

      console.log(`[GateHandler] Student ${student.display_name} exit recorded`);
    } catch (error) {
      console.error('[GateHandler] Gate exit processing failed:', error);
    }
  });
}
