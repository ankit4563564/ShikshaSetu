'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { updateBusLocationAction } from '@/app/parent/actions';
import { useNotifications } from '@/components/shared/NotificationContext';
import { useLanguage } from '@/components/shared/LanguageContext';
import { fetchChatMessagesAction, sendChatMessageAction, ChatMessageData } from '@/app/actions/chatActions';
import { requestGatePassAction, cancelGatePassAction } from '@/app/actions/gatePassActions';
import { submitMoodCheckin } from '@/app/actions/wellnessActions';
import NotificationBell from '@/components/shared/NotificationBell';
import { confirmHomeSafe, raiseAlert, checkNotHomeSafe } from '@/lib/journey';
import { Toast } from '@/components/shared/Toast';
import { Skeleton } from '@/components/shared/Skeleton';

// Import sub-components
import { ParentStudentHeader } from './ParentStudentHeader';
import { ParentMorningNote } from './ParentMorningNote';
import { ParentHomeworkTab } from './ParentHomeworkTab';
import { ParentAttendanceTab } from './ParentAttendanceTab';
import { ParentGatePassTab } from './ParentGatePassTab';
import { ParentBusTrackingTab } from './ParentBusTrackingTab';

const getChildBullets = (name: string, tone: 'positive' | 'neutral' | 'concern') => {
  const lower = name.toLowerCase();
  if (tone === 'positive') {
    return [
      'All homework completed and turned in on time',
      'Excellent attendance rate in all classes',
      'Consistently high academic engagement'
    ];
  }
  if (lower.includes('priya') || tone === 'neutral') {
    return [
      'A few homework tasks were not submitted',
      'Math scores have slipped recently',
      'Classroom focus has been mixed'
    ];
  }
  return [
    'Overdue assignments in Science and Math',
    'Multiple missed homework deadlines this week',
    'Class attendance has dipped recently'
  ];
};

interface ParentTodayClientProps {
  studentsData: {
    studentId: string;
    displayName: string;
    parentName: string;
    parentEmail: string;
    parentType: 'sunita' | 'kavita';
    noteResult: {
      note: string;
      prompt: string;
      tone: 'positive' | 'neutral' | 'concern';
      statusLabel: string;
    };
    homework: {
      id: string;
      subject: string;
      title: string;
      dueDate: string;
      submittedAt: string | null;
      isSubmitted: boolean;
    }[];
    attendance: {
      id: string;
      date: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      notes: string | null;
    }[];
    gatePasses: {
      id: string;
      status: 'pending' | 'approved' | 'used' | 'expired' | 'rejected';
      pickup_window_start: string;
      pickup_window_end: string;
      pass_code: string | null;
      reason: string | null;
      used_at: string | null;
      rejection_reason: string | null;
    }[];
    evidence?: {
      id: string;
      status: 'on-track' | 'worth-watching' | 'needs-attention';
      headline: string;
      bullets: string[];
    }[];
  }[];
  initialParentType?: 'sunita' | 'kavita';
  isClerkActive?: boolean;
  guardianId?: string | null;
}

export default function ParentTodayClient({ 
  studentsData, 
  initialParentType = 'sunita',
  isClerkActive = false,
  guardianId = null
}: ParentTodayClientProps) {
  const { t, language } = useLanguage();
  
  // ── Core State Management ──
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<'home' | 'homework' | 'attendance' | 'bus' | 'messages'>('home');
  const [activeParentType, setActiveParentType] = useState<'sunita' | 'kavita'>(initialParentType);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // ── UI State ──
  const [showSettings, setShowSettings] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);

  // ── Consent Settings ──
  const [consentSettings, setConsentSettings] = useState({
    shareMood: true,
    receiveBus: true,
    receiveAcademic: true,
  });

  // ── Mood Check-in State ──
  const [submittedMood, setSubmittedMood] = useState<number | null>(null);
  const [studentTodayMood, setStudentTodayMood] = useState<{ mood_value: number; mood_label: string; note: string | null } | null>(null);
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);

  // ── Gate Pass States ──
  const [showPassModal, setShowPassModal] = useState(false);
  const [passReason, setPassReason] = useState('Medical Appointment');
  const [customReason, setCustomReason] = useState('');
  const [pickupTime, setPickupTime] = useState('14:30');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const [passFormError, setPassFormError] = useState('');
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [passToCancel, setPassToCancel] = useState<string | null>(null);
  const [isCancellingPass, setIsCancellingPass] = useState(false);
  const [timeLeftText, setTimeLeftText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // ── Parent Switcher ──
  const currentParentStudents = useMemo(() => {
    return studentsData.filter((s) => s.parentType === activeParentType);
  }, [studentsData, activeParentType]);

  useEffect(() => {
    setIsWhyExpanded(false);
  }, [selectedStudentId]);

  const activeStudent = useMemo(() => {
    const defaultStudent = currentParentStudents[0];
    const found = currentParentStudents.find((s) => s.studentId === selectedStudentId);
    return found || defaultStudent;
  }, [currentParentStudents, selectedStudentId]);

  // ── Mood Check-in Effect ──
  useEffect(() => {
    if (!activeStudent) return;
    const checkTodayMood = async () => {
      const supabase = createClient();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: guardianData } = await supabase
        .from('mood_checkins')
        .select('mood_value')
        .eq('student_id', activeStudent.studentId)
        .eq('checked_in_by', 'guardian')
        .gte('checked_in_at', todayStart.toISOString())
        .limit(1)
        .maybeSingle();

      if (guardianData) {
        setSubmittedMood(guardianData.mood_value);
      } else {
        setSubmittedMood(null);
      }

      const { data: studentData } = await supabase
        .from('mood_checkins')
        .select('mood_value, mood_label, note')
        .eq('student_id', activeStudent.studentId)
        .eq('checked_in_by', 'student')
        .gte('checked_in_at', todayStart.toISOString())
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (studentData) {
        setStudentTodayMood({
          mood_value: studentData.mood_value,
          mood_label: studentData.mood_label,
          note: studentData.note
        });
      } else {
        setStudentTodayMood(null);
      }
    };
    checkTodayMood().catch(console.error);
  }, [activeStudent]);

  // ── Gate Pass Time Counter ──
  const activePass = useMemo(() => {
    return activeStudent?.gatePasses?.[0] || null;
  }, [activeStudent]);

  useEffect(() => {
    if (!activePass || activePass.status !== 'approved') {
      setTimeLeftText('');
      return;
    }
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(activePass.pickup_window_end);
      const diffMs = end.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeftText('Expired');
      } else {
        const diffMins = Math.ceil(diffMs / (60 * 1000));
        setTimeLeftText(`Expires in ${diffMins} minutes`);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 15000);
    return () => clearInterval(interval);
  }, [activePass]);

  return (
    <div className="parent-portal-shell mx-auto min-h-screen sm:min-h-[calc(100vh-2rem)] w-full max-w-5xl sm:rounded-[2.5rem] sm:shadow-2xl sm:border border-deep-teal/10 bg-paper flex flex-col relative font-body text-deep-teal antialiased overflow-hidden">
      
      {/* ── Header with Student Selector ── */}
      <ParentStudentHeader
        activeStudent={activeStudent}
        currentStudents={currentParentStudents}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
        isLoading={isLoading}
      />

      {/* ── Consent Settings Overlay ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-deep-teal/10 p-5 space-y-4 shadow-sm z-10"
          >
            <div>
              <h3 className="font-display text-sm font-extrabold text-deep-teal">
                Privacy Settings
              </h3>
              <p className="font-body text-[10px] text-deep-teal/50">
                Manage your data sharing and notification preferences.
              </p>
            </div>
            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-body text-xs font-semibold text-deep-teal/80">Share Mood Check-ins</span>
                <input
                  type="checkbox"
                  checked={consentSettings.shareMood}
                  onChange={(e) => setConsentSettings(prev => ({ ...prev, shareMood: e.target.checked }))}
                  className="rounded border-deep-teal/20 text-deep-teal focus:ring-deep-teal/20 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-body text-xs font-semibold text-deep-teal/80">Receive Bus Notifications</span>
                <input
                  type="checkbox"
                  checked={consentSettings.receiveBus}
                  onChange={(e) => setConsentSettings(prev => ({ ...prev, receiveBus: e.target.checked }))}
                  className="rounded border-deep-teal/20 text-deep-teal focus:ring-deep-teal/20 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-body text-xs font-semibold text-deep-teal/80">Receive Academic Updates</span>
                <input
                  type="checkbox"
                  checked={consentSettings.receiveAcademic}
                  onChange={(e) => setConsentSettings(prev => ({ ...prev, receiveAcademic: e.target.checked }))}
                  className="rounded border-deep-teal/20 text-deep-teal focus:ring-deep-teal/20 h-4 w-4"
                />
              </label>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-deep-teal text-white font-display text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-deep-teal/90 transition-all active:scale-95"
              >
                Close &amp; Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dev Tools (Development only) ── */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-deep-teal/5 border-b border-deep-teal/10 z-10">
          <button
            onClick={() => setShowDevTools(prev => !prev)}
            className="w-full px-4 py-2 flex items-center justify-between font-display text-[10px] font-extrabold uppercase tracking-wider text-deep-teal/40 hover:bg-deep-teal/[0.02] transition-all"
          >
            <span>Developer Controls</span>
            <span>{showDevTools ? '▲' : '▼'}</span>
          </button>
          {showDevTools && (
            <div className="p-4 pt-1 space-y-4 border-t border-deep-teal/5">
              {!isClerkActive && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-deep-teal/30 uppercase tracking-wide block">Select Account</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveParentType('sunita');
                        setSelectedStudentId('');
                      }}
                      className={`flex-1 text-center py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all border ${
                        activeParentType === 'sunita'
                          ? 'bg-deep-teal border-deep-teal text-white shadow-xs'
                          : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-white/50'
                      }`}
                    >
                      Sunita Sharma
                    </button>
                    <button
                      onClick={() => {
                        setActiveParentType('kavita');
                        setSelectedStudentId('');
                      }}
                      className={`flex-1 text-center py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all border ${
                        activeParentType === 'kavita'
                          ? 'bg-deep-teal border-deep-teal text-white shadow-xs'
                          : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-white/50'
                      }`}
                    >
                      Kavita Kapoor
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Notification Bell & Settings Button ── */}
      <div className="absolute top-4 right-5 sm:right-8 flex items-center gap-2 z-20">
        <NotificationBell />
        <button
          onClick={() => setShowSettings(prev => !prev)}
          className="p-2 rounded-full hover:bg-deep-teal/5 text-deep-teal/60 hover:text-deep-teal transition-all active:scale-95"
          aria-label="Consent Settings"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* ── Main Viewport (Tab Content) ── */}
      <div className="parent-portal-viewport flex-1 w-full max-w-4xl mx-auto px-5 py-7 sm:px-8 sm:py-9 overflow-y-auto pb-32 space-y-6">
        
        {/* Tab 1: Home */}
        {activeNav === 'home' && (
          isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="font-display text-xs font-semibold text-deep-teal/40 uppercase tracking-widest block">Good morning</span>
                <h1 className="font-display text-3xl font-extrabold text-deep-teal tracking-tight leading-none">
                  {activeStudent?.displayName.split(' ')[0] || 'Student'}
                </h1>
              </div>

              {/* Morning Note Component */}
              {!consentSettings.receiveAcademic ? (
                <div className="relative overflow-hidden rounded-2xl border border-deep-teal/5 bg-paper p-5 shadow-sm">
                  <p className="font-body text-sm text-deep-teal/40 italic py-2">
                    🔒 Academic updates are hidden because this preference is disabled.
                  </p>
                </div>
              ) : (
                <ParentMorningNote
                  studentId={activeStudent?.studentId || ''}
                  studentName={activeStudent?.displayName || ''}
                  tone={activeStudent?.noteResult.tone || 'positive'}
                  statusLabel={activeStudent?.noteResult.statusLabel || 'Daily Status'}
                  headline={activeStudent?.noteResult.tone === 'positive' ? 'All work is on track' : 'Homework check-in needed'}
                  bullets={
                    activeStudent?.evidence && activeStudent.evidence.length > 0
                      ? activeStudent.evidence.flatMap(e => e.bullets)
                      : getChildBullets(activeStudent?.displayName || '', activeStudent?.noteResult.tone || 'positive')
                  }
                  isWhyExpanded={isWhyExpanded}
                  onExpandChange={setIsWhyExpanded}
                  isLoading={isLoading}
                />
              )}
            </div>
          )
        )}

        {/* Tab 2: Homework */}
        {activeNav === 'homework' && (
          <ParentHomeworkTab
            homework={activeStudent?.homework || []}
            studentName={activeStudent?.displayName.split(' ')[0] || 'Student'}
            isLoading={isLoading}
            isEnabled={consentSettings.receiveAcademic}
            onSendMessage={() => setActiveNav('messages')}
          />
        )}

        {/* Tab 3: Attendance */}
        {activeNav === 'attendance' && (
          <ParentAttendanceTab
            attendance={activeStudent?.attendance || []}
            isLoading={isLoading}
            isEnabled={consentSettings.receiveAcademic}
          />
        )}

        {/* Tab 4: Bus Tracking */}
        {activeNav === 'bus' && (
          <ParentBusTrackingTab
            studentName={activeStudent?.displayName.split(' ')[0] || 'Student'}
            isLoading={isLoading}
            isEnabled={consentSettings.receiveBus}
          />
        )}

        {/* Tab 5: Messages */}
        {activeNav === 'messages' && (
          <div className="space-y-4 flex flex-col h-[400px]">
            <div>
              <h3 className="font-display text-lg font-extrabold text-deep-teal">
                Quick Notes to Teacher
              </h3>
              <p className="font-body text-xs text-deep-teal/50 font-semibold uppercase tracking-wider">
                Direct messages with Ms. Ananya Mehra (Teacher).
              </p>
            </div>

            <div className="rounded-2xl border border-deep-teal/5 bg-paper p-4 shadow-sm flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[300px]">
              <div className="text-center text-deep-teal/30 italic py-10 font-medium my-auto">
                No messages yet. Send a message to start the conversation.
              </div>
            </div>
          </div>
        )}

        {/* Product Principle Footer */}
        <div className="pt-4 pb-8 text-center border-t border-deep-teal/5">
          <p className="font-body text-[10px] text-deep-teal/40 leading-relaxed max-w-xs mx-auto font-medium">
            ShikshaSetu supports teachers and parents with timely information. Final decisions are always made by educators.
          </p>
        </div>
      </div>

      {/* ── Bottom Navigation Tabs ── */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-deep-teal/10 px-1 py-1.5 flex justify-between items-center z-20 shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'homework', label: 'Homework', icon: '📚' },
          { id: 'attendance', label: 'Attend', icon: '✓' },
          { id: 'bus', label: 'Bus', icon: '🚌' },
          { id: 'messages', label: 'Messages', icon: '💬' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveNav(tab.id as any);
              setShowSettings(false);
            }}
            className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 transition-all relative border-b-2 ${
              activeNav === tab.id
                ? 'text-deep-teal font-bold border-marigold'
                : 'text-deep-teal/60 font-medium border-transparent'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="text-[9px] tracking-tight leading-none text-center">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* ── Connection Error Banner ── */}
      {connectionError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-warm-clay/90 text-white text-center font-body text-sm py-2 animate-bounce">
          Connection lost. Trying to reconnect...
        </div>
      )}
    </div>
  );
}
