'use client';

import { useState, useRef } from 'react';

interface PersistentAISearchProps {
  onSend: (query: string) => void;
  isLoading?: boolean;
}

export default function PersistentAISearch({ onSend, isLoading }: PersistentAISearchProps) {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chips = [
    { id: 'ask', label: 'Ask', icon: '💬' },
    { id: 'analyze', label: 'Analyze', icon: '📈' },
    { id: 'create', label: 'Create', icon: '✨' },
    { id: 'compare', label: 'Compare', icon: '⇄' },
  ];

  const handleSend = () => {
    if (!query.trim() || isLoading) return;
    onSend(query.trim());
    setQuery('');
  };

  const handleChipClick = (chipLabel: string) => {
    setActiveChip(chipLabel);
    setQuery(`${chipLabel} `);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full bg-white border-2 border-indigo-200/90 hover:border-indigo-400 focus-within:border-indigo-600 rounded-3xl p-4 shadow-sm transition-all font-body space-y-3">
      {/* Text Input Area */}
      <textarea
        ref={inputRef}
        rows={2}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask SchoolGPT anything..."
        className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 outline-none resize-none"
      />

      {/* Action Chips & Circular Send Button */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {chips.map((chip) => {
            const isSelected = activeChip === chip.label;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700'
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !query.trim()}
          className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white font-extrabold text-lg flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
          title="Send Query"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
