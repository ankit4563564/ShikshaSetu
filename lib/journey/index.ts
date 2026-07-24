'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  createEcosystemNotifications,
  getStudentCareTeamRecipients,
  recordEcosystemEvent,
} from '@/lib/ecosystem';

export async function startTrip(driverId: string, busIdentifier: string): Promise<string> {
  const supabase = createClient();

  // A conductor can resume an interrupted in-progress route without creating
  // duplicate journey records for the same bus and driver.
  const { data: activeTrip, error: activeTripError } = await supabase
    .from('driver_trips')
    .select('id')
    .eq('driver_id', driverId)
    .eq('bus_identifier', busIdentifier)
    .eq('status', 'en_route')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeTripError) {
    throw new Error(activeTripError.message);
  }

  if (activeTrip) {
    return activeTrip.id;
  }

  // 1. Insert new trip
  const { data: trip, error: tripError } = await supabase
    .from('driver_trips')
    .insert({
      driver_id: driverId,
      bus_identifier: busIdentifier,
      status: 'en_route',
      started_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (tripError || !trip) {
    throw new Error(tripError?.message || 'Failed to start trip');
  }

  // 2. Fetch all student IDs assigned to stops on this bus route
  const { data: studentStops, error: stopsError } = await supabase
    .from('student_stops')
    .select('student_id, bus_stops!inner(bus_identifier)')
    .eq('bus_stops.bus_identifier', busIdentifier);

  if (stopsError) {
    throw new Error(stopsError.message);
  }

  const studentIdsRaw = studentStops?.map((s) => s.student_id) || [];

  // 2.5 Query today's used gate passes to filter out students who have checked out early
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: earlyExits, error: exitError } = await supabase
    .from('gate_passes')
    .select('student_id')
    .eq('status', 'used')
    .gte('used_at', todayStart.toISOString());

  if (exitError) {
    console.error('[Journey startTrip] Failed to query early exits:', exitError);
  }

  const earlyExitStudentIds = new Set(earlyExits?.map((e: any) => e.student_id) || []);
  const studentIds = studentIdsRaw.filter((id) => !earlyExitStudentIds.has(id));

  // 3. Insert initial student_journey rows (status='waiting')
  // Use upsert to handle case where journey rows already exist for resumed trip
  if (studentIds.length > 0) {
    const journeyRows = studentIds.map((studentId) => ({
      student_id: studentId,
      trip_id: trip.id,
      status: 'waiting',
      updated_at: new Date().toISOString()
    }));

    const { error: journeyError } = await supabase
      .from('student_journey')
      .upsert(journeyRows, {
        onConflict: 'student_id,trip_id',
        ignoreDuplicates: false
      });

    if (journeyError) {
      throw new Error(journeyError.message);
    }
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'driver_trip_started',
    actorId: driverId,
    actorRole: 'driver',
    title: 'Transport route started',
    body: `${busIdentifier} is now en route.`,
    metadata: {
      tripId: trip.id,
      busIdentifier,
      rosterSize: studentIds.length,
      skippedEarlyExitStudentIds: Array.from(earlyExitStudentIds),
    },
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/driver');
  revalidatePath('/admin');
  return trip.id;
}

export async function endTrip(tripId: string): Promise<void> {
  const supabase = createClient();

  const { data: stillBoarded, error: journeyError } = await supabase
    .from('student_journey')
    .select('id')
    .eq('trip_id', tripId)
    .eq('status', 'boarded')
    .limit(1);

  if (journeyError) {
    throw new Error(journeyError.message);
  }

  if (stillBoarded && stillBoarded.length > 0) {
    throw new Error('Every boarded student must be deboarded before the route can be completed.');
  }

  const { error } = await supabase
    .from('driver_trips')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString()
    })
    .eq('id', tripId);

  if (error) {
    throw new Error(error.message);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'driver_trip_completed',
    actorRole: 'driver',
    title: 'Transport route completed',
    metadata: {
      tripId,
    },
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/driver');
  revalidatePath('/admin');
}

export async function boardStudent(studentId: string, tripId: string): Promise<void> {
  const supabase = createClient();

  const { data: updatedJourney, error } = await supabase
    .from('student_journey')
    .update({
      status: 'boarded',
      boarded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('student_id', studentId)
    .eq('trip_id', tripId)
    .eq('status', 'waiting')
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  // A retry after a successful boarding must not repeat notifications or
  // ecosystem events.
  if (!updatedJourney) return;

  await recordEcosystemEvent(supabase, {
    eventType: 'student_boarded_bus',
    studentId,
    actorRole: 'driver',
    title: 'Student boarded bus',
    metadata: {
      tripId,
    },
  });

  const recipients = await getStudentCareTeamRecipients(supabase, studentId, {
    includeGuardians: true,
    includeTeacher: true,
  });

  await createEcosystemNotifications(supabase, recipients, {
    studentId,
    title: 'Bus boarding recorded',
    body: 'The student has been marked boarded on the active route.',
    category: 'safety',
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/driver');
  revalidatePath('/admin');
}

export async function deboardStudent(
  studentId: string,
  tripId: string,
  stopName: string,
  lat: number,
  lng: number
): Promise<void> {
  const supabase = createClient();

  // 1. Update deboard status
  const { data: updatedJourney, error: updateError } = await supabase
    .from('student_journey')
    .update({
      status: 'deboarded',
      deboarded_at: new Date().toISOString(),
      deboard_stop: stopName,
      deboard_lat: lat,
      deboard_lng: lng,
      updated_at: new Date().toISOString()
    })
    .eq('student_id', studentId)
    .eq('trip_id', tripId)
    .eq('status', 'boarded')
    .select('id')
    .maybeSingle();

  if (updateError) {
    throw new Error(updateError.message);
  }

  // A duplicate deboarding request must not repeat alerts, notifications, or
  // ecosystem events.
  if (!updatedJourney) return;

  // 2. Fetch student's registered stop name and details
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('display_name')
    .eq('id', studentId)
    .single();

  const studentName = student?.display_name || 'Student';

  const { data: registeredStops, error: registeredError } = await supabase
    .from('student_stops')
    .select('bus_stops(stop_name)')
    .eq('student_id', studentId);

  let expectedStopName = '';
  if (registeredStops && registeredStops.length > 0) {
    const stops = registeredStops[0].bus_stops as any;
    expectedStopName = stops?.stop_name || '';
  }

  // 3. Compare deboard stop to registered stop
  if (expectedStopName && stopName.toLowerCase() !== expectedStopName.toLowerCase()) {
    const msg = `${studentName} got off at ${stopName} instead of their scheduled stop. Please check on them.`;
    await raiseAlert(studentId, tripId, 'unexpected_deboard', msg);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'student_deboarded_bus',
    studentId,
    actorRole: 'driver',
    title: 'Student deboarded bus',
    body: `${studentName} deboarded at ${stopName}.`,
    metadata: {
      tripId,
      stopName,
      expectedStopName,
      lat,
      lng,
    },
  });

  const recipients = await getStudentCareTeamRecipients(supabase, studentId, {
    includeGuardians: true,
    includeTeacher: true,
  });

  await createEcosystemNotifications(supabase, recipients, {
    studentId,
    title: 'Bus deboarding recorded',
    body: `${studentName} deboarded at ${stopName}.`,
    category: 'safety',
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/driver');
  revalidatePath('/admin');
}

export async function confirmHomeSafe(studentId: string, tripId: string, guardianId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('student_journey')
    .update({
      status: 'home_safe',
      home_safe_at: new Date().toISOString(),
      confirmed_by: guardianId,
      updated_at: new Date().toISOString()
    })
    .eq('student_id', studentId)
    .eq('trip_id', tripId);

  if (error) {
    throw new Error(error.message);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'student_home_safe_confirmed',
    studentId,
    actorId: guardianId,
    actorRole: 'parent',
    title: 'Home safe confirmed',
    metadata: {
      tripId,
    },
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/driver');
  revalidatePath('/admin');
}

export async function raiseAlert(
  studentId: string,
  tripId: string,
  type: 'missed_stop' | 'not_home_safe' | 'unexpected_deboard',
  message: string
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('create_journey_alert', {
    p_student_id: studentId,
    p_trip_id: tripId,
    p_alert_type: type,
    p_message: message
  });

  if (error) {
    throw new Error(error.message);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'journey_alert_raised',
    studentId,
    actorRole: 'driver',
    title: 'Journey alert raised',
    body: message,
    metadata: {
      tripId,
      alertType: type,
      alertId: data,
    },
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/admin');
  return data;
}

export async function checkNotHomeSafe(tripId: string): Promise<void> {
  const supabase = createClient();

  // For demo: query all students WHERE status='deboarded' AND home_safe_at IS NULL AND deboarded_at < now() - 30 mins
  // TODO: replace with pg_cron in production
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: journeys, error } = await supabase
    .from('student_journey')
    .select('student_id, trip_id, students(display_name)')
    .eq('trip_id', tripId)
    .eq('status', 'deboarded')
    .is('home_safe_at', null)
    .lt('deboarded_at', thirtyMinsAgo);

  if (error) {
    throw new Error(error.message);
  }

  if (journeys && journeys.length > 0) {
    for (const j of journeys) {
      const studentName = (j.students as any)?.display_name || 'Student';
      const msg = `${studentName} was deboarded over 30 minutes ago and has not confirmed safe arrival. Please verify safety immediately.`;
      const { data: existingAlert, error: existingAlertError } = await supabase
        .from('journey_alerts')
        .select('id')
        .eq('student_id', j.student_id)
        .eq('trip_id', j.trip_id)
        .eq('alert_type', 'not_home_safe')
        .eq('resolved', false)
        .limit(1)
        .maybeSingle();

      if (existingAlertError) {
        console.error('[Journey Safety] Failed to check for an existing not-home-safe alert:', existingAlertError);
        continue;
      }

      if (!existingAlert) {
        await raiseAlert(j.student_id, j.trip_id, 'not_home_safe', msg);
      }
    }
  }
}

export async function updateLiveBusLocation(
  busIdentifier: string,
  lat: number,
  lng: number,
  speed: number | null,
  heading: number | null
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('bus_locations').insert({
    bus_identifier: busIdentifier,
    latitude: lat,
    longitude: lng,
    speed_kmh: speed !== null ? Math.round(speed * 3.6 * 10) / 10 : 22.5,
    heading: heading || 0,
    recorded_at: new Date().toISOString(),
  });
  if (error) {
    throw new Error(error.message);
  }
}
