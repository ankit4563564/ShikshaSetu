'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from './NotificationContext';
import { NotificationCenter } from './NotificationCenter';

export default function NotificationBell() {
  const { unreadCount, dbNotifications, markAllAsRead, registerRecipientId } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(unreadCount);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      prevCount.current = unreadCount;
    }
  }, [unreadCount]);

  const safeCount = unreadCount ?? 0;

  // Extract recipientId from first loaded notification
  const recipientId = dbNotifications.length > 0 ? dbNotifications[0].recipientId : null;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label={`Notifications${safeCount > 0 ? `, ${safeCount} unread` : ''}`}
        className="relative p-2 hover:bg-deep-teal/5 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/30 flex items-center justify-center text-deep-teal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {safeCount > 0 && (
          <motion.span
            key={safeCount}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warm-clay text-[9px] font-extrabold text-white ring-2 ring-white"
          >
            {safeCount > 9 ? '9+' : safeCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <NotificationCenterWrapper
            recipientId={recipientId}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationCenterWrapper({
  recipientId,
  onClose,
}: {
  recipientId: string | null;
  onClose: () => void;
}) {
  // If no recipientId from notifications yet, show a loading state
  if (!recipientId) {
    return (
      <>
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" 
          onClick={onClose} 
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display text-sm font-extrabold text-slate-900">Notifications</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          </div>
        </motion.div>
      </>
    );
  }

  return <NotificationCenter recipientId={recipientId} isOpen={true} onClose={onClose} />;
}
