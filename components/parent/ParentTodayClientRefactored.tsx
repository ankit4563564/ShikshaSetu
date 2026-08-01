'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
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
import { ParentCopilotStrip } from '@/components/copilot/ParentCopilotStrip';

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
  const pathname = usePathname();
  
  // ✅ C4 FIX: Hide Developer Controls in production OR demo routes
  const isDemoMode = pathname?.startsWith('/demo') || false;
  const showDeveloperControls = process.env.NODE_ENV === 'development' && !isDemoMode;
  
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
    <div className="parent-portal-shell mx-auto min-h-screen sm:min-h-[calc(100vh-2rem)] w-full max-w-md sm:max-w-5xl sm:rounded-[2.5rem] sm:shadow-2xl sm:border border-deep-teal/10 bg-paper flex flex-col relative font-body text-deep-teal antialiased overflow-hidden">
      
      {/* ── Header with Student Selector & Header Actions ── */}
      <ParentStudentHeader
        activeStudent={activeStudent}
        currentStudents={currentParentStudents}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
        isLoading={isLoading}
        rightActions={
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className="p-2 rounded-full hover:bg-deep-teal/5 text-deep-teal/60 hover:text-deep-teal transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/30"
              aria-label="Consent Settings"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        }
      />

      {/* ShikshaSetu Copilot Strip */}
      <div className="px-4 sm:px-6">
        <ParentCopilotStrip />
      </div>

      {/* ── Settings Modal ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-deep-teal">
                    Settings
                  </h3>
                  <p className="font-body text-xs text-deep-teal/50 mt-0.5">
                    Manage your preferences
                  </p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-deep-teal/5 text-deep-teal/40 hover:text-deep-teal transition-all"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-xl bg-deep-teal/5 hover:bg-deep-teal/10 transition-all cursor-pointer">
                  <div>
                    <span className="font-body text-sm font-semibold text-deep-teal">Share Mood Check-ins</span>
                    <p className="font-body text-[10px] text-deep-teal/50 mt-0.5">Allow teachers to see wellness updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentSettings.shareMood}
                    onChange={(e) => setConsentSettings(prev => ({ ...prev, shareMood: e.target.checked }))}
                    className="rounded-full border-deep-teal/20 text-deep-teal focus:ring-deep-teal/20 h-5 w-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-deep-teal/5 hover:bg-deep-teal/10 transition-all cursor-pointer">
                  <div>
                    <span className="font-body text-sm font-semibold text-deep-teal">Receive Bus Notifications</span>
                    <p className="font-body text-[10px] text-deep-teal/50 mt-0.5">Get alerts for bus delays and arrivals</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentSettings.receiveBus}
                    onChange={(e) => setConsentSettings(prev => ({ ...prev, receiveBus: e.target.checked }))}
                    className="rounded-full border-deep-teal/20 text-deep-teal focus:ring-deep-teal/20 h-5 w-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-deep-teal/5 hover:bg-deep-teal/10 transition-all cursor-pointer">
                  <div>
                    <span className="font-body text-sm font-semibold text-deep-teal">Receive Academic Updates</span>
                    <p className="font-body text-[10px] text-deep-teal/50 mt-0.5">Show homework and attendance info</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentSettings.receiveAcademic}
                    onChange={(e) => setConsentSettings(prev => ({ ...prev, receiveAcademic: e.target.checked }))}
                    className="rounded-full border-deep-teal/20 text-deep-teal focus:ring-deep-teal/20 h-5 w-5"
                  />
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-deep-teal text-white font-display text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-deep-teal/90 transition-all active:scale-95 shadow-lg"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dev Tools (Development only) ── */}
      {showDeveloperControls && (
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



      {/* ── Main Viewport (Tab Content) ── */}
      <div className="parent-portal-viewport flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 overflow-y-auto pb-32 space-y-6">
        
        {/* Tab 1: Home */}
        {activeNav === 'home' && (
          isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Today's Story Hero */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-semibold text-deep-teal/40 uppercase tracking-widest">Today</span>
                  <span className="text-[10px] text-deep-teal/50 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                {!consentSettings.receiveAcademic ? (
                  <div className="relative overflow-hidden rounded-2xl border border-deep-teal/5 bg-white p-6 shadow-sm">
                    <p className="font-body text-sm text-deep-teal/40 italic py-2">
                      🔒 Academic updates are hidden because this preference is disabled.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-deep-teal to-teal-700 p-6 shadow-lg"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-display text-xs font-bold text-white/80 uppercase tracking-wider">
                          {activeStudent?.noteResult.tone === 'positive' ? 'Everything is on track' : 'Needs attention today'}
                        </span>
                      </div>
                      
                      <h2 className="font-display text-2xl font-extrabold text-white mb-2 leading-tight">
                        {activeStudent?.displayName.split(' ')[0] || 'Your child'} safely entered school at 8:14 AM.
                      </h2>
                      
                      <p className="font-body text-sm text-white/70 mb-6">
                        Bus is on schedule. Homework reminder available.
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                          <span className="text-emerald-300">✓</span>
                          <span className="font-body text-xs font-semibold text-white">At School</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                          <span>🚌</span>
                          <span className="font-body text-xs font-semibold text-white">Bus On Time</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                          <span>📚</span>
                          <span className="font-body text-xs font-semibold text-white">{activeStudent?.homework?.filter(h => h.isSubmitted).length || 0} Completed</span>
                        </div>
                        {activeStudent?.homework?.filter(h => !h.isSubmitted && new Date(h.dueDate) <= new Date(Date.now() + 86400000)).length > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30">
                            <span>⚠</span>
                            <span className="font-body text-xs font-semibold text-amber-200">Needs Attention</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>


              {/* Homework Section */}
              {activeStudent?.homework && activeStudent.homework.length > 0 && (
                <div className="bg-white rounded-2xl border border-deep-teal/10 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-deep-teal">Homework Progress</h3>
                      <p className="font-body text-xs text-deep-teal/50 mt-0.5">{activeStudent.homework.filter(h => h.isSubmitted).length} of {activeStudent.homework.length} completed</p>
                    </div>
                    <button
                      onClick={() => setActiveNav('homework')}
                      className="text-xs font-semibold text-deep-teal/60 hover:text-deep-teal transition-colors"
                    >
                      View all →
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex-1 h-3 bg-deep-teal/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(activeStudent.homework.filter(h => h.isSubmitted).length / activeStudent.homework.length) * 100}%` }}
                      />
                    </div>
                    <span className="font-display text-2xl font-extrabold text-deep-teal">
                      {Math.round((activeStudent.homework.filter(h => h.isSubmitted).length / activeStudent.homework.length) * 100)}%
                    </span>
                  </div>
                  
                  {activeStudent.homework.filter(h => !h.isSubmitted).length > 0 && (
                    <div className="bg-deep-teal/5 rounded-xl p-4">
                      <p className="font-display text-xs font-semibold text-deep-teal/60 uppercase tracking-wider mb-3">Next Due</p>
                      {activeStudent.homework
                        .filter(h => !h.isSubmitted)
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .slice(0, 1)
                        .map(hw => (
                          <div key={hw.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-body text-sm font-semibold text-deep-teal">{hw.title}</p>
                              <p className="font-body text-xs text-deep-teal/50 mt-0.5">
                                {hw.subject} · Due {new Date(hw.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(hw.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveNav('homework')}
                              className="px-4 py-2 rounded-xl bg-deep-teal text-white font-display text-xs font-bold hover:bg-deep-teal/90 transition-all active:scale-95 shadow-md"
                            >
                              Open →
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}


              {/* Today's Journey Timeline */}
              <div className="bg-white rounded-2xl border border-deep-teal/10 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-deep-teal">Today's Journey</h3>
                    <p className="font-body text-xs text-deep-teal/50 mt-0.5">Following {activeStudent?.displayName.split(' ')[0] || 'your child'}'s day</p>
                  </div>
                </div>
                
                <div className="space-y-0">
                  {[
                    { time: '08:14', event: 'Entered School', icon: '🏫', status: 'completed' },
                    { time: '08:15', event: 'Attendance Recorded', icon: '✓', status: 'completed' },
                    { time: '10:30', event: 'Homework Assigned', icon: '📚', status: 'completed' },
                    { time: '12:30', event: 'Lunch Break', icon: '🍽️', status: 'completed' },
                    { time: '15:30', event: 'School Dismissal', icon: '🔔', status: 'pending' },
                    { time: '16:00', event: 'Boarding Bus', icon: '🚌', status: 'pending' },
                    { time: '16:45', event: 'Expected Home Arrival', icon: '🏠', status: 'pending' },
                  ].map((item, idx) => (
                    <div key={idx} className="relative">
                      {idx !== 0 && (
                        <div className="absolute left-4 -top-3 w-0.5 h-6 bg-deep-teal/10" />
                      )}
                      <div className="flex items-start gap-4 pb-4 last:pb-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          item.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-deep-teal/5 text-deep-teal/40'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center justify-between">
                            <p className={`font-body text-sm font-semibold ${
                              item.status === 'completed' ? 'text-deep-teal' : 'text-deep-teal/50'
                            }`}>
                              {item.event}
                            </p>
                            <span className={`font-display text-xs font-bold ${
                              item.status === 'completed' ? 'text-deep-teal/60' : 'text-deep-teal/30'
                            }`}>
                              {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Attendance Section */}
              {activeStudent?.attendance && activeStudent.attendance.length > 0 && (
                <div className="bg-white rounded-2xl border border-deep-teal/10 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-deep-teal">Attendance</h3>
                      <p className="font-body text-xs text-deep-teal/50 mt-0.5">This month</p>
                    </div>
                    <button
                      onClick={() => setActiveNav('attendance')}
                      className="text-xs font-semibold text-deep-teal/60 hover:text-deep-teal transition-colors"
                    >
                      View details →
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-5">
                    <div className="text-center">
                      <p className="font-display text-3xl font-extrabold text-deep-teal">
                        {Math.round((activeStudent.attendance.filter(a => a.status === 'present').length / activeStudent.attendance.length) * 100)}%
                      </p>
                      <p className="font-body text-xs text-deep-teal/50 font-semibold mt-1">Rate</p>
                    </div>
                    <div className="flex-1 h-px bg-deep-teal/10" />
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="font-display text-xl font-bold text-emerald-600">
                          {activeStudent.attendance.filter(a => a.status === 'present').length}
                        </p>
                        <p className="font-body text-[10px] text-deep-teal/50 font-semibold mt-0.5">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-xl font-bold text-rose-600">
                          {activeStudent.attendance.filter(a => a.status === 'absent').length}
                        </p>
                        <p className="font-body text-[10px] text-deep-teal/50 font-semibold mt-0.5">Absent</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weekly Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {activeStudent.attendance.slice(0, 7).map((att, idx) => {
                      const dayName = new Date(att.date).toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNum = new Date(att.date).getDate();
                      return (
                        <div
                          key={idx}
                          className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center border ${
                            att.status === 'present' ? 'bg-emerald-50 border-emerald-200' :
                            att.status === 'late' ? 'bg-amber-50 border-amber-200' :
                            att.status === 'absent' ? 'bg-rose-50 border-rose-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <span className="font-body text-[10px] font-semibold text-deep-teal/60">{dayName}</span>
                          <span className="font-display text-sm font-bold text-deep-teal mt-0.5">{dayNum}</span>
                          <span className="mt-1">
                            {att.status === 'present' ? '✓' :
                             att.status === 'late' ? '⏰' :
                             att.status === 'absent' ? '✗' : '📋'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {activeStudent.attendance.filter(a => a.status === 'present').length === activeStudent.attendance.length && (
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-600">🎉</span>
                      <span className="font-body text-xs font-semibold text-emerald-700">Perfect Attendance</span>
                    </div>
                  )}
                </div>
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

      {/* ── Floating Dock Navigation ── */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/90 backdrop-blur-xl border border-deep-teal/10 rounded-2xl shadow-2xl px-2 py-2 flex items-center gap-1">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'homework', label: 'Homework', icon: '📚' },
            { id: 'attendance', label: 'Attend', icon: '✓' },
            { id: 'bus', label: 'Bus', icon: '🚌' },
            { id: 'messages', label: 'Messages', icon: '💬' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveNav(tab.id as any);
                setShowSettings(false);
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] gap-1 px-4 py-2 rounded-xl transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/30 ${
                activeNav === tab.id
                  ? 'text-deep-teal bg-deep-teal/10 shadow-sm'
                  : 'text-deep-teal/50 hover:text-deep-teal hover:bg-deep-teal/5'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] tracking-tight leading-none text-center font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
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
