'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

const spotlightActions = [
  { id: '1', icon: '🎯', title: 'Which students need support today?', category: 'Attention Radar', action: 'query' },
  { id: '2', icon: '👤', title: "Show Aarav's complete academic report", category: 'Student Analytics', action: 'query' },
  { id: '3', icon: '📊', title: "Summarize today's attendance anomalies", category: 'Attendance', action: 'query' },
  { id: '4', icon: '✉️', title: 'Generate PTM summary update for Class 8A', category: 'Parent Comms', action: 'query' },
  { id: '5', icon: '📈', title: 'Compare Term 1 and Term 3 performance', category: 'Growth Analytics', action: 'query' },
  { id: '6', icon: '⏱️', title: 'Show bus tracking and gate entry logs', category: 'Safety Telemetry', action: 'query' },
  { id: '7', icon: '📚', title: 'Jump to Gradebook & Marks Page', category: 'Navigation', action: 'nav', path: '/teacher' },
  { id: '8', icon: '🚌', title: 'Jump to Bus Telemetry Tracking', category: 'Navigation', action: 'nav', path: '/parent' },
];

export default function SchoolGPTSpotlight({ isOpen, onClose, onSelectPrompt }: SpotlightProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = spotlightActions.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: (typeof spotlightActions)[0]) => {
    onClose();
    if (item.action === 'query' && onSelectPrompt) {
      onSelectPrompt(item.title);
    } else if (item.action === 'nav' && item.path) {
      router.push(item.path);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/40 backdrop-blur-sm font-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="bg-white rounded-3xl border border-slate-200/90 max-w-xl w-full shadow-2xl overflow-hidden"
        >
          {/* Spotlight Search Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <span className="text-xl text-slate-400 pl-1">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, search student, or ask SchoolGPT..."
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 outline-none"
            />
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-mono text-[10px] font-bold">
              ESC
            </span>
          </div>

          {/* Action List */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs font-medium text-slate-400">
                No matching commands found. Press Enter to ask SchoolGPT directly.
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between transition-all group text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div>
                      <h4 className="font-display text-xs sm:text-sm font-extrabold text-slate-900">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-400 group-hover:text-slate-900 transition-colors">
                    &rarr;
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Spotlight Footer */}
          <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400 px-4">
            <span className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-600">↑↓</span> to navigate
              <span className="font-mono font-bold text-slate-600">↵</span> to select
            </span>
            <span className="font-bold text-slate-500">SchoolGPT Spotlight Command</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
