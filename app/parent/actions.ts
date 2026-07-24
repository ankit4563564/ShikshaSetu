'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBusLocationAction(data: {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
}) {
  const supabase = createClient();

  const { error } = await supabase.from('bus_locations').insert({
    bus_identifier: 'BUS-001',
    latitude: data.latitude,
    longitude: data.longitude,
    speed_kmh: data.speed !== null ? Math.round(data.speed * 3.6 * 10) / 10 : 22.5, // convert m/s to km/h, default to 22.5
    heading: data.heading || 0,
    recorded_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[Supabase GPS Stream] Failed to insert location:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
