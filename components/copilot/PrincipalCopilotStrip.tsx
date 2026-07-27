'use client';

import React, { useState, useEffect } from 'react';
import { getCopilotState, subscribeCopilotState } from '@/lib/copilot/copilotEngine';

export function PrincipalCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const aaravAction = state.items.find((i) => i.id === 'act_001');
  const isApproved = aaravAction?.status === 'approved';

  return (
    <div className="space-y-3 text-xs">
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between font-bold text-slate-200">
          <span>Grade 8 Attendance Flag</span>
          <span className="text-[10px] font-mono text-amber-400">Needs Observation</span>
        </div>
        <p className="text-slate-400">
          Morning attendance dropped by 4.2% due to Route #04 rain delay.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-[#F4FBF7]/10 border border-[#22C55E]/30 space-y-1.5">
        <div className="flex items-center justify-between font-bold text-emerald-400">
          <span>Active Intervention Status</span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            {isApproved ? '8 Active' : '7 Active'}
          </span>
        </div>
        <p className="text-slate-300">
          {isApproved
            ? 'Mrs. Kavita Rao approved intervention package for Aarav Sharma.'
            : '1 teacher intervention awaiting approval.'}
        </p>
      </div>
    </div>
  );
}
