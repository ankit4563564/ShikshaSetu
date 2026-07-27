'use client';

import React, { useState, useEffect } from 'react';
import { getCopilotState, subscribeCopilotState, approveCopilotAction, undoCopilotAction, setDrawerOpen } from '@/lib/copilot/copilotEngine';
import { TrustPanel } from './TrustPanel';

export function TeacherCopilotStrip() {
  const [state, setState] = useState(getCopilotState());

  useEffect(() => {
    return subscribeCopilotState((s) => setState(s));
  }, []);

  const item = state.items.find((i) => i.id === 'act_001') || state.items[0];
  const isApproved = item.status === 'approved';

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-md space-y-5 my-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F4FBF7] border border-[#22C55E]/30 px-3.5 py-1 rounded-full mb-2">
            <span className="text-[#0F766E] text-xs">🧠</span>
            <span className="text-[11px] font-mono font-extrabold text-[#0F766E] uppercase tracking-wider">
              SHIKSHASETU COPILOT &bull; TEACHER ASSISTANT
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#111827]">
            Good morning, Mrs. Rao.
          </h3>
          <p className="text-xs text-[#6B7280] font-medium">
            Today&apos;s Mission: {state.reviewQueue.needsReview} action requiring your approval &bull; Est. 11 mins saved.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 bg-[#F8FAFC] hover:bg-white text-[#111827] border border-[#E5E7EB] px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all"
        >
          <span>🧠 Open Copilot</span>
          <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded">Cmd + K</span>
        </button>
      </div>

      {/* Main Action Recommendation */}
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-[#111827] flex items-center gap-2">
            <span className="text-red-500 font-extrabold">🔴</span> {item.studentName}: {item.title}
          </h4>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isApproved
                ? 'bg-[#F4FBF7] text-[#0F766E] border-[#22C55E]/40'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isApproved ? '✓ Approved & Syncing' : 'Needs Review'}
          </span>
        </div>

        {/* Why Flagged */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5 text-xs">
          <span className="text-[10px] font-mono font-extrabold text-[#6B7280] uppercase tracking-wider block">
            🔍 WHY I FLAGGED THIS
          </span>
          <ul className="space-y-1 text-[#111827] font-medium">
            {item.whyFlagged.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-red-500 font-bold">•</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* AI Prepared Actions */}
        <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/30 space-y-1.5 text-xs">
          <span className="text-[10px] font-mono font-extrabold text-[#0F766E] uppercase tracking-wider block">
            ✨ AI PREPARED (1-Click Actions)
          </span>
          <ul className="space-y-1 text-[#111827] font-medium">
            {item.preparedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#22C55E] font-bold">✓</span>
                <div>
                  <span className="font-extrabold">{a.label}:</span>{' '}
                  <span className="text-[#6B7280]">{a.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Impact */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#6B7280] font-mono border-t border-b border-[#E5E7EB] py-2 px-1">
          <span>⏱️ {item.expectedImpact.approvalTime}</span>
          <span className="text-[#0F766E] font-bold">💡 {item.expectedImpact.timeSaved}</span>
        </div>

        {/* Trust Panel */}
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

        {/* Actions Controls */}
        <div className="pt-2 flex justify-end">
          {isApproved ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold text-[#0F766E]">
                ✓ Intervention Active &bull; Parent &amp; Student Portals Synced Live
              </span>
              <button
                type="button"
                onClick={() => undoCopilotAction(item.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:bg-slate-100"
              >
                ↩ Undo Approval
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => approveCopilotAction(item.id)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0F766E] hover:bg-[#0d665f] text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
            >
              ✓ Approve All Actions
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
