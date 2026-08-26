import { describe, it, expect, beforeEach } from 'vitest';
import {
  updateLiveBusLocationAction,
  endLiveBusTripAction,
  getLiveBusLocationAction,
} from '@/app/actions/busTrackingActions';
import { CANONICAL_SCHOOL_ID, CANONICAL_STUDENT_ID } from '@/lib/canonical';

describe('Real-Time Live GPS Bus Tracking Tests', () => {
  const busId = 'BUS-21';

  beforeEach(async () => {
    await endLiveBusTripAction(busId);
  });

  it('1. Driver starts trip and publishes real browser GPS coordinates -> Persists to canonical bus record', async () => {
    const lat = 28.535512;
    const lng = 77.209025;
    const accuracy = 11.5;
    const speed = 6.2; // m/s -> ~22.3 km/h
    const heading = 180;

    const updateResult = await updateLiveBusLocationAction({
      busIdentifier: busId,
      latitude: lat,
      longitude: lng,
      accuracy,
      speed,
      heading,
      isLive: true,
    });

    expect(updateResult.success).toBe(true);

    const liveRecord = await getLiveBusLocationAction(busId, CANONICAL_STUDENT_ID);
    expect(liveRecord).toBeDefined();
    expect(liveRecord?.bus_identifier).toBe('BUS-21');
    expect(liveRecord?.latitude).toBe(lat);
    expect(liveRecord?.longitude).toBe(lng);
    expect(liveRecord?.accuracy_meters).toBe(12);
    expect(liveRecord?.is_live).toBe(true);
    expect(liveRecord?.status).toBe('live');
    expect(liveRecord?.driver_name).toBe('Rajesh Kumar');
    expect(liveRecord?.school_id).toBe(CANONICAL_SCHOOL_ID);
  });

  it('2. Invalid coordinates are rejected by the server action', async () => {
    const invalidResult = await updateLiveBusLocationAction({
      busIdentifier: busId,
      latitude: NaN,
      longitude: 77.2090,
      accuracy: 10,
    });

    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toContain('Invalid coordinates');
  });

  it('3. Driver stops trip -> Tracking ends and Parent sees trip ended', async () => {
    // Publish a live location first
    await updateLiveBusLocationAction({
      busIdentifier: busId,
      latitude: 28.5355,
      longitude: 77.2090,
      accuracy: 10,
      isLive: true,
    });

    // Driver ends trip
    const stopResult = await endLiveBusTripAction(busId);
    expect(stopResult.success).toBe(true);

    // Parent fetches bus status
    const statusRecord = await getLiveBusLocationAction(busId, CANONICAL_STUDENT_ID);
    expect(statusRecord?.is_live).toBe(false);
    expect(statusRecord?.status).toBe('ended');
  });

  it('4. Stale location detection flags outdated location broadcasts', async () => {
    await updateLiveBusLocationAction({
      busIdentifier: busId,
      latitude: 28.5355,
      longitude: 77.2090,
      accuracy: 10,
      isLive: true,
    });

    // Manually age the recorded timestamp in memory to 5 minutes ago
    if (globalThis.__SHIKSHASETU_LIVE_BUS__?.[busId]) {
      globalThis.__SHIKSHASETU_LIVE_BUS__[busId].last_updated = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    }

    const liveRecord = await getLiveBusLocationAction(busId, CANONICAL_STUDENT_ID);
    expect(liveRecord?.status).toBe('stale');
  });

  it('5. Tenant Scoping: Bus record strictly belongs to the active school tenant', async () => {
    const busRecord = await getLiveBusLocationAction(busId, CANONICAL_STUDENT_ID);
    expect(busRecord?.school_id).toBe(CANONICAL_SCHOOL_ID);
    expect(busRecord?.route_name).toContain('Greenwood');
  });
});
