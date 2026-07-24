'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolGPTVoice } from '@/lib/schoolgpt/useSchoolGPTVoice';
import type { VoiceAssistantProps } from '@/lib/schoolgpt/voiceTypes';
import type { SupportedSpeechLanguage } from '@/lib/speech/SpeechService';
import { SPEECH_LANGUAGES } from '@/lib/speech/SpeechService';

const stateConfig: Record<string, { color: string; ring: string; label: string; icon: string }> = {
  idle: {
    color: 'from-deep-teal/20 to-deep-teal/5',
    ring: 'border-deep-teal/20',
    label: 'Tap to speak',
    icon: '🎤',
  },
  listening: {
    color: 'from-primary/30 to-primary/10',
    ring: 'border-primary/40',
    label: 'Listening…',
    icon: '🎤',
  },
  processing: {
    color: 'from-marigold/30 to-marigold/10',
    ring: 'border-marigold/40',
    label: 'Thinking…',
    icon: '🤔',
  },
  speaking: {
    color: 'from-sage/30 to-sage/10',
    ring: 'border-sage/40',
    label: 'Speaking…',
    icon: '🔊',
  },
};

export default function SchoolGPTVoicePanel(props: VoiceAssistantProps) {
  const {
    state, messages, interim, error, language, isSupported,
    startListening, stopListening, cancelSpeech,
    clearHistory, setLanguage,
  } = useSchoolGPTVoice(props);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interim]);

  const cfg = stateConfig[state];

  function handleMicTap() {
    if (state === 'idle') startListening();
    else if (state === 'listening') stopListening();
    else if (state === 'speaking') cancelSpeech();
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-4">🎙️</span>
        <p className="text-sm font-bold text-deep-teal/60">Voice input is not supported in this browser.</p>
        <p className="text-xs text-deep-teal/40 mt-1">Try Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-teal/40">Voice Mode</span>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${
            state === 'idle' ? 'bg-deep-teal/20' :
            state === 'listening' ? 'bg-primary animate-pulse' :
            state === 'processing' ? 'bg-marigold animate-pulse' :
            'bg-sage animate-pulse'
          }`} />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as SupportedSpeechLanguage)}
            className="rounded-lg border border-deep-teal/10 bg-white/70 px-2 py-1 text-[10px] font-bold text-deep-teal outline-none"
          >
            {Object.entries(SPEECH_LANGUAGES).map(([code, lang]) => (
              <option key={code} value={code}>{lang.label}</option>
            ))}
          </select>
          {messages.length > 1 && (
            <button
              type="button"
              onClick={clearHistory}
              className="rounded-lg border border-deep-teal/10 px-2 py-1 text-[10px] font-bold text-deep-teal/40 hover:text-warm-clay"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary/10 text-primary'
                  : 'border border-deep-teal/5 bg-white text-deep-teal'
              }`}>
                {msg.role === 'assistant' && (
                  <span className="mr-1.5 text-xs">🤖</span>
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {interim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm italic text-deep-teal/60">
              {interim}
            </div>
          </motion.div>
        )}

        {state === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="rounded-2xl border border-deep-teal/5 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-deep-teal/30" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-deep-teal/30" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-deep-teal/30" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-xl bg-warm-clay/5 border border-warm-clay/10 px-3 py-2 text-xs font-medium text-warm-clay"
        >
          {error}
        </motion.div>
      )}

      <div className="flex flex-col items-center pt-2">
        <div className="relative">
          <AnimatePresence mode="wait">
            {state === 'listening' && (
              <motion.div
                key="pulse-ring"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full border-2 border-primary/30"
              />
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleMicTap}
            className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg transition-all active:scale-90 ${
              state === 'idle'
                ? 'bg-white border-deep-teal/15 shadow-deep-teal/10 hover:shadow-deep-teal/20 hover:border-deep-teal/30'
                : state === 'listening'
                ? 'bg-primary text-white border-primary shadow-primary/30 scale-110'
                : state === 'processing'
                ? 'bg-marigold text-white border-marigold shadow-marigold/20'
                : 'bg-sage text-white border-sage shadow-sage/20'
            }`}
          >
            <span className="text-2xl">
              {state === 'speaking' ? '🔊' : state === 'processing' ? '🤔' : state === 'listening' ? '🎙️' : '🎤'}
            </span>
          </button>
        </div>

        <p className="mt-3 text-xs font-bold text-deep-teal/50">
          {state === 'idle' ? 'Tap mic to ask' :
           state === 'listening' ? 'Tap to stop' :
           state === 'processing' ? 'Processing' :
           state === 'speaking' ? 'Tap to silence' : ''}
        </p>

        {state === 'listening' && (
          <div className="mt-2 flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="w-0.5 rounded-full bg-primary"
                initial={{ height: 8 }}
                animate={{ height: [8, 20, 12, 24, 8][i] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
