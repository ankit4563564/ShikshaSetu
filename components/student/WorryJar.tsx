'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBrowserLocale, SpeechService } from '@/lib/speech';
import { useLanguage } from '@/components/shared/LanguageContext';

interface WorryEntry {
  id: string;
  content: string;
  createdAt: Date;
  isShared: boolean;
}

interface WorryJarProps {
  studentId: string;
  studentName: string;
}

export default function WorryJar({ studentId, studentName }: WorryJarProps) {
  const [worries, setWorries] = useState<WorryEntry[]>([]);
  const [newWorry, setNewWorry] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [worryToShare, setWorryToShare] = useState<string | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const service = useRef<SpeechService | null>(null);
  let siteLanguage = 'en';
  try {
    const langContext = useLanguage();
    siteLanguage = langContext.language;
  } catch (e) {
    console.warn('[Worry Jar] LanguageContext not found:', e);
  }

  // Load worries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`worry-jar-${studentId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWorries(parsed.map((w: any) => ({ ...w, createdAt: new Date(w.createdAt) })));
      } catch (e) {
        console.error('[Worry Jar] Failed to load worries:', e);
      }
    }
  }, [studentId]);

  // Save worries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`worry-jar-${studentId}`, JSON.stringify(worries));
  }, [worries, studentId]);

  // Initialize SpeechService
  useEffect(() => {
    service.current = new SpeechService();
    return () => {
      service.current?.dispose();
    };
  }, []);

  const startRecording = () => {
    const speech = service.current;
    if (!speech || !speech.isSupported()) {
      setToast({ message: 'Voice recording not supported in this browser', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const computedLang = getBrowserLocale(siteLanguage);
      speech.start(computedLang, {
        onInterim: () => {},
        onFinal: (value) => {
          setNewWorry((prev) => `${prev} ${value}`.trim());
        },
        onError: (error) => {
          setIsRecording(false);
          setToast({ message: error.message, type: 'error' });
          setTimeout(() => setToast(null), 4000);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
      setIsRecording(true);
    } catch (error) {
      console.error('[Worry Jar] Failed to start recording:', error);
      setToast({ message: 'Speech recognition could not start. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const stopRecording = () => {
    if (service.current) {
      service.current.stop();
    }
    setIsRecording(false);
  };

  const addWorry = () => {
    if (!newWorry.trim()) return;

    const worry: WorryEntry = {
      id: Date.now().toString(),
      content: newWorry.trim(),
      createdAt: new Date(),
      isShared: false,
    };

    setWorries(prev => [worry, ...prev]);
    setNewWorry('');
  };

  const deleteWorry = (id: string) => {
    setWorries(prev => prev.filter(w => w.id !== id));
  };

  const initiateShare = (worryId: string) => {
    setWorryToShare(worryId);
    setShowShareConfirm(true);
  };

  const confirmShare = async () => {
    if (!worryToShare) return;

    setIsSharing(true);
    setShowShareConfirm(false);

    try {
      const response = await fetch('/api/student/share-worry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worryId: worryToShare,
          studentId,
          studentName,
          content: worries.find(w => w.id === worryToShare)?.content,
        }),
      });

      if (response.ok) {
        setWorries(prev => prev.map(w => 
          w.id === worryToShare ? { ...w, isShared: true } : w
        ));
        setToast({ message: 'Worry shared with counselor', type: 'success' });
      } else {
        setToast({ message: 'Failed to share worry', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to share worry', type: 'error' });
    } finally {
      setIsSharing(false);
      setWorryToShare(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const cancelShare = () => {
    setShowShareConfirm(false);
    setWorryToShare(null);
  };

  return (
    <div className="student-worry-jar rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-[0_20px_55px_rgba(0,102,92,.08)] backdrop-blur-xl space-y-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🫙</span>
          <h3 className="font-display text-sm font-extrabold text-deep-teal">
            Worry Jar
          </h3>
        </div>
      </div>

      <p className="font-body text-xs text-deep-teal/50 leading-relaxed">
        This is your private space to write down worries. Nothing here is shared with anyone unless you choose to share it with your counselor.
      </p>

      {/* 60-SECOND GUIDED BREATHING GROUNDING TOOL */}
      <div className="rounded-2xl border border-sage/30 bg-gradient-to-r from-sage/15 to-primary/10 p-4 text-center space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-sage flex items-center gap-1.5">
            <span>🌿</span> 60-Second Breathing Break
          </span>
          <span className="text-[10px] font-extrabold text-primary bg-white/80 px-2 py-0.5 rounded-full border border-primary/10">Mindful Comfort</span>
        </div>
        <p className="text-[11px] font-bold text-deep-teal/80">Feeling anxious? Take a deep breath: Inhale for 4s, Hold for 4s, Exhale for 4s.</p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button 
            type="button"
            onClick={() => {
              setToast({ message: '🌬️ Breathing exercise started. Inhale slowly...', type: 'success' });
              setTimeout(() => setToast(null), 4000);
            }}
            className="px-3 py-1.5 rounded-xl bg-sage text-white font-extrabold text-xs shadow-2xs hover:bg-sage/90 transition-all"
          >
            Start 60s Breathing
          </button>
        </div>
      </div>

      {/* New Worry Input */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={newWorry}
            onChange={(e) => setNewWorry(e.target.value)}
            placeholder="Write your worry here, or use the microphone to speak..."
            className="w-full border border-deep-teal/15 rounded-xl px-4 py-3 text-sm text-deep-teal focus:border-deep-teal/30 focus:outline-none focus:ring-1 focus:ring-deep-teal/10 placeholder-deep-teal/30 resize-none bg-paper min-h-[100px]"
            disabled={isRecording}
          />
          
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-deep-teal/10 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-clay opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-warm-clay"></span>
              </span>
              <span className="text-[10px] font-bold text-warm-clay uppercase tracking-wider">Recording...</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isSharing}
              className="flex-1 border border-deep-teal/10 hover:bg-deep-teal/5 text-deep-teal/70 font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Record Voice
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 bg-warm-clay hover:bg-warm-clay/95 text-white font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Recording
            </button>
          )}

          <button
            onClick={addWorry}
            disabled={!newWorry.trim() || isSharing}
            className="flex-1 bg-deep-teal hover:bg-deep-teal/95 text-white font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Jar
          </button>
        </div>
      </div>

      {/* Worries List */}
      {worries.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40">
            Your Worries ({worries.length})
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {worries.map((worry) => (
              <div
                key={worry.id}
                className={`border rounded-xl p-4 transition-all ${
                  worry.isShared
                    ? 'bg-sage/5 border-sage/20'
                    : 'bg-paper border-deep-teal/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-body text-xs text-deep-teal/80 leading-relaxed flex-1">
                    {worry.content}
                  </p>
                  <button
                    onClick={() => deleteWorry(worry.id)}
                    className="text-deep-teal/30 hover:text-warm-clay transition-colors flex-shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-deep-teal/5">
                  <span className="text-[10px] text-deep-teal/40">
                    {new Date(worry.createdAt).toLocaleDateString()} at {new Date(worry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {worry.isShared ? (
                    <span className="text-[10px] font-bold text-sage flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Shared with counselor
                    </span>
                  ) : (
                    <button
                      onClick={() => initiateShare(worry.id)}
                      disabled={isSharing}
                      className="text-[10px] font-bold text-deep-teal/60 hover:text-deep-teal underline disabled:opacity-50"
                    >
                      Share with counselor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {worries.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-deep-teal/10 rounded-xl bg-paper">
          <span className="text-4xl mb-2 block">🫙</span>
          <p className="font-body text-xs text-deep-teal/40 font-medium">
            Your worry jar is empty. Add your first worry above.
          </p>
        </div>
      )}

      {/* Share Confirmation Modal */}
      <AnimatePresence>
        {showShareConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full"
            >
              <h3 className="font-display text-lg font-bold text-deep-teal mb-2">
                Share with Counselor?
              </h3>
              <p className="font-body text-xs text-deep-teal/60 mb-4">
                This will send your worry to the school counselor. They will be able to see what you wrote and may reach out to talk with you about it.
              </p>
              
              <div className="bg-paper rounded-lg p-3 mb-4 border border-deep-teal/10">
                <p className="font-body text-xs text-deep-teal/80 italic">
                  "{worries.find(w => w.id === worryToShare)?.content}"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelShare}
                  className="flex-1 border border-deep-teal/10 hover:bg-deep-teal/5 text-deep-teal/70 font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmShare}
                  disabled={isSharing}
                  className="flex-1 bg-sage hover:bg-sage/95 text-white font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSharing ? 'Sharing...' : 'Yes, Share'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl p-3 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-sage/10 text-sage border border-sage/20'
                : 'bg-warm-clay/10 text-warm-clay border border-warm-clay/20'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
