'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SubjectGrowthData {
  subject: string;
  icon: string;
  term1Score: number;
  term2Score: number;
  term3Score: number;
  trend: 'rising' | 'stable' | 'slipping';
  growthPct: number;
  masteryBreakdown: { skill: string; score: number }[];
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
    masteryBreakdown: [
      { skill: 'Algebraic Equations', score: 94 },
      { skill: 'Geometry & Angles', score: 88 },
      { skill: 'Word Problems', score: 76 },
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
    masteryBreakdown: [
      { skill: 'Chemical Reactions', score: 85 },
      { skill: 'Forces & Motion', score: 62 },
      { skill: 'Lab Experiments', score: 80 },
    ],
    aiIntervention: 'Slipping in Forces & Motion. Recommended: 10-minute School Mitra Socratic review on Newton\'s 2nd Law.',
  },
  {
    subject: 'English & Literature',
    icon: '📚',
    term1Score: 80,
    term2Score: 82,
    term3Score: 83,
    trend: 'stable',
    growthPct: 3,
    masteryBreakdown: [
      { skill: 'Grammar & Vocabulary', score: 90 },
      { skill: 'Essay Composition', score: 82 },
      { skill: 'Reading Comprehension', score: 78 },
    ],
    aiIntervention: 'Steady progress. Reading comprehension exercises will boost overall score to 90%+.',
  },
  {
    subject: 'Social Studies & History',
    icon: '🌍',
    term1Score: 72,
    term2Score: 79,
    term3Score: 86,
    trend: 'rising',
    growthPct: 14,
    masteryBreakdown: [
      { skill: 'Historical Timeline', score: 88 },
      { skill: 'Geography Maps', score: 84 },
      { skill: 'Civics & Governance', score: 86 },
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
    <div className="academic-growth-analytics rounded-[2rem] border border-white/80 bg-white/85 p-5 sm:p-7 shadow-[0_20px_55px_rgba(63,81,181,.08)] backdrop-blur-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <h3 className="font-display text-lg font-black text-ink">Student Progress & Learning Growth</h3>
          </div>
          <p className="text-xs text-muted/70 font-medium mt-0.5">
            Simple term-wise marks trend & topic progress for {studentName}.
          </p>
        </div>

        {/* Overall Term 3 Average Card */}
        <div className="flex items-center gap-3 bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/15 shrink-0">
          <div>
            <small className="block text-[9px] font-extrabold uppercase tracking-widest text-muted/60">Term 3 Average</small>
            <strong className="text-base font-black text-primary block">{overallAvg}% • Grade A</strong>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-sage/15 text-sage font-extrabold text-[10px] uppercase tracking-wider">
            ↗ +7% vs Term 1
          </span>
        </div>
      </div>

      {/* Trajectory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_GROWTH_DATA.map((s) => {
          const isSelected = s.subject === selectedSubject;
          return (
            <motion.div
              key={s.subject}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedSubject(s.subject)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/15 shadow-sm'
                  : 'border-primary/10 bg-white hover:border-primary/30 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    s.trend === 'rising'
                      ? 'bg-sage/15 text-sage'
                      : s.trend === 'slipping'
                      ? 'bg-warm-clay/15 text-warm-clay'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {s.trend === 'rising' ? `↗ +${s.growthPct}%` : s.trend === 'slipping' ? `↘ ${s.growthPct}%` : '→ Stable'}
                </span>
              </div>

              <h4 className="text-xs font-black text-ink mt-2.5 truncate">{s.subject}</h4>

              {/* Term 1 -> Term 2 -> Term 3 Trajectory Bar Visualizer */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted/70">
                  <span>Term 1 ({s.term1Score}%)</span>
                  <span>Term 3 ({s.term3Score}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-primary/10 overflow-hidden flex">
                  <div style={{ width: `${s.term1Score}%` }} className="h-full bg-primary/30" />
                  <div style={{ width: `${s.term3Score - s.term1Score}%` }} className={`h-full ${s.trend === 'slipping' ? 'bg-warm-clay' : 'bg-sage'}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Subject Mastery Deep Dive & AI Intervention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Skill Mastery Breakdown Bars */}
        <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl bg-white border border-primary/15 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-extrabold text-ink flex items-center gap-2">
              <span>{activeSubjectData.icon}</span> {activeSubjectData.subject} Topic Progress
            </h4>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Latest Score: {activeSubjectData.term3Score}%
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {activeSubjectData.masteryBreakdown.map((m) => (
              <div key={m.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-ink">{m.skill}</span>
                  <span className={m.score >= 85 ? 'text-sage font-black' : m.score >= 70 ? 'text-primary font-bold' : 'text-warm-clay font-black'}>
                    {m.score}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-primary/10 overflow-hidden">
                  <div
                    style={{ width: `${m.score}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.score >= 85 ? 'bg-sage' : m.score >= 70 ? 'bg-primary' : 'bg-warm-clay'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Actionable Intervention Card */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-sage/10 border border-primary/20 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
              <span>🤖</span> Easy Study Tip
            </span>
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          </div>

          <p className="text-xs font-bold text-ink leading-relaxed bg-white/80 p-3.5 rounded-xl border border-primary/10">
            {activeSubjectData.aiIntervention}
          </p>

          {/* CLASS-WIDE CONCEPT HEATMAP (SIMPLE 1-LINE VIEW) */}
          <div className="pt-2 border-t border-primary/10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted/70 block">
              💡 Class Struggling Topic
            </span>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">Forces & Acceleration</span>
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-500/20 px-2 py-0.5 rounded-full">
                68% Class Struggling
              </span>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setToastMessage(`✓ Remediation sprint assigned for ${activeSubjectData.subject}!`);
                setTimeout(() => setToastMessage(null), 4000);
              }}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs shadow-2xs hover:bg-primary/90 transition-all active:scale-95"
            >
              {isParentView ? 'View Easy Practice Tips →' : 'Assign 1-Tap 10-Min Class Sprint →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
