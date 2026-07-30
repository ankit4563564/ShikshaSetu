import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

console.log('[Supabase Client] URL:', supabaseUrl);
console.log('[Supabase Client] Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');

export function createClient(accessToken?: string) {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    accessToken
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : undefined,
  );
}
