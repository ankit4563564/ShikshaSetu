'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { RedemptionToken, Vendor } from '@/lib/rewards/types';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

const db = createAdminClient();

export async function getVendorByEmailAction(email: string): Promise<Vendor | null> {
  await requireAuth();
  const { data, error } = await db.from('vendors').select('*').eq('email', email).maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id, name: data.name, email: data.email,
    clerkUserId: data.clerk_user_id, vendorType: data.vendor_type, isActive: data.is_active,
  };
}

export async function getVendorByIdAction(id: string): Promise<Vendor | null> {
  await requireAuth();
  const { data, error } = await db.from('vendors').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id, name: data.name, email: data.email,
    clerkUserId: data.clerk_user_id, vendorType: data.vendor_type, isActive: data.is_active,
  };
}

export async function scanRedemptionTokenAction(
  token: string, vendorId: string
): Promise<{
  success: boolean; error?: string;
  studentName?: string; rewardName?: string; studentId?: string;
  tokenId?: string; redemptionId?: string;
}> {
  await requireRole(['vendor']);
  const { data, error } = await db.rpc('vendor_scan_token', {
    p_token: token,
    p_vendor_id: vendorId,
  });

  if (error) return { success: false, error: error.message };
  const r = data as any;
  if (!r?.success) return { success: false, error: r?.error || 'Scan failed' };

  return {
    success: true,
    studentName: r.student_name,
    rewardName: r.reward_name,
    tokenId: r.token_id,
  };
}

export async function getPendingRedemptionsAction(vendorType: string): Promise<any[]> {
  await requireAuth();
  const { data, error } = await db
    .from('redemption_tokens')
    .select('id, token, status, expires_at, created_at, redemption_id, redemptions(student_id, reward_id, rewards_config(name, category))')
    .eq('status', 'ready')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.filter((t: any) => {
    if (vendorType === 'general') return true;
    const cat = t.redemptions?.rewards_config?.category;
    if (vendorType === 'canteen') return cat === 'canteen';
    if (vendorType === 'library') return cat === 'library';
    if (vendorType === 'sports') return cat === 'sports';
    if (vendorType === 'facility') return cat === 'sports' || cat === 'other';
    return false;
  }).map((t: any) => ({
    id: t.id, token: t.token, status: t.status,
    expiresAt: t.expires_at, createdAt: t.created_at,
    studentId: t.redemptions?.student_id,
    rewardName: t.redemptions?.rewards_config?.name,
    category: t.redemptions?.rewards_config?.category,
  }));
}

export async function getVendorHistoryAction(vendorId: string): Promise<any[]> {
  await requireAuth();
  const { data, error } = await db
    .from('vendor_scan_logs')
    .select('id, action, result, details, scanned_at')
    .eq('vendor_id', vendorId)
    .order('scanned_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data;
}

export async function getVendorTodayStatsAction(vendorId: string, vendorType: string): Promise<{
  todayRedemptions: number; pendingCount: number;
}> {
  await requireAuth();
  const today = new Date().toISOString().slice(0, 10);

  const { count: todayRedemptions } = await db
    .from('vendor_scan_logs')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)
    .eq('result', 'success')
    .gte('scanned_at', today);

  const pending = await getPendingRedemptionsAction(vendorType);

  return {
    todayRedemptions: todayRedemptions || 0,
    pendingCount: pending.length,
  };
}
