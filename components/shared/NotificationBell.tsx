'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from './NotificationContext';
import { NotificationCenter } from './NotificationCenter';

interface NotificationBellProps {
  recipientId?: string | null;
}

export default function NotificationBell({ recipientId: explicitRecipientId }: NotificationBellProps = {}) {
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
    if (explicitRecipientId) {
      registerRecipientId(explicitRecipientId);
    }
  }, [explicitRecipientId, registerRecipientId]);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      prevCount.current = unreadCount;
    }
  }, [unreadCount]);

  const safeCount = unreadCount ?? 0;

  // Extract recipientId from props or first loaded notification or default
  const effectiveRecipientId = explicitRecipientId || (dbNotifications.length > 0 ? dbNotifications[0].recipientId : 'guardian');

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
            recipientId={effectiveRecipientId}
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
  return <NotificationCenter recipientId={recipientId || 'guardian'} isOpen={true} onClose={onClose} />;
}
