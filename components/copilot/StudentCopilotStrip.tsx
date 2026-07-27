'use client';

import React, { useState, useEffect } from 'react';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';

export function StudentCopilotStrip() {
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
          <span className="text-xl">🎒</span>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#111827]">
              Today&apos;s Roadmap &bull; Finish by 5:42 PM
            </h3>
            <p className="text-xs text-[#6B7280] font-medium">
              You have enough time today to conquer every task!
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F4FBF7] text-[#0F766E] border border-[#22C55E]/30">
          🔥 14-Day Streak
        </span>
      </div>

      {/* Reactive Extra Worksheet Task if Approved */}
      {isApproved && (
        <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/40 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#22C55E] text-base font-bold">✨</span>
            <div>
              <span className="font-extrabold text-[#111827]">Algebra Practice Worksheet B Added</span>
              <p className="text-[10px] text-[#6B7280]">Assigned by Mrs. Kavita Rao &bull; 15 mins</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#0F766E] text-white">
            Start Task
          </span>
        </div>
      )}

      {/* Ordered Task Stack */}
      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
          <span className="font-bold text-[#111827]">1. Science Lab Report (Acid-Base Test)</span>
          <span className="text-[#6B7280] font-mono">Due 4:00 PM</span>
        </div>
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
          <span className="font-bold text-[#111827]">2. Mathematics Algebra Review Set</span>
          <span className="text-[#6B7280] font-mono">Due Today</span>
        </div>
      </div>
    </section>
  );
}
