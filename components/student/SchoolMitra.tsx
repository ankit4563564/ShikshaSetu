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
    <div className="school-mitra-container rounded-3xl border border-indigo-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl space-y-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md shadow-indigo-500/25">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-black text-slate-900">School Mitra</h3>
              <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                AI Study Companion
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Socratic concept guidance • Ask any academic doubt</p>
          </div>
        </div>

        {/* Honest session stats */}
        {sessionStats.questions > 0 && (
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
            <span>💡 {sessionStats.questions} question{sessionStats.questions !== 1 ? 's' : ''}</span>
            <span className="h-3 w-px bg-slate-200" />
            <span>📖 {sessionStats.topics.size} topic{sessionStats.topics.size !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/60">
        <button
          type="button"
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'copilot'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📖 Study Coach
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sprint')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'sprint'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:text-amber-700'
          }`}
        >
          ⚡ 15-Min Sprint
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'support'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:text-emerald-700'
          }`}
        >
          💬 Counselor &amp; Support
        </button>
      </div>

      {/* ══ TAB 1: STUDY COACH (Real AI) ══ */}
      {activeTab === 'copilot' && (
        <div className="space-y-4">
          {/* Quick starters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Try Asking:</span>
            {[
              'Explain photosynthesis simply',
              'Help me solve linear equations',
              'What homework is due today?',
            ].map((q) => (
              <motion.button
                key={q}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSendQuery(q)}
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-2xs cursor-pointer"
              >
                {q} ✨
              </motion.button>
            ))}
          </div>

          {/* Chat window */}
          <div className="h-80 overflow-y-auto space-y-3.5 p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-inner">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.sender === 'student'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs shadow-indigo-500/20'
                      : msg.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-xs'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                  <span className={`block text-[9px] mt-2 font-mono ${
                    msg.sender === 'student' ? 'text-white/70 text-right' : 'text-slate-400 text-left'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-700 bg-white px-4 py-3 rounded-2xl border border-indigo-100 shadow-sm w-fit animate-pulse">
                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
                <span>Mitra is formulating a step-by-step hint...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
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
              placeholder="Ask any doubt or concept question..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
              disabled={isThinking}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSendQuery()}
              disabled={isThinking || !inputQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black text-xs hover:shadow-md hover:shadow-indigo-500/25 transition-all disabled:opacity-40 cursor-pointer shrink-0"
            >
              Ask Mitra →
            </motion.button>
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
