'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { DEMO_STEP_DEFINITIONS, type DemoSpeed } from '@/lib/demo/demoConstants';

interface StepStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  completedAt?: string;
  startedAt?: number;
  result?: any;
}

interface DemoRunnerContextValue {
  stepStatuses: StepStatus[];
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  speed: DemoSpeed;
  sessionId: string | null;
  error: string | null;
  totalSteps: number;
  completedCount: number;
  progress: number;
  currentStep: typeof DEMO_STEP_DEFINITIONS[0] | null;
  startDemo: () => Promise<void>;
  pauseDemo: () => void;
  resumeDemo: () => void;
  stopDemo: () => void;
  restartDemo: () => Promise<void>;
  setSpeed: (speed: DemoSpeed) => void;
  jumpToStep: (index: number) => Promise<void>;
}

const DemoRunnerContext = createContext<DemoRunnerContextValue | null>(null);

export function useDemoRunner() {
  const context = useContext(DemoRunnerContext);
  if (!context) {
    throw new Error('useDemoRunner must be used within a DemoRunnerProvider');
  }
  return context;
}

export function DemoRunnerProvider({ children }: { children: React.ReactNode }) {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(() => 
    DEMO_STEP_DEFINITIONS.map(() => ({ status: 'pending' as const }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeedState] = useState<DemoSpeed>(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const currentStepIndexRef = useRef(-1);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  
  const animationFrameRef = useRef<number>();
  const isExecutingRef = useRef(false);
  const stepTimeoutRef = useRef<NodeJS.Timeout>();

  const totalSteps = DEMO_STEP_DEFINITIONS.length;
  const completedCount = stepStatuses.filter(s => s.status === 'completed').length;
  const progress = totalSteps > 0 ? completedCount / totalSteps : 0;
  const currentStep = currentStepIndex >= 0 && currentStepIndex < DEMO_STEP_DEFINITIONS.length 
    ? DEMO_STEP_DEFINITIONS[currentStepIndex] 
    : null;

  // Call server action via fetch to API route
  const executeStep = useCallback(async (index: number): Promise<boolean> => {
    if (isExecutingRef.current) return false;
    isExecutingRef.current = true;
    
    // Mark as running
    setStepStatuses(prev => prev.map((s, i) => i === index ? { 
      ...s, 
      status: 'running' as const, 
      startedAt: Date.now(),
      error: undefined 
    } : s));
    currentStepIndexRef.current = index;
    setCurrentStepIndex(index);
    setError(null);

    try {
      // Call the demo runner API
      const response = await fetch('/api/demo/runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepIndex: index, sessionId: sessionIdRef.current }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setStepStatuses(prev => prev.map((s, i) => i === index ? { 
          ...s, 
          status: 'failed' as const, 
          error: result.error, 
          completedAt: Date.now().toString() 
        } : s));
        setError(result.error || `Step ${index + 1} failed`);
        isExecutingRef.current = false;
        return false;
      }

      // Mark completed
      setStepStatuses(prev => prev.map((s, i) => i === index ? { 
        ...s, 
        status: 'completed' as const, 
        completedAt: new Date().toISOString(),
        result: result.data
      } : s));
      
      isExecutingRef.current = false;
      return true;
    } catch (e: any) {
      setStepStatuses(prev => prev.map((s, i) => i === index ? { 
        ...s, 
        status: 'failed' as const, 
        error: e.message, 
        completedAt: Date.now().toString() 
      } : s));
      setError(e.message);
      isExecutingRef.current = false;
      return false;
    }
  }, []);

  const runLoop = useCallback(async () => {
    if (!isRunningRef.current || isPausedRef.current) return;

    const index = currentStepIndexRef.current;
    if (index >= totalSteps) {
      isRunningRef.current = false;
      setIsRunning(false);
      return;
    }

    const success = await executeStep(index);
    
    if (!success || !isRunningRef.current) return;

    // Move to next step
    currentStepIndexRef.current = index + 1;
    setCurrentStepIndex(index + 1);
    
    // Schedule next step
    if (index + 1 < totalSteps) {
      const nextStep = DEMO_STEP_DEFINITIONS[index + 1];
      const delay = (nextStep.estimatedDuration || 1000) / speed;
      
      stepTimeoutRef.current = setTimeout(() => {
        if (isRunningRef.current && !isPausedRef.current) {
          runLoop();
        }
      }, delay);
    } else {
      isRunningRef.current = false;
      setIsRunning(false);
    }
  }, [totalSteps, speed, executeStep]);

  const startDemo = useCallback(async () => {
    if (isRunningRef.current) return;

    // Create the session before changing the visible runner state. A failed
    // session request must not leave the UI claiming that the demo is live.
    try {
      const sessionRes = await fetch('/api/demo/runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_session' }),
      });
      const sessionData = await sessionRes.json();

      if (!sessionRes.ok || !sessionData.success || !sessionData.sessionId) {
        throw new Error(sessionData.error || `Unable to create demo session (${sessionRes.status})`);
      }

      sessionIdRef.current = sessionData.sessionId;
      setSessionId(sessionData.sessionId);
      setError(null);
    } catch (e: any) {
      isRunningRef.current = false;
      isPausedRef.current = false;
      setIsRunning(false);
      setIsPaused(false);
      setError(e?.message || 'Unable to start the demo');
      return;
    }
    
    // Reset state
    setStepStatuses(DEMO_STEP_DEFINITIONS.map(() => ({ status: 'pending' as const })));
    currentStepIndexRef.current = 0;
    setCurrentStepIndex(0);
    isRunningRef.current = true;
    isPausedRef.current = false;
    setIsRunning(true);
    setIsPaused(false);
    setError(null);
    
    // Start loop
    runLoop();
  }, [runLoop]);

  const pauseDemo = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = undefined;
    }
  }, []);

  const resumeDemo = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    runLoop();
  }, [runLoop]);

  const stopDemo = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = undefined;
    }
  }, []);

  const restartDemo = useCallback(async () => {
    stopDemo();
    
    // Cleanup previous session
    if (sessionId) {
      await fetch('/api/demo/runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup', sessionId }),
      });
    }
    
    // Reset student
    await fetch('/api/demo/runner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_student' }),
    });
    
    // Wait a bit then start fresh
    await new Promise(r => setTimeout(r, 500));
    await startDemo();
  }, [sessionId, stopDemo, startDemo]);

  const setSpeed = useCallback((newSpeed: DemoSpeed) => {
    setSpeedState(newSpeed);
  }, []);

  const jumpToStep = useCallback(async (index: number) => {
    if (index < 0 || index >= totalSteps) return;
    
    const wasRunning = isRunning;
    if (wasRunning) pauseDemo();
    
    currentStepIndexRef.current = index;
    setCurrentStepIndex(index);
    
    // Reset steps after the target index
    setStepStatuses(prev => prev.map((status, i) => 
      i < index ? status : { ...status, status: 'pending' as const, error: undefined, result: undefined }
    ));
    
    if (wasRunning) {
      setTimeout(() => resumeDemo(), 100);
    }
  }, [totalSteps, isRunning, pauseDemo, resumeDemo]);

  return (
    <DemoRunnerContext.Provider value={{
      stepStatuses,
      currentStepIndex,
      isRunning,
      isPaused,
      speed,
      sessionId,
      error,
      totalSteps,
      completedCount,
      progress,
      currentStep,
      startDemo,
      pauseDemo,
      resumeDemo,
      stopDemo,
      restartDemo,
      setSpeed,
      jumpToStep,
    }}>
      {children}
    </DemoRunnerContext.Provider>
  );
}
