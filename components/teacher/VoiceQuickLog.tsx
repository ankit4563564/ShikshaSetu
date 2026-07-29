'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { logVoiceNoteAction } from '@/app/actions/voiceLogActions';
import { getBrowserLocale, SpeechService } from '@/lib/speech';

interface VoiceQuickLogProps { teacherId: string; }

export default function VoiceQuickLog({ teacherId }: VoiceQuickLogProps) {
  const service = useRef<SpeechService | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    service.current = new SpeechService();
    return () => service.current?.dispose();
  }, []);

  const startListening = () => {
    setResult(null);
    setTranscript('');
    setInterim('');
    const speech = service.current;
    if (!speech) return;
    const computedLang = getBrowserLocale();
    speech.start(computedLang, {
      onInterim: setInterim,
      onFinal: (value) => { setTranscript((current) => `${current} ${value}`.trim()); setInterim(''); },
      onError: (error) => { setIsListening(false); setInterim(''); setResult({ success: false, message: error.message }); },
      onEnd: () => setIsListening(false),
    });
    if (speech.isSupported()) setIsListening(true);
  };

  const submit = async () => {
    if (!transcript.trim()) { setResult({ success: false, message: 'Please speak or type a note first.' }); return; }
    setIsProcessing(true);
    setResult(null);
    try {
      const response = await logVoiceNoteAction({ originalTranscript: transcript, inputMode: 'speech' }, teacherId);
      setResult({ success: true, message: `Evidence logged for ${response.categorization.studentName}.` });
      setTranscript('');
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'The voice note could not be processed. Please try again.' });
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="bg-white border border-deep-teal/10 rounded-2xl p-5 shadow-sm space-y-4">
      <div><h3 className="font-display text-sm font-extrabold text-deep-teal">Voice Quick Log</h3><p className="mt-1 font-body text-xs text-deep-teal/50">Record an observation in your language. The transcript is processed only after you log it.</p></div>
      <div className="relative">
        <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Tap the microphone and speak, or type your observation..." rows={3} disabled={isListening || isProcessing} className="w-full resize-none rounded-xl border border-deep-teal/15 bg-paper px-4 py-3 text-sm text-deep-teal focus:outline-none focus:ring-1 focus:ring-deep-teal/20 disabled:opacity-70" />
        {isListening && <div className="absolute right-2 top-2 rounded-full border border-deep-teal/10 bg-white/95 px-2 py-1 text-[10px] font-bold text-sage">Listening{interim ? `: ${interim}` : '...'}</div>}
      </div>
      <div className="flex gap-3">
        <button onClick={isListening ? () => service.current?.stop() : startListening} disabled={isProcessing} className={`flex-1 rounded-xl py-3 text-xs font-bold text-white disabled:opacity-50 shadow-md ${isListening ? 'bg-warm-clay' : 'bg-deep-teal'}`}>{isListening ? 'Stop recording' : 'Start recording'}</button>
        <button onClick={submit} disabled={!transcript.trim() || isListening || isProcessing} className="flex-1 rounded-xl bg-sage py-3 text-xs font-bold text-white disabled:opacity-50 shadow-md">{isProcessing ? 'Processing language and evidence...' : 'Log evidence'}</button>
      </div>
      <AnimatePresence>{result && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-xl border p-3 text-xs font-semibold ${result.success ? 'border-sage/20 bg-sage/10 text-sage' : 'border-warm-clay/20 bg-warm-clay/10 text-warm-clay'}`}>{result.message}</motion.div>}</AnimatePresence>
      {service.current && !service.current.isSupported() && <p className="rounded-lg border border-warm-clay/15 bg-warm-clay/5 px-3 py-2 text-[10px] font-semibold text-warm-clay">Voice recognition is unavailable in this browser. Type your observation instead.</p>}
    </div>
  );
}
