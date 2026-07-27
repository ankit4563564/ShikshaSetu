'use client';

import React, { useState, useEffect } from 'react';
import { getCopilotState, subscribeCopilotState, approveCopilotAction, undoCopilotAction } from '@/lib/copilot/copilotEngine';
import { TrustPanel } from './TrustPanel';

export function TeacherCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const item = state.items.find((i) => i.id === 'act_001') || state.items[0];
  const isApproved = item.status === 'approved';

  return (
    <div className="space-y-4">
      {/* Primary Action Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-[#111827]">
            {item.studentName}: {item.title}
          </h3>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5">
            1 action requiring your approval &bull; Est. 11 mins saved
          </p>
        </div>
        <span
          className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            isApproved
              ? 'bg-[#F4FBF7] text-[#0F766E] border-[#22C55E]/40'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {isApproved ? 'Approved & Syncing' : 'Needs Review'}
        </span>
      </div>

      {/* Signals Detected */}
      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
          Signals Flagged
        </span>
        <ul className="space-y-0.5 text-[#111827] font-medium">
          {item.whyFlagged.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-red-500 font-bold">•</span> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* AI Prepared Actions */}
      <div className="p-3 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/30 space-y-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-[#0F766E] uppercase tracking-wider block">
          Prepared Intervention Package
        </span>
        <ul className="space-y-1 text-[#111827] font-medium">
          {item.preparedActions.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#22C55E] font-bold">✓</span>
              <div>
                <span className="font-bold">{a.label}:</span> <span className="text-[#6B7280]">{a.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Expected Outcome */}
      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider block">
          Expected Outcome
        </span>
        <p className="text-[#111827] font-medium leading-relaxed">
          Parent informed today, targeted practice sheet assigned, and teacher check-in scheduled before Friday assessment.
        </p>
      </div>

      {/* Trust Panel (Explainability Evidence) */}
      <TrustPanel
        signalsUsed={item.trustSignals.used}
        signalsIgnored={item.trustSignals.ignored}
        confidenceScore={item.confidenceScore}
        reasoning={item.trustSignals.reasoning}
        historicalEvidence={{
          id: 'h1',
          pattern: item.trustSignals.reasoning,
          count: item.historicalEvidence.casesCount,
          interventions: [
            { name: 'Parent Message + Teacher Check-in', successRate: item.historicalEvidence.successRate, description: '' },
          ],
          recommendedApproach: item.historicalEvidence.recommendedApproach,
        }}
      />
    </div>
  );
}
