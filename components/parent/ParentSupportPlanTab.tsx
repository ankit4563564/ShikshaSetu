'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SupportPlanItem {
  id: string;
  title: string;
  description: string;
  category?: 'academic' | 'wellness' | 'behavioural' | 'attendance';
  status: 'active' | 'in_progress' | 'completed';
  nextReviewDate?: string;
  suggestedHomeSupport?: string;
}

interface ParentSupportPlanTabProps {
  studentName: string;
  evidenceLogs?: Array<{
    id: string;
    headline: string;
    bullets: string[];
    status?: string;
  }>;
  isLoading?: boolean;
}

export function ParentSupportPlanTab({
  studentName,
  evidenceLogs = [],
  isLoading = false,
}: ParentSupportPlanTabProps) {
  // Extract parent-visible support items from evidence logs or construct standard growth plan
  const visibleHighlights = evidenceLogs.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-extrabold text-deep-teal">
              Learning Help &amp; Focus
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage font-extrabold text-[10px] uppercase tracking-wider border border-sage/30">
              🌱 For {studentName}
            </span>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-medium mt-0.5">
            Teacher guidance and simple study tips at home for {studentName}.
          </p>
        </div>
      </div>

      {/* Active Academic Support Card */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-sage/30 bg-gradient-to-br from-sage/10 via-white to-primary/5 p-6 shadow-sm space-y-5"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sage font-mono">
              Current Learning Focus
            </span>
            <h4 className="font-display text-xl font-extrabold text-deep-teal leading-tight">
              Strengthen Mathematics &amp; Problem Solving
            </h4>
          </div>
          <span className="px-3 py-1 rounded-full bg-sage text-white text-xs font-bold shadow-2xs shrink-0">
            Active Plan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-deep-teal/10 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40 block">
              🗓️ Next Teacher Review
            </span>
            <p className="font-display text-sm font-extrabold text-deep-teal">
              12 September 2026
            </p>
            <p className="text-[11px] text-deep-teal/60">Reviewed with Class 8A Math teacher</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-deep-teal/10 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40 block">
              💡 Suggested Home Support
            </span>
            <p className="font-display text-sm font-extrabold text-deep-teal">
              20 mins revision / day
            </p>
            <p className="text-[11px] text-deep-teal/60">Focus on linear equation practice worksheets</p>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="space-y-2 pt-2 border-t border-deep-teal/5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-deep-teal/50 font-display">
            Milestones &amp; Learning Steps
          </span>
          <div className="space-y-2">
            {[
              {
                title: 'Review Chapter 3 Algebraic Identities',
                desc: 'Extra guided practice sheet provided by Ms. Mehra',
                done: true,
              },
              {
                title: 'Daily 20-min Home Revision Routine',
                desc: 'Encourage independent problem solving without distractions',
                done: false,
              },
              {
                title: 'Class Progress Check-in',
                desc: 'Formative evaluation after upcoming unit test',
                done: false,
              },
            ].map((milestone, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-deep-teal/5"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    milestone.done
                      ? 'bg-sage text-white'
                      : 'bg-deep-teal/10 text-deep-teal/40 border border-deep-teal/20'
                  }`}
                >
                  {milestone.done ? '✓' : idx + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-body text-xs font-bold ${
                      milestone.done ? 'text-deep-teal/60 line-through' : 'text-deep-teal'
                    }`}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-[11px] text-deep-teal/50">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Parent-Visible Teacher Observations */}
      {visibleHighlights.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold text-deep-teal">
            Teacher Notes &amp; Observations
          </h4>
          <div className="space-y-2">
            {visibleHighlights.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-deep-teal/10 bg-white p-4 shadow-xs space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sage" />
                  <h5 className="font-display text-xs font-bold text-deep-teal">
                    {log.headline}
                  </h5>
                </div>
                <ul className="space-y-1 pl-4">
                  {log.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="text-xs text-deep-teal/70 list-disc">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 rounded-2xl bg-paper border border-deep-teal/10 text-center space-y-1">
        <p className="text-xs font-semibold text-deep-teal/70">
          🔒 Protected Student Privacy
        </p>
        <p className="text-[11px] text-deep-teal/40 max-w-md mx-auto leading-relaxed">
          Support plans are curated collaboratively by educators to support your child. Sensitive internal counselor records remain confidential.
        </p>
      </div>
    </div>
  );
}
