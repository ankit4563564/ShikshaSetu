'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStudentBalanceAction,
  getStudentTransactionsAction,
  getStudentRedemptionsAction,
  getActiveRewardsAction,
  getStudentTokensAction,
  getStudentCouponsAction,
  getStudentBookingsAction,
  getStudentAchievementsAction,
  getMysteryBoxesAction,
  getMysteryBoxItemsAction,
  getRewardRecommendationsAction,
  redeemRewardAction,
  openMysteryBoxAction,
  getFacilitiesAction,
  getFacilitySlotsAction,
  bookFacilityAction,
} from '@/app/actions/rewardsActions';
import type {
  RewardConfig, StudentBalance, CoinTransaction, Redemption, RedemptionToken,
  Coupon, FacilityBooking, StudentAchievement, MysteryBox, MysteryBoxItem,
  Facility, FacilitySlot, AIRecommendation,
} from '@/lib/rewards/types';

interface StudentRewardsPanelProps {
  studentId: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  canteen: '🍽️', library: '📚', sports: '⚽', merchandise: '🎁', event_ticket: '🎟️', other: '✨',
};

const TX_TYPE_LABELS: Record<string, string> = {
  earn_attendance: 'Attendance', earn_homework: 'Homework', earn_competition: 'Competition',
  earn_club: 'Club Activity', earn_sports: 'Sports', earn_behaviour: 'Positive Behaviour',
  earn_bonus: 'Bonus', earn_achievement: 'Achievement', earn_mystery: 'Mystery Box',
  earn_campaign: 'Campaign Bonus', redeem_reward: 'Redeemed', admin_adjust: 'Admin Adjustment',
};

const ACHIEVEMENT_ICONS: Record<string, string> = {
  attendance: '📅', homework: '📚', sports: '🏆', behaviour: '💛',
  academic: '⭐', club: '🎭', transport: '🚌', special: '✨',
};

export default function StudentRewardsPanel({ studentId }: StudentRewardsPanelProps) {
  const [balance, setBalance] = useState<StudentBalance | null>(null);
  const [rewards, setRewards] = useState<RewardConfig[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [tokens, setTokens] = useState<RedemptionToken[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBox[]>([]);
  const [mysteryItems, setMysteryItems] = useState<MysteryBoxItem[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wallet' | 'marketplace' | 'coupons' | 'bookings' | 'achievements' | 'mystery'>('wallet');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Facility booking state
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slots, setSlots] = useState<FacilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingReward, setBookingReward] = useState<string | null>(null);

  // Mystery box state
  const [openingBox, setOpeningBox] = useState<string | null>(null);
  const [mysteryResult, setMysteryResult] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [
        bal, rwds, txs, reds, toks, cps, bks, ach, allAch, boxes, facs, recs,
      ] = await Promise.all([
        getStudentBalanceAction(studentId),
        getActiveRewardsAction(),
        getStudentTransactionsAction(studentId),
        getStudentRedemptionsAction(studentId),
        getStudentTokensAction(studentId),
        getStudentCouponsAction(studentId),
        getStudentBookingsAction(studentId),
        getStudentAchievementsAction(studentId),
        import('@/app/actions/rewardsActions').then(m => m.getAchievementsAction()),
        getMysteryBoxesAction(),
        getFacilitiesAction(),
        getRewardRecommendationsAction(studentId),
      ]);
      setBalance(bal);
      setRewards(rwds);
      setTransactions(txs);
      setRedemptions(reds);
      setTokens(toks);
      setCoupons(cps);
      setBookings(bks);
      setAchievements(ach);
      setAllAchievements(allAch);
      setMysteryBoxes(boxes);
      setFacilities(facs);
      setRecommendations(recs);
    } catch (err) {
      console.error('[Rewards] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const redeemedIds = new Set(redemptions.filter(r => r.status === 'completed').map(r => r.rewardId));

  async function handleRedeem(rewardId: string) {
    const result = await redeemRewardAction(studentId, rewardId);
    if (result.success) {
      setToast({ message: 'Reward redeemed! Show the QR to the vendor.', type: 'success' });
      await loadData();
    } else {
      setToast({ message: result.error || 'Redemption failed', type: 'error' });
    }
  }

  async function handleOpenMysteryBox(boxId: string) {
    setOpeningBox(boxId);
    setMysteryResult(null);
    try {
      const result = await openMysteryBoxAction(studentId, boxId);
      if (result.success) {
        setMysteryResult(`You won: ${result.itemWon}!${result.itemValue ? ` (Value: ${result.itemValue} coins)` : ''}`);
        setToast({ message: `🎉 ${result.itemWon}!`, type: 'success' });
        await loadData();
      } else {
        setToast({ message: result.error || 'Failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error', type: 'error' });
    } finally {
      setOpeningBox(null);
    }
  }

  async function handleBookFacility() {
    if (!selectedFacility || !selectedSlot || !bookingDate) return;
    const facilityReward = rewards.find(r => r.facilityId === selectedFacility && r.rewardType === 'facility');
    if (!facilityReward) { setToast({ message: 'No reward linked to this facility', type: 'error' }); return; }
    const redeemResult = await redeemRewardAction(studentId, facilityReward.id);
    if (!redeemResult.success) { setToast({ message: redeemResult.error || 'Not enough coins', type: 'error' }); return; }
    const result = await bookFacilityAction(studentId, selectedFacility, selectedSlot, bookingDate, redeemResult.redemptionId);
    if (result.success) {
      setToast({ message: 'Facility booked!', type: 'success' });
      setSelectedFacility(null); setSelectedSlot(null); setBookingDate('');
      await loadData();
    } else {
      setToast({ message: result.error || 'Booking failed', type: 'error' });
    }
  }

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between ${
            toast.type === 'success' ? 'bg-sage/10 text-sage' : 'bg-warm-clay/10 text-warm-clay'
          }`}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="text-xs ml-2">✕</button>
        </motion.div>
      )}

      {/* Balance card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-gradient-to-br from-marigold to-amber p-6 text-white"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-white/70">Campus Coins Wallet</p>
        <p className="mt-1 text-4xl font-extrabold">{balance?.balance ?? 0}</p>
        <div className="mt-3 flex gap-4 text-xs text-white/70">
          <span>Earned: {balance?.lifetimeEarned ?? 0}</span>
          <span>Spent: {balance?.lifetimeSpent ?? 0}</span>
        </div>
      </motion.div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-primary/10 bg-primary/[0.02] px-4 py-2.5 text-sm text-deep-teal/80"
            >
              💡 {rec.message}
            </motion.div>
          ))}
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-3 overflow-x-auto border-b border-deep-teal/5 pb-2 text-nowrap">
        {[{ id: 'wallet', label: 'History', icon: '📜' },
          { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
          { id: 'coupons', label: 'Coupons', icon: '🎟️' },
          { id: 'bookings', label: 'Bookings', icon: '📅' },
          { id: 'achievements', label: 'Achievements', icon: '🏅' },
          { id: 'mystery', label: 'Mystery Box', icon: '🎁' },
        ].map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 pb-1 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-deep-teal text-deep-teal' : 'border-transparent text-deep-teal/40 hover:text-deep-teal/60'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Wallet / History ─── */}
        {activeTab === 'wallet' && (
          <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {transactions.length === 0 && <p className="text-sm text-deep-teal/40 italic text-center py-8">No transactions yet.</p>}
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tx.direction === 'earn' ? '🪙' : '🎯'}</span>
                  <div>
                    <p className="text-sm font-bold text-deep-teal">{TX_TYPE_LABELS[tx.txType] || tx.txType}</p>
                    <p className="text-xs text-deep-teal/40">{tx.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-extrabold ${tx.direction === 'earn' ? 'text-sage' : 'text-warm-clay'}`}>
                  {tx.direction === 'earn' ? '+' : '-'}{tx.amount}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ─── Marketplace ─── */}
        {activeTab === 'marketplace' && (
          <motion.div key="marketplace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {rewards.filter(r => r.rewardType !== 'facility').length === 0 && (
              <p className="text-sm text-deep-teal/40 italic text-center py-8">No rewards available.</p>
            )}
            {rewards.filter(r => r.rewardType !== 'facility').map(reward => {
              const alreadyRedeemed = redeemedIds.has(reward.id);
              const outOfStock = reward.stock !== null && reward.stock <= 0;
              const unavailable = reward.inventoryStatus === 'out_of_stock' || reward.inventoryStatus === 'discontinued';
              const cantAfford = (balance?.balance ?? 0) < reward.cost;
              const disabled = alreadyRedeemed || outOfStock || unavailable || cantAfford;

              return (
                <div key={reward.id} className={`rounded-xl border p-4 transition-all ${
                  disabled ? 'border-deep-teal/5 bg-white/30 opacity-50' : 'border-white/80 bg-white/70 backdrop-blur-xl hover:shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CATEGORY_ICONS[reward.category] || '✨'}</span>
                      <div>
                        <p className="text-sm font-bold text-deep-teal">{reward.name}</p>
                        {reward.description && <p className="text-xs text-deep-teal/40">{reward.description}</p>}
                        <div className="flex gap-2 mt-0.5">
                          {reward.stock !== null && <span className="text-[10px] text-deep-teal/30">{reward.stock} left</span>}
                          {reward.inventoryStatus === 'low_stock' && <span className="text-[10px] text-marigold font-bold">Low stock!</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-extrabold text-deep-teal">{reward.cost} 🪙</p>
                  </div>
                  <button type="button" onClick={() => handleRedeem(reward.id)} disabled={disabled}
                    className={`mt-3 w-full rounded-lg py-2 text-xs font-bold transition-all active:scale-95 ${
                      disabled ? 'bg-deep-teal/5 text-deep-teal/30 cursor-not-allowed' : 'bg-deep-teal text-white hover:bg-deep-teal/90 shadow-md'
                    }`}
                  >
                    {alreadyRedeemed ? 'Already Redeemed' : outOfStock || unavailable ? 'Unavailable' : 'Redeem'}
                  </button>
                </div>
              );
            })}

            {/* Facility bookings marketplace */}
            {facilities.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40 mb-3">Book Facilities</p>
                <div className="space-y-3">
                  {rewards.filter(r => r.rewardType === 'facility').map(reward => {
                    const facility = facilities.find(f => f.id === reward.facilityId);
                    if (!facility) return null;
                    const cantAfford = (balance?.balance ?? 0) < reward.cost;
                    return (
                      <div key={reward.id} className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-deep-teal">{facility.name}</p>
                            <p className="text-xs text-deep-teal/40">{facility.description}</p>
                          </div>
                          <p className="text-sm font-extrabold text-deep-teal">{reward.cost} 🪙</p>
                        </div>
                        {selectedFacility === facility.id ? (
                          <div className="mt-3 space-y-2 border-t border-deep-teal/5 pt-3">
                            <input type="date" value={bookingDate} min={today}
                              onChange={e => { setBookingDate(e.target.value); setSelectedSlot(null);
                                getFacilitySlotsAction(facility.id, e.target.value).then(setSlots);
                              }}
                              className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm"
                            />
                            {slots.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {slots.map(slot => (
                                  <button key={slot.id} type="button" onClick={() => setSelectedSlot(slot.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                      selectedSlot === slot.id ? 'bg-deep-teal text-white border-deep-teal' : 'border-deep-teal/10 text-deep-teal/60 hover:border-deep-teal/20'
                                    }`}
                                  >
                                    {slot.startTime?.slice(0, 5)}-{slot.endTime?.slice(0, 5)}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button type="button" onClick={handleBookFacility} disabled={!selectedSlot || !bookingDate}
                                className="flex-1 rounded-lg bg-sage py-2 text-xs font-bold text-white hover:bg-sage/90 disabled:opacity-40 shadow-sm"
                              >
                                Book Now ({reward.cost} 🪙)
                              </button>
                              <button type="button" onClick={() => { setSelectedFacility(null); setSelectedSlot(null); }}
                                className="rounded-lg border border-deep-teal/10 px-3 py-2 text-xs font-bold text-deep-teal/60"
                              >Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => { setSelectedFacility(facility.id); setBookingReward(reward.id); }}
                            disabled={cantAfford}
                            className={`mt-3 w-full rounded-lg py-2 text-xs font-bold transition-all active:scale-95 ${
                              cantAfford ? 'bg-deep-teal/5 text-deep-teal/30 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                          >
                            {cantAfford ? 'Not enough coins' : 'Select Date & Time'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Coupons ─── */}
        {activeTab === 'coupons' && (
          <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {coupons.length === 0 && (
              <p className="text-sm text-deep-teal/40 italic text-center py-8">No coupons yet. Redeem coupon-type rewards to get them!</p>
            )}
            {coupons.map(c => (
              <div key={c.id} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-deep-teal">{c.description}</p>
                    <p className="text-xs text-deep-teal/40">Code: <span className="font-mono font-bold">{c.code}</span></p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    c.status === 'active' ? 'bg-sage/10 text-sage' :
                    c.status === 'used' ? 'bg-deep-teal/10 text-deep-teal/40' : 'bg-warm-clay/10 text-warm-clay'
                  }`}>{c.status}</span>
                </div>
                <div className="mt-1 flex gap-3 text-[10px] text-deep-teal/30">
                  <span>Expires: {new Date(c.expiryDate).toLocaleDateString()}</span>
                  <span>Used: {c.usageCount}/{c.usageLimit}</span>
                </div>
              </div>
            ))}
            {tokens.filter(t => t.status === 'ready').length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40 mb-2">Active QR Tokens</p>
                {tokens.filter(t => t.status === 'ready').map(t => (
                  <div key={t.id} className="rounded-xl border border-primary/10 bg-primary/[0.02] px-4 py-3 mb-2">
                    <p className="text-xs font-bold text-deep-teal">Redemption Token</p>
                    <p className="text-sm font-mono text-deep-teal/70 mt-1">{t.token}</p>
                    <p className="text-[10px] text-deep-teal/30 mt-0.5">
                      Expires: {new Date(t.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Bookings ─── */}
        {activeTab === 'bookings' && (
          <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {bookings.length === 0 && (
              <p className="text-sm text-deep-teal/40 italic text-center py-8">No facility bookings yet.</p>
            )}
            {bookings.map(b => (
              <div key={b.id} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-deep-teal">{b.facilityName || 'Facility'}</p>
                    <p className="text-xs text-deep-teal/40">{b.bookingDate}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    b.status === 'confirmed' ? 'bg-sage/10 text-sage' :
                    b.status === 'completed' ? 'bg-deep-teal/10 text-deep-teal/40' :
                    b.status === 'cancelled' ? 'bg-warm-clay/10 text-warm-clay' : 'bg-marigold/10 text-marigold'
                  }`}>{b.status}</span>
                </div>
                {b.qrToken && <p className="mt-1 text-[10px] text-deep-teal/30 font-mono">QR: {b.qrToken.slice(0, 16)}…</p>}
              </div>
            ))}
          </motion.div>
        )}

        {/* ─── Achievements ─── */}
        {activeTab === 'achievements' && (
          <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40">Earned ({achievements.length})</p>
            {achievements.length === 0 && (
              <p className="text-sm text-deep-teal/40 italic text-center py-4">No achievements yet. Keep participating!</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {achievements.map(sa => (
                <div key={sa.id} className="rounded-xl border border-white/80 bg-white/70 p-3 backdrop-blur-xl text-center">
                  <span className="text-2xl">{sa.achievementIcon || '🏅'}</span>
                  <p className="mt-1 text-xs font-bold text-deep-teal">{sa.achievementName || 'Achievement'}</p>
                  <p className="text-[10px] text-deep-teal/30">{new Date(sa.earnedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40 mb-3">All Achievements</p>
              <div className="grid grid-cols-2 gap-2">
                {allAchievements.map(a => {
                  const earned = achievements.some(sa => sa.achievementId === a.id);
                  return (
                    <div key={a.id} className={`rounded-xl border p-3 text-center ${earned ? 'border-sage/20 bg-sage/5' : 'border-deep-teal/5 bg-white/30 opacity-50'}`}>
                      <span className="text-2xl">{a.icon || ACHIEVEMENT_ICONS[a.category] || '🏅'}</span>
                      <p className="mt-1 text-xs font-bold text-deep-teal">{a.name}</p>
                      <p className="text-[10px] text-deep-teal/30">{earned ? '✓ Earned' : `+${a.coinsReward} coins`}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Mystery Box ─── */}
        {activeTab === 'mystery' && (
          <motion.div key="mystery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {mysteryResult && (
              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-lg font-extrabold">{mysteryResult}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {mysteryBoxes.map(box => {
                const cantAfford = (balance?.balance ?? 0) < box.cost;
                return (
                  <div key={box.id} className="rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-extrabold text-deep-teal">{box.name}</p>
                        {box.description && <p className="text-xs text-deep-teal/40 mt-0.5">{box.description}</p>}
                      </div>
                      <p className="text-lg font-extrabold text-deep-teal">{box.cost} 🪙</p>
                    </div>
                    <button type="button" onClick={() => handleOpenMysteryBox(box.id)}
                      disabled={cantAfford || openingBox === box.id}
                      className={`mt-4 w-full rounded-xl py-3 text-sm font-extrabold transition-all active:scale-95 ${
                        cantAfford ? 'bg-deep-teal/5 text-deep-teal/30 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                      }`}
                    >
                      {openingBox === box.id ? 'Opening…' : cantAfford ? 'Not enough coins' : 'Open Mystery Box'}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
