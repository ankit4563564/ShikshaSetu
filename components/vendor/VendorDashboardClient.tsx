'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import VendorQRScanner from './VendorQRScanner';
import {
  VENDOR_REDEMPTIONS_TODAY,
  VENDOR_MENU_ITEMS,
  VENDOR_STATS_TODAY,
  LIVE_ACTIVITY,
} from '@/lib/demo/schoolUniverse';

interface VendorDashboardClientProps {
  vendorId: string;
  vendorName: string;
  vendorType: string;
}

// Realistic hourly pattern - morning is slow, lunch rush is intense
const HOURLY = [
  { hour: '8 AM', count: 0, label: 'Morning' },
  { hour: '9 AM', count: 1, label: 'Early birds' },
  { hour: '10 AM', count: 5, label: 'Snack time' },
  { hour: '11 AM', count: 9, label: '⬆ Peak building' },
  { hour: '12 PM', count: 18, label: 'Lunch rush' },
  { hour: '1 PM', count: 8, label: 'After lunch' },
];
const maxHourly = Math.max(...HOURLY.map(h => h.count));

export default function VendorDashboardClient({ vendorId, vendorName, vendorType }: VendorDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scan' | 'activity'>('overview');

  const lowStock = VENDOR_MENU_ITEMS.filter(i => i.stock <= 8);
  const peakHour = HOURLY.reduce((max, h) => h.count > max.count ? h : max);
  const avgWaitTime = VENDOR_STATS_TODAY.totalRedemptions > 0 ? Math.ceil(12 * (8 / VENDOR_STATS_TODAY.totalRedemptions)) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {/* ── HERO: Operational Status ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/80 bg-gradient-to-br from-white/80 to-white/60 p-6 backdrop-blur-xl shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">Campus Canteen · Where Students Redeem Their Earned Coins</p>
            <h1 className="font-display text-3xl font-extrabold text-deep-teal mt-2">Welcome, {vendorName}</h1>
            <p className="mt-2 text-sm text-deep-teal/60">Wednesday · 22 July 2026 · Lunch rush in progress (Peak at {peakHour.hour})</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1.5 text-xs font-bold text-sage">
              <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
              System online
            </span>
            <span className="text-[10px] font-bold text-primary">↑ +18 from yesterday</span>
          </div>
        </div>

        {/* Operational Health Row */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white/50 px-3 py-2.5">
            <p className="text-2xl font-extrabold text-sage">{VENDOR_STATS_TODAY.totalRedemptions}</p>
            <p className="text-[10px] font-bold text-deep-teal/40">Students Served</p>
            <p className="text-[9px] text-deep-teal/30 mt-0.5">Campus Coins redeemed</p>
          </div>
          <div className="rounded-lg bg-white/50 px-3 py-2.5">
            <p className="text-2xl font-extrabold text-primary">{avgWaitTime}s</p>
            <p className="text-[10px] font-bold text-deep-teal/40">Average Wait Time</p>
            <p className="text-[9px] text-deep-teal/30 mt-0.5">QR scan to redemption</p>
          </div>
          <div className="rounded-lg bg-white/50 px-3 py-2.5">
            <p className="text-2xl font-extrabold text-primary">{VENDOR_STATS_TODAY.totalCoins}</p>
            <p className="text-[10px] font-bold text-deep-teal/40">Campus Coins Used</p>
            <p className="text-[9px] text-deep-teal/30 mt-0.5">Connected to school rewards</p>
          </div>
        </div>
      </motion.div>

      {/* ── Low stock alert (if needed) ── */}
      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-warm-clay/20 bg-warm-clay/5 px-4 py-3">
          <p className="text-xs font-extrabold text-warm-clay">⚠️ Low Stock Alert</p>
          <p className="mt-1 text-xs text-deep-teal/70">
            Restock: {lowStock.map(i => `${i.name}`).join(', ')}
          </p>
        </motion.div>
      )}

      {/* ── Tab nav ── */}
      <div className="flex gap-1 rounded-xl border border-deep-teal/10 bg-white/60 p-1">
        {(['overview', 'scan', 'activity'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-deep-teal text-white shadow-sm'
                : 'text-deep-teal/50 hover:text-deep-teal'
            }`}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'scan' ? '🎯 Scan & Redeem' : '⚡ Live Activity'}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

          {/* Rush Timeline - Shows when peak demand happens */}
          <div className="rounded-2xl border border-white/80 bg-white/75 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">Today's Lunch Rush Timeline</p>
              <span className="text-[10px] font-bold text-primary">Peak: {peakHour.hour} ({peakHour.count} students)</span>
            </div>
            <div className="flex items-end gap-1.5 h-24">
              {HOURLY.map((h, i) => (
                <motion.div 
                  key={h.hour} 
                  initial={{ height: 0 }}
                  animate={{ height: maxHourly ? `${(h.count / maxHourly) * 96}px` : '4px' }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-[9px] font-bold text-deep-teal/60">{h.count > 0 ? h.count : ''}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all" />
                  <span className="text-[8px] text-deep-teal/40 mt-1">{h.hour}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-[9px] text-deep-teal/50 mt-3 text-center">Peak demand at lunch break. Inventory prepared accordingly.</p>
          </div>

          {/* Inventory as Story - Rich Cards showing connection to ecosystem */}
          <div className="rounded-2xl border border-white/80 bg-white/75 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">Menu & Inventory</p>
              <span className="text-[10px] font-bold text-deep-teal/50">{VENDOR_MENU_ITEMS.length} items available</span>
            </div>
            <div className="space-y-3">
              {VENDOR_MENU_ITEMS.map(item => (
                <motion.div 
                  key={item.id} 
                  whileHover={{ scale: 1.01 }}
                  className="rounded-xl border border-deep-teal/10 bg-white/50 px-4 py-3 transition-all hover:border-deep-teal/20 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-bold text-deep-teal">{item.name}</p>
                        {item.popular && (
                          <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[8px] font-bold text-sage">
                            ⭐ Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-deep-teal/50 mb-2">
                        {item.stock <= 5 ? '🔴 Running low' : item.stock <= 12 ? '🟡 Moderate' : '🟢 Well stocked'}
                        {' • '} 
                        {Math.ceil(Math.random() * 8)}-12 sold today
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{item.coins}c</p>
                      <p className={`text-[10px] font-bold ${item.stock <= 8 ? 'text-warm-clay' : 'text-deep-teal/60'}`}>
                        {item.stock} left
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Insights - Connected to ecosystem */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-3">🎓 Connected to School Ecosystem</p>
            <div className="space-y-2 text-[10px] leading-relaxed text-primary/80">
              <div className="flex gap-2">
                <span>📚</span>
                <span><strong>Homework Streaks:</strong> Students earn coins → redeem meals daily</span>
              </div>
              <div className="flex gap-2">
                <span>🏆</span>
                <span><strong>Teacher Recognition:</strong> Recognized by teachers → earn coins → spend here</span>
              </div>
              <div className="flex gap-2">
                <span>👥</span>
                <span><strong>Parent Visibility:</strong> Every redemption syncs to parent app</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Scan tab ── */}
      {activeTab === 'scan' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <VendorQRScanner vendorId={vendorId} onScanComplete={() => {}} />
        </motion.div>
      )}

      {/* ── Activity tab ── */}
      {activeTab === 'activity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

          {/* Live Activity Feed - Shows ecosystem connectivity */}
          <div className="rounded-2xl border border-white/80 bg-white/75 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">⚡ Live Activity (Last 30 min)</p>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
                Real-time
              </span>
            </div>
            <div className="space-y-2.5">
              {LIVE_ACTIVITY.map((activity, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 rounded-lg border border-deep-teal/5 bg-white/40 p-3 text-[11px]"
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-deep-teal">{activity.event}</p>
                    <p className="text-[9px] text-deep-teal/50 mt-0.5">From: {activity.source}</p>
                  </div>
                  <span className="text-[10px] text-deep-teal/40 font-mono flex-shrink-0">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Redemption Timeline - Connected to ecosystem */}
          <div className="rounded-2xl border border-white/80 bg-white/75 p-5 backdrop-blur-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">Student Redemptions Today ({VENDOR_REDEMPTIONS_TODAY.length})</p>
            <div className="space-y-2.5">
              {VENDOR_REDEMPTIONS_TODAY.map((r) => (
                <motion.div 
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start justify-between rounded-lg border border-deep-teal/5 bg-white/40 p-3.5"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-deep-teal">{r.student}</p>
                      <p className="text-[10px] text-deep-teal/50 mt-0.5">
                        <span className="font-semibold text-deep-teal">{r.item}</span> · Class {r.grade}
                      </p>
                      <p className="text-[9px] text-primary mt-1">Through: Homework Streak Badge</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-primary">-{r.coins}c</p>
                    <p className="text-[10px] text-deep-teal/40 font-mono mt-1">{r.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
