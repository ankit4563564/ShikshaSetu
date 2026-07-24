'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getRewardsAction,
  getAdminRewardsOverviewAction,
  getRewardsAnalyticsAction,
  getAchievementsAction,
  getHouseScoresAction,
  getAllCampaignsAction,
  createRewardAction,
  updateRewardAction,
  restockRewardAction,
  earnCoinsAction,
  awardAchievementAction,
  createCampaignAction,
  toggleCampaignAction,
} from '@/app/actions/rewardsActions';
import type { RewardConfig, Campaign, Achievement, HouseScore } from '@/lib/rewards/types';
import type { CoinTxType } from '@/lib/rewards/types';

const CATEGORY_LABELS: Record<string, string> = {
  canteen: 'Canteen', library: 'Library', sports: 'Sports',
  merchandise: 'Merchandise', event_ticket: 'Event Tickets', other: 'Other',
};

export default function AdminRewardsPanel() {
  const [rewards, setRewards] = useState<RewardConfig[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [houseScores, setHouseScores] = useState<HouseScore[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'inventory' | 'campaigns' | 'analytics' | 'achievements' | 'houses'>('overview');
  const [toast, setToast] = useState<string | null>(null);

  // Create reward form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'canteen', cost: 0, stock: '', rewardType: 'item' });

  // Earn coins form
  const [earnForm, setEarnForm] = useState({ studentId: '', amount: 10, txType: 'earn_bonus' as CoinTxType, description: '' });
  const [earnResult, setEarnResult] = useState<string | null>(null);

  // Award achievement form
  const [achForm, setAchForm] = useState({ studentId: '', achievementId: '' });

  // Campaign form
  const [campForm, setCampForm] = useState({ name: '', description: '', bonusMultiplier: 1, startDate: '', endDate: '' });

  // Restock
  const [restockForm, setRestockForm] = useState({ rewardId: '', quantity: 10, notes: '' });

  const loadData = async () => {
    const [rwds, ov, an, ach, houses, camps] = await Promise.all([
      getRewardsAction(),
      getAdminRewardsOverviewAction(),
      getRewardsAnalyticsAction(),
      getAchievementsAction(),
      getHouseScoresAction(),
      getAllCampaignsAction(),
    ]);
    setRewards(rwds); setOverview(ov); setAnalytics(an);
    setAchievements(ach); setHouseScores(houses); setCampaigns(camps);
  };

  useEffect(() => { (async () => { try { await loadData(); } catch {} finally { setLoading(false); } })(); }, []);

  async function handleCreateReward() {
    if (!form.name || form.cost <= 0) return;
    const res = await createRewardAction({ name: form.name, description: form.description || undefined, category: form.category, cost: form.cost, stock: form.stock ? parseInt(form.stock) : null, rewardType: form.rewardType });
    if (res.success) { setToast('Reward created'); setShowCreate(false); setForm({ name: '', description: '', category: 'canteen', cost: 0, stock: '', rewardType: 'item' }); loadData(); }
    else setToast(res.error || 'Failed');
  }

  async function handleToggleActive(rewardId: string, current: boolean) {
    const res = await updateRewardAction(rewardId, { isActive: !current });
    if (res.success) loadData(); else setToast(res.error || 'Failed');
  }

  async function handleRestock() {
    if (!restockForm.rewardId || restockForm.quantity <= 0) return;
    const res = await restockRewardAction(restockForm.rewardId, restockForm.quantity, restockForm.notes);
    if (res.success) { setToast('Stock updated'); setRestockForm({ rewardId: '', quantity: 10, notes: '' }); loadData(); }
    else setToast(res.error || 'Failed');
  }

  async function handleEarnCoins() {
    if (!earnForm.studentId || earnForm.amount <= 0) return;
    const res = await earnCoinsAction({ studentId: earnForm.studentId, amount: earnForm.amount, txType: earnForm.txType, description: earnForm.description });
    if (res.success) { setEarnResult(`Success! New balance: ${res.newBalance}`); setEarnForm({ studentId: '', amount: 10, txType: 'earn_bonus', description: '' }); }
    else setEarnResult(res.error || 'Failed');
  }

  async function handleAwardAchievement() {
    if (!achForm.studentId || !achForm.achievementId) return;
    const res = await awardAchievementAction(achForm.studentId, achForm.achievementId);
    if (res.success) { setToast(`Achievement "${res.achievementName}" awarded!`); setAchForm({ studentId: '', achievementId: '' }); loadData(); }
    else setToast(res.error || 'Failed');
  }

  async function handleCreateCampaign() {
    if (!campForm.name || !campForm.startDate || !campForm.endDate) return;
    const res = await createCampaignAction(campForm);
    if (res.success) { setToast('Campaign created'); setCampForm({ name: '', description: '', bonusMultiplier: 1, startDate: '', endDate: '' }); loadData(); }
    else setToast(res.error || 'Failed');
  }

  if (loading) return <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="rounded-xl bg-sage/10 px-4 py-3 text-sm font-bold text-sage flex items-center justify-between">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="text-xs ml-2">✕</button>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-3 overflow-x-auto border-b border-deep-teal/5 pb-2 text-nowrap">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'manage', label: 'Rewards' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'campaigns', label: 'Campaigns' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'achievements', label: 'Achievements' },
          { id: 'houses', label: 'Houses' },
        ].map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)}
            className={`pb-1 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-deep-teal text-deep-teal' : 'border-transparent text-deep-teal/40'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && overview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">Students</p>
              <p className="mt-1 text-xl font-extrabold text-deep-teal">{overview.totalStudents}</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">Issued</p>
              <p className="mt-1 text-xl font-extrabold text-deep-teal">{overview.totalCoinsIssued}</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">Spent</p>
              <p className="mt-1 text-xl font-extrabold text-deep-teal">{overview.totalCoinsSpent}</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">Redemptions</p>
              <p className="mt-1 text-xl font-extrabold text-deep-teal">{overview.totalRedemptions}</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">Bookings</p>
              <p className="mt-1 text-xl font-extrabold text-deep-teal">{overview.totalFacilityBookings}</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">Coupons</p>
              <p className="mt-1 text-xl font-extrabold text-deep-teal">{overview.totalCouponsIssued}</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase text-deep-teal/40">Achievements</p>
              <p className="mt-1 text-xl font-extrabold text-deep-teal">{overview.totalAchievementsEarned}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40 mb-3">Top Earners</p>
            {overview.topEarners.map((e: any, i: number) => (
              <div key={e.studentId} className="flex items-center justify-between py-1.5 border-b border-deep-teal/5 last:border-0">
                <span className="text-sm font-bold text-deep-teal">{i + 1}. {e.studentName}</span>
                <span className="text-sm font-extrabold text-marigold">{e.balance} 🪙</span>
              </div>
            ))}
            {overview.topEarners.length === 0 && <p className="text-xs text-deep-teal/40 italic">No data yet.</p>}
          </div>
        </motion.div>
      )}

      {/* ── Manage Rewards ── */}
      {activeTab === 'manage' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowCreate(!showCreate)}
              className="rounded-lg bg-deep-teal px-4 py-2 text-xs font-bold text-white hover:bg-deep-teal/90"
            >{showCreate ? 'Cancel' : '+ New Reward'}</button>
          </div>

          {showCreate && (
            <div className="rounded-xl border border-white/80 bg-white/70 p-4 space-y-3 backdrop-blur-xl">
              <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
              <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="rounded-lg border border-deep-teal/10 px-3 py-2 text-sm">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={form.rewardType} onChange={e => setForm(p => ({ ...p, rewardType: e.target.value }))} className="rounded-lg border border-deep-teal/10 px-3 py-2 text-sm">
                  <option value="item">Item</option><option value="coupon">Coupon</option><option value="facility">Facility</option>
                </select>
                <input type="number" placeholder="Cost" value={form.cost || ''} onChange={e => setForm(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))} className="w-20 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
                <input type="text" placeholder="Stock" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} className="w-20 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
              </div>
              <button type="button" onClick={handleCreateReward} className="rounded-lg bg-sage px-4 py-2 text-xs font-bold text-white hover:bg-sage/90">Create</button>
            </div>
          )}

          {/* Earn coins */}
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 space-y-3 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40">Award Coins</p>
            <input type="text" placeholder="Student ID" value={earnForm.studentId} onChange={e => setEarnForm(p => ({ ...p, studentId: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            <div className="flex gap-3">
              <select value={earnForm.txType} onChange={e => setEarnForm(p => ({ ...p, txType: e.target.value as CoinTxType }))} className="rounded-lg border border-deep-teal/10 px-3 py-2 text-sm">
                <option value="earn_attendance">Attendance</option><option value="earn_homework">Homework</option>
                <option value="earn_competition">Competition</option><option value="earn_club">Club</option>
                <option value="earn_sports">Sports</option><option value="earn_behaviour">Behaviour</option><option value="earn_bonus">Bonus</option>
              </select>
              <input type="number" placeholder="Amount" value={earnForm.amount} onChange={e => setEarnForm(p => ({ ...p, amount: parseInt(e.target.value) || 0 }))} className="w-20 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            </div>
            <input type="text" placeholder="Description" value={earnForm.description} onChange={e => setEarnForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            <button type="button" onClick={handleEarnCoins} className="rounded-lg bg-sage px-4 py-2 text-xs font-bold text-white hover:bg-sage/90">Award Coins</button>
            {earnResult && <p className="text-sm font-bold text-deep-teal">{earnResult}</p>}
          </div>

          <div className="space-y-2">
            {rewards.map(reward => (
              <div key={reward.id} className="flex items-center justify-between rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur-xl">
                <div>
                  <p className="text-sm font-bold text-deep-teal">{reward.name}</p>
                  <p className="text-xs text-deep-teal/40">{CATEGORY_LABELS[reward.category] || reward.category} · {reward.cost} coins · {reward.rewardType}{reward.stock !== null ? ` · ${reward.stock} stock` : ' · unlimited'}</p>
                  {reward.inventoryStatus !== 'in_stock' && (
                    <span className={`text-[10px] font-bold ${reward.inventoryStatus === 'low_stock' ? 'text-marigold' : 'text-warm-clay'}`}>
                      {reward.inventoryStatus.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reward.isActive ? 'bg-sage/10 text-sage' : 'bg-warm-clay/10 text-warm-clay'}`}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button type="button" onClick={() => handleToggleActive(reward.id, reward.isActive)}
                    className="rounded-lg border border-deep-teal/10 px-3 py-1 text-xs font-bold text-deep-teal/60 hover:bg-deep-teal/5">Toggle</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Inventory ── */}
      {activeTab === 'inventory' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 space-y-3 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40">Restock Reward</p>
            <select value={restockForm.rewardId} onChange={e => setRestockForm(p => ({ ...p, rewardId: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm">
              <option value="">Select reward…</option>
              {rewards.filter(r => r.stock !== null).map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.stock} left)</option>
              ))}
            </select>
            <div className="flex gap-3">
              <input type="number" placeholder="Quantity" value={restockForm.quantity} onChange={e => setRestockForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} className="w-24 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
              <input type="text" placeholder="Notes" value={restockForm.notes} onChange={e => setRestockForm(p => ({ ...p, notes: e.target.value }))} className="flex-1 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            </div>
            <button type="button" onClick={handleRestock} className="rounded-lg bg-sage px-4 py-2 text-xs font-bold text-white hover:bg-sage/90">Restock</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {rewards.filter(r => r.stock !== null).map(r => (
              <div key={r.id} className={`rounded-xl border p-3 ${
                r.inventoryStatus === 'out_of_stock' ? 'border-warm-clay/20 bg-warm-clay/5' :
                r.inventoryStatus === 'low_stock' ? 'border-marigold/20 bg-marigold/5' :
                'border-white/80 bg-white/70 backdrop-blur-xl'
              }`}>
                <p className="text-xs font-bold text-deep-teal">{r.name}</p>
                <p className={`text-lg font-extrabold mt-1 ${
                  r.inventoryStatus === 'out_of_stock' ? 'text-warm-clay' :
                  r.inventoryStatus === 'low_stock' ? 'text-marigold' : 'text-sage'
                }`}>{r.stock}</p>
                <p className="text-[10px] text-deep-teal/30">{r.inventoryStatus.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Campaigns ── */}
      {activeTab === 'campaigns' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 space-y-3 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40">New Campaign</p>
            <input type="text" placeholder="Campaign name" value={campForm.name} onChange={e => setCampForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            <input type="text" placeholder="Description (optional)" value={campForm.description} onChange={e => setCampForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            <div className="flex gap-3">
              <input type="number" placeholder="Multiplier (e.g. 2.0)" value={campForm.bonusMultiplier} onChange={e => setCampForm(p => ({ ...p, bonusMultiplier: parseFloat(e.target.value) || 1 }))} className="w-24 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" step="0.1" />
              <input type="date" placeholder="Start" value={campForm.startDate} onChange={e => setCampForm(p => ({ ...p, startDate: e.target.value }))} className="flex-1 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
              <input type="date" placeholder="End" value={campForm.endDate} onChange={e => setCampForm(p => ({ ...p, endDate: e.target.value }))} className="flex-1 rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            </div>
            <button type="button" onClick={handleCreateCampaign} className="rounded-lg bg-deep-teal px-4 py-2 text-xs font-bold text-white hover:bg-deep-teal/90">Create Campaign</button>
          </div>

          <div className="space-y-2">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur-xl">
                <div>
                  <p className="text-sm font-bold text-deep-teal">{c.name}</p>
                  <p className="text-xs text-deep-teal/40">{c.startDate?.slice(0, 10)} → {c.endDate?.slice(0, 10)} · {c.bonusMultiplier}x multiplier</p>
                </div>
                <button type="button" onClick={() => toggleCampaignAction(c.id, !c.isActive).then(loadData)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    c.isActive ? 'bg-sage/10 text-sage' : 'bg-deep-teal/5 text-deep-teal/40'
                  }`}
                >{c.isActive ? 'Active' : 'Inactive'}</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Analytics ── */}
      {activeTab === 'analytics' && analytics && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Most redeemed */}
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40 mb-3">Most Redeemed Rewards</p>
            {analytics.mostRedeemed.length === 0 ? <p className="text-xs text-deep-teal/40 italic">No redemptions yet.</p> : (
              <div className="space-y-2">
                {analytics.mostRedeemed.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-deep-teal">{i + 1}. {r.name}</span>
                    <span className="text-sm font-extrabold text-sage">{r.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40 mb-3">Category Usage</p>
            <div className="space-y-2">
              {analytics.categoryBreakdown.map((c: any) => (
                <div key={c.category} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-deep-teal capitalize">{c.category}</span>
                  <span className="text-sm font-extrabold text-deep-teal">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily coins */}
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40 mb-3">Daily Coin Activity (14 days)</p>
            <div className="space-y-1">
              {analytics.coinsDaily.map((d: any) => (
                <div key={d.date} className="flex items-center justify-between text-xs">
                  <span className="text-deep-teal/60">{d.date?.slice(5)}</span>
                  <div className="flex gap-3">
                    <span className="text-sage font-bold">+{d.earned}</span>
                    <span className="text-warm-clay font-bold">-{d.spent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Achievements ── */}
      {activeTab === 'achievements' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-xl border border-white/80 bg-white/70 p-4 space-y-3 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase text-deep-teal/40">Award Achievement to Student</p>
            <input type="text" placeholder="Student ID" value={achForm.studentId} onChange={e => setAchForm(p => ({ ...p, studentId: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm" />
            <select value={achForm.achievementId} onChange={e => setAchForm(p => ({ ...p, achievementId: e.target.value }))} className="w-full rounded-lg border border-deep-teal/10 px-3 py-2 text-sm">
              <option value="">Select achievement…</option>
              {achievements.map(a => <option key={a.id} value={a.id}>{a.name} (+{a.coinsReward} coins)</option>)}
            </select>
            <button type="button" onClick={handleAwardAchievement} className="rounded-lg bg-sage px-4 py-2 text-xs font-bold text-white hover:bg-sage/90">Award</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {achievements.map(a => (
              <div key={a.id} className="rounded-xl border border-white/80 bg-white/70 p-3 text-center backdrop-blur-xl">
                <span className="text-xl">{a.icon || '🏅'}</span>
                <p className="mt-1 text-xs font-bold text-deep-teal">{a.name}</p>
                <p className="text-[10px] text-deep-teal/30">+{a.coinsReward} coins · {a.category}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── House Scores ── */}
      {activeTab === 'houses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {houseScores.length === 0 ? (
            <p className="text-sm text-deep-teal/40 italic text-center py-8">No house scores yet. They populate as students earn coins.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {houseScores.map(h => (
                <div key={h.id} className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
                  <p className="text-lg font-extrabold text-deep-teal">{h.house}</p>
                  <p className="text-3xl font-extrabold text-marigold mt-1">{h.score}</p>
                  <p className="text-[10px] text-deep-teal/30 capitalize">{h.periodType}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
