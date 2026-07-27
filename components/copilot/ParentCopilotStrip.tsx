'use client';

import React, { useState, useEffect } from 'react';
import { getCopilotState, subscribeCopilotState, setDrawerOpen } from '@/lib/copilot/copilotEngine';

export function ParentCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-md space-y-4 my-6">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">👨‍👩‍👧</span>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#111827]">
              Today&apos;s Plan &bull; Aarav Sharma
            </h3>
            <p className="text-xs text-[#6B7280] font-medium">
              Guided by ShikshaSetu Copilot
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="text-xs font-mono font-bold text-[#0F766E] hover:underline"
        >
          View Full Briefing →
        </button>
      </div>

      {/* Reactive Message Banner if Teacher Approved */}
      {isApproved && (
        <div className="p-4 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/40 space-y-1 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#0F766E] font-bold">📲 New Teacher Update (Mrs. Kavita Rao)</span>
            <span className="text-[#22C55E] font-bold">Just Now</span>
          </div>
          <p className="text-xs font-medium text-[#111827]">
            &ldquo;Hi Priya, Aarav missed homework for 3 days. I have prepared an extra practice sheet and scheduled a 10-minute check-in for tomorrow.&rdquo;
          </p>
        </div>
      )}

      {/* Live Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
          <span className="text-[#22C55E] font-bold block">✓ Gate Scan Entry</span>
          <p className="font-bold text-[#111827]">08:14 AM &bull; Gate #2 RFID</p>
          <p className="text-[11px] text-[#6B7280]">Safely on campus</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
          <span className="text-[#0F766E] font-bold block">🚌 Bus #04 ETA</span>
          <p className="font-bold text-[#111827]">Sector 12 Stop &bull; 8 Mins</p>
          <p className="text-[11px] text-[#6B7280]">On-time evening route</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
          <span className="text-[#3b82f6] font-bold block">📝 Homework Mode</span>
          <p className="font-bold text-[#111827]">Science &amp; Algebra</p>
          <p className="text-[11px] text-[#6B7280]">Est. 65 mins today</p>
        </div>
      </div>
    </section>
  );
}
