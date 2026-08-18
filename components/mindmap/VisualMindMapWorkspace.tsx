'use client';

import React, { useState } from 'react';
import type { ConceptMindMap } from '@/lib/mindmap/types';
import VisualMindMapCanvas from './VisualMindMapCanvas';
import MindMapExportModal from './MindMapExportModal';
import { generateMindMapAction } from '@/app/actions/mindmapActions';

const PRESET_CHAPTERS: Array<{ title: string; subject: string; grade: string; notes: string }> = [
  {
    title: 'Capacitance & Dielectrics',
    subject: 'Physics',
    grade: '12',
    notes: `Chapter: Electrostatic Potential and Capacitance
1. Definition of Capacitance:
Capacitance is the ratio of electric charge Q on either conductor to the potential difference V between them.
Formula: C = Q / V. SI unit is Farad (F). 1 Farad = 1 Coulomb / Volt.
Capacitance depends on geometric shape, plate area A, distance d, and dielectric medium. It is independent of Q and V.

2. Parallel Plate Capacitor:
Two large parallel conducting plates of area A separated by small distance d.
In vacuum: C0 = (ε0 * A) / d where ε0 = 8.854 x 10^-12 F/m.
Condition: Plate dimensions must be much larger than distance d (d^2 << A).
Electric field between plates: E = σ / ε0 = Q / (A * ε0).

3. Dielectric Slab:
Inserting an insulating dielectric slab of constant K between plates reduces electric field to E = E0 / K.
Potential difference becomes V = V0 / K.
Capacitance increases: C = K * C0 = (K * ε0 * A) / d.
Exam Trap: If battery remains connected, voltage V stays constant and charge Q increases. If battery is disconnected, charge Q stays constant and voltage V drops.

4. Capacitor Combinations:
Series Combination:
1 / C_eq = 1 / C1 + 1 / C2 + 1 / C3. Charge Q is same across each capacitor. Equivalent capacitance is smaller than the smallest individual capacitance.
Parallel Combination:
C_eq = C1 + C2 + C3. Potential difference V is same across each capacitor. Equivalent capacitance increases.

5. Energy Stored in Capacitor:
Work done in charging capacitor is stored as electrostatic potential energy in electric field:
U = (1/2) * C * V^2 = (1/2) * Q * V = Q^2 / (2 * C).
Energy density u_E = (1/2) * ε0 * E^2 (energy per unit volume in J/m^3).`,
  },
  {
    title: "Newton's Laws of Motion & Momentum",
    subject: 'Physics',
    grade: '9',
    notes: `Chapter: Force and Laws of Motion
1. First Law of Motion (Law of Inertia):
An object remains in state of rest or uniform motion in straight line unless acted upon by external unbalanced force.
Inertia is natural tendency of objects to resist change in state of motion. Mass is the quantitative measure of inertia.

2. Momentum & Second Law:
Momentum p is product of mass m and velocity v: p = m * v. SI unit: kg m/s.
Second Law: Rate of change of momentum is proportional to applied unbalanced force in direction of force:
F = m * a = m * (v - u) / t.
SI unit of force is Newton (N) = 1 kg m/s^2.

3. Third Law & Conservation of Momentum:
To every action there is equal and opposite reaction acting on different bodies: F_AB = - F_BA.
Law of Conservation of Linear Momentum: In isolated system with no external net force, total momentum before collision equals total momentum after collision:
m1 * u1 + m2 * u2 = m1 * v1 + m2 * v2.`,
  },
  {
    title: 'Photosynthesis & Light Reactions',
    subject: 'Biology',
    grade: '10',
    notes: `Chapter: Life Processes - Autotrophic Nutrition
1. Overview of Photosynthesis:
Process by which green plants synthesize glucose from carbon dioxide and water in presence of sunlight and chlorophyll:
Chemical Equation: 6 CO2 + 12 H2O + Light -> C6H12O6 + 6 O2 + 6 H2O.
Occurs within chloroplasts containing chlorophyll pigments.

2. Light-Dependent Reactions (Thylakoids):
Absorption of light energy by chlorophyll.
Photolysis of water: 2 H2O -> 4 H+ + 4 e- + O2.
Generation of assimilatory power: ATP and NADPH.

3. Light-Independent Reactions / Calvin Cycle (Stroma):
Reduction of CO2 into carbohydrates using ATP and NADPH.
Key Enzyme: RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase).
Primary product is 3-PGA, subsequently converted to triose phosphate and glucose.`,
  },
];

export default function VisualMindMapWorkspace() {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [title, setTitle] = useState(PRESET_CHAPTERS[0].title);
  const [subject, setSubject] = useState(PRESET_CHAPTERS[0].subject);
  const [grade, setGrade] = useState(PRESET_CHAPTERS[0].grade);
  const [notesText, setNotesText] = useState(PRESET_CHAPTERS[0].notes);

  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [activeMindMap, setActiveMindMap] = useState<ConceptMindMap | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const preset = PRESET_CHAPTERS[idx];
    setTitle(preset.title);
    setSubject(preset.subject);
    setGrade(preset.grade);
    setNotesText(preset.notes);
    setErrorText(null);
  };

  const handleGenerate = async () => {
    if (!notesText || notesText.trim().length < 20) {
      setErrorText('Please provide comprehensive notes (at least 20 characters) to generate a reliable revision sheet.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorText(null);

      const result = await generateMindMapAction({
        title,
        subject,
        grade,
        rawNotes: notesText,
      });

      if (result.success && result.mindMap) {
        setActiveMindMap(result.mindMap);
      } else {
        setErrorText(result.error || 'Failed to generate visual mind map.');
      }
    } catch (err: any) {
      setErrorText(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate initial map on load
  React.useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* ── TOP HEADER ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                🗺️ Visual Revision Mind Map
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase border border-indigo-200">
                Phase A Production MVP
              </span>
            </div>
            <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight mt-2">
              Educational Concept Revision Sheets
            </h1>
            <p className="font-body text-xs text-slate-500 font-medium max-w-2xl mt-1 leading-relaxed">
              Transform entire textbook chapters into dense, color-coded, 1-page visual revision concept posters with formulas, diagrams, and relationships.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Sample Topics:</span>
            {PRESET_CHAPTERS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedPreset === idx
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Input Area (Collapsible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chapter Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject &amp; Grade</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <>
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting Concept Map...</span>
                </>
              ) : (
                <span>Generate Visual Revision Map ✨</span>
              )}
            </button>
          </div>
        </div>

        {errorText && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
            <span>⚠️ {errorText}</span>
            <button onClick={() => setErrorText(null)} className="text-rose-600 hover:underline text-xs">Dismiss</button>
          </div>
        )}
      </div>

      {/* ── VISUAL CANVAS CONTAINER ── */}
      {activeMindMap && (
        <div className="h-[750px] w-full">
          <VisualMindMapCanvas
            mindMap={activeMindMap}
            onExportPdf={() => setIsExportModalOpen(true)}
          />
        </div>
      )}

      {/* ── EXPORT MODAL ── */}
      {activeMindMap && (
        <MindMapExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          mindMap={activeMindMap}
        />
      )}
    </div>
  );
}
