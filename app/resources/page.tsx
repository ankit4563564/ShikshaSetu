import React from 'react';
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-16 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span>🏫</span> ShikshaSetu
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-mono font-bold text-secondary-container uppercase">School Leadership Resources</span>
          <h1 className="text-4xl font-extrabold text-white">Guides, Whitepapers &amp; CBSE Playbooks</h1>
          <p className="text-slate-400 text-sm">Download actionable playbooks on modern school gate security, bus fleet GPS integration, and SchoolGPT deployment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">WHITEPAPER</span>
            <h3 className="text-lg font-bold text-white">The Modern School Safety Matrix (2024 Edition)</h3>
            <p className="text-xs text-slate-400">How leading CBSE schools reduced parent anxiety calls by 60% using real-time gate pass and bus telemetry.</p>
            <Link href="/" className="inline-block text-xs font-bold text-secondary-container hover:underline pt-2">Download Free PDF →</Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30">TEACHER PLAYBOOK</span>
            <h3 className="text-lg font-bold text-white">SchoolGPT Prompting Playbook for Teachers</h3>
            <p className="text-xs text-slate-400">50 ready-to-use prompts for lesson planning, differentiated quizzes, and empathetic parent messages.</p>
            <Link href="/" className="inline-block text-xs font-bold text-teal-300 hover:underline pt-2">Download Free PDF →</Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
