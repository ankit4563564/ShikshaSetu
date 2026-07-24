'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

export interface GuardianPreferences {
  shareMood: boolean;
  receiveBus: boolean;
  receiveAcademic: boolean;
}

export async function fetchGuardianPreferencesAction(guardianId: string): Promise<GuardianPreferences> {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from('guardian_preferences')
    .select('share_mood, receive_bus, receive_academic')
    .eq('guardian_id', guardianId)
    .maybeSingle();

  if (!data) {
    return { shareMood: true, receiveBus: true, receiveAcademic: true };
  }

  return {
    shareMood: data.share_mood,
    receiveBus: data.receive_bus,
    receiveAcademic: data.receive_academic,
  };
}

export async function upsertGuardianPreferencesAction(
  guardianId: string,
  prefs: GuardianPreferences,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  if (user.dbUserId !== guardianId) {
    return { success: false, error: 'Forbidden: you can only modify your own preferences' };
  }
  const supabase = await createClient();

  const { error } = await supabase.from('guardian_preferences').upsert(
    {
      guardian_id: guardianId,
      share_mood: prefs.shareMood,
      receive_bus: prefs.receiveBus,
      receive_academic: prefs.receiveAcademic,
    },
    { onConflict: 'guardian_id' },
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
