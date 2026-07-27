'use client';

import React from 'react';
import { AIImpactMetrics } from '@/lib/copilot/impactEngine';

interface AIImpactWidgetProps {
  metrics: AIImpactMetrics;
}

export function AIImpactWidget({ metrics }: AIImpactWidgetProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
        <span className="text-xs font-mono font-extrabold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
          <span>⚡</span> Today's AI Impact Summary
        </span>
        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F4FBF7] text-[#0F766E] border border-[#22C55E]/30">
          {metrics.teacherApprovalRate}% Teacher Approval Rate
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-0.5">
          <span className="text-xs text-[#6B7280] font-mono block">Teacher Time Saved</span>
          <span className="text-lg font-extrabold text-[#0F766E] font-display">{metrics.teacherHoursSaved}</span>
        </div>

        {/* Metric 2 */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-0.5">
          <span className="text-xs text-[#6B7280] font-mono block">Communications Drafted</span>
          <span className="text-lg font-extrabold text-[#111827] font-display">{metrics.communicationsDrafted}</span>
        </div>

        {/* Metric 3 */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-0.5">
          <span className="text-xs text-[#6B7280] font-mono block">Students Supported</span>
          <span className="text-lg font-extrabold text-[#3b82f6] font-display">{metrics.studentsSupported}</span>
        </div>

        {/* Metric 4 */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-0.5">
          <span className="text-xs text-[#6B7280] font-mono block">Active Interventions</span>
          <span className="text-lg font-extrabold text-[#22C55E] font-display">{metrics.activeInterventionsCount}</span>
        </div>
      </div>
    </div>
  );
}
