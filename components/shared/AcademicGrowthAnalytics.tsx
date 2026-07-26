'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubjectGrowthData {
  subject: string;
  icon: string;
  term1Score: number;
  term2Score: number;
  term3Score: number;
  trend: 'rising' | 'stable' | 'slipping';
  growthPct: number;
  strongestTopic: string;
  weakestTopic: string;
  strugglingCount: number;
  masteryBreakdown: { skill: string; score: number; strugglingStudents: number; action: string }[];
  aiIntervention: string;
}

const SAMPLE_GROWTH_DATA: SubjectGrowthData[] = [
  {
    subject: 'Mathematics',
    icon: '📐',
    term1Score: 78,
    term2Score: 84,
    term3Score: 92,
    trend: 'rising',
    growthPct: 14,
    strongestTopic: 'Algebraic Equations (94%)',
    weakestTopic: 'Word Problems (76%)',
    strugglingCount: 2,
    masteryBreakdown: [
      { skill: 'Algebraic Equations', score: 94, strugglingStudents: 0, action: 'Ready for Olympiad Challenge' },
      { skill: 'Geometry & Angles', score: 88, strugglingStudents: 1, action: 'Assign Practice Set A' },
      { skill: 'Word Problems', score: 76, strugglingStudents: 3, action: 'Assign 10-Min Remediation Sprint' },
    ],
    aiIntervention: 'Performing in top 10% of class. Ready for advanced Olympiad problem sets.',
  },
  {
    subject: 'Science (Physics & Chem)',
    icon: '🧪',
    term1Score: 88,
    term2Score: 82,
    term3Score: 76,
    trend: 'slipping',
    growthPct: -12,
    strongestTopic: 'Chemical Reactions (85%)',
    weakestTopic: 'Forces & Motion (62%)',
    strugglingCount: 4,
    masteryBreakdown: [
      { skill: 'Chemical Reactions', score: 85, strugglingStudents: 1, action: 'Routine Practice' },
      { skill: 'Forces & Motion', score: 62, strugglingStudents: 5, action: 'Assign Newton 2nd Law Review' },
      { skill: 'Lab Experiments', score: 80, strugglingStudents: 2, action: 'Group Lab Activity' },
    ],
    aiIntervention: 'Slipping in Forces & Motion. Recommended: 10-minute Socratic review on Newton\'s 2nd Law.',
  },
  {
    subject: 'English & Literature',
    icon: '📚',
    term1Score: 80,
    term2Score: 82,
    term3Score: 83,
    trend: 'stable',
    growthPct: 3,
    strongestTopic: 'Grammar & Vocabulary (90%)',
    weakestTopic: 'Reading Comprehension (78%)',
    strugglingCount: 1,
    masteryBreakdown: [
      { skill: 'Grammar & Vocabulary', score: 90, strugglingStudents: 0, action: 'Advanced Vocabulary' },
      { skill: 'Essay Composition', score: 82, strugglingStudents: 2, action: 'Structure Review' },
      { skill: 'Reading Comprehension', score: 78, strugglingStudents: 3, action: 'Paragraph Summarization' },
    ],
    aiIntervention: 'Steady progress (+3%). Reading comprehension exercises will boost overall score to 90%+.',
  },
  {
    subject: 'Social Studies & History',
    icon: '🌍',
    term1Score: 72,
    term2Score: 79,
    term3Score: 86,
    trend: 'rising',
    growthPct: 14,
    strongestTopic: 'Historical Timeline (88%)',
    weakestTopic: 'Civics & Governance (86%)',
    strugglingCount: 1,
    masteryBreakdown: [
      { skill: 'Historical Timeline', score: 88, strugglingStudents: 1, action: 'Timeline Practice' },
      { skill: 'Geography Maps', score: 84, strugglingStudents: 2, action: 'Map Identification' },
      { skill: 'Civics & Governance', score: 86, strugglingStudents: 1, action: 'Constitution Quiz' },
    ],
    aiIntervention: 'Strong upward trajectory (+14%). Map reading skills show high accuracy.',
  },
];

interface AcademicGrowthAnalyticsProps {
  studentName?: string;
  isParentView?: boolean;
}

export default function AcademicGrowthAnalytics({
  studentName = 'Aarav Sharma',
  isParentView = false,
}: AcademicGrowthAnalyticsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeSubjectData = SAMPLE_GROWTH_DATA.find((s) => s.subject === selectedSubject) || SAMPLE_GROWTH_DATA[0];

  const overallAvg = Math.round(
    SAMPLE_GROWTH_DATA.reduce((acc, curr) => acc + curr.term3Score, 0) / SAMPLE_GROWTH_DATA.length
  );

  return (
    <div className="academic-growth-analytics rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* 1. AI CLASS SUMMARY HERO */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <h3 className="font-display text-xs font-black uppercase tracking-widest text-slate-300">
              SchoolGPT Academic Intelligence Summary
            </h3>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Overall Term Avg: {overallAvg}% (Grade A) &bull; ↗ +7% vs Term 1
          </span>
        </div>
        <p className="font-body text-xs leading-relaxed text-slate-200 font-medium">
          &ldquo;Overall class performance improved by <strong>7%</strong> this term for {studentName}. <strong>Mathematics</strong> showed the strongest growth (+14%) after weekly practice sessions, while <strong>Science</strong> declined (-12%) mainly due to low scores in Forces &amp; Motion. A 10-minute revision sprint is recommended.&rdquo;
        </p>
      </div>

      {/* 2. TERM COMPARISON BENCHMARK BAR */}
      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Term Comparison Benchmark</span>
          <strong className="font-display text-xs font-extrabold text-slate-900">Term 1 (78%) &rarr; Term 2 (82%) &rarr; Term 3 ({overallAvg}%)</strong>
        </div>
        <div className="flex items-center gap-2 font-mono font-bold text-slate-600">
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg">Class Avg: {overallAvg}%</span>
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg">School Avg: 84%</span>
        </div>
      </div>

      {/* 3. ENRICHED SUBJECT CARDS GRID */}
      <div>
        <h4 className="font-display text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
          Subject Performance &amp; Trends
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_GROWTH_DATA.map((s) => {
            const isSelected = s.subject === selectedSubject;
            return (
              <motion.div
                key={s.subject}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedSubject(s.subject)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200/80 bg-white hover:border-slate-400 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{s.icon}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isSelected
                        ? s.trend === 'rising' ? 'bg-emerald-500/20 text-emerald-300' : s.trend === 'slipping' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-200'
                        : s.trend === 'rising' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : s.trend === 'slipping' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {s.trend === 'rising' ? `↗ +${s.growthPct}%` : s.trend === 'slipping' ? `↘ ${s.growthPct}%` : '→ Stable'}
                  </span>
                </div>

                <h5 className="font-display text-sm font-extrabold mt-3 truncate">{s.subject}</h5>
                <div className="text-2xl font-black font-display mt-0.5">{s.term3Score}%</div>

                {/* Sparkline & Details */}
                <div className={`mt-3 pt-2 border-t text-[11px] space-y-1 ${isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-500'}`}>
                  <div className="flex justify-between font-mono font-bold">
                    <span>Sparkline:</span>
                    <span>[{s.term1Score}% &rarr; {s.term2Score}% &rarr; {s.term3Score}%]</span>
                  </div>
                  <div className="truncate font-medium">💪 Best: {s.strongestTopic}</div>
                  <div className="truncate font-medium">⚠️ Weak: {s.weakestTopic}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. TOPIC ANALYSIS & SCHOOLGPT ACADEMIC INSIGHTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Topic Mastery Breakdown */}
        <div className="lg:col-span-2 space-y-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-display text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>{activeSubjectData.icon}</span> {activeSubjectData.subject} Topic Breakdown
            </h4>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Current Mastery: {activeSubjectData.term3Score}%
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {activeSubjectData.masteryBreakdown.map((m) => (
              <div key={m.skill} className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{m.skill}</span>
                  <span className={m.score >= 85 ? 'text-emerald-700 font-extrabold' : m.score >= 70 ? 'text-sky-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                    {m.score}% Mastery
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    style={{ width: `${m.score}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.score >= 85 ? 'bg-emerald-500' : m.score >= 70 ? 'bg-sky-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1">
                  <span>👥 {m.strugglingStudents === 0 ? 'Zero students struggling' : `${m.strugglingStudents} student(s) need support`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`✓ ${m.action} assigned for ${m.skill}!`);
                      setTimeout(() => setToastMessage(null), 4000);
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 text-slate-900 rounded-lg font-bold text-[10px] transition-all"
                  >
                    Action: {m.action} &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SchoolGPT Insights Panel (Soft Tinted Background) */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <span>✨</span> SchoolGPT AI Insights
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biggest Improvement</span>
              <strong className="font-display font-extrabold text-emerald-700 block mt-0.5">Mathematics (+14% Growth)</strong>
            </div>

            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biggest Concern</span>
              <strong className="font-display font-extrabold text-rose-700 block mt-0.5">Science (Forces &amp; Motion - 62%)</strong>
            </div>

            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Root Cause</span>
              <p className="font-body text-slate-600 mt-0.5">Conceptual gap in multi-step problem formulation under timed conditions.</p>
            </div>

            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Strategy</span>
              <p className="font-body text-slate-600 mt-0.5">Use visual bar models during Friday 10-minute remediation sprint.</p>
            </div>
          </div>

          {/* 5. PREDICTIVE INSIGHTS BOX */}
          <div className="p-4 bg-sky-50/80 border border-sky-200/80 rounded-2xl space-y-1.5 text-xs">
            <h5 className="font-display font-extrabold text-sky-900 flex items-center gap-1.5">
              <span>🔮</span> Predictive Forward Insights
            </h5>
            <ul className="space-y-1 font-body text-sky-800 text-[11px] font-semibold">
              <li>&bull; Science scores predicted to improve +5–8% after revision sprint.</li>
              <li>&bull; 6 students are ready for advanced level math challenge questions.</li>
              <li>&bull; 3 students may require additional support before mid-terms.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              setToastMessage(`✓ 10-Min Remediation Sprint assigned for ${activeSubjectData.subject}!`);
              setTimeout(() => setToastMessage(null), 4000);
            }}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95"
          >
            {isParentView ? 'View Practice Tips &rarr;' : 'Assign 10-Min Class Sprint &rarr;'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl border border-slate-800"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
