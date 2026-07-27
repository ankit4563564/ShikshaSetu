'use client';

import React, { useState, useEffect } from 'react';
import { getCopilotState, subscribeCopilotState, setDrawerOpen } from '@/lib/copilot/copilotEngine';

export function PrincipalCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-md space-y-5 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F5F8FF] border border-blue-200 px-3.5 py-1 rounded-full mb-2">
            <span className="text-[#3b82f6] text-xs">🧠</span>
            <span className="text-[11px] font-mono font-extrabold text-[#3b82f6] uppercase tracking-wider">
              CAMPUS HEALTH &bull; PRINCIPAL COPILOT
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#111827]">
            School Operations Briefing
          </h3>
          <p className="text-xs text-[#6B7280] font-medium">
            Immediate Attention Items: 2 &bull; Active Interventions: {isApproved ? '8' : '7'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 bg-[#111827] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <span>🧠 Open Mission Control</span>
        </button>
      </div>

      {/* Immediate Attention Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2">
          <div className="flex items-center justify-between font-bold text-red-900">
            <span>🔴 Grade 8 Monday Attendance Drop</span>
            <span className="text-[10px] font-mono bg-red-100 px-2 py-0.5 rounded">Action Prepared</span>
          </div>
          <p className="text-[#6B7280]">
            Grade 8 attendance dropped by 4.2%. Root causes: Route #04 rain delay + Unit test week.
          </p>
          <div className="pt-1 text-[11px] font-bold text-[#0F766E] flex items-center gap-2">
            <span>✓ Prepared Action:</span> Delay assembly by 10 mins &amp; brief coordinators.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/40 space-y-2">
          <div className="flex items-center justify-between font-bold text-[#0F766E]">
            <span>🟢 Active Support Interventions</span>
            <span className="text-[10px] font-mono bg-[#F4FBF7] px-2 py-0.5 rounded border border-[#22C55E]/30">
              Live Sync
            </span>
          </div>
          <p className="text-[#6B7280]">
            {isApproved
              ? '✓ Mrs. Kavita Rao approved intervention package for Aarav Sharma (Homework drop).'
              : '1 teacher intervention awaiting approval.'}
          </p>
          <div className="pt-1 text-[11px] font-bold text-[#22C55E] flex items-center gap-2">
            <span>84% Success Rate Tracked in School Memory</span>
          </div>
        </div>
      </div>
    </section>
  );
}
