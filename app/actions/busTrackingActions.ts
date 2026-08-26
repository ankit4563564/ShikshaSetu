'use server';

import { createClient } from '@/lib/supabase/server';
import { createScopedClient } from '@/lib/supabase/scoped';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { CANONICAL_SCHOOL_ID, CANONICAL_STUDENT_ID } from '@/lib/canonical';

export interface LiveBusLocationRecord {
  id?: string;
  school_id: string;
  bus_identifier: string;
  route_name: string;
  driver_name: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  speed_kmh: number;
  heading: number;
  is_live: boolean;
  last_updated: string;
  status: 'live' | 'updating' | 'stale' | 'ended';
}

declare global {
  var __SHIKSHASETU_LIVE_BUS__: Record<string, LiveBusLocationRecord> | undefined;
}

if (!globalThis.__SHIKSHASETU_LIVE_BUS__) {
  globalThis.__SHIKSHASETU_LIVE_BUS__ = {
    'BUS-21': {
      school_id: CANONICAL_SCHOOL_ID,
      bus_identifier: 'BUS-21',
      route_name: 'Greenwood → ShikshaSetu Academy',
      driver_name: 'Rajesh Kumar',
      latitude: 28.5355,
      longitude: 77.2090,
      accuracy_meters: 12,
      speed_kmh: 0,
      heading: 0,
      is_live: false,
      last_updated: new Date().toISOString(),
      status: 'ended',
    },
    'BUS-001': {
      school_id: CANONICAL_SCHOOL_ID,
      bus_identifier: 'BUS-001',
      route_name: 'Saket → School Gate #2',
      driver_name: 'Rajesh Kumar',
      latitude: 28.5244,
      longitude: 77.2167,
      accuracy_meters: 10,
      speed_kmh: 0,
      heading: 0,
      is_live: false,
      last_updated: new Date().toISOString(),
      status: 'ended',
    },
  };
}

function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('example.com'));
}

export async function updateLiveBusLocationAction(payload: {
  busIdentifier: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number | null;
  heading?: number | null;
  isLive?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const { busIdentifier, latitude, longitude, accuracy, speed = 0, heading = 0, isLive = true } = payload;

  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    return { success: false, error: 'Invalid coordinates' };
  }

  const record: LiveBusLocationRecord = {
    school_id: CANONICAL_SCHOOL_ID,
    bus_identifier: busIdentifier,
    route_name: busIdentifier === 'BUS-21' ? 'Greenwood → ShikshaSetu Academy' : 'Saket → School Gate #2',
    driver_name: 'Rajesh Kumar',
    latitude,
    longitude,
    accuracy_meters: Math.round(accuracy || 10),
    speed_kmh: speed !== null && speed !== undefined ? Math.round(speed * 3.6 * 10) / 10 : 0,
    heading: heading || 0,
    is_live: isLive,
    last_updated: new Date().toISOString(),
    status: isLive ? 'live' : 'ended',
  };

  // 1. Update in-memory global store for immediate zero-latency cross-portal sync
  if (!globalThis.__SHIKSHASETU_LIVE_BUS__) {
    globalThis.__SHIKSHASETU_LIVE_BUS__ = {};
  }
  globalThis.__SHIKSHASETU_LIVE_BUS__[busIdentifier] = record;

  // 2. Persist to database if live Supabase is active
  if (isLiveSupabaseConfigured()) {
    try {
      const context = await getAuthContext('driver');
      const scopedDb = createScopedClient(context);
      await scopedDb.from('bus_locations').insert({
        bus_identifier: busIdentifier,
        latitude,
        longitude,
        speed_kmh: record.speed_kmh,
        heading: record.heading,
        recorded_at: record.last_updated,
      });
    } catch {
      // Offline fallback maintained in globalThis
    }
  }

  return { success: true };
}

export async function endLiveBusTripAction(busIdentifier: string): Promise<{ success: boolean }> {
  if (globalThis.__SHIKSHASETU_LIVE_BUS__?.[busIdentifier]) {
    globalThis.__SHIKSHASETU_LIVE_BUS__[busIdentifier].is_live = false;
    globalThis.__SHIKSHASETU_LIVE_BUS__[busIdentifier].status = 'ended';
    globalThis.__SHIKSHASETU_LIVE_BUS__[busIdentifier].speed_kmh = 0;
    globalThis.__SHIKSHASETU_LIVE_BUS__[busIdentifier].last_updated = new Date().toISOString();
  }

  return { success: true };
}

export async function getLiveBusLocationAction(
  busIdentifier: string = 'BUS-21',
  studentId: string = CANONICAL_STUDENT_ID
): Promise<LiveBusLocationRecord | null> {
  let record: LiveBusLocationRecord | null = null;

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bus_locations')
        .select('*')
        .eq('bus_identifier', busIdentifier)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        const diffMs = Date.now() - new Date(data.recorded_at).getTime();
        let status: 'live' | 'updating' | 'stale' | 'ended' = 'live';
        if (diffMs > 2 * 60 * 1000) status = 'stale';
        else if (diffMs > 30 * 1000) status = 'updating';

        record = {
          school_id: CANONICAL_SCHOOL_ID,
          bus_identifier: data.bus_identifier,
          route_name: 'Greenwood → ShikshaSetu Academy',
          driver_name: 'Rajesh Kumar',
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy_meters: data.accuracy || 12,
          speed_kmh: data.speed_kmh || 0,
          heading: data.heading || 0,
          is_live: diffMs < 5 * 60 * 1000,
          last_updated: data.recorded_at,
          status,
        };
      }
    } catch {
      // Fallback
    }
  }

  if (!record && globalThis.__SHIKSHASETU_LIVE_BUS__?.[busIdentifier]) {
    const raw = globalThis.__SHIKSHASETU_LIVE_BUS__[busIdentifier];
    const diffMs = Date.now() - new Date(raw.last_updated).getTime();
    let status: 'live' | 'updating' | 'stale' | 'ended' = raw.status;

    if (raw.is_live) {
      if (diffMs > 2 * 60 * 1000) status = 'stale';
      else if (diffMs > 30 * 1000) status = 'updating';
      else status = 'live';
    }

    record = {
      ...raw,
      status,
    };
  }

  return record;
}
