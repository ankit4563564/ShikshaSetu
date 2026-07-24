import { createClient } from '@/lib/supabase/client';

export async function getActiveTrip(busIdentifier: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('driver_trips')
    .select('*')
    .eq('bus_identifier', busIdentifier)
    .eq('status', 'en_route')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
