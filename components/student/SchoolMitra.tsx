'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeechService } from '@/lib/speech';
import { askSchoolGPTAction } from '@/app/actions/schoolgptActions';
import { createStudentAchievementAction } from '@/app/actions/studentActions';

interface ChatMessage {
  id: string;
  sender: 'student' | 'mitra';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface SchoolMitraProps {
  studentId: string;
  studentName: string;
}

export default function SchoolMitra({ studentId, studentName }: SchoolMitraProps) {
  const [activeTab, setActiveTab] = useState<'copilot' | 'sprint' | 'support'>('copilot');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [sessionStats, setSessionStats] = useState({ questions: 0, topics: new Set<string>() });
  
  // Sprint tab state
  const [sprintSubject, setSprintSubject] = useState('');
  const [sprintPlan, setSprintPlan] = useState<string | null>(null);
  const [isGeneratingSprint, setIsGeneratingSprint] = useState(false);

  // Support tab state
  const [supportReason, setSupportReason] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const speechService = useRef<SpeechService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    speechService.current = new SpeechService();
    return () => { speechService.current?.dispose(); };
  }, []);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'msg-init',
        sender: 'mitra',
        text: `Hi ${studentName.split(' ')[0]}! 👋 I'm your study companion. Ask me any doubt — I'll guide you step-by-step so you understand the concept, not just the answer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [studentName, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const toggleVoiceRecording = () => {
    const speech = speechService.current;
    if (!speech || !speech.isSupported()) {
      showToast('Voice not supported in this browser.', 'error');
      return;
    }

    if (isRecording) {
      speech.stop();
      setIsRecording(false);
    } else {
      try {
        speech.start('en', {
          onInterim: (text) => setInputQuery(text),
          onFinal: (text) => setInputQuery((prev) => `${prev} ${text}`.trim()),
          onError: () => { setIsRecording(false); showToast('Voice error. Try again.', 'error'); },
          onEnd: () => setIsRecording(false),
        });
        setIsRecording(true);
      } catch {
        setIsRecording(false);
        showToast('Could not start microphone.', 'error');
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Build chat history for context
  const buildHistory = useCallback(() => {
    return messages
      .filter(m => m.id !== 'msg-init' && !m.isError)
      .map(m => ({
        role: m.sender === 'student' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));
  }, [messages]);

  // Real AI query via askSchoolGPTAction
  const handleSendQuery = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsThinking(true);

    // Update session stats
    setSessionStats(prev => ({
      questions: prev.questions + 1,
      topics: new Set([...prev.topics, extractTopic(textToSend)]),
    }));

    try {
      const response = await askSchoolGPTAction({
        question: textToSend,
        role: 'student',
        studentId,
        history: buildHistory(),
      });

      const mitraMsg: ChatMessage = {
        id: `mitra-${Date.now()}`,
        sender: 'mitra',
        text: response.text || 'I could not generate a response. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, mitraMsg]);
    } catch (error) {
      console.error('[SchoolMitra] AI query failed:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'mitra',
        text: 'Something went wrong. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Generate real 15-min sprint plan via AI
  const handleGenerateSprint = async (subject: string) => {
    if (!subject.trim() || isGeneratingSprint) return;
    setIsGeneratingSprint(true);
    setSprintPlan(null);
    setSprintSubject(subject);

    try {
      const response = await askSchoolGPTAction({
        question: `Generate a focused 15-minute revision sprint for ${subject}. Structure it as:
- 0-3 min: Review core concepts (list the most important ones)
- 3-8 min: 2-3 practice questions to try
- 8-12 min: One challenge question
- 12-15 min: Quick self-check summary
Keep it concise and immediately actionable. Use the student's recent performance data if available to focus on weak areas.`,
        role: 'student',
        studentId,
        history: [],
      });

      setSprintPlan(response.text || 'Could not generate a plan. Please try again.');
    } catch (error) {
      console.error('[SchoolMitra] Sprint generation failed:', error);
      setSprintPlan('Something went wrong generating your sprint plan. Please try again.');
    } finally {
      setIsGeneratingSprint(false);
    }
  };

  // Send real counselor/support request
  const handleSendSupportRequest = async () => {
    if (!supportReason.trim() || isSendingSupport) return;
    setIsSendingSupport(true);

    try {
      await createStudentAchievementAction(
        studentId,
        `Support Request: ${supportReason}`,
        `${studentName} has requested a private check-in regarding: "${supportReason}". Please follow up.`,
        'wellness'
      );

      setSupportSent(true);
      showToast('Your request has been sent. A teacher or counselor will follow up.', 'success');
    } catch (error) {
      console.error('[SchoolMitra] Support request failed:', error);
      showToast('Could not send your request. Please try again or speak to a teacher directly.', 'error');
    } finally {
      setIsSendingSupport(false);
    }
  };

  const firstName = studentName.split(' ')[0];

  return (
    <div className="school-mitra-container rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl space-y-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-deep-teal/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-sage flex items-center justify-center text-white text-lg shadow-sm">
            ✨
          </div>
          <div>
            <h3 className="font-display text-base font-black text-deep-teal">School Mitra</h3>
            <p className="text-[11px] text-muted font-medium">Your study companion — ask any doubt</p>
          </div>
        </div>

        {/* Honest session stats */}
        {sessionStats.questions > 0 && (
          <div className="flex items-center gap-3 text-[10px] font-bold text-muted">
            <span>{sessionStats.questions} question{sessionStats.questions !== 1 ? 's' : ''} asked</span>
            <span className="h-3 w-px bg-deep-teal/10" />
            <span>{sessionStats.topics.size} topic{sessionStats.topics.size !== 1 ? 's' : ''} explored</span>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-100">
        <button
          type="button"
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'copilot' ? 'bg-white text-primary shadow-xs' : 'text-muted hover:text-primary'
          }`}
        >
          📖 Study Coach
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sprint')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sprint' ? 'bg-white text-amber-700 shadow-xs' : 'text-muted hover:text-amber-700'
          }`}
        >
          ⚡ 15-Min Sprint
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'support' ? 'bg-white text-sage shadow-xs' : 'text-muted hover:text-sage'
          }`}
        >
          💬 Talk to Someone
        </button>
      </div>

      {/* ══ TAB 1: STUDY COACH (Real AI) ══ */}
      {activeTab === 'copilot' && (
        <div className="space-y-3">
          {/* Quick starters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider shrink-0">Try:</span>
            {[
              'Explain photosynthesis simply',
              'Help me with algebra equations',
              'What homework is due?',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendQuery(q)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-[11px] font-bold text-deep-teal hover:border-primary/30 hover:bg-primary/5 transition-all shadow-2xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div className="h-72 overflow-y-auto space-y-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'student'
                      ? 'bg-primary text-white rounded-br-sm'
                      : msg.isError
                      ? 'bg-warm-clay/10 border border-warm-clay/20 text-warm-clay rounded-bl-sm'
                      : 'bg-white border border-slate-100 text-ink rounded-bl-sm shadow-2xs'
                  }`}
                >
                  {msg.text}
                  <span className={`block text-[9px] mt-1.5 text-right font-mono ${
                    msg.sender === 'student' ? 'text-white/60' : 'text-muted/40'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs font-bold text-primary bg-white p-3 rounded-xl border border-primary/10 w-fit">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-warm-clay text-white border-warm-clay animate-pulse'
                  : 'bg-white border-slate-200 text-primary hover:bg-primary/5'
              }`}
              title={isRecording ? 'Stop recording' : 'Speak your question'}
            >
              {isRecording ? '⏹️' : '🎙️'}
            </button>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask a doubt..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-ink focus:border-primary focus:outline-none"
              disabled={isThinking}
            />
            <button
              type="button"
              onClick={() => handleSendQuery()}
              disabled={isThinking || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Ask →
            </button>
          </div>
        </div>
      )}

      {/* ══ TAB 2: 15-MINUTE SPRINT (Real AI) ══ */}
      {activeTab === 'sprint' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-bold text-amber-900">
              ⚡ Quick revision before a test? Pick a subject and get a focused 15-minute study plan.
            </p>
          </div>

          {!sprintPlan ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { subject: 'Science', icon: '🧪' },
                { subject: 'Mathematics', icon: '📐' },
                { subject: 'English', icon: '📚' },
              ].map((s) => (
                <button
                  key={s.subject}
                  type="button"
                  onClick={() => handleGenerateSprint(s.subject)}
                  disabled={isGeneratingSprint}
                  className="p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:bg-primary/5 transition-all text-center space-y-2 disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-3xl block">{s.icon}</span>
                  <span className="text-xs font-bold text-deep-teal block">{s.subject}</span>
                  {isGeneratingSprint && sprintSubject === s.subject ? (
                    <span className="inline-block text-[10px] font-bold text-primary animate-pulse">Generating...</span>
                  ) : (
                    <span className="inline-block text-[10px] font-bold text-primary">Generate Sprint →</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-deep-teal">
                  ⚡ {sprintSubject} — 15-Minute Sprint
                </h4>
                <button
                  type="button"
                  onClick={() => { setSprintPlan(null); setSprintSubject(''); }}
                  className="text-xs font-bold text-muted hover:text-deep-teal cursor-pointer"
                >
                  ← Back
                </button>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-5">
                <div className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
                  {sprintPlan}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGenerateSprint(sprintSubject)}
                disabled={isGeneratingSprint}
                className="text-xs font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
              >
                {isGeneratingSprint ? 'Regenerating...' : '🔄 Generate a different plan'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB 3: TALK TO SOMEONE (Real notification) ══ */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-sage/10 border border-sage/20">
            <p className="text-xs font-bold text-deep-teal flex items-center gap-1.5">
              <span>🔒</span> Private & Confidential
            </p>
            <p className="mt-1 text-[11px] text-deep-teal/70 font-medium">
              If you need to talk to someone — about studies, stress, or anything else — you can send a private request here. Your class teacher or school counselor will follow up with you quietly.
            </p>
          </div>

          {supportSent ? (
            <div className="rounded-xl border border-sage/20 bg-sage/5 p-6 text-center space-y-2">
              <span className="text-3xl block">✅</span>
              <p className="text-sm font-bold text-deep-teal">Request sent</p>
              <p className="text-xs text-muted">A teacher or counselor will check in with you. If you need immediate help, please speak to any teacher directly.</p>
              <button
                type="button"
                onClick={() => { setSupportSent(false); setSupportReason(''); }}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Send another request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'I need help with studies',
                  'Feeling stressed about exams',
                  'Something is bothering me',
                  'I want to talk to my teacher',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSupportReason(reason)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      supportReason === reason
                        ? 'border-primary/30 bg-primary/5 text-primary font-bold'
                        : 'border-slate-100 bg-white text-ink hover:border-primary/20'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                value={supportReason}
                onChange={(e) => setSupportReason(e.target.value)}
                placeholder="Or write in your own words (optional)..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-ink focus:border-primary focus:outline-none resize-none bg-white min-h-[80px]"
              />

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted">
                  This will notify your teacher/counselor privately.
                </p>
                <button
                  type="button"
                  onClick={handleSendSupportRequest}
                  disabled={!supportReason.trim() || isSendingSupport}
                  className="px-5 py-2.5 rounded-xl bg-sage text-white font-bold text-xs hover:bg-sage/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingSupport ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
              toast.type === 'success' ? 'bg-sage/10 text-sage border border-sage/20' :
              toast.type === 'error' ? 'bg-warm-clay/10 text-warm-clay border border-warm-clay/20' :
              'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 cursor-pointer">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Extract a rough topic keyword from a query for session tracking */
function extractTopic(query: string): string {
  const lower = query.toLowerCase();
  const topics = ['math', 'science', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography', 'hindi', 'computer', 'algebra', 'geometry'];
  for (const t of topics) {
    if (lower.includes(t)) return t.charAt(0).toUpperCase() + t.slice(1);
  }
  return 'General';
}
