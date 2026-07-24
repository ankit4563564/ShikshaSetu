import { eventBus, type ScanEventPayload } from '../eventBus';
import { boardStudent, deboardStudent, raiseAlert } from '@/lib/journey';
import { createClient } from '@/lib/supabase/client';
import { getActiveTrip } from '@/lib/transport';

export function registerTransportHandlers(): void {
  eventBus.on('scan:transport_board', async (event) => {
    if (event.type !== 'scan:transport_board') return;
    const payload = event.payload as ScanEventPayload;

    try {
      const studentId = payload.studentId;
      const supabase = createClient();

      const { data: studentStop } = await supabase
        .from('student_stops')
        .select('bus_stops!inner(bus_identifier)')
        .eq('student_id', studentId)
        .limit(1)
        .maybeSingle();

      if (!studentStop) {
        const busIdentifier = (studentStop as any)?.bus_stops?.bus_identifier;
        if (!busIdentifier) {
          console.error(`[TransportHandler] No bus route found for student ${studentId}`);
          return;
        }
      }

      const busIdentifier = (studentStop as any)?.bus_stops?.bus_identifier;
      if (!busIdentifier) return;

      const activeTrip = await getActiveTrip(busIdentifier);
      if (!activeTrip) {
        console.error(`[TransportHandler] No active trip for ${busIdentifier}`);
        return;
      }

      await boardStudent(studentId, activeTrip.id);
      console.log(`[TransportHandler] Student ${payload.studentName} boarded on trip ${activeTrip.id}`);
    } catch (error) {
      console.error('[TransportHandler] Boarding failed:', error);
    }
  });

  eventBus.on('scan:transport_deboard', async (event) => {
    if (event.type !== 'scan:transport_deboard') return;
    const payload = event.payload as ScanEventPayload;

    try {
      const studentId = payload.studentId;
      const supabase = createClient();

      const { data: studentStop } = await supabase
        .from('student_stops')
        .select('bus_stops!inner(bus_identifier, stop_name, latitude, longitude)')
        .eq('student_id', studentId)
        .limit(1)
        .maybeSingle();

      const stopData = (studentStop as any)?.bus_stops;
      if (!stopData) {
        console.error(`[TransportHandler] No stop info for student ${studentId}`);
        return;
      }

      const busIdentifier = stopData.bus_identifier;
      const activeTrip = await getActiveTrip(busIdentifier);
      if (!activeTrip) return;

      await deboardStudent(
        studentId,
        activeTrip.id,
        stopData.stop_name,
        stopData.latitude,
        stopData.longitude,
      );
      console.log(`[TransportHandler] Student ${payload.studentName} deboarded at ${stopData.stop_name}`);
    } catch (error) {
      console.error('[TransportHandler] Debarding failed:', error);
    }
  });
}
