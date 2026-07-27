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
    <div className="space-y-3">
      {/* Dynamic Worksheet Task if Approved */}
      {isApproved && (
        <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/40 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-[#111827]">Algebra Practice Worksheet B Added</span>
            <p className="text-[10px] text-[#6B7280]">Assigned by Mrs. Kavita Rao &bull; 15 mins</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#0F766E] text-white">
            Active Task
          </span>
        </div>
      )}

      {/* Task Stack */}
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
    </div>
  );
}
