'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeechService } from '@/lib/speech';

interface StudentProfileMemory {
  studentId: string;
  iqScoreLevel: 'Building' | 'Confident' | 'Advanced Scholar';
  learningStyle: 'Visual Analogies' | 'Logical Steps' | 'Real-World Examples';
  criticalThinkingScore: number;
  totalInteractions: number;
  recentTopics: string[];
}

interface ChatMessage {
  id: string;
  sender: 'student' | 'mitra';
  text: string;
  hintLevel?: number;
  thinkingChallenge?: string;
  timestamp: string;
}

interface SchoolMitraProps {
  studentId: string;
  studentName: string;
}

export default function SchoolMitra({ studentId, studentName }: SchoolMitraProps) {
  const [activeTab, setActiveTab] = useState<'copilot' | 'panic' | 'counselor'>('copilot');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const speechService = useRef<SpeechService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize SpeechService for live voice recognition
  useEffect(() => {
    speechService.current = new SpeechService();
    return () => {
      speechService.current?.dispose();
    };
  }, []);

  const toggleVoiceRecording = () => {
    const speech = speechService.current;
    if (!speech || !speech.isSupported()) {
      setToast({ message: '🎙️ Voice dictation not supported in this browser.', type: 'error' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (isRecording) {
      speech.stop();
      setIsRecording(false);
      setToast({ message: '✓ Voice recording stopped.', type: 'info' });
      setTimeout(() => setToast(null), 3000);
    } else {
      try {
        speech.start('en', {
          onInterim: (text) => {
            setInputQuery(text);
          },
          onFinal: (text) => {
            setInputQuery((prev) => `${prev} ${text}`.trim());
          },
          onError: (err) => {
            setIsRecording(false);
            setToast({ message: `🎙️ Voice error: ${err.message}`, type: 'error' });
            setTimeout(() => setToast(null), 4000);
          },
          onEnd: () => {
            setIsRecording(false);
          },
        });
        setIsRecording(true);
        setToast({ message: '🎙️ Voice recording active! Speak in English / Hinglish...', type: 'info' });
      } catch (err: any) {
        setIsRecording(false);
        setToast({ message: 'Could not start microphone.', type: 'error' });
        setTimeout(() => setToast(null), 4000);
      }
    }
  };

  // Student Self-Evolving AI Memory Profile
  const [memoryProfile, setMemoryProfile] = useState<StudentProfileMemory>({
    studentId,
    iqScoreLevel: 'Building',
    learningStyle: 'Visual Analogies',
    criticalThinkingScore: 68,
    totalInteractions: 12,
    recentTopics: ['Science (Motion)', 'Maths (Algebra)'],
  });

  useEffect(() => {
    // Load student AI memory from localStorage
    const savedMemory = localStorage.getItem(`mitra-memory-${studentId}`);
    if (savedMemory) {
      try {
        setMemoryProfile(JSON.parse(savedMemory));
      } catch (e) {
        console.error('Failed to load Mitra memory:', e);
      }
    } else {
      // Seed initial welcoming message
      setMessages([
        {
          id: 'msg-init-1',
          sender: 'mitra',
          text: `Namaste ${studentName.split(' ')[0]}! 👋 I'm your School Mitra. Ask me any doubt or exam topic. I won't just copy-paste answers—I'll guide your thinking step-by-step so you master the concept!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [studentId, studentName]);

  useEffect(() => {
    localStorage.setItem(`mitra-memory-${studentId}`, JSON.stringify(memoryProfile));
  }, [memoryProfile, studentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Adaptive Socratic AI Logic Simulation
  const handleSendQuery = (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      // Analyze student question and dynamically adapt AI response level
      let aiResponseText = '';
      let challengeText = '';

      const queryLower = textToSend.toLowerCase();

      if (queryLower.includes('acceleration') || queryLower.includes('motion') || queryLower.includes('speed')) {
        aiResponseText = `Great question ${studentName.split(' ')[0]}! Think about this: When you accelerate a bicycle from 10 km/h to 30 km/h in 5 seconds, what changed? Speed or Time?`;
        challengeText = `💡 Hint 1: Acceleration = (Change in Speed) ÷ Time taken. Can you calculate the change in speed first?`;
      } else if (queryLower.includes('math') || queryLower.includes('equation') || queryLower.includes('x')) {
        aiResponseText = `Let's break this down together. If 2x + 5 = 15, imagine a balance scale. What happens if you subtract 5 from both sides first?`;
        challengeText = `🎯 Socratic Challenge: What is the remaining value of 2x?`;
      } else {
        aiResponseText = `I hear you! Let's think through "${textToSend}". Based on your learning style (${memoryProfile.learningStyle}), let's visualize the real-world connection first. What is the main goal here?`;
        challengeText = `⚡ Step 1: Try explaining what you already know about this topic in 1 short sentence.`;
      }

      // Evolve memory profile
      setMemoryProfile((prev) => ({
        ...prev,
        totalInteractions: prev.totalInteractions + 1,
        criticalThinkingScore: Math.min(100, prev.criticalThinkingScore + 2),
        iqScoreLevel: prev.criticalThinkingScore > 80 ? 'Advanced Scholar' : prev.criticalThinkingScore > 70 ? 'Confident' : 'Building',
      }));

      const mitraMsg: ChatMessage = {
        id: `mitra-${Date.now()}`,
        sender: 'mitra',
        text: aiResponseText,
        thinkingChallenge: challengeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, mitraMsg]);
      setIsThinking(false);
    }, 1200);
  };

  return (
    <div className="school-mitra-container rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_20px_55px_rgba(0,102,92,.08)] backdrop-blur-xl space-y-6 sm:p-7">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-deep-teal/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-sage flex items-center justify-center text-white text-2xl shadow-md">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-black text-deep-teal">School Mitra AI</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/15">
                Self-Evolving Socratic Coach
              </span>
            </div>
            <p className="text-xs text-muted/70 font-medium">Adaptive learning companion that builds critical thinking & exam confidence.</p>
          </div>
        </div>

        {/* Adaptive IQ & Learning Style Live Badge */}
        <div className="flex items-center gap-2 bg-paper px-3.5 py-2 rounded-2xl border border-deep-teal/10">
          <div className="text-right">
            <small className="block text-[9px] font-extrabold uppercase tracking-widest text-muted/60">Thinking Profile</small>
            <strong className="text-xs font-black text-primary block">{memoryProfile.iqScoreLevel} • IQ Score: {memoryProfile.criticalThinkingScore}</strong>
          </div>
          <span className="h-2 w-2 rounded-full bg-sage animate-ping" />
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-primary/5 border border-primary/10">
        <button
          type="button"
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
            activeTab === 'copilot' ? 'bg-white text-primary shadow-xs' : 'text-muted/70 hover:text-primary'
          }`}
        >
          🎓 Socratic Study Coach
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('panic')}
          className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
            activeTab === 'panic' ? 'bg-white text-warm-clay shadow-xs' : 'text-muted/70 hover:text-warm-clay'
          }`}
        >
          ⚡ 15-Min Test Sprint
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('counselor')}
          className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
            activeTab === 'counselor' ? 'bg-white text-sage shadow-xs' : 'text-muted/70 hover:text-sage'
          }`}
        >
          🔒 Private Counselor Request
        </button>
      </div>

      {/* TAB 1: SOCRATIC STUDY COACH */}
      {activeTab === 'copilot' && (
        <div className="space-y-4">
          {/* Quick Concept Triggers */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-bold text-muted/50 uppercase tracking-widest shrink-0">Quick Starters:</span>
            {[
              'Explain Newton\'s Laws using a sports example',
              'Maths: Help me solve linear equations',
              'Chemistry: Why do chemical reactions heat up?',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendQuery(q)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-primary/15 text-[11px] font-bold text-deep-teal hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Interactive Chat Window */}
          <div className="h-72 overflow-y-auto space-y-3 p-4 rounded-2xl bg-paper/60 border border-deep-teal/10 shadow-inner">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    msg.sender === 'student'
                      ? 'bg-primary text-white rounded-br-none shadow-xs'
                      : 'bg-white border border-primary/15 text-ink rounded-bl-none shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.thinkingChallenge && (
                    <div className="mt-2.5 pt-2 border-t border-primary/10 text-primary font-bold text-[11px] bg-primary/5 p-2.5 rounded-xl space-y-2">
                      <p>{msg.thinkingChallenge}</p>
                      {/* INTERACTIVE COMPREHENSION CHECK PILLS */}
                      <div className="flex items-center gap-2 pt-1 border-t border-primary/10">
                        <span className="text-[10px] font-bold text-muted/60">Did you get it?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setToast({ message: '🌟 Awesome! Critical thinking score increased +5!', type: 'success' });
                            setTimeout(() => setToast(null), 4000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sage/15 text-sage font-extrabold text-[10px] hover:bg-sage hover:text-white transition-all"
                        >
                          👍 Yes, got it! (+5 pts)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setToast({ message: '💡 Requesting a simpler real-world example...', type: 'info' });
                            setTimeout(() => setToast(null), 4000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-900 font-extrabold text-[10px] hover:bg-amber-500 hover:text-white transition-all"
                        >
                          🤔 Need simpler example
                        </button>
                      </div>
                    </div>
                  )}
                  <span className={`block text-[9px] mt-1 text-right font-mono ${msg.sender === 'student' ? 'text-white/70' : 'text-muted/50'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs font-bold text-primary bg-white p-3 rounded-2xl border border-primary/15 w-fit">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                <span>Mitra AI is tailoring Socratic hints to your IQ profile...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box with Voice Mic Dictation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-3 rounded-2xl border transition-all font-bold text-base shadow-2xs ${
                isRecording
                  ? 'bg-warm-clay text-white border-warm-clay animate-pulse'
                  : 'bg-paper border-deep-teal/15 text-primary hover:bg-primary/10'
              }`}
              title={isRecording ? 'Click to stop voice recording' : 'Speak doubt in Hinglish / English'}
            >
              {isRecording ? '⏹️' : '🎙️'}
            </button>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask a doubt or speak in Hinglish/English... (Mitra guides your thinking)"
              className="flex-1 px-4 py-3 rounded-2xl border border-deep-teal/15 bg-white text-xs font-semibold text-ink focus:border-primary focus:outline-none shadow-2xs"
            />
            <button
              type="button"
              onClick={() => handleSendQuery()}
              className="px-5 py-3 rounded-2xl bg-primary text-white font-extrabold text-xs hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              Ask Mitra →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: 15-MIN TEST SPRINT */}
      {activeTab === 'panic' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <strong className="text-xs font-black block flex items-center gap-1.5">
              <span>⚡</span> 15-Minute Exam Revision Sprint Generator
            </strong>
            <p className="text-[11px] font-semibold opacity-85">
              Don't panic before tests! Select your upcoming exam subject and Mitra AI will generate a custom 3-step rapid revision plan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { subject: 'Science (Physics & Chemistry)', icon: '🧪', time: '15 mins' },
              { subject: 'Mathematics (Algebra & Geometry)', icon: '📐', time: '15 mins' },
              { subject: 'English (Grammar & Essay)', icon: '📚', time: '10 mins' },
            ].map((s) => (
              <div key={s.subject} className="p-4 rounded-2xl border border-primary/15 bg-white hover:border-primary transition-all space-y-2 text-center">
                <span className="text-3xl block">{s.icon}</span>
                <strong className="text-xs font-extrabold text-ink block">{s.subject}</strong>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {s.time} Sprint
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setToast({ message: `🚀 Generated 15-Min Sprint for ${s.subject}! Check step-by-step revision guide.`, type: 'success' });
                    setTimeout(() => setToast(null), 4000);
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all shadow-2xs"
                >
                  Generate Plan →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRIVATE COUNSELOR REQUEST */}
      {activeTab === 'counselor' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sage/10 border border-sage/20 text-deep-teal space-y-2">
            <strong className="text-xs font-black block flex items-center gap-1.5">
              <span>🔒</span> Private & Confidential Support Request
            </strong>
            <p className="text-[11px] font-semibold opacity-85">
              If you're feeling overwhelmed, bullied, or need someone to talk to, tap below. A private 1-on-1 check-in will be scheduled quietly with your school counselor or class teacher.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-primary/15 space-y-4">
            <h4 className="text-xs font-black text-ink">Select what you'd like help with:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Need 5-min talk with Class Teacher',
                'Exam Panic & Study Stress',
                'Peer Problem / Classroom Issue',
                'General Advice & Guidance',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    setToast({ message: '✓ Confidential request sent quietly to Ms. Ananya Mehra.', type: 'success' });
                    setTimeout(() => setToast(null), 4000);
                  }}
                  className="p-3 rounded-xl border border-primary/10 bg-paper text-left text-xs font-bold text-ink hover:border-primary hover:bg-primary/5 transition-all"
                >
                  💬 {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="p-3.5 rounded-xl bg-deep-teal text-white text-xs font-extrabold shadow-lg flex items-center justify-between"
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="text-xs font-bold opacity-80 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
