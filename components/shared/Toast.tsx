'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  return (
    <div className="fixed bottom-4 right-4 bg-warm-clay text-white font-body text-sm px-4 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      {message}
    </div>
  );
}
