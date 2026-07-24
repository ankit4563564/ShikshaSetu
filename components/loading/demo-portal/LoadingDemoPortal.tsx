"use client";

import { m } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingDemoPortalProps {
  role: string;
  onComplete?: () => void;
}

const portalTitles: Record<string, string> = {
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
  admin: 'Administrator',
  driver: 'Driver',
  gate: 'Gate Security',
  vendor: 'Vendor',
};

const portalEmoji: Record<string, string> = {
  teacher: '👩‍🏫',
  parent: '👨‍👩‍👧',
  student: '🎓',
  admin: '🏫',
  driver: '🚌',
  gate: '🛡️',
  vendor: '📦',
};

export default function LoadingDemoPortal({ role, onComplete }: LoadingDemoPortalProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    `Initializing ShikshaSetu ${portalTitles[role] || role} Portal...`,
    `Loading user credentials and permissions...`,
    `Verifying access rights...`,
    `Preparing dashboard...`,
    `Connecting to ShikshaSetu services...`,
    `Preparing your experience...`,
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, 2000);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(messageTimer);
    };
  }, [messages.length]);

  useEffect(() => {
    if (progress === 100) {
      const redirectTimer = setTimeout(() => {
        onComplete?.();
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F232F] text-white overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-teal/20 via-transparent to-sage/20" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <m.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            animate={{ 
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight - 500],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <m.div
        className="relative z-10 flex flex-col items-center space-y-8 max-w-2xl mx-auto px-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Portal Avatar */}
        <m.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sage/30 to-transparent blur-xl" />
            
            {/* Avatar content */}
            <m.span 
              className="text-6xl relative z-10"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {portalEmoji[role as keyof typeof portalEmoji] || '🏫'}
            </m.span>
          </div>
        </m.div>

        {/* Title */}
        <m.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            ShikshaSetu
          </h1>
          <p className="text-xl text-sage font-medium">
            Signing you in as {portalTitles[role as keyof typeof portalTitles] || role}
          </p>
        </m.div>

        {/* Loading message */}
        <m.div
          className="h-8 overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <m.p 
            className="text-lg text-white/70 font-medium text-center transition-all duration-500"
            key={messageIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            {messages[messageIndex]}
          </m.p>
        </m.div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm text-white/50">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <m.div
              className="h-full bg-gradient-to-r from-sage to-green-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Spinning logo */}
        <m.div
          className="relative w-16 h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <m.div
            className="absolute inset-0 rounded-full border border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <m.div
            className="absolute inset-2 rounded-full border border-sage/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <m.span
              className="text-xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎬
            </m.span>
          </div>
        </m.div>

        {/* Tagline */}
        <m.p
          className="text-sm text-white/40 text-center max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          Live school environment • Real database actions • 5-minute complete journey
        </m.p>
      </m.div>
    </div>
  );
}
