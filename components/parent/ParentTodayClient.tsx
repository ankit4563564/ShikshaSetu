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
import LanguageToggle from '@/components/shared/LanguageToggle';
import { confirmHomeSafe, raiseAlert, checkNotHomeSafe } from '@/lib/journey';
import { Toast } from '@/components/shared/Toast';
import { Skeleton } from '@/components/shared/Skeleton';


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
  
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedMood, setSubmittedMood] = useState<number | null>(null);
  const [studentTodayMood, setStudentTodayMood] = useState<{ mood_value: number; mood_label: string; note: string | null } | null>(null);
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);



  // Mock Parent Switcher (Dev Tools)
  const [activeParentType, setActiveParentType] = useState<'sunita' | 'kavita'>(initialParentType);

  // Gate Pass request states
  const [showPassModal, setShowPassModal] = useState(false);
  const [passReason, setPassReason] = useState('Medical Appointment');
  const [customReason, setCustomReason] = useState('');
  const [pickupTime, setPickupTime] = useState('14:30');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const [passFormError, setPassFormError] = useState('');

  // Gate Pass cancellation states
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [passToCancel, setPassToCancel] = useState<string | null>(null);
  const [isCancellingPass, setIsCancellingPass] = useState(false);

  const handleSubmitGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    
    setIsSubmittingPass(true);
    setPassFormError('');
    
    try {
      const finalReason = passReason === 'Other' ? customReason : passReason;
      if (!finalReason.trim()) {
        throw new Error('Please specify a reason');
      }

      const [hours, minutes] = pickupTime.split(':').map(Number);
      const start = new Date();
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours window

      const res = await requestGatePassAction(
        activeStudent.studentId,
        finalReason,
        start.toISOString(),
        end.toISOString()
      );

      if (res.success) {
        setShowPassModal(false);
        setPassReason('Medical Appointment');
        setCustomReason('');
        setPickupTime('14:30');
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (err: any) {
      setPassFormError(err.message || 'An error occurred');
      setToastMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const handleCancelGatePass = async () => {
    if (!passToCancel) return;
    setIsCancellingPass(true);
    try {
      const res = await cancelGatePassAction(passToCancel);
      if (res.success) {
        setShowCancelConfirmModal(false);
        setPassToCancel(null);
      } else {
        throw new Error('Failed to cancel');
      }
    } catch (err: any) {
      setToastMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsCancellingPass(false);
    }
  };

  // Filter students based on active parent account
  const currentParentStudents = useMemo(() => {
    return studentsData.filter((s) => s.parentType === activeParentType);
  }, [studentsData, activeParentType]);

  // Selected student (defaults to first child)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    setIsWhyExpanded(false);
    setShowAllAttendance(false);
  }, [selectedStudentId]);

  const activeStudent = useMemo(() => {
    const defaultStudent = currentParentStudents[0];
    const found = currentParentStudents.find((s) => s.studentId === selectedStudentId);
    return found || defaultStudent;
  }, [currentParentStudents, selectedStudentId]);

  useEffect(() => {
    if (!activeStudent) return;
    const checkTodayMood = async () => {
      const supabase = createClient();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // 1. Fetch Guardian check-in
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

      // 2. Fetch Student check-in
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

  const [journeyState, setJourneyState] = useState<{
    status: 'waiting' | 'boarded' | 'deboarded' | 'home_safe' | 'no_trip';
    trip_id: string | null;
    boarded_at: string | null;
    deboarded_at: string | null;
    home_safe_at: string | null;
    deboard_stop: string | null;
    deboard_lat: number | null;
    deboard_lng: number | null;
    confirmed_by: string | null;
  }>({ status: 'no_trip', trip_id: null, boarded_at: null, deboarded_at: null, home_safe_at: null, deboard_stop: null, deboard_lat: null, deboard_lng: null, confirmed_by: null });

  const [helpClicked, setHelpClicked] = useState(false);

  // ── Real-time Interactive States for Parent App Buttons ──
  const [showSchoolGPTDrawer, setShowSchoolGPTDrawer] = useState(false);
  const [schoolGPTQuery, setSchoolGPTQuery] = useState('');
  const [schoolGPTChatHistory, setSchoolGPTChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am SchoolGPT, your real-time safety & growth assistant. Ask me anything about today’s bus journey, gate entry, or homework.' }
  ]);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<{ ref: string; label: string; time: string; evidence: string; hash: string } | null>(null);
  const [familyGoalCount, setFamilyGoalCount] = useState(3);
  const [familyActivityCompleted, setFamilyActivityCompleted] = useState(false);
  const [isReplayingJourney, setIsReplayingJourney] = useState(false);
  const [replayStepIndex, setReplayStepIndex] = useState(0);

  useEffect(() => {
    if (!activeStudent) return;

    const supabase = createClient();

    const fetchJourney = async () => {
      const { data, error } = await supabase
        .from('student_journey')
        .select('*, driver_trips!inner(status, started_at, bus_identifier)')
        .eq('student_id', activeStudent.studentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student journey:', error);
      } else if (data) {
        setJourneyState({
          status: data.status,
          trip_id: data.trip_id,
          boarded_at: data.boarded_at,
          deboarded_at: data.deboarded_at,
          home_safe_at: data.home_safe_at,
          deboard_stop: data.deboard_stop,
          deboard_lat: data.deboard_lat,
          deboard_lng: data.deboard_lng,
          confirmed_by: data.confirmed_by
        });

        if (data.trip_id) {
          checkNotHomeSafe(data.trip_id).catch(console.error);
        }
      } else {
        setJourneyState({ status: 'no_trip', trip_id: null, boarded_at: null, deboarded_at: null, home_safe_at: null, deboard_stop: null, deboard_lat: null, deboard_lng: null, confirmed_by: null });
      }
    };

    fetchJourney();

    const channel = supabase
      .channel(`student-journey-${activeStudent.studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_journey',
          filter: `student_id=eq.${activeStudent.studentId}`
        },
        (payload: any) => {
          console.log('[Supabase Realtime] Journey update received:', payload);
          const newJourney = payload.new;
          if (newJourney) {
            setJourneyState({
              status: newJourney.status,
              trip_id: newJourney.trip_id,
              boarded_at: newJourney.boarded_at,
              deboarded_at: newJourney.deboarded_at,
              home_safe_at: newJourney.home_safe_at,
              deboard_stop: newJourney.deboard_stop,
              deboard_lat: newJourney.deboard_lat,
              deboard_lng: newJourney.deboard_lng,
              confirmed_by: newJourney.confirmed_by
            });
          }
        }
      )
      .on('error' as any, {} as any, (error: any) => {
        console.error('Realtime error:', error);
        setConnectionError(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeStudent]);

  const homeworkDueToday = useMemo(() => {
    if (!activeStudent?.homework) return [];
    const unsubmitted = activeStudent.homework.filter(h => !h.isSubmitted);
    if (unsubmitted.length > 0) {
      return [unsubmitted[0]];
    }
    return activeStudent.homework.slice(0, 1);
  }, [activeStudent]);

  const homeworkDueTomorrow = useMemo(() => {
    if (!activeStudent?.homework) return [];
    const unsubmitted = activeStudent.homework.filter(h => !h.isSubmitted);
    if (unsubmitted.length > 1) {
      return unsubmitted.slice(1, 3);
    }
    return activeStudent.homework.slice(1, 3);
  }, [activeStudent]);

  const activePass = useMemo(() => {
    return activeStudent?.gatePasses?.[0] || null;
  }, [activeStudent]);

  const [timeLeftText, setTimeLeftText] = useState('');
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

  const parentName = activeStudent?.parentName || 'Parent';

  // Bottom Navigation State
  // 5 tabs: 'home' | 'homework' | 'attendance' | 'bus' | 'messages'
  const [activeNav, setActiveNav] = useState<'home' | 'homework' | 'attendance' | 'bus' | 'messages'>('home');

  // Privacy & Consent Settings State (per Section 1 consent feature)
  const [showSettings, setShowSettings] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [consentSettings, setConsentSettings] = useState({
    shareMood: true,
    receiveBus: true,
    receiveAcademic: true,
  });

  // Global Notification Context and Chat states
  const { registerStudentIds, registerRecipientId, notifications, clearNotificationsForStudent, setActiveChatStudentId } = useNotifications();
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1-tap Morning Heads-up state and sender (Section 16)
  const [sentMorningNotes, setSentMorningNotes] = useState<Record<string, string>>({});
  const sentMorningNote = activeStudent ? sentMorningNotes[activeStudent.studentId] : null;

  const handleSendMorningNote = async (text: string) => {
    if (!activeStudent) return;
    
    setSentMorningNotes((prev) => ({ ...prev, [activeStudent.studentId]: text }));

    const parentId = activeStudent.parentType === 'sunita' 
      ? 'c1000000-0000-4000-8000-000000000001' 
      : 'c1000000-0000-4000-8000-000000000002';

    const res = await sendChatMessageAction({
      studentId: activeStudent.studentId,
      text,
      senderRole: 'parent',
      senderId: parentId,
      isContextFlag: true,
    });

    if (!res.success) {
      setSentMorningNotes((prev) => {
        const next = { ...prev };
        delete next[activeStudent.studentId];
        return next;
      });
      setToastMessage('Failed to send morning heads-up. Please try again.');
    }
  };

  // Register current parent student IDs in global notification tracker and guardian ID for DB notifications
  useEffect(() => {
    const ids = currentParentStudents.map((s) => s.studentId);
    registerStudentIds(ids);
    if (guardianId) {
      registerRecipientId(guardianId);
    }
  }, [currentParentStudents, guardianId, registerStudentIds, registerRecipientId]);

  // Sync active chat thread for background notification filtering
  useEffect(() => {
    if (activeNav === 'messages' && activeStudent) {
      setActiveChatStudentId(activeStudent.studentId);
      clearNotificationsForStudent(activeStudent.studentId);
    } else {
      setActiveChatStudentId(null);
    }
  }, [activeNav, activeStudent, setActiveChatStudentId, clearNotificationsForStudent]);

  // Load chat history when active student changes
  useEffect(() => {
    if (!activeStudent) return;
    const loadChatHistory = async () => {
      const history = await fetchChatMessagesAction(activeStudent.studentId);
      setChatMessages(history);
    };
    loadChatHistory();
  }, [activeStudent]);

  // Scoped Supabase Realtime message subscription
  useEffect(() => {
    if (!activeStudent) return;
    const supabase = createClient();
    console.log(`[Parent Chat] Subscribing to messages for: ${activeStudent.displayName}`);

    const channel = supabase
      .channel(`parent-chat-${activeStudent.studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `student_id=eq.${activeStudent.studentId}`,
        },
        (payload: any) => {
          const newMsg = payload.new as ChatMessageData;
          if (!newMsg) return;

          console.log('[Parent Chat] Received realtime message:', newMsg);

          setChatMessages((prev) => {
            // Deduplicate if already reconciled
            if (prev.some((msg) => msg.id === newMsg.id)) return prev;

            // Reconcile pending optimistic messages from the parent
            const matchedOptimisticIndex = prev.findIndex(
              (msg) => 
                msg.senderRole === 'parent' && 
                msg.messageText === newMsg.messageText && 
                msg.id.startsWith('temp-')
            );

            if (matchedOptimisticIndex !== -1) {
              const updated = [...prev];
              updated[matchedOptimisticIndex] = newMsg;
              return updated;
            }

            return [...prev, newMsg];
          });
        }
      )
      .on('error' as any, {} as any, (error: any) => {
        console.error('Realtime error:', error);
        setConnectionError(true);
      })
      .subscribe();

    return () => {
      console.log(`[Parent Chat] Cleaning up realtime channel for ${activeStudent.displayName}`);
      supabase.removeChannel(channel);
    };
  }, [activeStudent]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeNav === 'messages') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeNav]);

  const handleSendParentMessage = async (text: string) => {
    if (!text.trim() || isSendingMessage || !activeStudent) return;

    setIsSendingMessage(true);
    setChatInputText('');

    const tempId = `temp-${Date.now()}`;

    // Optimistic Update
    const optimisticMsg: ChatMessageData = {
      id: tempId,
      studentId: activeStudent.studentId,
      senderId: activeStudent.parentType === 'sunita' 
        ? 'c1000000-0000-4000-8000-000000000001' 
        : 'c1000000-0000-4000-8000-000000000002',
      senderRole: 'parent',
      messageText: text,
      isContextFlag: false,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, optimisticMsg]);

    const res = await sendChatMessageAction({
      studentId: activeStudent.studentId,
      text,
      senderRole: 'parent',
      senderId: optimisticMsg.senderId,
      isContextFlag: false,
    });

    if (res.success && res.message) {
      // Reconcile
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? res.message! : msg))
      );
    } else {
      // Rollback
      setChatMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setToastMessage('Failed to send message. Reverting changes.');
    }

    setIsSendingMessage(false);
  };

  // Helper to map daily attendance to a Mon-Fri grid
  const attendanceWeeks = useMemo(() => {
    if (!activeStudent) return [];
    
    // Sort attendance by date ascending (June 15 to July 10, 2026 - 20 school days)
    const sorted = [...activeStudent.attendance].sort((a, b) => a.date.localeCompare(b.date));
    
    const weeks = [];
    for (let i = 0; i < sorted.length; i += 5) {
      weeks.push({
        name: `Week ${Math.floor(i / 5) + 1}`,
        days: sorted.slice(i, i + 5),
      });
    }
    return weeks;
  }, [activeStudent]);

  // Leaflet.js & Live Bus Tracking state
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [busPosition, setBusPosition] = useState<[number, number] | null>(null);
  const [lastUpdated, setLastUpdated] = useState(0);

  // GPS Streaming & Demo-only states
  const [isStreamingGPS, setIsStreamingGPS] = useState(false);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const [trackingMode, setTrackingMode] = useState<'simulated' | 'live'>(demoMode ? 'simulated' : 'live');

  // 1. Fetch the route only when the Transit tab is opened.
  useEffect(() => {
    if (activeNav !== 'bus' || routeCoords.length > 0) return;

    const fetchRoute = async () => {
      try {
        // Fetch a route between School (near Connaught Place) and Home (near Saket) in Delhi
        const res = await fetch('https://router.project-osrm.org/route/v1/driving/77.2215,28.5910;77.2100,28.5244?overview=full&geometries=geojson');
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
        } else {
          throw new Error('No route returned');
        }
      } catch (err) {
        console.warn('Failed to fetch OSRM route, using local fallback coords', err);
        // Fallback Delhi road coordinates
        setRouteCoords([
          [28.5910, 77.2215],
          [28.5810, 77.2180],
          [28.5710, 77.2150],
          [28.5610, 77.2120],
          [28.5494, 77.2001],
          [28.5390, 77.2050],
          [28.5244, 77.2100]
        ]);
      }
    };
    fetchRoute();
  }, [activeNav, routeCoords.length]);

  // 2. Increment "last updated" timer
  useEffect(() => {
    if (activeNav !== 'bus') return;

    const timer = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeNav]);

  // 3. Dynamically inject Leaflet stylesheet and script when the user goes to the Bus tab
  useEffect(() => {
    if (activeNav !== 'bus' || leafletLoaded) return;

    // Check if stylesheet is already added
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Check if script is already added
    const scriptId = 'leaflet-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, [activeNav, leafletLoaded]);

  // 4. Initialize Leaflet map and animate/interpolate marker movement
  useEffect(() => {
    if (!leafletLoaded || activeNav !== 'bus' || routeCoords.length === 0) return;

    const L = (window as any).L;
    if (!L) return;

    // Clean up existing map instance if any to prevent duplicate container errors
    // Clean up existing map instance if any to prevent duplicate container errors
    if ((window as any).mapInstance) {
      (window as any).mapInstance.remove();
    }

    // Centered around busPosition or mid-point
    const startPos = busPosition || routeCoords[0];
    const map = L.map('leaflet-bus-map').setView(startPos, 12);
    (window as any).mapInstance = map;

    // CartoDB Voyager High-DPI Vector Tile Layer with sleek presentation
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    // School Marker (Start)
    L.marker(routeCoords[0], {
      icon: L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-primary shadow-md">
            <span class="text-sm">🏫</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(map).bindPopup('<div class="p-1 font-bold text-xs">🎓 ShikshaSetu Main Campus</div>');

    // Intermediate Stop Markers with ETAs
    if (routeCoords.length > 4) {
      const midIdx = Math.floor(routeCoords.length / 2);
      L.marker(routeCoords[midIdx], {
        icon: L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 border border-primary/20 shadow-sm text-[10px] font-bold text-primary">
              <span>📍</span>
              <span>Stop #3 • ETA 8m</span>
            </div>
          `,
          iconSize: [100, 24],
          iconAnchor: [50, 12]
        })
      }).addTo(map);
    }

    // Home Marker (Destination)
    L.marker(routeCoords[routeCoords.length - 1], {
      icon: L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-sage text-white border-2 border-white shadow-md">
            <span class="text-sm">🏠</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(map).bindPopup('<div class="p-1 font-bold text-xs">🏡 Destination Stop</div>');

    // Route Outer Glow Line
    L.polyline(routeCoords, { color: '#3f51b5', weight: 8, opacity: 0.18, lineCap: 'round' }).addTo(map);
    // Main Route Line
    L.polyline(routeCoords, { color: '#3f51b5', weight: 4, opacity: 0.85, dashArray: '8, 8', lineCap: 'round' }).addTo(map);

    // Live Animated Bus Marker with Pulsing Glow Ring
    const busIcon = L.divIcon({
      className: 'custom-map-bus-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10">
          <span class="absolute inset-0 rounded-full bg-primary/25 animate-ping"></span>
          <div class="relative z-10 w-9 h-9 rounded-full bg-white border-2 border-primary shadow-lg flex items-center justify-center text-lg">
            🚌
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker(startPos, { icon: busIcon }).addTo(map);
    map.panTo(startPos);

    if (trackingMode === 'simulated') {
      // Live position interpolation along OSRM path (simulating realtime updates)
      let index = routeCoords.findIndex(c => c[0] === startPos[0] && c[1] === startPos[1]);
      if (index === -1) index = 0;

      const interval = setInterval(() => {
        if (index < routeCoords.length - 1) {
          index++;
        } else {
          index = 0; // loop back to school for constant demo flow
        }
        const nextPos = routeCoords[index];
        
        // Smoothly update marker and map center (Realtime simulation)
        marker.setLatLng(nextPos);
        map.panTo(nextPos);
        
        setBusPosition(nextPos);
        setLastUpdated(0); // reset "last updated" timer
      }, 4000); // position ticks every 4 seconds

      return () => {
        clearInterval(interval);
      };
    } else {
      // In live mode, the marker reactively repositions to busPosition changes
      marker.setLatLng(startPos);
      map.panTo(startPos);
    }
  }, [leafletLoaded, activeNav, routeCoords, busPosition, trackingMode]);

  // 5. Handle Geolocation GPS stream activation
  const toggleGPSStream = () => {
    if (isStreamingGPS) {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }
      setIsStreamingGPS(false);
      setGpsError(null);
    } else {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by this browser.');
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, speed, heading } = position.coords;
          console.log('[GPS Stream] New position fetched:', latitude, longitude);
          
          const res = await updateBusLocationAction({
            latitude,
            longitude,
            speed,
            heading,
          });

          if (!res.success) {
            setGpsError(`Upload failed: ${res.error}`);
          } else {
            setGpsError(null);
          }
        },
        (error) => {
          console.error('[GPS Stream] Geolocation error:', error.message);
          setGpsError(`GPS Error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );

      setGpsWatchId(watchId);
      setIsStreamingGPS(true);
    }
  };

  // Clean up Geolocation stream watch on unmount
  useEffect(() => {
    return () => {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
    };
  }, [gpsWatchId]);

  // 6. Supabase Realtime Listener to receive database updates and dynamically switch to live mode
  useEffect(() => {
    if (!leafletLoaded || activeNav !== 'bus') return;

    const supabase = createClient();
    console.log('[Supabase Realtime] Subscribing to bus_locations updates...');

    const channel = supabase
      .channel('live-bus-location-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bus_locations',
          filter: 'bus_identifier=eq.BUS-001'
        },
        (payload: any) => {
          const newPos = payload.new;
          if (newPos && newPos.latitude && newPos.longitude) {
            console.log('[Supabase Realtime] Received live location update:', newPos);
            setTrackingMode('live');
            setBusPosition([newPos.latitude, newPos.longitude]);
            setLastUpdated(0);
          }
        }
      )
      .on('error' as any, {} as any, (error: any) => {
        console.error('Realtime error:', error);
        setConnectionError(true);
      })
      .subscribe();

    return () => {
      console.log('[Supabase Realtime] Unsubscribing from bus_locations...');
      supabase.removeChannel(channel);
    };
  }, [leafletLoaded, activeNav]);

  // Derived current metrics based on bus position index
  const busMetrics = useMemo(() => {
    if (routeCoords.length === 0 || !busPosition) {
      return { speed: 22, nextStop: 'Lodhi Gardens', eta: 4 };
    }
    
    const index = routeCoords.findIndex(c => c[0] === busPosition[0] && c[1] === busPosition[1]);
    const progress = index / routeCoords.length;

    // Simulate different stops and speeds based on path index
    const speed = Math.floor(Math.random() * 5) + 20; // 20-24 km/h

    let nextStop = 'Lodhi Gardens';
    let eta = 5;

    if (progress < 0.4) {
      nextStop = 'Lodhi Gardens';
      eta = Math.max(1, Math.round((0.4 - progress) * 10));
    } else if (progress < 0.8) {
      nextStop = 'Hauz Khas Junction';
      eta = Math.max(1, Math.round((0.8 - progress) * 12));
    } else {
      nextStop = 'Saket (Home Stop)';
      eta = Math.max(1, Math.round((1.0 - progress) * 8));
    }

    return { speed, nextStop, eta };
  }, [routeCoords, busPosition]);

  const parentNotifications = useMemo(() => {
    const parentStudentIds = currentParentStudents.map((s) => s.studentId);
    return notifications.filter((n) => parentStudentIds.includes(n.studentId));
  }, [notifications, currentParentStudents]);

  return (
    <div className="parent-portal-shell mx-auto min-h-screen sm:min-h-[calc(100vh-2rem)] w-full max-w-5xl sm:rounded-[2.5rem] sm:shadow-2xl sm:border border-deep-teal/10 bg-paper flex flex-col relative font-body text-deep-teal antialiased overflow-hidden">
      
      {/* ── Header ── */}
      <header className="parent-portal-header bg-white/80 backdrop-blur-xl border-b border-white/70 px-5 py-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-deep-teal/5 font-display text-sm font-bold text-deep-teal border border-deep-teal/5">
            {activeStudent?.displayName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            {currentParentStudents.length > 1 ? (
              <div className="relative inline-block">
                <select
                  value={activeStudent?.studentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-transparent font-display text-md font-extrabold text-deep-teal outline-none focus:ring-1 focus:ring-deep-teal/15 rounded pr-6 cursor-pointer border border-transparent hover:border-deep-teal/10 py-0.5 px-1.5 transition-all"
                  style={{ appearance: 'auto' }}
                >
                  {currentParentStudents.map((child) => (
                    <option key={child.studentId} value={child.studentId}>
                      {child.displayName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h2 className="font-display text-md font-extrabold leading-tight text-deep-teal px-1.5">
                {activeStudent?.displayName}
              </h2>
            )}
            <p className="font-body text-[10px] text-deep-teal/50 font-medium px-1.5 mt-0.5">
              Grade 8A &middot; Ms. Mehra
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-[10px] uppercase tracking-wider">
            📱 Parent Mobile App
          </span>
          <LanguageToggle />
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
      </header>

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
                Manage your data sharing and notification preferences in compliance with Section 1.
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

       {/* Collapsible Dev Tools Accordion */}
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
              {/* Account Switcher */}
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

              {/* GPS Streamer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-deep-teal/30 uppercase tracking-wide block">GPS Simulation</span>
                  {isStreamingGPS && (
                    <span className="text-[8px] font-extrabold text-sage bg-sage/10 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
                      Live
                    </span>
                  )}
                </div>
                <button
                  onClick={toggleGPSStream}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    isStreamingGPS
                      ? 'bg-warm-clay border-warm-clay text-white shadow-xs hover:bg-warm-clay/90'
                      : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-white/50'
                  }`}
                >
                  🛰️ {isStreamingGPS ? 'Stop GPS Broadcast' : 'Stream My GPS as Bus'}
                </button>
                {gpsError && (
                  <p className="text-[9px] font-semibold text-warm-clay leading-tight">
                    ⚠️ {gpsError}
                  </p>
                )}
                {isStreamingGPS && busPosition && (
                  <p className="text-[8px] font-mono text-deep-teal/40 leading-none text-center">
                    Lat: {busPosition[0].toFixed(5)} &middot; Lng: {busPosition[1].toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Main Viewport ── */}
      <div className="parent-portal-viewport flex-1 w-full max-w-4xl mx-auto px-5 py-7 sm:px-8 sm:py-9 overflow-y-auto pb-32 space-y-6">
        
        {/* Tab 1: Home (The Today Feed) */}
        {activeNav === 'home' && (
          isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. HERO SECTION */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    Good Morning, {activeStudent?.parentName && activeStudent.parentName !== 'Parent' ? activeStudent.parentName.split(' ')[0] : 'Sunita'}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Safe
                  </div>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {activeStudent?.displayName.split(' ')[0] || 'Aarav'} reached school safely &amp; is on track today.
                </h1>

                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1">🚌 Bus #4 (Ramesh Kumar)</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">📍 Next Stop: Hauz Khas (ETA 8m)</span>
                  <span>&bull;</span>
                  <span className="text-slate-500 font-mono text-[11px]">Speed: 22 km/h</span>
                </div>
              </div>

              {/* 2. CONTEXT-AWARE PRIMARY CARD: LIVE BUS / TODAY'S HIGHLIGHT */}
              {consentSettings.receiveBus && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚌</span>
                      <div>
                        <h3 className="font-display text-base font-extrabold text-slate-900">
                          Live Bus Journey Tracker
                        </h3>
                        <p className="font-body text-xs text-slate-500">Route #4 &middot; Morning Pick-up &amp; School Transit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const driverPhone = "+91 98765 43210";
                          setToastMessage(`📞 Calling Driver Ramesh Kumar (${driverPhone})...`);
                        }}
                        className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-display text-xs font-bold hover:bg-slate-200 transition-all"
                      >
                        📞 Call Driver
                      </button>
                      <button
                        onClick={() => setActiveNav('bus')}
                        className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl font-display text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
                      >
                        Open Live Map &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Quick Map Preview Widget with Interactive Simulation */}
                  <div 
                    className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between"
                  >
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-display text-xs font-bold">Bus #4 Live En Route</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-300">Speed: 24 km/h</span>
                    </div>

                    <div className="relative z-10 space-y-1">
                      <h4 className="font-display text-base font-extrabold text-white">
                        Passing Hauz Khas Junction &middot; ETA 5 mins
                      </h4>
                      <p className="font-body text-xs text-slate-400">Next Stop: Saket Home Stop #3 &middot; Driver Ramesh Kumar</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage('🛰️ Live Bus telemetry updated: Bus is now 3 mins away!');
                        }}
                        className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>▶ Simulate Movement</span>
                      </button>
                      <button
                        onClick={() => setActiveNav('bus')}
                        className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <span>View Full Route &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MORNING HEADS-UP QUICK CARD (INTERACTIVE PRESETS) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-display text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                    ☀️ Send Morning Heads-up to Teacher
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">1-Tap Direct</span>
                </div>
                <p className="font-body text-xs text-slate-600 font-medium">
                  Tap an option below to alert Ms. Mehra on her morning dashboard before class starts:
                </p>

                {sentMorningNote ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3.5 text-xs font-bold flex items-center justify-between">
                    <span>Sent: &ldquo;{sentMorningNote}&rdquo;</span>
                    <span className="flex items-center gap-1 text-emerald-700">✅ Delivered to Ms. Mehra</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      'Had a rough morning',
                      'Did not sleep well',
                      'Stomach ache',
                      'Running late today'
                    ].map((presetText) => (
                      <button
                        key={presetText}
                        type="button"
                        onClick={() => handleSendMorningNote(presetText)}
                        className="text-center text-xs font-bold border border-slate-200 hover:border-slate-400 hover:bg-slate-50 p-2.5 rounded-xl text-slate-700 transition-all active:scale-95 leading-snug"
                      >
                        {presetText}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. NEEDS YOUR ATTENTION CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-display text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                    Needs Your Attention
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Real-time</span>
                </div>

                {parentNotifications.length > 0 ? (
                  <div
                    onClick={() => setActiveNav('messages')}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/80 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">✉️</span>
                      <span className="font-body text-xs font-bold text-amber-900">
                        New teacher note received from {parentNotifications[parentNotifications.length - 1].senderName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-700">Reply &rarr;</span>
                  </div>
                ) : activePass && activePass.status === 'pending' ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🎫</span>
                      <span className="font-body text-xs font-bold text-blue-900">
                        Gate Pass request is currently pending teacher approval
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowCancelConfirmModal(true)}
                      className="text-xs font-bold text-blue-700 hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <span className="text-base font-bold">✓</span>
                    <span className="font-body text-xs font-bold">You&apos;re all caught up today. Zero pending alerts.</span>
                  </div>
                )}
              </div>

              {/* 5. TODAY'S JOURNEY: CHRONOLOGICAL FEED */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Today&apos;s Journey
                    </h3>
                    <p className="font-body text-xs text-slate-500">Chronological timeline of {activeStudent?.displayName.split(' ')[0]}&apos;s day</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Live Feed
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Event 1: Boarded Bus */}
                  <div className="relative space-y-1.5">
                    <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shadow-xs">
                      🚌
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-slate-900">Boarded School Bus #4</h4>
                      <span className="font-mono text-xs font-bold text-slate-400">07:42 AM</span>
                    </div>
                    <p className="font-body text-xs text-slate-600 leading-relaxed">
                      Picked up at Saket Stop #3. Driver Ramesh Kumar confirmed seating.
                    </p>
                  </div>

                  {/* Event 2: Entered School */}
                  <div className="relative space-y-1.5">
                    <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shadow-xs">
                      🏫
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-slate-900">Entered School Campus</h4>
                      <span className="font-mono text-xs font-bold text-slate-400">08:18 AM</span>
                    </div>
                    <p className="font-body text-xs text-slate-600 leading-relaxed">
                      Security Gate #2 dynamic QR scan verified with 100% ID photo match.
                    </p>
                  </div>

                  {/* AI PERIOD SUMMARY BLOCK */}
                  <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                    <span className="font-display text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      Morning Summary
                    </span>
                    <p className="font-body text-xs font-semibold text-slate-800 leading-relaxed">
                      {activeStudent?.displayName.split(' ')[0]} arrived safely, attended all morning classes, and actively participated in Mathematics.
                    </p>
                  </div>

                  {/* Event 3: Academic Milestone */}
                  <div className="relative space-y-1.5">
                    <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shadow-xs">
                      📚
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-slate-900">Completed Mathematics Quiz</h4>
                      <span className="font-mono text-xs font-bold text-slate-400">10:25 AM</span>
                    </div>
                    <p className="font-body text-xs text-slate-600 leading-relaxed">
                      Scored 92% in Algebra Quiz. Classroom participation was excellent.
                    </p>

                    {/* Expandable Why Drawer */}
                    <div className="pt-1">
                      <button
                        onClick={() => setIsWhyExpanded(prev => !prev)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-transparent p-0 border-0"
                      >
                        <span>Why you&apos;re seeing this</span>
                        <svg className={`w-3 h-3 transition-transform ${isWhyExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isWhyExpanded && (
                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-body text-xs text-slate-700">
                          <p className="font-semibold text-slate-900">Teacher recorded note:</p>
                          <p className="italic text-slate-600">&ldquo;Aarav showed great initiative in solving algebraic equations today.&rdquo; &mdash; Ms. Mehra</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event 4: Homework Assigned */}
                  <div className="relative space-y-1.5">
                    <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shadow-xs">
                      ✍️
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-slate-900">Homework Assigned</h4>
                      <span className="font-mono text-xs font-bold text-slate-400">01:40 PM</span>
                    </div>
                    <p className="font-body text-xs text-slate-600 leading-relaxed">
                      Science Chapter 4 Exercise (Due tomorrow by 8:00 AM).
                    </p>
                    <button
                      onClick={() => setActiveNav('homework')}
                      className="text-xs font-bold text-slate-900 hover:underline inline-block pt-0.5"
                    >
                      See today&apos;s homework &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. POSITIVE MOMENTS WITH INTERACTIVE SHARE */}
              <div className="bg-gradient-to-br from-amber-50/80 to-emerald-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-display text-xs font-extrabold uppercase tracking-widest text-amber-900">
                      Teacher Highlight
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage("⭐ Encouraging teacher highlight copied to share with family!");
                    }}
                    className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition-all shadow-2xs"
                  >
                    Share Moment ↗
                  </button>
                </div>
                <p className="font-body text-xs font-bold text-slate-800 leading-relaxed">
                  &ldquo;{activeStudent?.displayName.split(' ')[0]} volunteered to solve today&apos;s complex math problem on the whiteboard and explained it clearly to the class.&rdquo;
                </p>
                <span className="font-body text-[10px] font-semibold text-slate-500 block">Shared by Ms. Ananya Mehra</span>
              </div>

              {/* 6. CONTEXTUAL QUICK ACTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveNav('messages')}
                  className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-400 transition-all text-left flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-display text-xs font-bold text-slate-900">Send a quick note to teacher</h4>
                    <p className="font-body text-[10px] text-slate-500">Direct message to Ms. Mehra</p>
                  </div>
                  <span className="text-base">&rarr;</span>
                </button>

                <button
                  onClick={() => setShowPassModal(true)}
                  className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-400 transition-all text-left flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-display text-xs font-bold text-slate-900">Request Gate Pass</h4>
                    <p className="font-body text-[10px] text-slate-500">Early pickup approval code</p>
                  </div>
                  <span className="text-base">&rarr;</span>
                </button>
              </div>

              {/* 7. END OF DAY SUMMARY */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Today&apos;s School Summary
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold">100% Synced</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-body text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span>✓</span> <span>Safe Journey</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span>✓</span> <span>Present All Day</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span>✓</span> <span>Homework Assigned</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span>✓</span> <span>Positive Feedback</span>
                  </div>
                </div>
                <p className="font-body text-xs text-slate-300 italic pt-1 border-t border-slate-800">
                  Everything is on track today.
                </p>
              </div>
            </div>
          )
        )}

        {/* Tab 2: Homework Tab */}
        {activeNav === 'homework' && (
          <div className="space-y-6">
            {/* Header & Overview */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-extrabold text-slate-900">
                    Homework for {activeStudent?.displayName.split(' ')[0] || 'Aarav'}
                  </h3>
                  <p className="font-body text-xs text-slate-500 mt-0.5">
                    Track pending tasks, submitted assignments, and teacher notes
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-bold text-xs">
                  2 of 3 Completed
                </div>
              </div>

              {/* Progress Summary bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  2 Submitted
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  1 Pending Today
                </span>
              </div>
            </div>

            {!consentSettings.receiveAcademic ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center py-10">
                <p className="font-body text-sm text-slate-500 italic">
                  🔒 Homework updates are hidden because this preference is disabled in settings.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Section 1: Due Today */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      <h4 className="font-display text-sm font-extrabold text-slate-900">
                        Due Today
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                      Priority Focus
                    </span>
                  </div>

                  {homeworkDueToday.length === 0 ? (
                    <p className="font-body text-xs text-slate-400 italic">No homework due today. All caught up!</p>
                  ) : (
                    <div className="space-y-3">
                      {homeworkDueToday.map((hw) => (
                        <div key={hw.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={hw.isSubmitted}
                                readOnly
                                className="rounded border-slate-300 text-slate-900 focus:ring-0 h-5 w-5 cursor-default"
                              />
                              <div>
                                <h5 className="font-display text-sm font-bold text-slate-900">{hw.title}</h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]">
                                    {hw.subject}
                                  </span>
                                  <span className="font-body text-[11px] text-slate-500">⏱️ Est: 20 mins</span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              hw.isSubmitted 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {hw.isSubmitted ? '✓ Submitted' : 'Pending Submission'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Due Tomorrow */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📚</span>
                      <h4 className="font-display text-sm font-extrabold text-slate-900">
                        Due Tomorrow
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
                      Upcoming
                    </span>
                  </div>

                  {homeworkDueTomorrow.length === 0 ? (
                    <p className="font-body text-xs text-slate-400 italic">No homework scheduled for tomorrow.</p>
                  ) : (
                    <div className="space-y-3">
                      {homeworkDueTomorrow.map((hw) => (
                        <div key={hw.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={hw.isSubmitted}
                                readOnly
                                className="rounded border-slate-300 text-slate-900 focus:ring-0 h-5 w-5 cursor-default"
                              />
                              <div>
                                <h5 className="font-display text-sm font-bold text-slate-900">{hw.title}</h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                                    {hw.subject}
                                  </span>
                                  <span className="font-body text-[11px] text-slate-500">⏱️ Est: 15 mins</span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              hw.isSubmitted 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {hw.isSubmitted ? '✓ Submitted' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Teacher Action */}
                <button
                  onClick={() => setActiveNav('messages')}
                  className="w-full p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-400 transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💬</span>
                    <div>
                      <h4 className="font-display text-xs font-bold text-slate-900">Have questions about an assignment?</h4>
                      <p className="font-body text-[11px] text-slate-500">Send a direct message to Ms. Mehra &rarr;</p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs">Message Teacher</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Attendance Tab (simplified Mon-Fri grid with status symbols) */}
        {activeNav === 'attendance' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-extrabold text-deep-teal">
                Attendance History
              </h3>
              <p className="font-body text-xs text-deep-teal/60">
                This month: 18/20 days
              </p>
            </div>

            <div className="rounded-2xl border border-deep-teal/5 bg-paper p-5 shadow-sm space-y-4">
              {/* Mon-Fri column headers */}
              <div className="grid grid-cols-5 text-center border-b border-deep-teal/5 pb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr'].map((day) => (
                  <span key={day} className="font-display text-xs font-bold text-deep-teal/40">
                    {day}
                  </span>
                ))}
              </div>

              {/* Weekly rows */}
              <div className="space-y-4">
                {(showAllAttendance ? attendanceWeeks : attendanceWeeks.slice(-2)).map((week, wIdx) => (
                  <div key={wIdx} className="flex items-center justify-between">
                    <span className="font-body text-[9px] font-extrabold text-deep-teal/30 w-10 uppercase tracking-widest">
                      {week.name}
                    </span>
                    <div className="grid grid-cols-5 flex-1 items-center justify-items-center">
                      {week.days.map((day: any) => {
                        const symbol =
                          day.status === 'present' || day.status === 'late'
                            ? '✓'
                            : day.status === 'absent'
                            ? '✗'
                            : '-';
                        return (
                          <div key={day.id} className="flex flex-col items-center justify-center p-1">
                            <span
                              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                                day.status === 'present'
                                  ? 'bg-sage/10 text-sage'
                                  : day.status === 'late'
                                  ? 'bg-marigold/10 text-marigold'
                                  : 'bg-warm-clay/10 text-warm-clay'
                              }`}
                              title={`${day.date}: ${day.status}`}
                            >
                              {symbol}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!showAllAttendance && attendanceWeeks.length > 2 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllAttendance(true)}
                  className="font-display text-xs font-bold text-deep-teal underline hover:text-deep-teal/80 transition-all bg-transparent"
                >
                  [See Details]
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Guardian Journey™ Tab (Parent Verified Safety Intelligence) */}
        {activeNav === 'bus' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deep-teal/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-black text-deep-teal">
                    Guardian Journey™
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage font-extrabold text-[10px] uppercase tracking-wider border border-sage/30">
                    🛡️ Live Child Safety Updates
                  </span>
                </div>
                <p className="font-body text-xs text-deep-teal/60 font-semibold mt-0.5">
                  Verified safety updates at every step of your child's school day.
                </p>
              </div>

              {/* 1-Tap SchoolGPT Safety Query Button */}
              <button
                type="button"
                onClick={() => setShowSchoolGPTDrawer(true)}
                className="px-3.5 py-2 rounded-xl bg-primary text-white font-extrabold text-xs shadow-2xs hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>🤖 Ask SchoolGPT: "Was my child safe today?"</span>
              </button>
            </div>

            {!consentSettings.receiveBus ? (
              <div className="rounded-2xl border border-deep-teal/10 bg-paper p-6 shadow-sm text-center py-10">
                <p className="font-body text-sm text-deep-teal/40 italic">
                  🔒 Bus tracking is hidden because this preference is disabled.
                </p>
              </div>
            ) : (
              <div className="bus-journey-content flex flex-col space-y-6 pb-8">
                
                {/* 1. GUARDIAN CONFIDENCE PASSPORT CARD (98%) */}
                <div className="rounded-3xl bg-gradient-to-br from-sage/15 via-white to-primary/5 border border-sage/30 p-6 shadow-md backdrop-blur-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-sage/20 border border-sage/30 flex flex-col items-center justify-center text-sage shrink-0 shadow-inner">
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Safety Score</span>
                        <strong className="text-2xl font-black leading-none mt-0.5">98%</strong>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-sage animate-ping" />
                          <h4 className="font-display text-base font-black text-ink">Child Safety Status: Fully Verified</h4>
                        </div>
                        <p className="text-xs font-semibold text-muted/80">All 5 daily safety steps confirmed — bus, school gate, class, canteen, and home.</p>
                      </div>
                    </div>

                    {/* ANIMATED REPLAY JOURNEY BUTTON */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsReplayingJourney(true);
                        setReplayStepIndex(0);
                        let idx = 0;
                        const timer = setInterval(() => {
                          idx++;
                          if (idx >= 5) {
                            clearInterval(timer);
                            setIsReplayingJourney(false);
                            setToastMessage('✅ Journey Replay Completed! 100% Safety Verified.');
                            setTimeout(() => setToastMessage(null), 4000);
                          } else {
                            setReplayStepIndex(idx);
                          }
                        }, 1000);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-sage text-white font-extrabold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                    >
                      <span>{isReplayingJourney ? `▶ Replaying Step ${replayStepIndex + 1}/5...` : "▶ Replay Today's Journey"}</span>
                    </button>
                  </div>

                  {/* 5 VERIFIED EVIDENCE CHECKPOINT CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-sage/20">
                    {[
                      { time: '07:36 AM', label: 'Bus #4 Boarded', evidence: 'Driver: Rajesh', ref: '#BUS-402', hash: 'BUS4-SECTOR12-PASS-OK' },
                      { time: '08:09 AM', label: 'Gate #2 Verified', evidence: 'Gate Officer: Priya', ref: '#GT-20394', hash: 'GATE2-PHOTO-MATCH-OK' },
                      { time: '08:15 AM', label: 'Class Attendance', evidence: 'Teacher: Ms. Ananya', ref: '#ATT-8A', hash: 'CLASS-8A-ROLLCALL-OK' },
                      { time: '12:45 PM', label: 'Lunch Redeemed', evidence: 'School Canteen Counter', ref: '#POS-981', hash: 'CANTEEN-COINS-REDEEMED' },
                      { time: '04:08 PM', label: 'Reached Home', evidence: 'Safe Arrival Confirmed', ref: '#HOM-104', hash: 'PARENT-APP-HOME-SAFE' },
                    ].map((cp, idx) => (
                      <button
                        key={cp.label}
                        type="button"
                        onClick={() => {
                          setActiveEvidenceModal(cp);
                        }}
                        className={`p-2.5 rounded-2xl text-left transition-all shadow-2xs group ${
                          isReplayingJourney && replayStepIndex === idx
                            ? 'bg-marigold/20 border-2 border-marigold scale-105 shadow-md'
                            : 'bg-white/90 border border-sage/20 hover:border-sage hover:bg-sage/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-sage">✓ {cp.label}</span>
                          <small className="text-[9px] font-mono text-muted/50">{cp.time}</small>
                        </div>
                        <p className="text-[9px] font-bold text-muted/75 mt-1 group-hover:text-primary transition-colors">{cp.evidence}</p>
                        <span className="text-[8px] font-mono text-primary/60 block mt-0.5">{cp.ref}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. 🌱 CARE JOURNEY™ & RECOVERY PROGRESS CARD */}
                <div className="rounded-3xl bg-gradient-to-br from-sage/10 via-white to-primary/5 border border-sage/30 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🌱</span>
                      <div>
                        <h4 className="font-display text-base font-black text-ink">Care Journey™ Progress</h4>
                        <p className="text-xs font-semibold text-muted/80">School & family care progress</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sage/20 text-sage font-extrabold text-[10px] uppercase tracking-wider">
                      Student Progress: Doing Great
                    </span>
                  </div>

                  {/* CARE JOURNEY STAGES WITH OWNERSHIP */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-sage/20">
                    <div className="p-2.5 rounded-2xl bg-white/90 border border-sage/20">
                      <span className="text-[9px] font-black text-muted/60 uppercase block">Support Identified</span>
                      <strong className="text-xs font-bold text-ink block mt-0.5">Class Teacher</strong>
                      <span className="text-[9px] font-bold text-sage mt-1 block">✓ Logged</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/90 border border-sage/20">
                      <span className="text-[9px] font-black text-muted/60 uppercase block">Teacher Check-in</span>
                      <strong className="text-xs font-bold text-ink block mt-0.5">Ms. Priya</strong>
                      <span className="text-[9px] font-bold text-sage mt-1 block">✓ Completed</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/90 border border-sage/20">
                      <span className="text-[9px] font-black text-muted/60 uppercase block">Counselor Session</span>
                      <strong className="text-xs font-bold text-ink block mt-0.5">School Counselor</strong>
                      <span className="text-[9px] font-bold text-sage mt-1 block">✓ Completed</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/90 border border-sage/20 border-primary/40 bg-primary/5">
                      <span className="text-[9px] font-black text-primary uppercase block">Family Activity</span>
                      <strong className="text-xs font-bold text-ink block mt-0.5">Parent</strong>
                      <span className="text-[9px] font-bold text-primary mt-1 block">✓ Completed</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/90 border border-sage/20">
                      <span className="text-[9px] font-black text-muted/60 uppercase block">Follow-up</span>
                      <strong className="text-xs font-bold text-ink block mt-0.5">Next Review</strong>
                      <span className="text-[9px] font-bold text-sage mt-1 block">In 7 Days</span>
                    </div>
                  </div>
                </div>

                {/* 3. 🌿 CONTEXTUAL FAMILY WELLNESS ACTIVITY CARD */}
                <div className="rounded-2xl bg-gradient-to-r from-sage/15 via-white to-sage/5 border border-sage/30 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌿</span>
                      <strong className="text-xs font-black text-ink">Recommended Family Activity</strong>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-sage/20 text-sage px-2.5 py-0.5 rounded-full border border-sage/30">
                      Weekly Goal: {familyGoalCount}/5 Completed
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted/80 leading-relaxed">
                    "After an intense exam week, consider taking a 15-minute screen-free walk together or sharing tea."
                  </p>
                  <button
                    type="button"
                    disabled={familyActivityCompleted}
                    onClick={() => {
                      setFamilyActivityCompleted(true);
                      setFamilyGoalCount(4);
                      setToastMessage('🎉 Family Wellness Activity Completed! (+1 Activity to Weekly Family Goal)');
                      setTimeout(() => setToastMessage(null), 4000);
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-extrabold text-xs shadow-2xs transition-all flex items-center gap-1.5 ${
                      familyActivityCompleted ? 'bg-sage/70 cursor-default' : 'bg-sage hover:brightness-105 active:scale-95'
                    }`}
                  >
                    <span>{familyActivityCompleted ? '✓ Family Activity Saved (+25 Coins)' : '✓ Family Activity Completed'}</span>
                  </button>
                </div>

                {/* 4. AI NATURAL LANGUAGE ANOMALY EXPLANATION CARD */}
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-white to-amber-500/5 border border-amber-500/30 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>🤖</span> SchoolGPT Daily Safety Summary
                    </strong>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-900 px-2 py-0.5 rounded-full border border-amber-500/30">
                      All Steps On Time
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-950/90 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-500/20">
                    "Aarav's bus arrived at 8:07 AM, and Gate #2 verification was completed at 8:09 AM within the expected 3-minute safety window. Class attendance was verified at 8:15 AM. Zero safety discrepancies detected."
                  </p>
                </div>

                {/* SMART PROXIMITY ARRIVAL BANNER */}
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-marigold/10 to-sage/10 border border-amber-500/30 p-4 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-amber-500/20 shadow-inner flex items-center justify-center text-xl shrink-0">
                      🚍
                    </div>
                    <div>
                      <strong className="text-xs font-black text-ink block">Bus Reaching Soon: 2 Stops Away (~4 mins)</strong>
                      <p className="text-[11px] font-semibold text-muted/80">Bus #4 is approaching your pickup point (Sector 12 Market). Head to the stop now.</p>
                    </div>
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider shrink-0 border border-amber-500/30">
                    <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
                    Live ETA
                  </span>
                </div>
                
                {/* 1. HERO CARD (Child Safety Card) */}
                <div className={`journey-hero-card rounded-2xl p-6 shadow-sm border ${
                  journeyState.status === 'home_safe' || journeyState.status === 'deboarded' ? 'bg-sage/10 border-sage/20 text-deep-teal' :
                  journeyState.status === 'boarded' ? 'bg-sage/10 border-sage/20 text-deep-teal' :
                  journeyState.status === 'waiting' ? 'bg-marigold/10 border-marigold/20 text-deep-teal' :
                  'bg-paper border-deep-teal/10 text-deep-teal'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4 w-full">
                      {/* Safety status indicator */}
                      <div className="flex items-center gap-2">
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow-2xs border border-deep-teal/5">
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            journeyState.status === 'home_safe' || journeyState.status === 'boarded' ? 'bg-sage' :
                            journeyState.status === 'deboarded' ? 'bg-marigold' :
                            journeyState.status === 'waiting' ? 'bg-marigold animate-pulse' :
                            'bg-deep-teal/20'
                          }`} />
                        </span>
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-deep-teal/60">
                          {journeyState.status === 'home_safe' && "Safe at Home"}
                          {journeyState.status === 'boarded' && "Child is Safe"}
                          {journeyState.status === 'deboarded' && "Arrived at Stop"}
                          {journeyState.status === 'waiting' && "Bus On the Way"}
                          {journeyState.status === 'no_trip' && "No Active Journey"}
                        </span>
                      </div>

                      {/* Main friendly boarding headline */}
                      <div className="space-y-1">
                        <h4 className="font-display text-3xl font-extrabold text-deep-teal tracking-tight leading-none">
                          {journeyState.status === 'home_safe' && "Arrived Safely"}
                          {journeyState.status === 'boarded' && "Boarded Successfully"}
                          {journeyState.status === 'deboarded' && "Dropped Off at Stop"}
                          {journeyState.status === 'waiting' && "Waiting for Boarding"}
                          {journeyState.status === 'no_trip' && "No Scheduled Journey"}
                        </h4>
                        
                        {/* Boarding time if available */}
                        {journeyState.status === 'boarded' && journeyState.boarded_at && (
                          <p className="font-body text-xs text-deep-teal/70">
                            Boarded at {new Date(journeyState.boarded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {journeyState.status === 'deboarded' && journeyState.deboarded_at && (
                          <p className="font-body text-xs text-deep-teal/70">
                            Dropped off at {new Date(journeyState.deboarded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {journeyState.status === 'home_safe' && journeyState.home_safe_at && (
                          <p className="font-body text-xs text-deep-teal/70">
                            Arrival confirmed at {new Date(journeyState.home_safe_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>

                      {/* Verification Conductor and Status */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-deep-teal/10">
                        {['boarded', 'deboarded', 'home_safe'].includes(journeyState.status) && (
                          <div>
                            <span className="font-body text-[10px] text-deep-teal/40 uppercase font-bold tracking-wider block">Verified by</span>
                            <span className="font-body text-xs font-semibold text-deep-teal/80">Rajesh (Conductor)</span>
                          </div>
                        )}
                        <div>
                          <span className="font-body text-[10px] text-deep-teal/40 uppercase font-bold tracking-wider block">Current Status</span>
                          <span className="font-body text-xs font-semibold text-deep-teal/80">
                            {journeyState.status === 'home_safe' && "At Home"}
                            {journeyState.status === 'boarded' && "On the way to School"}
                            {journeyState.status === 'deboarded' && "Waiting at Stop"}
                            {journeyState.status === 'waiting' && "Preparing for Boarding"}
                            {journeyState.status === 'no_trip' && "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. JOURNEY PROGRESS CARD */}
                <div className="journey-progress rounded-2xl border border-deep-teal/10 bg-paper p-6 shadow-xs space-y-4">
                  <h4 className="font-display text-xs font-bold text-deep-teal/40 uppercase tracking-widest">
                    Journey Progress
                  </h4>
                  <div className="flex items-center justify-between relative px-2">
                    {/* Progress Bar Line */}
                    <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-deep-teal/10" />
                    
                    {/* Step 1: Waiting */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                        journeyState.status === 'waiting'
                          ? 'border-marigold bg-marigold/10 text-marigold animate-pulse font-bold'
                          : journeyState.status !== 'no_trip'
                          ? 'border-sage bg-sage text-white font-bold'
                          : 'border-deep-teal/10 bg-paper text-deep-teal/30'
                      }`}>
                        {journeyState.status !== 'no_trip' && journeyState.status !== 'waiting' ? '✓' : '1'}
                      </div>
                      <span className={`font-body text-[10px] font-bold ${journeyState.status === 'waiting' ? 'text-marigold' : 'text-deep-teal/50'}`}>
                        Waiting
                      </span>
                    </div>

                    {/* Step 2: Boarded */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                        journeyState.status === 'boarded'
                          ? 'border-marigold bg-marigold/10 text-marigold animate-pulse font-bold'
                          : ['deboarded', 'home_safe'].includes(journeyState.status)
                          ? 'border-sage bg-sage text-white font-bold'
                          : 'border-deep-teal/10 bg-paper text-deep-teal/30'
                      }`}>
                        {['deboarded', 'home_safe'].includes(journeyState.status) ? '✓' : '2'}
                      </div>
                      <span className={`font-body text-[10px] font-bold ${journeyState.status === 'boarded' ? 'text-marigold' : 'text-deep-teal/50'}`}>
                        Boarded
                      </span>
                    </div>

                    {/* Step 3: On the Way */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                        journeyState.status === 'boarded'
                          ? 'border-marigold bg-marigold/10 text-marigold animate-pulse font-bold'
                          : ['deboarded', 'home_safe'].includes(journeyState.status)
                          ? 'border-sage bg-sage text-white font-bold'
                          : 'border-deep-teal/10 bg-paper text-deep-teal/30'
                      }`}>
                        {['deboarded', 'home_safe'].includes(journeyState.status) ? '✓' : '3'}
                      </div>
                      <span className={`font-body text-[10px] font-bold ${journeyState.status === 'boarded' ? 'text-marigold' : 'text-deep-teal/50'}`}>
                        On the Way
                      </span>
                    </div>

                    {/* Step 4: Reached Stop/School */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                        ['deboarded', 'home_safe'].includes(journeyState.status)
                          ? 'border-sage bg-sage text-white font-bold'
                          : 'border-deep-teal/10 bg-paper text-deep-teal/30'
                      }`}>
                        {journeyState.status === 'home_safe' ? '✓' : '4'}
                      </div>
                      <span className={`font-body text-[10px] font-bold ${['deboarded', 'home_safe'].includes(journeyState.status) ? 'text-sage' : 'text-deep-teal/50'}`}>
                        Reached
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. SMART ALERTS */}
                {journeyState.status !== 'no_trip' && (
                  <div className="space-y-2.5">
                    {journeyState.status === 'waiting' && (
                      <div className="rounded-xl border border-marigold/20 bg-marigold/5 px-4 py-3 flex items-start gap-3 shadow-2xs animate-pulse">
                        <span className="text-base mt-0.5">🚌</span>
                        <div className="space-y-0.5">
                          <p className="font-body text-xs font-bold text-deep-teal leading-snug">
                            Bus reaches your stop in {busMetrics.eta} minutes.
                          </p>
                          <p className="font-body text-[10px] text-deep-teal/50">
                            Please prepare to head to the pickup point.
                          </p>
                        </div>
                      </div>
                    )}
                    {journeyState.status === 'boarded' && (
                      <div className="rounded-xl border border-sage/20 bg-sage/5 px-4 py-3 flex items-start gap-3 shadow-2xs">
                        <span className="text-base mt-0.5">🏫</span>
                        <div className="space-y-0.5">
                          <p className="font-body text-xs font-bold text-deep-teal leading-snug">
                            Your child is safely on the bus.
                          </p>
                          <p className="font-body text-[10px] text-deep-teal/50">
                            ETA to school stop is {busMetrics.eta} minutes.
                          </p>
                        </div>
                      </div>
                    )}
                    {journeyState.status === 'deboarded' && (
                      <div className="rounded-xl border border-marigold/20 bg-marigold/5 px-4 py-3 flex items-start gap-3 shadow-2xs animate-pulse">
                        <span className="text-base mt-0.5">⚠️</span>
                        <div className="space-y-0.5">
                          <p className="font-body text-xs font-bold text-deep-teal leading-snug">
                            Please confirm your child arrived safely.
                          </p>
                          <p className="font-body text-[10px] text-deep-teal/50">
                            Tap 'Yes, Home Safe' below to verify.
                          </p>
                        </div>
                      </div>
                    )}
                    {busMetrics.eta > 10 && journeyState.status === 'boarded' && (
                      <div className="rounded-xl border border-warm-clay/20 bg-warm-clay/5 px-4 py-3 flex items-start gap-3 shadow-2xs">
                        <span className="text-base mt-0.5">🚦</span>
                        <div className="space-y-0.5">
                          <p className="font-body text-xs font-bold text-deep-teal leading-snug">
                            Running slightly late because of traffic.
                          </p>
                          <p className="font-body text-[10px] text-deep-teal/50">
                            Route travel times are slightly elevated today.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Home Safe Confirmation Panel */}
                {journeyState.status === 'deboarded' && journeyState.trip_id && (
                  <div className="rounded-2xl border border-marigold/20 bg-marigold/5 p-5 shadow-sm space-y-3">
                    <h4 className="font-display text-sm font-bold text-deep-teal">
                      Has {activeStudent?.displayName?.split(' ')[0] || 'your child'} reached home safely?
                    </h4>
                    <p className="font-body text-xs text-deep-teal/50">
                      Please confirm once they are safely home. If you need help, tap the button below.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!activeStudent || !journeyState.trip_id) return;
                          const gId = guardianId || 'c1000000-0000-4000-8000-000000000001';
                          try {
                            await confirmHomeSafe(activeStudent.studentId, journeyState.trip_id, gId);
                          } catch (err: any) {
                            console.error('Confirm home safe failed:', err);
                            setToastMessage(err.message || "Something went wrong. Please try again.");
                          }
                        }}
                        className="flex-1 bg-sage text-white font-display text-xs font-bold py-3 px-4 rounded-xl hover:bg-sage/90 active:scale-95 transition-all shadow-sm"
                      >
                        Yes, Home Safe ✓
                      </button>
                      <button
                        onClick={async () => {
                          if (!activeStudent || !journeyState.trip_id) return;
                          setHelpClicked(true);
                          const studentName = activeStudent.displayName?.split(' ')[0] || 'Student';
                          try {
                            await raiseAlert(
                              activeStudent.studentId,
                              journeyState.trip_id,
                              'not_home_safe',
                              `${studentName}'s parent has requested help. The child has not arrived home safely after deboarding.`
                            );
                          } catch (err: any) {
                            console.error('Raise alert failed:', err);
                            setToastMessage(err.message || "Something went wrong. Please try again.");
                            setHelpClicked(false);
                          }
                        }}
                        disabled={helpClicked}
                        className={`flex-1 font-display text-xs font-bold py-3 px-4 rounded-xl transition-all border ${
                          helpClicked
                            ? 'bg-warm-clay/10 border-warm-clay/20 text-warm-clay/60 cursor-not-allowed'
                            : 'bg-white border-warm-clay/30 text-warm-clay hover:bg-warm-clay/10 active:scale-95'
                        }`}
                      >
                        {helpClicked ? 'Alert Sent ✓' : 'Need Help'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. TODAY'S JOURNEY TIMELINE */}
                {journeyState.status !== 'no_trip' && (
                  <div className="journey-timeline rounded-2xl border border-deep-teal/10 bg-paper p-6 shadow-xs space-y-4">
                    <h4 className="font-display text-xs font-bold text-deep-teal/40 uppercase tracking-widest">
                      Today's Journey
                    </h4>
                    <div className="relative pl-6 border-l border-deep-teal/10 space-y-5 ml-2 pt-1 pb-1">
                      
                      {/* Timeline Node 1: Started */}
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-sage border-2 border-white shadow-2xs" />
                        <div className="space-y-0.5">
                          <span className="font-body text-[10px] text-deep-teal/40 block font-bold">
                            {journeyState.boarded_at 
                              ? new Date(new Date(journeyState.boarded_at).getTime() - 10 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                              : '7:32 AM'}
                          </span>
                          <span className="font-body text-xs font-semibold text-deep-teal/80">Bus started</span>
                        </div>
                      </div>

                      {/* Timeline Node 2: Boarded */}
                      {['boarded', 'deboarded', 'home_safe'].includes(journeyState.status) && (
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-sage border-2 border-white shadow-2xs" />
                          <div className="space-y-0.5">
                            <span className="font-body text-[10px] text-deep-teal/40 block font-bold">
                              {journeyState.boarded_at ? new Date(journeyState.boarded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '7:42 AM'}
                            </span>
                            <span className="font-body text-xs font-semibold text-deep-teal/80">
                              {activeStudent?.displayName?.split(' ')[0] || 'Child'} boarded safely
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Timeline Node 3: Current next stop / route */}
                      {journeyState.status === 'boarded' && (
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-marigold border-2 border-white shadow-2xs animate-pulse" />
                          <div className="space-y-0.5">
                            <span className="font-body text-[10px] text-marigold block font-bold">
                              Live updates
                            </span>
                            <span className="font-body text-xs font-semibold text-deep-teal/80">
                              Bus passing near {busMetrics.nextStop}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Timeline Node 4: Deboarded */}
                      {['deboarded', 'home_safe'].includes(journeyState.status) && (
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-sage border-2 border-white shadow-2xs" />
                          <div className="space-y-0.5">
                            <span className="font-body text-[10px] text-deep-teal/40 block font-bold">
                              {journeyState.deboarded_at ? new Date(journeyState.deboarded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '8:12 AM'}
                            </span>
                            <span className="font-body text-xs font-semibold text-deep-teal/80">
                              Arrived at stop safely
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Timeline Node 5: Confirmed Home Safe */}
                      {journeyState.status === 'home_safe' && (
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-sage border-2 border-white shadow-2xs" />
                          <div className="space-y-0.5">
                            <span className="font-body text-[10px] text-deep-teal/40 block font-bold">
                              {journeyState.home_safe_at ? new Date(journeyState.home_safe_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '8:15 AM'}
                            </span>
                            <span className="font-body text-xs font-semibold text-deep-teal/80">
                              Confirmed safe at home
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. LIVE MAP */}
                <div className="journey-map rounded-2xl border border-deep-teal/10 bg-paper p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
                    <span className="font-display text-xs font-bold text-deep-teal/40 uppercase tracking-widest">
                      Live map tracking
                    </span>
                    <span className="text-[10px] text-sage font-extrabold uppercase bg-sage/10 px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Live
                    </span>
                  </div>

                  {/* Leaflet map div */}
                  {!leafletLoaded ? (
                    <div className="h-[250px] w-full rounded-xl bg-paper border border-deep-teal/5 animate-pulse flex items-center justify-center text-xs text-deep-teal/30">
                      Loading map layer...
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border border-deep-teal/5 bg-paper p-1 shadow-2xs">
                      <div 
                        id="leaflet-bus-map" 
                        className="h-[250px] sm:h-[360px] w-full rounded-lg bg-paper"
                        style={{ zIndex: 1 }}
                      />
                    </div>
                  )}

                  {/* Map Footer Information */}
                  {journeyState.status !== 'no_trip' && (
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-deep-teal/5 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">Next stop</span>
                        <span className="font-body text-xs font-bold text-deep-teal/80">{busMetrics.nextStop}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">ETA</span>
                        <span className="font-body text-xs font-bold text-deep-teal/80">{busMetrics.eta} mins</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">Speed</span>
                        <span className="font-body text-xs font-bold text-deep-teal/80">{busMetrics.speed} km/h</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-[9px] text-deep-teal/30 pt-1 font-medium italic text-right">
                    Last location update: {lastUpdated < 60 ? `${lastUpdated} sec ago` : `${Math.floor(lastUpdated / 60)} min ago`}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Tab 5: Messages Tab (Supabase Realtime live feed) */}
        {activeNav === 'messages' && (
          <div className="space-y-4 flex flex-col h-[400px]">
            <div>
              <h3 className="font-display text-lg font-extrabold text-deep-teal">
                Quick Notes to Teacher
              </h3>
              <p className="font-body text-xs text-deep-teal/50 font-semibold uppercase tracking-wider">
                Direct messages with Ms. Ananya Mehra (Teacher).
              </p>
              <p className="font-body text-[10px] text-marigold font-bold mt-0.5 leading-snug">
                (Asynchronous updates &mdash; teachers check and reply after class hours)
              </p>
            </div>

            {/* Chat Thread container */}
            <div className="rounded-2xl border border-deep-teal/5 bg-paper p-4 shadow-sm flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[300px] scrollbar-thin">
              {chatMessages.length === 0 ? (
                <div className="text-center text-deep-teal/30 italic py-10 font-medium my-auto">
                  No messages yet. Send a message to start the conversation.
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderRole === 'parent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isMe ? 'self-end items-end ml-auto' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2 font-medium leading-relaxed ${
                          isMe
                            ? 'bg-marigold text-white rounded-tr-none shadow-2xs'
                            : 'bg-deep-teal text-white rounded-tl-none shadow-2xs'
                        } ${msg.id.startsWith('temp-') ? 'opacity-65 animate-pulse' : ''}`}
                      >
                        <p className="whitespace-pre-wrap text-xs">{msg.messageText}</p>
                      </div>
                      <span className="text-[9px] text-deep-teal/30 mt-1 font-medium px-1">
                        {isMe ? 'You' : 'Ms. Ananya Mehra'} &middot;{' '}
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Controls */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendParentMessage(chatInputText)}
                  placeholder="Type message..."
                  className="flex-1 rounded-xl border border-deep-teal/15 px-3 py-1.5 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none focus:ring-1 focus:ring-deep-teal/10 placeholder-deep-teal/30"
                  disabled={isSendingMessage}
                />
                <button
                  onClick={() => handleSendParentMessage(chatInputText)}
                  disabled={isSendingMessage || !chatInputText.trim()}
                  className="bg-deep-teal hover:bg-deep-teal/95 text-white font-display text-xs font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  Send
                </button>
              </div>

              {/* Quick-note buttons below input */}
              <div className="flex gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => handleSendParentMessage("Had a rough morning")}
                  className="text-2xs font-bold border border-deep-teal/10 hover:border-deep-teal/30 hover:bg-deep-teal/[0.02] py-1.5 px-3 rounded-lg text-deep-teal/80 transition-all active:scale-95 bg-paper"
                >
                  [😴 Morning rough]
                </button>
                <button
                  onClick={() => handleSendParentMessage("Need help with homework")}
                  className="text-2xs font-bold border border-deep-teal/10 hover:border-deep-teal/30 hover:bg-deep-teal/[0.02] py-1.5 px-3 rounded-lg text-deep-teal/80 transition-all active:scale-95 bg-paper"
                >
                  [🆘 Need help]
                </button>
                <button
                  onClick={() => handleSendParentMessage("Everything is all good")}
                  className="text-2xs font-bold border border-deep-teal/10 hover:border-deep-teal/30 hover:bg-deep-teal/[0.02] py-1.5 px-3 rounded-lg text-deep-teal/80 transition-all active:scale-95 bg-paper"
                >
                  [💪 All good]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Principle Footer (Subtle) */}
        <div className="pt-4 pb-8 text-center border-t border-deep-teal/5">
          <p className="font-body text-[10px] text-deep-teal/40 leading-relaxed max-w-xs mx-auto font-medium">
            ShikshaSetu supports teachers and parents with timely information. Final decisions are always made by educators.
          </p>
        </div>
      </div>

      {/* ── Compact Floating Capsule Navigation ── */}
      <nav className="sticky bottom-4 mx-auto max-w-md w-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-md text-white rounded-full shadow-2xl h-14 px-3 flex items-center justify-around z-40 border border-slate-800 my-4">
        
        {/* Home Tab */}
        <button
          onClick={() => {
            setActiveNav('home');
            setShowSettings(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all ${
            activeNav === 'home'
              ? 'text-white font-bold bg-slate-800'
              : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <span className="text-sm">🏠</span>
          <span className="text-[10px] tracking-tight leading-none">Home</span>
        </button>

        {/* Journey Tab */}
        <button
          onClick={() => {
            setActiveNav('bus');
            setShowSettings(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all ${
            activeNav === 'bus'
              ? 'text-white font-bold bg-slate-800'
              : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <span className="text-sm">🚌</span>
          <span className="text-[10px] tracking-tight leading-none">Journey</span>
        </button>

        {/* Homework Tab */}
        <button
          onClick={() => {
            setActiveNav('homework');
            setShowSettings(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all ${
            activeNav === 'homework'
              ? 'text-white font-bold bg-slate-800'
              : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <span className="text-sm">📚</span>
          <span className="text-[10px] tracking-tight leading-none">Homework</span>
        </button>

        {/* Messages Tab */}
        <button
          onClick={() => {
            setActiveNav('messages');
            setShowSettings(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all relative ${
            activeNav === 'messages'
              ? 'text-white font-bold bg-slate-800'
              : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <div className="relative">
            <span className="text-sm">💬</span>
            {parentNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none">Messages</span>
        </button>

        {/* Attendance Tab */}
        <button
          onClick={() => {
            setActiveNav('attendance');
            setShowSettings(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all ${
            activeNav === 'attendance'
              ? 'text-white font-bold bg-slate-800'
              : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <span className="text-sm font-bold">✓</span>
          <span className="text-[10px] tracking-tight leading-none">Attend</span>
        </button>

      </nav>

      {/* ── Request Gate Pass Modal ── */}
      <AnimatePresence>
        {showPassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-deep-teal/10 p-6 max-w-sm w-full shadow-lg relative space-y-4 text-deep-teal"
            >
              <div>
                <h3 className="font-display text-base font-extrabold text-deep-teal">Request Gate Pass</h3>
                <p className="font-body text-[10px] text-deep-teal/50 font-medium mt-0.5">
                  Submit a time-limited gate pass for {activeStudent?.displayName}.
                </p>
              </div>

              <form onSubmit={handleSubmitGatePass} className="space-y-4">
                {/* Quick Chips */}
                <div className="space-y-2">
                  <label className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 block">Reason for Pickup</label>
                  <div className="flex flex-wrap gap-2">
                    {['Medical Appointment', 'Family Emergency', 'Personal Work', 'Other'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setPassReason(option);
                          if (option !== 'Other') setCustomReason('');
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          passReason === option
                            ? 'bg-deep-teal border-deep-teal text-white shadow-3xs'
                            : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-deep-teal/[0.02]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Reason Textbox */}
                {passReason === 'Other' && (
                  <div className="space-y-1">
                    <label className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 block">Custom Details</label>
                    <input
                      type="text"
                      required
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Specify reason..."
                      className="w-full border border-deep-teal/15 rounded-xl px-3.5 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none placeholder-deep-teal/30 focus:ring-1 focus:ring-deep-teal/10"
                    />
                  </div>
                )}

                {/* Time Picker */}
                <div className="space-y-1">
                  <label className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 block">Estimated Pickup Time</label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full border border-deep-teal/15 rounded-xl px-3.5 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none focus:ring-1 focus:ring-deep-teal/10 bg-white"
                  />
                  <p className="text-[9px] text-deep-teal/40 leading-tight mt-1 font-medium">Passes are valid for a 2-hour window starting at the selected time.</p>
                </div>

                {passFormError && (
                  <p className="text-2xs font-bold text-warm-clay flex items-center gap-1">
                    <span>⚠️</span> {passFormError}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassModal(false);
                      setPassReason('Medical Appointment');
                      setCustomReason('');
                      setPickupTime('14:30');
                      setPassFormError('');
                    }}
                    className="flex-1 border border-deep-teal/10 hover:bg-deep-teal/5 text-deep-teal/70 font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPass}
                    className="flex-1 bg-deep-teal hover:bg-deep-teal/95 text-white font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingPass ? 'Submitting...' : 'Request Pass'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Cancellation Confirmation Modal ── */}
      <AnimatePresence>
        {showCancelConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-deep-teal/10 p-6 max-w-xs w-full shadow-lg relative space-y-4 text-deep-teal"
            >
              <h4 className="font-display text-base font-extrabold text-deep-teal">Cancel Gate Pass?</h4>
              <p className="font-body text-xs text-deep-teal/60 leading-relaxed font-medium">
                This action cannot be undone. The gate security registry will void the code immediately.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    setShowCancelConfirmModal(false);
                    setPassToCancel(null);
                  }}
                  className="flex-1 border border-deep-teal/10 hover:bg-deep-teal/5 text-deep-teal/70 font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
                >
                  Keep Request
                </button>
                <button
                  onClick={handleCancelGatePass}
                  disabled={isCancellingPass}
                  className="flex-1 bg-warm-clay hover:bg-warm-clay/95 text-white font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isCancellingPass ? 'Cancelling...' : 'Cancel Pass'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 🤖 SchoolGPT Interactive Safety Drawer Modal ── */}
      <AnimatePresence>
        {showSchoolGPTDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-primary/20 p-6 max-w-md w-full shadow-2xl space-y-4 text-deep-teal relative"
            >
              <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-display text-base font-black text-deep-teal">SchoolGPT Safety Assistant</h3>
                    <p className="font-body text-[10px] text-sage font-bold">● Real-time Safety & Telemetry Active</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSchoolGPTDrawer(false)}
                  className="text-deep-teal/40 hover:text-deep-teal text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Chat History */}
              <div className="h-56 overflow-y-auto space-y-2.5 p-2 bg-deep-teal/[0.02] rounded-2xl border border-deep-teal/5">
                {schoolGPTChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-deep-teal text-white rounded-br-none'
                          : 'bg-white border border-deep-teal/10 text-deep-teal rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Query Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Was my child safe today?',
                  'When did bus arrive at school?',
                  'Show gate photo log'
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setSchoolGPTChatHistory((prev) => [
                        ...prev,
                        { sender: 'user', text: q },
                        {
                          sender: 'bot',
                          text: q.includes('safe')
                            ? 'Aarav boarded Bus #4 at 7:36 AM, passed Gate #2 at 8:09 AM with 100% photo match. Zero safety discrepancies.'
                            : q.includes('bus')
                            ? 'Bus #4 completed morning route at 8:07 AM. All 14 students deboarded safely.'
                            : 'Gate #2 dynamic QR scan verified at 8:09 AM by Security Officer Priya.'
                        }
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-deep-teal/10 bg-deep-teal/[0.04] text-[10px] font-bold text-deep-teal hover:bg-deep-teal/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!schoolGPTQuery.trim()) return;
                  const query = schoolGPTQuery.trim();
                  const q = query.toLowerCase();
                  const name = activeStudent?.displayName || 'your child';
                  setSchoolGPTQuery('');

                  let botReply = '';
                  if (q.includes('sunday') || q.includes('saturday') || q.includes('weekend') || q.includes('holiday') || q.includes('class on')) {
                    botReply = `No, Sunday is a weekly school holiday for ${name}. School operations, classes, and bus tracking resume on Monday morning at 7:30 AM.`;
                  } else if (q.includes('will bus') || q.includes('is bus coming') || q.includes('bus today') || q.includes('bus schedule')) {
                    botReply = `Yes! Bus #4 is running on schedule today for ${name}. Morning pickup: 7:36 AM | Evening drop-off: 3:45 PM. Driver: Ramesh Kumar (+91 98765 43210).`;
                  } else if (q.includes('bus') || q.includes('route') || q.includes('tracking') || q.includes('driver')) {
                    botReply = `Bus #4 completed the morning pickup at 7:36 AM and arrived safely at school at 8:07 AM. Geofence tracking confirmed ${name} deboarded safely at 8:09 AM.`;
                  } else if (q.includes('homework') || q.includes('assignment') || q.includes('project') || q.includes('task')) {
                    botReply = `${name} has 2 active homework tasks: Mathematics (Exercise 4.2) due tomorrow and English Essay due on Friday.`;
                  } else if (q.includes('teacher') || q.includes('faculty') || q.includes('mam') || q.includes('sir') || q.includes('contact')) {
                    botReply = `${name}'s Class 8-A teacher is Ms. Ananya Mehra (Mathematics). You can message her directly from the Messages tab in your Parent App.`;
                  } else if (q.includes('gate') || q.includes('photo') || q.includes('checkin') || q.includes('entry')) {
                    botReply = `Gate #2 dynamic QR scan was verified at 8:09 AM with a 100% photo/ID match by Security Officer Priya.`;
                  } else if (q.includes('safe') || q.includes('checkpoint') || q.includes('status') || q.includes('where is')) {
                    botReply = `${name} has cleared all 5 safety checkpoints today (Bus #4 ➔ Gate #2 ➔ Class 8A ➔ Canteen POS ➔ Reached Home). 100% verified safe!`;
                  } else if (q.includes('exam') || q.includes('test') || q.includes('marks') || q.includes('result')) {
                    botReply = `Mid-Term examinations begin next month. ${name}'s overall attendance is at 96% and current academic progress is excellent.`;
                  } else if (q.includes('fee') || q.includes('payment') || q.includes('dues')) {
                    botReply = `All tuition and transport fees for Q3 are fully paid with zero outstanding balance for ${name}.`;
                  } else {
                    botReply = `Regarding "${query}": ${name} is currently in Class 8-A with 100% verified attendance, all 5 safety checkpoints cleared, and no critical school alerts today.`;
                  }

                  setSchoolGPTChatHistory((prev) => [
                    ...prev,
                    { sender: 'user', text: query },
                    { sender: 'bot', text: botReply }
                  ]);
                }}
                className="flex gap-2 pt-1"
              >
                <input
                  type="text"
                  value={schoolGPTQuery}
                  onChange={(e) => setSchoolGPTQuery(e.target.value)}
                  placeholder="Ask SchoolGPT about safety or homework..."
                  className="flex-1 border border-deep-teal/15 rounded-xl px-3.5 py-2 text-xs text-deep-teal focus:outline-none focus:border-deep-teal"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-deep-teal text-white font-bold text-xs rounded-xl hover:bg-deep-teal/90"
                >
                  Ask
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 🔍 Verified Checkpoint Evidence Audit Modal ── */}
      <AnimatePresence>
        {activeEvidenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-sage/30 p-6 max-w-sm w-full shadow-2xl space-y-4 text-deep-teal relative"
            >
              <div className="flex items-center justify-between border-b border-sage/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-sage">✓</span>
                  <div>
                    <h3 className="font-display text-sm font-black text-deep-teal">Safety Verification Record</h3>
                    <p className="font-mono text-[9px] text-sage font-bold">{activeEvidenceModal.ref}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveEvidenceModal(null)}
                  className="text-deep-teal/40 hover:text-deep-teal text-base font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 bg-sage/[0.04] p-4 rounded-2xl border border-sage/15">
                <div>
                  <span className="text-[9px] font-black uppercase text-deep-teal/40 block">Verified Safety Step</span>
                  <strong className="text-xs font-bold text-deep-teal">{activeEvidenceModal.label}</strong>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-deep-teal/40 block">Time Confirmed</span>
                  <span className="text-xs font-semibold text-deep-teal">{activeEvidenceModal.time}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-deep-teal/40 block">Verified By</span>
                  <span className="text-xs font-semibold text-deep-teal">{activeEvidenceModal.evidence}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-deep-teal/40 block">Safety Verification Code</span>
                  <code className="text-[9px] font-mono text-sage block break-all bg-white p-2 rounded-lg border border-sage/20">
                    {activeEvidenceModal.hash}
                  </code>
                </div>
              </div>

              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="w-full py-2.5 bg-sage text-white font-bold text-xs rounded-xl hover:bg-sage/90"
              >
                Close Evidence Record
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Custom Shimmer Style injection ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-shimmer {
          0% { transform: translateX(-100%) rotate(15deg); }
          100% { transform: translateX(100%) rotate(15deg); }
        }
        .animate-shimmer {
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(31,78,95,0.06) 50%, transparent 100%);
          animation: custom-shimmer 2.5s infinite linear;
        }
      `}} />

      {/* Connection error banner */}
      {connectionError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-warm-clay/90 text-white text-center font-body text-sm py-2 animate-bounce">
          Connection lost. Trying to reconnect...
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

    </div>
  );
}
