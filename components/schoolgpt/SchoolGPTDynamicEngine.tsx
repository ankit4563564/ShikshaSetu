'use client';

import { motion } from 'framer-motion';
import { STUDENTS_DATA } from '@/lib/demo-data/students';
import { SUPPORT_RADAR_DATA } from '@/lib/demo-data/supportRadar';
import { GUARDIAN_JOURNEY_DATA } from '@/lib/demo-data/guardianJourney';

interface DynamicEngineProps {
  intent: 'STUDENT_REPORT' | 'CLASS_ANALYTICS' | 'COMPARISON' | 'TIMELINE' | 'ACTION' | 'PARENT_SUMMARY' | 'SEARCH';
  queryText?: string;
}

export default function SchoolGPTDynamicEngine({ intent, queryText = '' }: DynamicEngineProps) {
  const aarav = STUDENTS_DATA[0];
  const priya = STUDENTS_DATA[1];

  switch (intent) {
    case 'STUDENT_REPORT':
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-body">
          {/* Header Card */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-display text-base font-extrabold flex items-center justify-center">
                  AS
                </div>
                <div>
                  <h4 className="font-display text-base font-extrabold text-slate-900">{aarav.name} &bull; {aarav.classGrade}-{aarav.section}</h4>
                  <p className="text-xs font-semibold text-slate-500">Roll #{aarav.rollNumber} &bull; Admission: {aarav.admissionNumber}</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold self-start sm:self-center">
                Term 3 Avg: {aarav.overallTerm3Average}% (Grade A)
              </span>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance</span>
                <strong className="text-xs font-black text-emerald-700 block mt-0.5">{aarav.attendancePct}% (Safe)</strong>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Homework</span>
                <strong className="text-xs font-black text-slate-900 block mt-0.5">{aarav.homeworkCompletionPct}% Done</strong>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Growth</span>
                <strong className="text-xs font-black text-emerald-700 block mt-0.5">↗ +{aarav.growthTrendPct}% Term 3</strong>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Behaviour</span>
                <strong className="text-xs font-black text-slate-900 block mt-0.5">{aarav.behaviourStatus}</strong>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1.5">
              <h5 className="font-display text-xs font-black uppercase tracking-wider text-slate-300">AI Intelligence Summary</h5>
              <p className="font-body text-xs text-slate-200 leading-relaxed font-medium">
                &ldquo;{aarav.storySnippet}&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      );

    case 'CLASS_ANALYTICS':
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-body">
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-display text-base font-extrabold text-slate-900">Class 8A Command Center</h4>
                <p className="text-xs font-semibold text-slate-500">14 Active Students &bull; Mathematics &amp; Science Coordinator</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold">
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
        </motion.div>
      );

    case 'TIMELINE':
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-body">
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                Today&apos;s Real-Time Timeline Stream
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ● 6 Telemetry Events Logged
              </span>
            </div>

            <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 font-body">
              {GUARDIAN_JOURNEY_DATA.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-slate-900 ring-4 ring-white" />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{evt.timestamp}</span>
                      <h5 className="font-display text-xs font-extrabold text-slate-900">{evt.stepName}</h5>
                      <p className="text-[11px] text-slate-600 mt-0.5">{evt.details}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
                      {evt.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );

    case 'ACTION':
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-body">
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                Support Radar Action List
              </h4>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                94% AI Confidence
              </span>
            </div>

            {SUPPORT_RADAR_DATA.map((sig) => (
              <div key={sig.studentId} className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h5 className="font-display text-xs font-extrabold text-amber-900">{sig.studentName}</h5>
                  <p className="text-[11px] font-body text-amber-800 mt-0.5">{sig.recommendation}</p>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-all shrink-0 active:scale-95"
                >
                  {sig.suggestedAction}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      );

    default:
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-3 font-body">
          <h5 className="font-display text-sm font-extrabold text-slate-900">
            ShikshaSetu Central Knowledge Engine
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            &ldquo;School operates Monday to Friday 08:00 AM to 02:30 PM. All student RFID gate scans and bus arrival telemetry are logged live.&rdquo;
          </p>
        </motion.div>
      );
  }
}
