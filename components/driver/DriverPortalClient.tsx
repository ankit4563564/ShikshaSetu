'use client';

import { useEffect, useRef, useState } from 'react';
import { boardStudent, deboardStudent, endTrip, raiseAlert, startTrip, updateLiveBusLocation } from '@/lib/journey';
import { createClient } from '@/lib/supabase/client';

type Screen = 'selector' | 'route' | 'boarding' | 'deboarding' | 'complete';
type Driver = { id: string; name: string; bus_identifier: string; emoji: string };
type Stop = { id: string; stop_name: string; stop_order: number; latitude: number; longitude: number; arrival_time: string };
type Student = { id: string; display_name: string };

// The current schema does not link drivers to vehicles. This profile is the seeded
// conductor with a configured route; keeping it explicit prevents unusable routes.
const DRIVERS: Driver[] = [
  { id: 'd1000000-0000-4000-8000-000000000001', name: 'Rajesh Kumar', bus_identifier: 'BUS-001', emoji: '🧑‍✈️' },
  { id: 'd1000000-0000-4000-8000-000000000002', name: 'Suresh Sharma', bus_identifier: 'BUS-002', emoji: '🚌' },
  { id: 'd1000000-0000-4000-8000-000000000003', name: 'Amit Singh', bus_identifier: 'BUS-003', emoji: '🚍' },
];

const progressKey = (tripId: string) => `shikshasetu:conductor-trip:${tripId}`;

// Placeholder screen components
function SelectorScreen({ selectedDriver, setSelectedDriver, setErrorText, isBusy, handleStartTrip }: any) {
  return <div className="p-6">Select driver screen - not yet implemented</div>;
}

function RouteScreen({ currentStop, currentStopIndex, stops, gpsError, isBusy, openCurrentStop, selectedDriver }: any) {
  return <div className="p-6">Route screen - not yet implemented</div>;
}

function BoardingScreen({ currentStop, currentStopIndex, stops, students, studentStatus, busyStudentId, board, isBusy, continueFromBoarding }: any) {
  return <div className="p-6">Boarding screen - not yet implemented</div>;
}

function DeboardingScreen({ currentStop, students, studentStatus, busyStudentId, deboard, isBusy, finishRoute }: any) {
  return <div className="p-6">Deboarding screen - not yet implemented</div>;
}

function CompleteScreen({ completion, resetTrip, setNotice, setErrorText, setScreen }: any) {
  return <div className="p-6">Completion screen - not yet implemented</div>;
}

export default function DriverPortalClient() {
  const supabase = createClient();
  const watchIdRef = useRef<number | null>(null);
  const [screen, setScreen] = useState<Screen>('selector');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentStatus, setStudentStatus] = useState<Record<string, boolean>>({});
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [boardingOpenedAt, setBoardingOpenedAt] = useState<number | null>(null);
  const [completion, setCompletion] = useState({ boarded: 0, deboarded: 0, missed: 0 });

  const clearGpsWatch = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const saveProgress = (id: string, stopIndex: number) => {
    localStorage.setItem(progressKey(id), JSON.stringify({ stopIndex }));
  };

  const loadRoute = async (busIdentifier: string) => {
    const { data, error } = await supabase
      .from('bus_stops')
      .select('id, stop_name, stop_order, latitude, longitude, arrival_time')
      .eq('bus_identifier', busIdentifier)
      .order('stop_order', { ascending: true });

    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error(`No route has been configured for ${busIdentifier}.`);
    return data as Stop[];
  };

  const startGpsBroadcast = (busIdentifier: string) => {
    if (!navigator.geolocation) {
      setGpsError('This device does not support GPS. Route operations will work without live tracking.');
      setNotice('Operating in manual mode - Complete stops manually.');
      return;
    }

    clearGpsWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await updateLiveBusLocation(busIdentifier, position.coords.latitude, position.coords.longitude, position.coords.speed, position.coords.heading);
          setGpsError(null);
          if (notice?.includes('manual mode')) {
            setNotice(null);
          }
        } catch (err) {
          console.warn('[Driver GPS] Location update failed:', err);
          setGpsError('Live location could not be saved. Route checklist remains available.');
        }
      },
      (gpsError) => {
        // CRITICAL FIX: Graceful GPS fallback
        if (gpsError.code === gpsError.PERMISSION_DENIED) {
          setGpsError('GPS permission denied. Continuing in manual mode.');
          setNotice('Manual mode: Mark stops as completed. Parents will see route progress without live tracking.');
        } else if (gpsError.code === gpsError.POSITION_UNAVAILABLE) {
          setGpsError('GPS signal weak. Retrying...');
          setNotice('Operating with limited GPS. Route operations continue normally.');
        } else {
          setGpsError('GPS timeout. Retrying automatically.');
        }
        // Don't block route operations - continue in manual mode
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 },
    );
  };

  const resetTrip = () => {
    clearGpsWatch();
    setTripId(null);
    setSelectedDriver(null);
    setStops([]);
    setStudents([]);
    setStudentStatus({});
    setCurrentStopIndex(0);
    setBoardingOpenedAt(null);
  };

  const handleStartTrip = async () => {
    if (!selectedDriver) return;
    setIsBusy(true);
    setErrorText(null);
    setNotice(null);
    try {
      const route = await loadRoute(selectedDriver.bus_identifier);
      const id = await startTrip(selectedDriver.id, selectedDriver.bus_identifier);
      const saved = localStorage.getItem(progressKey(id));
      const savedIndex = saved ? Number(JSON.parse(saved).stopIndex) : 0;
      const stopIndex = Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < route.length ? savedIndex : 0;
      setStops(route);
      setTripId(id);
      setCurrentStopIndex(stopIndex);
      saveProgress(id, stopIndex);
      startGpsBroadcast(selectedDriver.bus_identifier);
      setScreen('route');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to start the route.');
    } finally {
      setIsBusy(false);
    }
  };

  const loadStudentsForBoarding = async (stop: Stop, id: string) => {
    const [{ data: assigned, error: assignedError }, { data: journeys, error: journeyError }] = await Promise.all([
      supabase.from('student_stops').select('student_id, students(id, display_name)').eq('stop_id', stop.id),
      supabase.from('student_journey').select('student_id, status').eq('trip_id', id),
    ]);
    if (assignedError || journeyError) throw new Error(assignedError?.message || journeyError?.message || 'Unable to load the stop checklist.');

    const roster = (assigned || []).flatMap((row: any) => row.students ? [{ id: row.students.id, display_name: row.students.display_name }] : []);
    const state = Object.fromEntries(roster.map((student) => [student.id, journeys?.some((journey) => journey.student_id === student.id && journey.status === 'boarded') ?? false]));
    setStudents(roster);
    setStudentStatus(state);
  };

  const openCurrentStop = async () => {
    const stop = stops[currentStopIndex];
    if (!stop || !tripId) return;
    setIsBusy(true);
    setErrorText(null);
    setNotice(null);
    try {
      await loadStudentsForBoarding(stop, tripId);
      setBoardingOpenedAt(Date.now());
      setScreen('boarding');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to open this stop.');
    } finally {
      setIsBusy(false);
    }
  };

  const board = async (studentId: string) => {
    if (!tripId) return;
    setBusyStudentId(studentId);
    setErrorText(null);
    try {
      await boardStudent(studentId, tripId);
      setStudentStatus((current) => ({ ...current, [studentId]: true }));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to record boarding.');
    } finally {
      setBusyStudentId(null);
    }
  };

  const openDeboarding = async () => {
    if (!tripId) return;
    const { data, error } = await supabase
      .from('student_journey')
      .select('student_id, students(id, display_name)')
      .eq('trip_id', tripId)
      .eq('status', 'boarded');
    if (error) throw new Error(error.message);
    const roster = (data || []).flatMap((row: any) => row.students ? [{ id: row.students.id, display_name: row.students.display_name }] : []);
    setStudents(roster);
    setStudentStatus(Object.fromEntries(roster.map((student) => [student.id, false])));
    setScreen('deboarding');
  };

  const continueFromBoarding = async () => {
    if (!tripId) return;
    const missed = students.filter((student) => !studentStatus[student.id]);
    setIsBusy(true);
    setErrorText(null);
    try {
      await Promise.all(missed.map((student) => raiseAlert(student.id, tripId, 'missed_stop', `${student.display_name} did not board at ${stops[currentStopIndex].stop_name}. Parent and teacher have been notified.`)));
      if (missed.length) setNotice(`${missed.length} missed-stop alert${missed.length === 1 ? '' : 's'} sent.`);
      setBoardingOpenedAt(null);
      if (currentStopIndex === stops.length - 1) {
        await openDeboarding();
      } else {
        const next = currentStopIndex + 1;
        setCurrentStopIndex(next);
        saveProgress(tripId, next);
        setScreen('route');
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not continue to the next step.');
    } finally {
      setIsBusy(false);
    }
  };

  const deboard = async (student: Student) => {
    const stop = stops[currentStopIndex];
    if (!tripId || !stop) return;
    setBusyStudentId(student.id);
    setErrorText(null);
    try {
      await deboardStudent(student.id, tripId, stop.stop_name, stop.latitude, stop.longitude);
      setStudentStatus((current) => ({ ...current, [student.id]: true }));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to record deboarding.');
    } finally {
      setBusyStudentId(null);
    }
  };

  const finishRoute = async () => {
    if (!tripId) return;
    const remaining = students.filter((student) => !studentStatus[student.id]);
    if (remaining.length) {
      setErrorText(`Deboard every student before completing the route (${remaining.length} still on the bus).`);
      return;
    }
    setIsBusy(true);
    try {
      const { data, error } = await supabase.from('student_journey').select('status').eq('trip_id', tripId);
      if (error) throw new Error(error.message);
      await endTrip(tripId);
      localStorage.removeItem(progressKey(tripId));
      setCompletion({
        boarded: data?.filter((journey) => ['deboarded', 'home_safe'].includes(journey.status)).length || 0,
        deboarded: data?.filter((journey) => ['deboarded', 'home_safe'].includes(journey.status)).length || 0,
        missed: data?.filter((journey) => journey.status === 'waiting').length || 0,
      });
      clearGpsWatch();
      setScreen('complete');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to complete the route.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => () => clearGpsWatch(), []);

  const currentStop = stops[currentStopIndex];
  const boardedCount = Object.values(studentStatus).filter(Boolean).length;

  return (
    <main className="driver-portal-shell mx-auto min-h-screen max-w-6xl bg-paper px-4 py-6 font-body text-deep-teal sm:px-6 lg:px-10">
      {/* Driving Safety Banner */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⚠️</span>
          <div>
            <strong className="text-xs font-black block">Safety Protocol: Hands-Free Vehicle Mode</strong>
            <p className="text-[10px] font-semibold opacity-80">Drivers must not operate mobile screens while vehicle is in motion. App is operated by the Bus Conductor / Attendant.</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-[10px] font-extrabold text-amber-900 border border-amber-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
          PASSIVE GPS ACTIVE
        </span>
      </div>

      <header className="driver-portal-header mb-7 rounded-[2rem] border border-white/80 bg-white/70 p-6 text-center shadow-[0_18px_45px_rgba(63,81,181,.09)] backdrop-blur-xl sm:p-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deep-teal/45">Bus Transit & Conductor Console</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Transport Attendant Portal</h1>
        <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-deep-teal/60">Designed for the bus conductor to log student boarding & deboarding — while the driver focuses 100% on safe navigation with passive background GPS streaming.</p>
      </header>

      {errorText && <div role="alert" className="mb-5 rounded-xl border border-warm-clay/30 bg-warm-clay/10 p-3 text-xs font-semibold text-warm-clay">⚠ {errorText}</div>}
      {notice && <div className="mb-5 rounded-xl border border-sage/20 bg-sage/10 p-3 text-xs font-semibold text-sage">✓ {notice}</div>}

      {screen === 'selector' && <SelectorScreen selectedDriver={selectedDriver} setSelectedDriver={setSelectedDriver} setErrorText={setErrorText} isBusy={isBusy} handleStartTrip={handleStartTrip} />}
      {screen === 'route' && selectedDriver && <RouteScreen currentStop={currentStop} currentStopIndex={currentStopIndex} stops={stops} gpsError={gpsError} isBusy={isBusy} openCurrentStop={openCurrentStop} selectedDriver={selectedDriver} />}
      {screen === 'boarding' && currentStop && <BoardingScreen currentStop={currentStop} currentStopIndex={currentStopIndex} stops={stops} students={students} studentStatus={studentStatus} busyStudentId={busyStudentId} board={board} isBusy={isBusy} continueFromBoarding={continueFromBoarding} />}
      {screen === 'deboarding' && currentStop && <DeboardingScreen currentStop={currentStop} students={students} studentStatus={studentStatus} busyStudentId={busyStudentId} deboard={deboard} isBusy={isBusy} finishRoute={finishRoute} />}
      {screen === 'complete' && <CompleteScreen completion={completion} resetTrip={resetTrip} setNotice={setNotice} setErrorText={setErrorText} setScreen={setScreen} />}
    </main>
  );
}
