'use client';

import React from 'react';
import Image from 'next/image';
import { PreparedActionItem, approveCopilotAction, undoCopilotAction } from '@/lib/copilot/copilotEngine';
import { TrustPanel } from './TrustPanel';

interface CopilotCardProps {
  item: PreparedActionItem;
}

export function CopilotCard({ item }: CopilotCardProps) {
  const isApproved = item.status === 'approved';

  return (
    <div
      className={`rounded-2xl p-6 border transition-all duration-300 space-y-5 bg-white ${
        isApproved
          ? 'border-[#22C55E]/40 shadow-xs opacity-90'
          : 'border-[#E5E7EB] shadow-md hover:shadow-lg'
      }`}
    >
      {/* Card Top Banner */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {item.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#E5E7EB] shrink-0">
              <Image src={item.avatar} alt={item.studentName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#F5F8FF] text-[#0F766E] font-bold flex items-center justify-center border border-[#E5E7EB]">
              🎓
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-[#111827]">{item.studentName}</h4>
              <span
                className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  item.priority === 'high'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : item.priority === 'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {item.priority === 'high' ? '🔴 Priority Alert' : item.priority === 'medium' ? '🟡 Notice' : '🟢 Info'}
              </span>
            </div>
            <p className="text-xs font-bold text-[#111827] mt-0.5">{item.title}</p>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
            isApproved
              ? 'bg-[#F4FBF7] text-[#0F766E] border-[#22C55E]/40'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {isApproved ? '✓ Approved & Syncing' : 'Needs Review'}
        </span>
      </div>

      {/* WHY I FLAGGED THIS (Evidence Signals) */}
      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2">
        <span className="text-[10px] font-mono font-extrabold text-[#6B7280] uppercase tracking-wider block">
          🔍 WHY I FLAGGED THIS (Signals Detected)
        </span>
        <ul className="space-y-1 text-xs text-[#111827] font-medium">
          {item.whyFlagged.map((flag, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-red-500 font-bold">•</span>
              {flag}
            </li>
          ))}
        </ul>
      </div>

      {/* AI PREPARED ACTIONS */}
      <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22C55E]/30 space-y-2">
        <span className="text-[10px] font-mono font-extrabold text-[#0F766E] uppercase tracking-wider block">
          ✨ AI PREPARED (Ready for Review)
        </span>
        <ul className="space-y-1.5 text-xs text-[#111827] font-medium">
          {item.preparedActions.map((act, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#22C55E] font-bold">✓</span>
              <div>
                <span className="font-extrabold text-[#111827]">{act.label}:</span>{' '}
                <span className="text-[#6B7280]">{act.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* EXPECTED IMPACT & TIME SAVED */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#6B7280] border-t border-b border-[#E5E7EB] py-2.5 px-1 font-mono">
        <span>⏱️ {item.expectedImpact.approvalTime}</span>
        <span className="text-[#0F766E] font-bold">💡 {item.expectedImpact.timeSaved}</span>
      </div>

      {/* TRUST PANEL (Collapsible Evidence) */}
      <TrustPanel
        signalsUsed={item.trustSignals.used}
        signalsIgnored={item.trustSignals.ignored}
        confidenceScore={item.confidenceScore}
        reasoning={item.trustSignals.reasoning}
        historicalEvidence={{
          id: 'hist_1',
          pattern: item.trustSignals.reasoning,
          count: item.historicalEvidence.casesCount,
          interventions: [
            {
              name: 'Parent Message + Teacher Check-in',
              successRate: item.historicalEvidence.successRate,
              description: 'Standard 1-click support package',
            },
          ],
          recommendedApproach: item.historicalEvidence.recommendedApproach,
        }}
      />

      {/* CONTROLS */}
      <div className="flex items-center justify-between pt-1">
        {isApproved ? (
          <div className="flex items-center gap-3 w-full justify-between">
            <span className="text-xs font-mono font-bold text-[#0F766E]">
              ✓ Action Approved &amp; Cross-Portal Sync Active
            </span>
            <button
              type="button"
              onClick={() => undoCopilotAction(item.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:bg-slate-100 transition-colors"
            >
              ↩ Undo Approval
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full justify-end">
            <button
              type="button"
              onClick={() => approveCopilotAction(item.id)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0F766E] hover:bg-[#0d665f] text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
            >
              ✓ Approve All Actions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
