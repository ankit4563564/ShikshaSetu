import { eventBus, type ScanEventPayload, type ScanRejectedPayload } from '../eventBus';

export function registerAiHandlers(): void {
  eventBus.on('scan:transport_board', async (event) => {
    if ('eventId' in event.payload) {
      await handleStudentBoarded(event.payload as ScanEventPayload);
    }
  });

  eventBus.on('scan:transport_deboard', async (event) => {
    if ('eventId' in event.payload) {
      await handleStudentDeboarded(event.payload as ScanEventPayload);
    }
  });

  eventBus.on('scan:gate_entry', async (event) => {
    if ('eventId' in event.payload) {
      await handleGateEntry(event.payload as ScanEventPayload);
    }
  });

  eventBus.on('scan:gate_exit', async (event) => {
    if ('eventId' in event.payload) {
      await handleGateExit(event.payload as ScanEventPayload);
    }
  });

  eventBus.on('scan:attendance', async (event) => {
    if ('eventId' in event.payload) {
      await handleAttendanceMarked(event.payload as ScanEventPayload);
    }
  });

  eventBus.on('scan.rejected', async (event) => {
    if ('eventId' in event.payload) {
      const rejected = event.payload as ScanRejectedPayload;
      if (rejected.result === 'expired_token') await handleLateArrival(rejected);
      if (rejected.result === 'already_boarded') await handleMissedBus(rejected);
    }
  });
}

async function handleStudentBoarded(_payload: ScanEventPayload): Promise<void> {
  // TODO: AI-1 — Detect anomalous boarding patterns (wrong route, wrong time)
  // TODO: AI-2 — Predict ETA based on historical boarding times
}

async function handleStudentDeboarded(_payload: ScanEventPayload): Promise<void> {
  // TODO: AI-3 — Detect early/late deboarding patterns
  // TODO: AI-4 — Correlate deboarding with attendance data
}

async function handleGateEntry(_payload: ScanEventPayload): Promise<void> {
  // TODO: AI-5 — Flag students entering outside normal hours
  // TODO: AI-6 — Gate throughput prediction for admin scheduling
}

async function handleGateExit(_payload: ScanEventPayload): Promise<void> {
  // TODO: AI-7 — Detect unauthorized exit patterns
}

async function handleAttendanceMarked(_payload: ScanEventPayload): Promise<void> {
  // TODO: AI-8 — Predict attendance trends per student/class
  // TODO: AI-9 — Flag attendance anomalies (sudden drops)
}

async function handleLateArrival(_payload: ScanRejectedPayload): Promise<void> {
  // TODO: AI-10 — Track chronic late arrivals per student
  // TODO: AI-11 — Alert teacher on 3rd late arrival in a week
}

async function handleMissedBus(_payload: ScanRejectedPayload): Promise<void> {
  // TODO: AI-12 — Detect repeated missed bus patterns → parent outreach
}
