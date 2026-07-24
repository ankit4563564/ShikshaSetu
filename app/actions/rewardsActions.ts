'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole, unauthorized } from '@/lib/auth/getUser';
import type {
  RewardConfig, StudentBalance, CoinTransaction, Redemption, RedemptionToken,
  Facility, FacilitySlot, FacilityBooking, Coupon, Campaign,
  MysteryBox, MysteryBoxItem, Achievement, StudentAchievement,
  HouseScore, EarnCoinsInput, AIRecommendation,
} from '@/lib/rewards/types';

const adminDb = createAdminClient();

function mapReward(row: any): RewardConfig {
  return {
    id: row.id, name: row.name, description: row.description,
    category: row.category, cost: row.cost, stock: row.stock,
    imageUrl: row.image_url, isActive: row.is_active,
    dailyLimit: row.daily_limit, weeklyLimit: row.weekly_limit,
    monthlyLimit: row.monthly_limit,
    availabilityWindowStart: row.availability_window_start,
    availabilityWindowEnd: row.availability_window_end,
    inventoryStatus: row.inventory_status || 'in_stock',
    rewardType: row.reward_type || 'item',
    facilityId: row.facility_id || null,
  };
}

function mapTransaction(row: any): CoinTransaction {
  return {
    id: row.id, studentId: row.student_id, txType: row.tx_type,
    amount: row.amount, direction: row.direction, description: row.description,
    referenceId: row.reference_id, createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

// ── Student queries (preserved from original) ──────────────────────────────

export async function getStudentBalanceAction(studentId: string): Promise<StudentBalance | null> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('student_balance').select('*').eq('student_id', studentId).maybeSingle();
  if (error || !data) return null;
  return { studentId: data.student_id, balance: data.balance, lifetimeEarned: data.lifetime_earned, lifetimeSpent: data.lifetime_spent };
}

export async function getStudentTransactionsAction(studentId: string, limit = 50): Promise<CoinTransaction[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('coin_transactions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(limit);
  if (error || !data) return [];
  return data.map(mapTransaction);
}

export async function getStudentRedemptionsAction(studentId: string): Promise<Redemption[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('redemptions').select('id, student_id, reward_id, coin_tx_id, status, redeemed_at').eq('student_id', studentId).order('redeemed_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r: any) => ({ id: r.id, studentId: r.student_id, rewardId: r.reward_id, coinTxId: r.coin_tx_id, status: r.status, redeemedAt: r.redeemed_at }));
}

// ── Atomic Redemption (single RPC, no partial failure) ─────────────────────

export async function redeemRewardAction(
  studentId: string, rewardId: string
): Promise<{ success: boolean; error?: string; newBalance?: number; redemptionId?: string; token?: string }> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const { data: access } = await adminDb.from('guardian_access')
      .select('id').eq('guardian_id', user.dbUserId).eq('student_id', studentId)
      .maybeSingle();
    if (!access) return { success: false, error: 'Access denied' };
  }
  const token = crypto.randomUUID();
  const qrData = JSON.stringify({ v: 1, t: token, s: studentId, r: rewardId });

  const result = await adminDb.rpc('redeem_reward_with_token', {
    p_student_id: studentId, p_reward_id: rewardId,
    p_token: token, p_qr_data: qrData,
  });
  if (result.error) return { success: false, error: result.error.message };
  const r = result.data as any;
  if (!r?.success) return { success: false, error: r?.error || 'Redemption failed' };

  const { data: student } = await adminDb.from('students').select('display_name').eq('id', studentId).single() as any;
  const { data: reward } = await adminDb.from('rewards_config').select('name, cost').eq('id', rewardId).single() as any;

  const rewardName = (reward as any)?.name || 'Unknown';
  const studentName = (student as any)?.display_name || 'A student';
  const cost = (reward as any)?.cost || 0;

  // Notify guardians
  const { data: guardians } = await adminDb.from('guardian_access').select('guardian_id').eq('student_id', studentId) as any;
  if (guardians) {
    const title = cost >= 100 ? 'High-Value Reward Redeemed' : 'Reward Redeemed';
    const body = cost >= 100
      ? `${studentName} redeemed a high-value reward "${rewardName}" for ${cost} Campus Coins.`
      : `${studentName} redeemed "${rewardName}" for ${cost} Campus Coins.`;
    for (const g of guardians) {
      try {
        await adminDb.from('notifications').insert({
          recipient_id: g.guardian_id, recipient_role: 'parent',
          student_id: studentId, title, body, category: 'academic',
        }).maybeSingle();
      } catch { /* silent */ }
    }
  }

  return {
    success: true,
    newBalance: r.new_balance,
    redemptionId: r.redemption_id,
    token: r.token,
  };
}

// ── Earning (preserved) ────────────────────────────────────────────────────

export async function earnCoinsAction(input: EarnCoinsInput): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const { data: access } = await adminDb.from('guardian_access')
      .select('id').eq('guardian_id', user.dbUserId).eq('student_id', input.studentId)
      .maybeSingle();
    if (!access) return { success: false, error: 'Access denied' };
  }
  let finalAmount = input.amount;

  const { data: campaigns } = await adminDb.from('campaigns').select('bonus_multiplier, name')
    .eq('is_active', true).lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString()) as any;

  for (const c of (campaigns || [])) {
    const bonus = Math.round(input.amount * ((c.bonus_multiplier || 1) - 1));
    if (bonus > 0) {
      finalAmount += bonus;
    }
  }

  const { data, error } = await adminDb.rpc('earn_coins', {
    p_student_id: input.studentId, p_amount: finalAmount,
    p_tx_type: input.txType, p_description: finalAmount !== input.amount
      ? `${input.description} (incl. campaign bonus)` : input.description,
    p_created_by: input.teacherId || null,
  });
  if (error) return { success: false, error: error.message };
  const r = data as any;
  return { success: true, newBalance: r.new_balance };
}

// ── Rewards catalogue (preserved + extended fields) ────────────────────────

export async function getRewardsAction(): Promise<RewardConfig[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('rewards_config').select('*').order('category').order('name');
  if (error || !data) return [];
  return data.map(mapReward);
}

export async function getActiveRewardsAction(): Promise<RewardConfig[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('rewards_config').select('*').eq('is_active', true).order('cost');
  if (error || !data) return [];
  return data.map(mapReward);
}

export async function createRewardAction(reward: {
  name: string; description?: string; category: string; cost: number; stock?: number | null;
  rewardType?: string; facilityId?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const user = await requireRole(['admin']);
  const { error } = await adminDb.from('rewards_config').insert({
    name: reward.name, description: reward.description || null,
    category: reward.category, cost: reward.cost, stock: reward.stock ?? null,
    reward_type: reward.rewardType || 'item', facility_id: reward.facilityId || null,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateRewardAction(
  rewardId: string,
  updates: Partial<{
    name: string; description: string; cost: number; stock: number | null;
    isActive: boolean; dailyLimit: number | null; weeklyLimit: number | null;
    monthlyLimit: number | null; inventoryStatus: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  const user = await requireRole(['admin']);
  const { error } = await adminDb.from('rewards_config').update(updates).eq('id', rewardId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function restockRewardAction(
  rewardId: string, quantity: number, notes?: string, teacherId?: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireRole(['admin']);
  const { data: r } = await adminDb.from('rewards_config').select('stock').eq('id', rewardId).single();
  const currentStock = (r as any)?.stock ?? 0;
  const newStock = currentStock + quantity;
  const { error: uErr } = await adminDb.from('rewards_config').update({
    stock: newStock, inventory_status: 'in_stock',
  }).eq('id', rewardId);
  if (uErr) return { success: false, error: uErr.message };
  await adminDb.from('inventory_logs').insert({
    reward_id: rewardId, change_type: 'restock', quantity,
    notes: notes || null, created_by: teacherId || null,
  });
  return { success: true };
}

// ── QR Tokens ──────────────────────────────────────────────────────────────

export async function getStudentTokensAction(studentId: string): Promise<RedemptionToken[]> {
  const user = await requireAuth();
  const { data: redemptions } = await adminDb
    .from('redemptions').select('id').eq('student_id', studentId);
  const redemptionIds = (redemptions || []).map((r: any) => r.id);
  if (redemptionIds.length === 0) return [];

  const { data, error } = await adminDb
    .from('redemption_tokens')
    .select('id, redemption_id, token, qr_data, expires_at, status, scanned_at, scanned_by')
    .in('redemption_id', redemptionIds)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((t: any) => ({
    id: t.id, redemptionId: t.redemption_id, token: t.token,
    qrData: t.qr_data, expiresAt: t.expires_at, status: t.status,
    scannedAt: t.scanned_at, scannedBy: t.scanned_by,
  }));
}

// ── Facilities & Booking ───────────────────────────────────────────────────

export async function getFacilitiesAction(): Promise<Facility[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('facilities').select('*').eq('is_active', true).order('name');
  if (error || !data) return [];
  return data.map((f: any) => ({
    id: f.id, name: f.name, description: f.description,
    category: f.category, location: f.location, capacity: f.capacity, isActive: f.is_active,
  }));
}

export async function getFacilitySlotsAction(facilityId: string, date: string): Promise<FacilitySlot[]> {
  const user = await requireAuth();
  const dayOfWeek = new Date(date).getDay() - 1;
  if (dayOfWeek < 0 || dayOfWeek > 4) return [];
  const { data, error } = await adminDb.from('facility_slots').select('*')
    .eq('facility_id', facilityId).eq('day_of_week', dayOfWeek).order('start_time');
  if (error || !data) return [];
  return data.map((s: any) => ({
    id: s.id, facilityId: s.facility_id, dayOfWeek: s.day_of_week,
    startTime: s.start_time, endTime: s.end_time, maxBookings: s.max_bookings,
  }));
}

export async function bookFacilityAction(
  studentId: string, facilityId: string, slotId: string, date: string, redemptionId?: string
): Promise<{ success: boolean; error?: string; bookingId?: string; qrToken?: string }> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const { data: access } = await adminDb.from('guardian_access')
      .select('id').eq('guardian_id', user.dbUserId).eq('student_id', studentId)
      .maybeSingle();
    if (!access) return { success: false, error: 'Access denied' };
  }
  const qrToken = crypto.randomUUID();
  const { data, error } = await adminDb.from('facility_bookings').insert({
    student_id: studentId, facility_id: facilityId, slot_id: slotId,
    booking_date: date, redemption_id: redemptionId || null, qr_token: qrToken, status: 'confirmed',
  }).select('id').single();
  if (error) return { success: false, error: error.message };

  const { data: student } = await adminDb.from('students').select('display_name').eq('id', studentId).single() as any;
  const { data: facility } = await adminDb.from('facilities').select('name').eq('id', facilityId).single() as any;
  const studentName = (student as any)?.display_name || 'A student';
  const facilityName = (facility as any)?.name || 'a facility';

  const { data: guardians } = await adminDb.from('guardian_access').select('guardian_id').eq('student_id', studentId) as any;
  if (guardians) {
    const notifBody = `${studentName} booked "${facilityName}" on ${date}. Booking is confirmed.`;
    for (const g of guardians) {
      try {
        await adminDb.from('notifications').insert({
          recipient_id: g.guardian_id, recipient_role: 'parent',
          student_id: studentId, title: 'Facility Booking Approved',
          body: notifBody, category: 'academic',
        });
      } catch { /* silent */ }
    }
  }

  return { success: true, bookingId: (data as any)?.id, qrToken };
}

export async function cancelFacilityBookingAction(
  bookingId: string, studentId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const { data: access } = await adminDb.from('guardian_access')
      .select('id').eq('guardian_id', user.dbUserId).eq('student_id', studentId)
      .maybeSingle();
    if (!access) return { success: false, error: 'Access denied' };
  }
  const { data: booking, error: fetchErr } = await adminDb.from('facility_bookings')
    .select('id, student_id, facility_id, booking_date, facilities(name)')
    .eq('id', bookingId).single() as any;
  if (fetchErr) return { success: false, error: 'Booking not found' };

  const { error: updateErr } = await adminDb.from('facility_bookings')
    .update({ status: 'cancelled' }).eq('id', bookingId);
  if (updateErr) return { success: false, error: updateErr.message };

  const { data: student } = await adminDb.from('students').select('display_name').eq('id', studentId).single() as any;
  const studentName = (student as any)?.display_name || 'A student';
  const facilityName = booking?.facilities?.name || 'a facility';

  const { data: guardians } = await adminDb.from('guardian_access').select('guardian_id').eq('student_id', studentId) as any;
  if (guardians) {
    for (const g of guardians) {
      try {
        await adminDb.from('notifications').insert({
          recipient_id: g.guardian_id, recipient_role: 'parent',
          student_id: studentId, title: 'Facility Booking Cancelled',
          body: `${studentName} cancelled booking for "${facilityName}" on ${booking?.booking_date || 'unknown date'}.`,
          category: 'academic',
        });
      } catch { /* silent */ }
    }
  }
  return { success: true };
}

export async function getStudentBookingsAction(studentId: string): Promise<FacilityBooking[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('facility_bookings')
    .select('id, student_id, facility_id, slot_id, redemption_id, booking_date, status, qr_token, checked_in_at, facilities(name)')
    .eq('student_id', studentId).order('booking_date', { ascending: false }).limit(20);
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id, studentId: b.student_id, facilityId: b.facility_id,
    facilityName: b.facilities?.name || 'Unknown',
    slotId: b.slot_id, redemptionId: b.redemption_id,
    bookingDate: b.booking_date, status: b.status,
    qrToken: b.qr_token, checkedInAt: b.checked_in_at,
  }));
}

// ── Coupons ────────────────────────────────────────────────────────────────

export async function getStudentCouponsAction(studentId: string): Promise<Coupon[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('coupons').select('*')
    .eq('student_id', studentId).order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((c: any) => ({
    id: c.id, studentId: c.student_id, redemptionId: c.redemption_id,
    code: c.code, description: c.description, category: c.category,
    expiryDate: c.expiry_date, usageLimit: c.usage_limit,
    usageCount: c.usage_count, status: c.status,
  }));
}

// ── Campaigns ──────────────────────────────────────────────────────────────

export async function getActiveCampaignsAction(): Promise<Campaign[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('campaigns').select('*')
    .eq('is_active', true).lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString()).order('name');
  if (error || !data) return [];
  return data.map((c: any) => ({
    id: c.id, name: c.name, description: c.description,
    bonusMultiplier: c.bonus_multiplier, startDate: c.start_date,
    endDate: c.end_date, isActive: c.is_active,
  }));
}

export async function getAllCampaignsAction(): Promise<Campaign[]> {
  const user = await requireRole(['admin']);
  const { data, error } = await adminDb.from('campaigns').select('*').order('start_date', { ascending: false });
  if (error || !data) return [];
  return data.map((c: any) => ({
    id: c.id, name: c.name, description: c.description,
    bonusMultiplier: c.bonus_multiplier, startDate: c.start_date,
    endDate: c.end_date, isActive: c.is_active,
  }));
}

export async function createCampaignAction(c: {
  name: string; description?: string; bonusMultiplier: number;
  startDate: string; endDate: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await requireRole(['admin']);
  const { error } = await adminDb.from('campaigns').insert({
    name: c.name, description: c.description || null,
    bonus_multiplier: c.bonusMultiplier, start_date: c.startDate, end_date: c.endDate,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleCampaignAction(campaignId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const user = await requireRole(['admin']);
  const { error } = await adminDb.from('campaigns').update({ is_active: isActive }).eq('id', campaignId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Mystery Boxes ──────────────────────────────────────────────────────────

export async function getMysteryBoxesAction(): Promise<MysteryBox[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('mystery_boxes').select('*').eq('is_active', true).order('cost');
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id, name: b.name, description: b.description,
    cost: b.cost, imageUrl: b.image_url, isActive: b.is_active,
  }));
}

export async function getMysteryBoxItemsAction(boxId: string): Promise<MysteryBoxItem[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('mystery_box_items').select('*')
    .eq('box_id', boxId).eq('is_active', true).order('probability', { ascending: false });
  if (error || !data) return [];
  return data.map((i: any) => ({
    id: i.id, boxId: i.box_id, itemType: i.item_type, itemName: i.item_name,
    itemDescription: i.item_description, itemValue: i.item_value,
    probability: i.probability, quantity: i.quantity, isActive: i.is_active,
  }));
}

export async function openMysteryBoxAction(
  studentId: string, boxId: string
): Promise<{ success: boolean; error?: string; itemWon?: string; itemType?: string; itemDescription?: string; itemValue?: number; newBalance?: number }> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const { data: access } = await adminDb.from('guardian_access')
      .select('id').eq('guardian_id', user.dbUserId).eq('student_id', studentId)
      .maybeSingle();
    if (!access) return { success: false, error: 'Access denied' };
  }
  const { data, error } = await adminDb.rpc('open_mystery_box', { p_student_id: studentId, p_box_id: boxId });
  if (error) return { success: false, error: error.message };
  const r = data as any;
  if (!r?.success) return { success: false, error: r?.error || 'Failed' };
  return {
    success: true, itemWon: r.item_won, itemType: r.item_type,
    itemDescription: r.item_description, itemValue: r.item_value, newBalance: r.new_balance,
  };
}

// ── Achievements ───────────────────────────────────────────────────────────

export async function getAchievementsAction(): Promise<Achievement[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('achievements').select('*').eq('is_active', true).order('name');
  if (error || !data) return [];
  return data.map((a: any) => ({
    id: a.id, name: a.name, description: a.description, icon: a.icon,
    category: a.category, coinsReward: a.coins_reward, isActive: a.is_active,
  }));
}

export async function getStudentAchievementsAction(studentId: string): Promise<StudentAchievement[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('student_achievements')
    .select('id, student_id, achievement_id, coin_tx_id, earned_at, achievements(name, icon, category)')
    .eq('student_id', studentId).order('earned_at', { ascending: false });
  if (error || !data) return [];
  return data.map((sa: any) => ({
    id: sa.id, studentId: sa.student_id, achievementId: sa.achievement_id,
    achievementName: sa.achievements?.name,
    achievementIcon: sa.achievements?.icon,
    achievementCategory: sa.achievements?.category,
    coinTxId: sa.coin_tx_id, earnedAt: sa.earned_at,
  }));
}

export async function awardAchievementAction(
  studentId: string, achievementId: string
): Promise<{ success: boolean; error?: string; achievementName?: string; coinsReward?: number }> {
  const user = await requireRole(['admin']);
  const { data, error } = await adminDb.rpc('award_achievement', { p_student_id: studentId, p_achievement_id: achievementId });
  if (error) return { success: false, error: error.message };
  const r = data as any;
  if (!r?.success) return { success: false, error: r?.error || 'Failed' };
  return { success: true, achievementName: r.achievement_name, coinsReward: r.coins_reward };
}

// ── House Scores ───────────────────────────────────────────────────────────

export async function getHouseScoresAction(periodType = 'all_time'): Promise<HouseScore[]> {
  const user = await requireAuth();
  const { data, error } = await adminDb.from('house_scores')
    .select('*').eq('period_type', periodType).order('score', { ascending: false });
  if (error || !data) return [];
  return data.map((h: any) => ({
    id: h.id, house: h.house, periodType: h.period_type,
    periodStart: h.period_start, periodEnd: h.period_end, score: h.score,
  }));
}

// ── Admin overview (extended) ──────────────────────────────────────────────

export async function getAdminRewardsOverviewAction(): Promise<{
  totalStudents: number; totalCoinsIssued: number; totalCoinsSpent: number;
  totalRedemptions: number; topEarners: { studentId: string; studentName: string; balance: number }[];
  recentRedemptions: Redemption[]; totalFacilityBookings: number; totalCouponsIssued: number;
  totalAchievementsEarned: number;
}> {
  const user = await requireRole(['admin']);
  const { count: totalStudents } = await adminDb.from('student_balance').select('*', { count: 'exact', head: true });

  const { data: totals } = await adminDb.rpc('analytics_coin_totals') as any;
  const totalCoinsIssued = Number((totals?.[0])?.total_earned ?? 0);
  const totalCoinsSpent = Number((totals?.[0])?.total_spent ?? 0);

  const { count: totalRedemptions } = await adminDb.from('redemptions').select('*', { count: 'exact', head: true }).eq('status', 'completed');
  const { count: totalFacilityBookings } = await adminDb.from('facility_bookings').select('*', { count: 'exact', head: true }).neq('status', 'cancelled');
  const { count: totalCouponsIssued } = await adminDb.from('coupons').select('*', { count: 'exact', head: true });
  const { count: totalAchievementsEarned } = await adminDb.from('student_achievements').select('*', { count: 'exact', head: true });

  const { data: topBalance } = await adminDb.from('student_balance').select('student_id, balance').order('balance', { ascending: false }).limit(5);
  let topEarners: { studentId: string; studentName: string; balance: number }[] = [];
  if (topBalance && topBalance.length > 0) {
    const ids = topBalance.map((r: any) => r.student_id);
    const { data: students } = await adminDb.from('students').select('id, display_name').in('id', ids);
    const nameMap = new Map((students || []).map((s: any) => [s.id, s.display_name]));
    topEarners = topBalance.map((r: any) => ({ studentId: r.student_id, studentName: nameMap.get(r.student_id) || 'Unknown', balance: r.balance }));
  }

  const { data: recentRows } = await adminDb.from('redemptions').select('id, student_id, reward_id, coin_tx_id, status, redeemed_at').eq('status', 'completed').order('redeemed_at', { ascending: false }).limit(10);
  const recentRedemptions: Redemption[] = (recentRows || []).map((r: any) => ({ id: r.id, studentId: r.student_id, rewardId: r.reward_id, coinTxId: r.coin_tx_id, status: r.status, redeemedAt: r.redeemed_at }));

  return { totalStudents: totalStudents || 0, totalCoinsIssued, totalCoinsSpent, totalRedemptions: totalRedemptions || 0, topEarners, recentRedemptions, totalFacilityBookings: totalFacilityBookings || 0, totalCouponsIssued: totalCouponsIssued || 0, totalAchievementsEarned: totalAchievementsEarned || 0 };
}

// ── Analytics ──────────────────────────────────────────────────────────────

export async function getRewardsAnalyticsAction(): Promise<{
  mostRedeemed: { name: string; count: number }[];
  leastRedeemed: { name: string; count: number }[];
  inventoryUsage: { name: string; stock: number; redeemed: number }[];
  coinsDaily: { date: string; earned: number; spent: number }[];
  categoryBreakdown: { category: string; count: number }[];
}> {
  const user = await requireRole(['admin']);
  const { data: topRedeemed } = await adminDb.rpc('analytics_top_redeemed') as any;
  const mostRedeemed = (topRedeemed || []).map((r: any) => ({ name: r.reward_name, count: Number(r.cnt) }));
  const leastRedeemed = [...mostRedeemed].reverse();

  const { data: categories } = await adminDb.rpc('analytics_category_breakdown') as any;
  const categoryBreakdown = (categories || []).map((c: any) => ({ category: c.category, count: Number(c.cnt) }));

  const { data: coinsDaily } = await adminDb.rpc('analytics_daily_coins') as any;
  const coinsDailyMapped = (coinsDaily || []).map((d: any) => ({ date: d.day, earned: Number(d.earned), spent: Number(d.spent) }));

  const { data: inventoryUsage } = await adminDb.rpc('analytics_inventory_usage') as any;
  const inventoryUsageMapped = (inventoryUsage || []).map((i: any) => ({ name: i.reward_name, stock: Number(i.stock ?? 0), redeemed: Number(i.redeemed) }));

  return { mostRedeemed, leastRedeemed, inventoryUsage: inventoryUsageMapped, coinsDaily: coinsDailyMapped, categoryBreakdown };
}

// ── AI Recommendations ─────────────────────────────────────────────────────

export async function getRewardRecommendationsAction(studentId: string): Promise<AIRecommendation[]> {
  const user = await requireAuth();
  const recs: AIRecommendation[] = [];
  const balance = await getStudentBalanceAction(studentId);
  if (!balance) return [];

  const { data: rewards } = await adminDb.from('rewards_config').select('id, name, cost, stock, inventory_status, is_active').eq('is_active', true).order('cost') as any;

  for (const r of (rewards || [])) {
    if (r.inventory_status === 'out_of_stock' || r.inventory_status === 'discontinued') continue;
    if (balance.balance >= r.cost) continue;
    const diff = r.cost - balance.balance;
    if (diff > 0 && diff <= 30) {
      recs.push({ type: 'coins_to_reward', message: `Only ${diff} more coins until "${r.name}"!`, rewardId: r.id, priority: 10 - diff });
    }
  }

  const { data: redemptions } = await adminDb.from('redemptions').select('id').eq('student_id', studentId);
  const redemptionIds = (redemptions || []).map((x: any) => x.id);
  const { data: tokens } = redemptionIds.length > 0 ? await adminDb.from('redemption_tokens').select('expires_at, redemption_id, status')
    .in('redemption_id', redemptionIds)
    .eq('status', 'ready') as any : { data: [] };

  for (const t of (tokens || [])) {
    const exp = new Date(t.expires_at);
    const daysLeft = Math.ceil((exp.getTime() - Date.now()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 3) {
      recs.push({ type: 'expiring', message: `A reward QR expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}! Redeem at the counter soon.`, priority: 8 - daysLeft });
    }
  }

  const { data: bookings } = await adminDb.from('facility_bookings').select('id, status, facilities(name)')
    .eq('student_id', studentId).neq('status', 'cancelled').limit(5) as any;
  if (bookings && bookings.length > 0) {
    recs.push({ type: 'activity_match', message: `You have ${bookings.length} upcoming booking${bookings.length > 1 ? 's' : ''}. Check in on time!`, priority: 6 });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
