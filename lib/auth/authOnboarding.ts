import { createAdminClient } from '@/lib/supabase/admin';

export interface LinkUserResult {
  success: boolean;
  linkedRole?: 'teacher' | 'parent' | 'admin';
  error?: string;
}

/**
 * linkClerkUser: Idempotent and resilient user linking flow.
 * 1. Checks if clerk_user_id is already linked in teachers, guardians, or admins.
 * 2. If not, queries by email in each table:
 *    - Updates the database row with the clerk_user_id.
 *    - Updates Clerk user's publicMetadata.role via Clerk API.
 *    - Handles updates resiliently with a database rollback if the Clerk metadata write fails.
 * 
 * NOTE: Uses admin (service_role) client to bypass RLS, since the user
 * hasn't been linked yet and RLS would block the email lookup.
 */
export async function linkClerkUser(userId: string, email: string): Promise<LinkUserResult> {
  const supabase = createAdminClient();

  // 1. Idempotent check: is the clerk_user_id already mapped?
  // Check teachers
  const { data: teacherById } = await supabase
    .from('teachers')
    .select('id')
    .eq('clerk_user_id', userId)
    .limit(1)
    .maybeSingle();

  if (teacherById) {
    return { success: true, linkedRole: 'teacher' };
  }

  // Check guardians
  const { data: guardianById } = await supabase
    .from('guardians')
    .select('id')
    .eq('clerk_user_id', userId)
    .limit(1)
    .maybeSingle();

  if (guardianById) {
    return { success: true, linkedRole: 'parent' };
  }

  // Check admins
  const { data: adminById } = await supabase
    .from('admins')
    .select('id')
    .eq('clerk_user_id', userId)
    .limit(1)
    .maybeSingle();

  if (adminById) {
    return { success: true, linkedRole: 'admin' };
  }

  // 2. Email-based mapping lookup (runs on first login only)
  // Check teachers
  const { data: teacherByEmail } = await supabase
    .from('teachers')
    .select('id')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (teacherByEmail) {
    // Update DB with clerk_user_id
    const { error: dbError } = await supabase
      .from('teachers')
      .update({ clerk_user_id: userId })
      .eq('id', teacherByEmail.id);

    if (dbError) {
      return { success: false, error: `Database link update failed: ${dbError.message}` };
    }

    // Update Clerk metadata
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { role: 'teacher' }
      });
      return { success: true, linkedRole: 'teacher' };
    } catch (clerkError: any) {
      // Rollback database link if Clerk metadata assignment failed
      await supabase
        .from('teachers')
        .update({ clerk_user_id: null })
        .eq('id', teacherByEmail.id);

      return { 
        success: false, 
        error: `Clerk metadata update failed. Rollback succeeded: ${clerkError.message}` 
      };
    }
  }

  // Check guardians
  const { data: guardianByEmail } = await supabase
    .from('guardians')
    .select('id')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (guardianByEmail) {
    const { error: dbError } = await supabase
      .from('guardians')
      .update({ clerk_user_id: userId })
      .eq('id', guardianByEmail.id);

    if (dbError) {
      return { success: false, error: `Database link update failed: ${dbError.message}` };
    }

    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { role: 'parent' }
      });
      return { success: true, linkedRole: 'parent' };
    } catch (clerkError: any) {
      await supabase
        .from('guardians')
        .update({ clerk_user_id: null })
        .eq('id', guardianByEmail.id);

      return { 
        success: false, 
        error: `Clerk metadata update failed. Rollback succeeded: ${clerkError.message}` 
      };
    }
  }

  // Check admins
  const { data: adminByEmail } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (adminByEmail) {
    const { error: dbError } = await supabase
      .from('admins')
      .update({ clerk_user_id: userId })
      .eq('id', adminByEmail.id);

    if (dbError) {
      return { success: false, error: `Database link update failed: ${dbError.message}` };
    }

    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { role: 'admin' }
      });
      return { success: true, linkedRole: 'admin' };
    } catch (clerkError: any) {
      await supabase
        .from('admins')
        .update({ clerk_user_id: null })
        .eq('id', adminByEmail.id);

      return { 
        success: false, 
        error: `Clerk metadata update failed. Rollback succeeded: ${clerkError.message}` 
      };
    }
  }

  return { success: false, error: 'No matching school database account found.' };
}
