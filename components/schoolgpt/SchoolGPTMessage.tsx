'use client';

import { motion } from 'framer-motion';

interface SchoolGPTMessageProps {
  role: 'user' | 'assistant';
  content: string;
  userQuery?: string;
  sources?: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'GENERAL' | 'LIMITED';
}

export default function SchoolGPTMessage({
  role,
  content,
  userQuery = '',
  sources = ['School Telemetry Database', 'Live Student Portal'],
  confidence = 'HIGH',
}: SchoolGPTMessageProps) {
  const isUser = role === 'user';

  // Detect Intent Mode based on query content
  const q = userQuery.toLowerCase() + ' ' + content.toLowerCase();

  const isTimelineMode = q.includes('timeline') || q.includes('today') || q.includes('schedule') || q.includes('happened');
  const isStudentReportMode = q.includes('report') || q.includes('aarav') || q.includes('profile');
  const isClassAnalyticsMode = q.includes('class') || q.includes('8a') || q.includes('performing') || q.includes('health');
  const isComparisonMode = q.includes('compare') || q.includes('term') || q.includes('versus');
  const isActionMode = q.includes('check in') || q.includes('who should') || q.includes('action');
  const isParentSummaryMode = q.includes('parent') || q.includes('ptm') || q.includes('update');

  const confidenceBadge = {
    HIGH: { label: 'High Confidence (Verified Telemetry)', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    MEDIUM: { label: 'Medium Confidence (Knowledge Engine)', style: 'bg-sky-50 text-sky-800 border-sky-200' },
    GENERAL: { label: 'General Knowledge (AI Core)', style: 'bg-purple-50 text-purple-800 border-purple-200' },
    LIMITED: { label: 'Limited Offline Context', style: 'bg-amber-50 text-amber-800 border-amber-200' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full py-4 ${
        isUser
          ? 'border-b border-slate-100'
          : 'bg-slate-50/60 border border-slate-200/80 rounded-3xl p-5 sm:p-7 my-4 shadow-2xs'
      }`}
    >
      <div className="flex gap-3.5 items-start">
        {/* Avatar */}
        <div
          className={`h-9 w-9 rounded-2xl flex items-center justify-center font-display text-xs font-black select-none shrink-0 shadow-2xs ${
            isUser ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs'
          }`}
        >
          {isUser ? 'U' : '✨'}
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
            <span className="font-display text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <span>{isUser ? 'User Request' : 'SchoolGPT Adaptive Intelligence Workspace'}</span>
              {!isUser && (
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wider">
                  {isTimelineMode
                    ? 'Timeline Mode'
                    : isStudentReportMode
                    ? 'Student Report Mode'
                    : isClassAnalyticsMode
                    ? 'Class Analytics Mode'
                    : isComparisonMode
                    ? 'Comparison Mode'
                    : isActionMode
                    ? 'Action Mode'
                    : isParentSummaryMode
                    ? 'Parent Summary Mode'
                    : 'Search Mode'}
                </span>
              )}
            </span>
            {!isUser && confidence && (
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${confidenceBadge[confidence].style}`}>
                ● {confidenceBadge[confidence].label}
              </span>
            )}
          </div>

          {/* User Message View */}
          {isUser ? (
            <p className="font-display text-sm font-extrabold text-slate-900 leading-relaxed">
              {content}
            </p>
          ) : (
            <div className="space-y-5">
              {/* MODE 1: TIMELINE MODE */}
              {isTimelineMode && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                      Today&apos;s Real-Time Timeline Stream
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ● 5 Events Verified Today
                    </span>
                  </div>
                  <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 font-body">
                    {[
                      { time: '08:05 AM', title: 'Campus Gate Entry & Attendance', desc: 'RFID verified at Main Gate #1. Marked Present.', tag: 'Gate Scan' },
                      { time: '09:20 AM', title: 'Mathematics Homework Submission', desc: 'Algebraic equations assignment submitted online (Score: 94%).', tag: 'Academic' },
                      { time: '10:10 AM', title: 'Chapter 4 Physics Quiz Completed', desc: 'Completed in 15 mins. Class rank #3.', tag: 'Quiz' },
                      { time: '11:30 AM', title: 'Parent Telemetry Inquiry', desc: 'Mother inquired about Saket Bus Route #4 evening stop ETA.', tag: 'Message' },
                      { time: '01:00 PM', title: 'Teacher Positive Note (Ms. Mehra)', desc: 'Excellent group leadership during Science Lab experiment.', tag: 'Behavior' },
                    ].map((evt, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-slate-900 ring-4 ring-white" />
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{evt.time}</span>
                            <h5 className="font-display text-xs font-extrabold text-slate-900">{evt.title}</h5>
                            <p className="text-[11px] text-slate-600 mt-0.5">{evt.desc}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
                            {evt.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE 2: STUDENT REPORT MODE */}
              {isStudentReportMode && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-display text-base font-extrabold flex items-center justify-center">
                        AS
                      </div>
                      <div>
                        <h4 className="font-display text-base font-extrabold text-slate-900">Aarav Sharma &bull; Class 8A</h4>
                        <p className="text-xs font-semibold text-slate-500">Roll #08 &bull; Roll of Honor &bull; Safe &amp; Present Today</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold self-start sm:self-center">
                      Term 3 Average: 92% (Grade A)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance</span>
                      <strong className="text-xs font-black text-emerald-700 block mt-0.5">98% (Safe)</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Homework</span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5">94% Done</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Growth</span>
                      <strong className="text-xs font-black text-emerald-700 block mt-0.5">↗ +14% Term 3</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Behaviour</span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5">Exemplary</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1.5">
                    <h5 className="font-display text-xs font-black uppercase tracking-wider text-slate-300">AI Summary</h5>
                    <p className="font-body text-xs text-slate-200 leading-relaxed">
                      &ldquo;Aarav continues to demonstrate top 10% academic performance across Mathematics and Literature. Science lab work is strong, though Forces &amp; Motion problem-solving can benefit from advanced Olympiad exercises.&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* MODE 3: CLASS ANALYTICS MODE */}
              {isClassAnalyticsMode && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-display text-base font-extrabold text-slate-900">Class 8A Command Center</h4>
                      <p className="text-xs font-semibold text-slate-500">14 Active Students &bull; Mathematics &amp; Science Coordinator</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 border border-emerald-300 rounded-full text-xs font-extrabold">
                      Class Health: 94% Stable
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance Rate</span>
                      <strong className="font-display text-sm font-extrabold text-emerald-700 block mt-0.5">95% Present Today</strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Homework Completion</span>
                      <strong className="font-display text-sm font-extrabold text-slate-900 block mt-0.5">88% Submitted</strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Students Needing Focus</span>
                      <strong className="font-display text-sm font-extrabold text-amber-700 block mt-0.5">2 (Priya, Rohan)</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 4: COMPARISON MODE */}
              {isComparisonMode && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                    Term 1 vs Term 3 Academic Growth Visualizer
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Term 1 Baseline</span>
                      <strong className="text-lg font-black text-slate-700 block">78% Class Average</strong>
                      <span className="text-[10px] text-slate-500 block">Initial Benchmark</span>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block">Term 3 Current</span>
                      <strong className="text-lg font-black text-emerald-800 block">88% Class Average</strong>
                      <span className="text-[10px] font-bold text-emerald-700 block">↗ +10% Net Improvement</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 5: ACTION MODE */}
              {isActionMode && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                      Priority Student Support Radar
                    </h4>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      94% AI Confidence
                    </span>
                  </div>

                  <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <h5 className="font-display text-xs font-extrabold text-amber-900">Priya Patel (Class 8A)</h5>
                      <p className="text-[11px] font-body text-amber-800 mt-0.5">
                        Homework completion dropped 30% over 14 days. Brief homeroom check-in recommended.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-all shrink-0 active:scale-95"
                    >
                      📅 Schedule Check-in
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 6: PARENT SUMMARY MODE */}
              {isParentSummaryMode && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                      Parent Communication Update Draft
                    </h4>
                    <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                      Ready to Send
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 font-body text-xs text-slate-700">
                    <p className="font-bold text-slate-900">Dear Sunita Sharma,</p>
                    <p>
                      Aarav has had a fantastic week in Class 8A! His mathematics score reached 94% on the latest quiz, and his classroom participation was exemplary. Attendance remains 98% present.
                    </p>
                    <p className="font-semibold text-slate-600">
                      Next Step: Chapter 4 Science revision sprint scheduled for Friday.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-2xs hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>✉️</span> Send Update to Parent via Portal
                  </button>
                </div>
              )}

              {/* MODE 7: DEFAULT SEARCH & EXECUTIVE TEXT CARD */}
              {!isTimelineMode && !isStudentReportMode && !isClassAnalyticsMode && !isComparisonMode && !isActionMode && !isParentSummaryMode && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
                  <h5 className="font-display text-sm font-extrabold text-slate-900 leading-snug">
                    {content.split('\n\n')[0]}
                  </h5>
                  {content.split('\n\n').slice(1).join('\n\n') && (
                    <p className="font-body text-xs text-slate-600 leading-relaxed font-medium pt-2 border-t border-slate-100">
                      {content.split('\n\n').slice(1).join('\n\n')}
                    </p>
                  )}
                </div>
              )}

              {/* Verified Sources Chips */}
              {sources && sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Verified Evidence Sources &amp; Telemetry
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src) => (
                      <span
                        key={src}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        <span>📄</span>
                        <span>{src}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
