'use server';

import { getAuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';
import { revalidatePath } from 'next/cache';

export interface SchoolUserRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'teacher' | 'parent' | 'gate' | 'driver';
  createdAt: string;
}

export async function inviteUserAction(formData: FormData) {
  try {
    const context = await getAuthContext();
    requirePermission(context, 'users:manage');

    const scopedDb = createScopedClient(context);

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase() || null;
    const phone = (formData.get('phone') as string)?.trim() || null;
    const role = (formData.get('role') as 'admin' | 'teacher' | 'parent' | 'gate' | 'driver') || 'teacher';

    if (!name) {
      return { error: 'Name is required' };
    }

    if (!email && !phone) {
      return { error: 'Either email or mobile number is required' };
    }

    // Insert user into tenant users table
    const { data: newUser, error: userError } = await scopedDb
      .from('users')
      .insert({
        school_id: context.schoolId,
        role,
        full_name: name,
        email,
        phone,
      })
      .select('id')
      .single();

    if (userError || !newUser) {
      return { error: userError?.message || 'Failed to create user record' };
    }

    // Associate domain role record
    if (role === 'teacher') {
      try {
        await scopedDb.from('teachers').insert({
          user_id: newUser.id,
          name,
          email,
          school_id: context.schoolId,
        });
      } catch {}
    } else if (role === 'parent') {
      try {
        await scopedDb.from('guardians').insert({
          user_id: newUser.id,
          name,
          phone,
          email,
          school_id: context.schoolId,
        });
      } catch {}
    }

    revalidatePath('/admin');
    return { success: true, userId: newUser.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to invite user' };
  }
}

export async function getSchoolUsersAction(): Promise<SchoolUserRecord[]> {
  try {
    const context = await getAuthContext();
    requirePermission(context, 'users:manage');

    const scopedDb = createScopedClient(context);

    const { data, error } = await scopedDb
      .from('users')
      .select('id, full_name, email, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((u: any) => ({
      id: u.id,
      name: u.full_name || 'User',
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.created_at,
    }));
  } catch {
    return [];
  }
}
