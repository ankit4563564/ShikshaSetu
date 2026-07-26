'use client';

import { motion } from 'framer-motion';
import { STUDENTS_DATA } from '@/lib/demo-data/students';
import { SUPPORT_RADAR_DATA } from '@/lib/demo-data/supportRadar';
import { GUARDIAN_JOURNEY_DATA } from '@/lib/demo-data/guardianJourney';

interface DynamicEngineProps {
  intent: 'STUDENT_REPORT' | 'CLASS_ANALYTICS' | 'COMPARISON' | 'TIMELINE' | 'ACTION' | 'PARENT_SUMMARY' | 'SEARCH';
  queryText?: string;
  onSelectAction?: (actionText: string) => void;
}

export default function SchoolGPTDynamicEngine({ intent, queryText = '', onSelectAction }: DynamicEngineProps) {
  const aarav = STUDENTS_DATA[0];

  const renderFollowUpFooter = (actions: string[]) => (
    <div className="pt-4 border-t border-slate-100 space-y-2.5">
      <span className="text-[11px] font-bold text-slate-500 block">
        What would you like to do next?
      </span>
      <div className="flex flex-wrap gap-2">
        {actions.map((act) => (
          <button
            key={act}
            type="button"
            onClick={() => onSelectAction && onSelectAction(act)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 border border-slate-200/80"
          >
            {act} &rarr;
          </button>
        ))}
      </div>
    </div>
  );

  switch (intent) {
    case 'STUDENT_REPORT':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 font-body">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-display text-base font-extrabold flex items-center justify-center shadow-2xs">
                  AS
                </div>
                <div>
                  <h4 className="font-display text-base font-extrabold text-slate-900">{aarav.name}</h4>
                  <p className="text-xs font-medium text-slate-500">Class 8A &bull; Roll #{aarav.rollNumber}</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold">
                Term 3 Average: {aarav.overallTerm3Average}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance</span>
                <strong className="text-xs font-black text-emerald-700 block mt-0.5">{aarav.attendancePct}% Present</strong>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Homework</span>
                <strong className="text-xs font-black text-slate-900 block mt-0.5">{aarav.homeworkCompletionPct}% Complete</strong>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Progress</span>
                <strong className="text-xs font-black text-emerald-700 block mt-0.5">↗ +{aarav.growthTrendPct}% Term 3</strong>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Behaviour</span>
                <strong className="text-xs font-black text-slate-900 block mt-0.5">{aarav.behaviourStatus}</strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-xs text-slate-700">
              <h5 className="font-display font-extrabold text-slate-900">Learning Summary</h5>
              <p className="leading-relaxed font-medium">
                Aarav is doing very well in Mathematics and has improved steadily this term. Science has stayed about the same over the last few weeks. A little extra revision in Forces &amp; Motion could help improve confidence before the next assessment.
              </p>
            </div>

            {renderFollowUpFooter(['Compare with Class Average', 'Generate Parent Summary', 'View Attendance History', 'Message Parent'])}
          </div>
        </motion.div>
      );

    case 'CLASS_ANALYTICS':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 font-body">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-display text-base font-extrabold text-slate-900">Class 8A Summary</h4>
                <p className="text-xs font-medium text-slate-500">14 Students &bull; Mathematics &amp; Science</p>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold">
                Overall Class Health: Stable (94%)
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
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Needs Extra Support</span>
                <strong className="font-display text-sm font-extrabold text-amber-700 block mt-0.5">2 Students (Priya, Rohan)</strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-xs text-slate-700">
              <h5 className="font-display font-extrabold text-slate-900">Classroom Insight</h5>
              <p className="leading-relaxed font-medium">
                Your classroom is performing well overall. Mathematics practice sessions have led to steady growth across 80% of students. Priya Patel and Rohan Sharma would benefit from a quick supportive check-in during homeroom.
              </p>
            </div>

            {renderFollowUpFooter(['Who needs extra help today?', 'Compare this term with last term', 'Schedule Homeroom Check-in'])}
          </div>
        </motion.div>
      );

    case 'TIMELINE':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 font-body">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                Today&apos;s Learning Timeline
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ● 6 Events Logged
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
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{evt.details}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shrink-0">
                      {evt.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {renderFollowUpFooter(['Explain today\'s homework', 'Check bus location', 'View attendance details'])}
          </div>
        </motion.div>
      );

    case 'ACTION':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 font-body">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
                Students Needing Support Today
              </h4>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Updated Just Now
              </span>
            </div>

            {SUPPORT_RADAR_DATA.map((sig) => (
              <div key={sig.studentId} className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h5 className="font-display text-xs font-extrabold text-amber-900">{sig.studentName}</h5>
                  <p className="text-[11px] font-body text-amber-800 mt-0.5 font-medium">{sig.recommendation}</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-all shrink-0 active:scale-95"
                >
                  {sig.suggestedAction}
                </button>
              </div>
            ))}

            {renderFollowUpFooter(['Schedule Homeroom Check-in', 'View Priya\'s complete report', 'Send parent message'])}
          </div>
        </motion.div>
      );

    default:
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-2xs space-y-4 font-body">
          <h5 className="font-display text-sm font-extrabold text-slate-900">
            School General Guidance
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Campus operates Monday to Friday 08:00 AM to 02:30 PM. All arrival scans and student attendance records are logged automatically in real time.
          </p>
          {renderFollowUpFooter(['How is Class 8A doing?', 'Who needs attention today?', 'Explain today\'s homework'])}
        </motion.div>
      );
  }
}
