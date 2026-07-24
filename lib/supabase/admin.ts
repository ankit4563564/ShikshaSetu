import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client using the service_role key.
 * This client bypasses RLS and should ONLY be used for
 * server-side admin operations like user onboarding.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    return new Proxy({} as any, {
      get(target, prop) {
        return () => {
          throw new Error('Supabase admin client cannot be used on the client side.');
        };
      }
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
