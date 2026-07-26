'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextRegistry } from '../context/ContextRegistry';
import { useAmbientAICore } from '../core/AmbientIntelligenceCore';
import { adaptContextToUI } from '../core/PresentationAdapter';
import SchoolGPTMessage from '../SchoolGPTMessage';

export default function EmbeddedBar() {
  const { context } = useContextRegistry();
  const { conversation, ask, isLoading, executeAction } = useAmbientAICore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uiProps = adaptContextToUI(context);
  const showHero = conversation.length === 0;

  const handleSend = (query: string) => {
    if (!query.trim() || isLoading) return;
    ask(query);
    setInput('');
  };

  const toggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice dictation is not supported in this browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (e: any) => {
        if (e.results[0][0].transcript) {
          setInput(e.results[0][0].transcript);
        }
      };
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4 font-body space-y-6">
      {/* Context Banner */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{uiProps.contextBanner}</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Ambient AI Active</span>
      </div>

      {/* Hero Greeting (Progressive Disclosure) */}
      <AnimatePresence>
        {showHero && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="text-center space-y-1.5 pt-2"
          >
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">{uiProps.greeting}</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto">
              Ask anything naturally. SchoolGPT already understands your current workspace.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Search Bar */}
      <div className="relative flex items-center bg-white border border-slate-200/90 rounded-3xl p-2 shadow-xs hover:shadow-md focus-within:shadow-md focus-within:border-slate-900 transition-all">
        <span className="pl-3 pr-1 text-slate-400 text-lg">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder={isListening ? '🎙️ Listening to your voice...' : uiProps.placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none font-medium"
        />
        <button
          type="button"
          onClick={toggleVoiceDictation}
          className={`p-2.5 rounded-2xl transition-all mr-1.5 ${
            isListening ? 'bg-rose-500 text-white animate-pulse shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Voice Search Dictation"
        >
          🎙️
        </button>
        <button
          type="button"
          onClick={() => handleSend(input)}
          disabled={isLoading || !input.trim()}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all active:scale-95 disabled:opacity-30 flex items-center gap-1.5 shrink-0"
        >
          <span>Ask</span>
          <span className="text-xs">✨</span>
        </button>
      </div>

      {/* Route-Adapted Suggestions (Progressive Disclosure) */}
      <AnimatePresence>
        {showHero && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {uiProps.suggestions.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => handleSend(card.prompt)}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-left transition-all shadow-2xs hover:shadow-xs group flex flex-col justify-between gap-2 active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border ${card.bg}`}>
                    {card.icon}
                  </div>
                  <span className="text-slate-400 group-hover:text-slate-900 transition-colors">&rarr;</span>
                </div>
                <div>
                  <h4 className="font-display text-xs font-extrabold text-slate-900">{card.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">{card.prompt}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Stream */}
      <div className="space-y-4">
        {conversation.map((msg, idx) => (
          <SchoolGPTMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            sources={msg.aiResponse?.evidence.map((e) => e.label)}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start py-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center gap-3 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-slate-900 animate-bounce" />
              <span>Looking up student &amp; classroom data…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
