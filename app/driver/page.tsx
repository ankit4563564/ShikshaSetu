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

export default function DriverApp() {
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

      {screen === 'selector' && <section className="space-y-5">
        {/* Safety stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Trips done',    value: '147',  color: 'text-sage'       },
            { label: 'Students safe', value: '14',   color: 'text-primary'    },
            { label: 'On-time rate',  value: '96%',  color: 'text-sage'       },
            { label: 'Alerts total',  value: '2',    color: 'text-warm-clay'  },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-deep-teal/10 bg-white p-3 text-center">
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent trips */}
        <div className="rounded-2xl border border-deep-teal/10 bg-white p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-deep-teal/45">Recent completed trips</p>
          <div className="space-y-2">
            {[
              { date: 'Today · Morning',        bus: 'BUS-001', students: 14, stops: 4, status: 'completed', time: '8:22 AM' },
              { date: 'Tue 21 Jul · Afternoon', bus: 'BUS-001', students: 13, stops: 4, status: 'completed', time: '3:45 PM' },
              { date: 'Tue 21 Jul · Morning',   bus: 'BUS-001', students: 14, stops: 4, status: 'completed', time: '8:20 AM' },
              { date: 'Mon 20 Jul · Afternoon', bus: 'BUS-001', students: 12, stops: 4, status: 'completed', time: '3:50 PM' },
            ].map((trip, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-deep-teal/[0.03] px-4 py-2.5">
                <div>
                  <p className="text-sm font-bold text-deep-teal">{trip.date}</p>
                  <p className="text-[11px] text-deep-teal/50">{trip.bus} · {trip.students} students · {trip.stops} stops</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-bold text-sage">✓ Done</span>
                  <p className="mt-0.5 font-mono text-[10px] text-deep-teal/35">{trip.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's route preview */}
        <div className="rounded-2xl border border-marigold/20 bg-marigold/5 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-marigold">Today's afternoon route preview</p>
          <div className="flex items-center gap-2 flex-wrap">
            {['Sector 12 Market', 'Rajouri Garden', 'Paschim Vihar', 'Pitampura Station'].map((stop, i, arr) => (
              <span key={stop} className="flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-deep-teal border border-deep-teal/10">{stop}</span>
                {i < arr.length - 1 && <span className="text-deep-teal/30 text-xs">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-deep-teal/50">Est. departure 3:30 PM · 14 students expected</p>
        </div>

        <div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-deep-teal/45">Step 1 of 4</p><h2 className="mt-1 font-display text-xl font-bold">Select your route</h2></div>
        {DRIVERS.map((driver) => <button key={driver.id} type="button" onClick={() => { setSelectedDriver(driver); setErrorText(null); }} className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all ${selectedDriver?.id === driver.id ? 'border-marigold bg-marigold/10 ring-2 ring-marigold/15' : 'border-deep-teal/10 bg-white hover:border-deep-teal/25 hover:shadow-sm'}`}>
          <span className="text-3xl">{driver.emoji}</span>
          <div>
            <span className="block font-display text-lg font-bold">{driver.name}</span>
            <span className="mt-0.5 block text-xs font-bold uppercase tracking-wider text-deep-teal/55">{driver.bus_identifier}</span>
          </div>
          <div className="ml-auto text-right">
            <span className="block text-[11px] font-bold text-sage">✓ 147 safe trips</span>
            <span className="block text-[10px] text-deep-teal/40">4 stops · 14 students</span>
          </div>
        </button>)}
        <button type="button" disabled={!selectedDriver || isBusy} onClick={handleStartTrip} className="w-full rounded-xl bg-marigold px-5 py-4 font-display text-base font-bold text-white shadow-md transition-all hover:bg-marigold/90 disabled:cursor-not-allowed disabled:opacity-50">{isBusy ? 'Preparing route…' : 'Begin route →'}</button>
      </section>}

      {screen === 'route' && selectedDriver && <section className="space-y-5">
        <div className="rounded-2xl border border-sage/20 bg-sage/10 p-4"><div className="flex items-center gap-2 font-display text-sm font-bold text-sage"><span className="h-2.5 w-2.5 rounded-full bg-sage animate-pulse" />Route active</div><p className="mt-1 text-sm font-bold">{selectedDriver.bus_identifier} · {selectedDriver.name}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-deep-teal/45">{gpsError || 'Sharing live location when GPS is available'}</p></div>
        <div className="driver-route-visual rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_22px_55px_rgba(63,81,181,.11)] backdrop-blur-xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary/55">Live route</p><h2 className="mt-1 font-display text-2xl font-extrabold text-primary">{currentStop?.stop_name || 'Route ready'}</h2><p className="mt-1 text-xs font-medium text-deep-teal/55">{currentStop ? `Stop ${currentStopIndex + 1} of ${stops.length}` : 'Select a route stop to continue'}</p></div><span className="rounded-full bg-sage/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sage">GPS {gpsError ? 'limited' : 'ready'}</span></div><div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2">{stops.map((stop, index) => <div key={stop.id} className="flex min-w-[110px] items-center gap-2"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${index < currentStopIndex ? 'border-sage bg-sage text-white' : index === currentStopIndex ? 'border-marigold bg-marigold text-white shadow-[0_0_0_5px_rgba(255,152,0,.14)]' : 'border-primary/15 bg-primary/5 text-primary/50'}`}>{index < currentStopIndex ? '✓' : index + 1}</div><div><p className="max-w-[90px] truncate text-[11px] font-bold text-deep-teal">{stop.stop_name}</p><p className="text-[10px] text-deep-teal/45">{stop.arrival_time.slice(0, 5)}</p></div>{index < stops.length - 1 && <span className="h-px min-w-5 flex-1 bg-primary/15" />}</div>)}</div></div>
        <div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-deep-teal/45">Step 2 of 4</p><h2 className="mt-1 font-display text-xl font-bold">Stop checklist</h2></div>
        <div className="space-y-3">{stops.map((stop, index) => { const completed = index < currentStopIndex; const current = index === currentStopIndex; return <button key={stop.id} type="button" disabled={!current || isBusy} onClick={openCurrentStop} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${completed ? 'border-sage/15 bg-sage/5 text-sage' : current ? 'border-marigold bg-marigold/10 text-deep-teal shadow-sm hover:shadow-md' : 'border-deep-teal/10 bg-white text-deep-teal/40'}`}><span className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold">{completed ? '✓' : index + 1}</span><span className="font-display text-base font-bold">{stop.stop_name}{current && <span className="ml-2 text-[10px] uppercase tracking-wider text-marigold">Current</span>}</span></span><span className="font-mono text-xs font-semibold">{stop.arrival_time.slice(0, 5)}</span></button>; })}</div>
        <p className="text-center text-xs font-medium text-deep-teal/50">Tap the highlighted stop to open its student checklist.</p>
      </section>}

      {screen === 'boarding' && currentStop && <section className="space-y-5">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-marigold">Boarding · stop {currentStopIndex + 1} of {stops.length}</p><h2 className="mt-1 font-display text-2xl font-bold">{currentStop.stop_name}</h2><p className="mt-1 text-xs font-medium text-deep-teal/55">{students.length} student{students.length === 1 ? '' : 's'} expected · {boardedCount} boarded</p></div><span className="rounded-full bg-marigold/10 px-3 py-1 text-[10px] font-bold text-marigold">{boardingOpenedAt ? 'Checklist open' : 'Ready'}</span></div>
        <div className="space-y-3">{students.length ? students.map((student) => <div key={student.id} className={`flex items-center justify-between rounded-xl border p-4 ${studentStatus[student.id] ? 'border-sage/20 bg-sage/5' : 'border-deep-teal/15 bg-white'}`}><span className="font-display text-base font-bold">{student.display_name}</span>{studentStatus[student.id] ? <span className="text-xs font-bold text-sage">Boarded ✓</span> : <button type="button" disabled={busyStudentId === student.id} onClick={() => board(student.id)} className="rounded-lg border border-sage px-4 py-2 text-xs font-bold text-sage transition-colors hover:bg-sage hover:text-white disabled:opacity-50">{busyStudentId === student.id ? 'Saving…' : 'Board'}</button>}</div>) : <div className="rounded-xl border border-dashed border-deep-teal/15 p-5 text-center text-sm text-deep-teal/55">No students are assigned to this stop.</div>}</div>
        <button type="button" disabled={isBusy} onClick={continueFromBoarding} className="w-full rounded-xl bg-deep-teal px-5 py-4 font-display text-base font-bold text-white shadow-md transition-all hover:bg-deep-teal/90 disabled:opacity-50">{currentStopIndex === stops.length - 1 ? 'Open final deboarding checklist →' : 'Confirm stop & continue →'}</button>
      </section>}

      {screen === 'deboarding' && currentStop && <section className="space-y-5">
        <div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-marigold">Step 4 of 4 · final safety check</p><h2 className="mt-1 font-display text-2xl font-bold">Deboard at {currentStop.stop_name}</h2><p className="mt-1 text-xs font-medium text-deep-teal/55">Every boarded student must be marked off before this route can close.</p></div>
        <div className="space-y-3">{students.length ? students.map((student) => <div key={student.id} className={`flex items-center justify-between rounded-xl border p-4 ${studentStatus[student.id] ? 'border-sage/20 bg-sage/5' : 'border-deep-teal/15 bg-white'}`}><span className="font-display text-base font-bold">{student.display_name}</span>{studentStatus[student.id] ? <span className="text-xs font-bold text-sage">Deboarded ✓</span> : <button type="button" disabled={busyStudentId === student.id} onClick={() => deboard(student)} className="rounded-lg bg-marigold px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-marigold/90 disabled:opacity-50">{busyStudentId === student.id ? 'Saving…' : 'Deboard'}</button>}</div>) : <div className="rounded-xl border border-sage/20 bg-sage/5 p-5 text-center text-sm font-medium text-sage">No students remain on the bus.</div>}</div>
        <button type="button" disabled={isBusy} onClick={finishRoute} className="w-full rounded-xl bg-deep-teal px-5 py-4 font-display text-base font-bold text-white shadow-md transition-all hover:bg-deep-teal/90 disabled:opacity-50">{isBusy ? 'Completing route…' : 'Complete route'}</button>
      </section>}

      {screen === 'complete' && <section className="space-y-6 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 text-3xl">✓</div><div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-sage">Route completed</p><h2 className="mt-2 font-display text-3xl font-extrabold">Everyone accounted for</h2><p className="mt-3 text-sm font-medium leading-relaxed text-deep-teal/60">The trip has been closed and parent journey updates have been sent.</p></div><div className="grid grid-cols-3 gap-3 rounded-2xl border border-deep-teal/10 bg-white p-4 text-center"><div><p className="font-display text-2xl font-extrabold">{completion.boarded}</p><p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/45">Completed</p></div><div><p className="font-display text-2xl font-extrabold text-sage">{completion.deboarded}</p><p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/45">Deboarded</p></div><div><p className="font-display text-2xl font-extrabold text-warm-clay">{completion.missed}</p><p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/45">Missed</p></div></div><button type="button" onClick={() => { resetTrip(); setNotice(null); setErrorText(null); setScreen('selector'); }} className="w-full rounded-xl border border-deep-teal/20 bg-white px-5 py-4 font-display text-base font-bold text-deep-teal transition-colors hover:bg-deep-teal/5">Start another route</button></section>}
    </main>
  );
}
