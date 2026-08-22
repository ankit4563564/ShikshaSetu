'use client';

import React, { useState } from 'react';

interface StudentStudyHelpCardProps {
  onAskAI: (initialQuery?: string) => void;
}

export default function StudentStudyHelpCard({
  onAskAI,
}: StudentStudyHelpCardProps) {
  const [query, setQuery] = useState('');

  const quickStarters = [
    'Explain Newton\'s laws with sports examples',
    'Help with linear equations',
    'Why do chemical reactions produce heat?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAskAI(query.trim());
      setQuery('');
    } else {
      onAskAI();
    }
  };

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-deep-teal text-lg text-white shadow-xs">
            ✨
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
              Study Help
            </p>
            <h3 className="font-display text-base font-black text-deep-teal">
              Stuck on something?
            </h3>
            <p className="text-xs font-semibold text-muted">
              Ask ShikshaSetu for instant Socratic guidance, step-by-step doubt clearing, or exam revision.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAskAI()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-deep-teal px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-deep-teal/90 active:scale-95 cursor-pointer shrink-0"
        >
          <span>Ask ShikshaSetu</span>
          <span>→</span>
        </button>
      </div>

      {/* Quick concept starters */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-primary/10">
        <span className="text-[10px] font-bold text-muted/70 uppercase tracking-wider">
          Quick Starters:
        </span>
        {quickStarters.map((starter) => (
          <button
            key={starter}
            type="button"
            onClick={() => onAskAI(starter)}
            className="rounded-lg border border-primary/15 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-deep-teal transition hover:border-primary hover:bg-primary/5 cursor-pointer shadow-2xs"
          >
            {starter}
          </button>
        ))}
      </div>
    </section>
  );
}
