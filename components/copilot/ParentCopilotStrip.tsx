'use client';

import React, { useState, useEffect } from 'react';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';

export function ParentCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  return (
    <div className="space-y-4">
      {/* Reactive Message Banner if Teacher Approved */}
      {isApproved ? (
        <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/40 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#0F766E] font-bold">New Teacher Update (Mrs. Kavita Rao)</span>
            <span className="text-[#22C55E] font-bold">Just Now</span>
          </div>
          <p className="text-xs font-medium text-[#111827]">
            &ldquo;Hi Priya, Aarav missed homework for 3 days. I prepared an extra practice sheet and scheduled a check-in for tomorrow.&rdquo;
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 font-mono">
          No new alerts. Aarav is attending class normally.
        </div>
      )}

      {/* Live Telemetry Overview */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
          <span className="text-[#22C55E] font-bold block text-[10px] uppercase font-mono">Gate Scan</span>
          <p className="font-bold text-[#111827]">08:14 AM</p>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
          <span className="text-[#0F766E] font-bold block text-[10px] uppercase font-mono">Bus #04</span>
          <p className="font-bold text-[#111827]">8 Mins ETA</p>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
          <span className="text-[#3b82f6] font-bold block text-[10px] uppercase font-mono">Homework</span>
          <p className="font-bold text-[#111827]">65 Mins Est.</p>
        </div>
      </div>
    </div>
  );
}
