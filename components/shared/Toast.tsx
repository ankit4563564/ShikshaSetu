'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  onRetry?: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, onRetry, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  const bgStyle =
    type === 'error'
      ? 'bg-rose-900/90 text-rose-100 border-rose-700'
      : type === 'success'
      ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700'
      : type === 'warning'
      ? 'bg-amber-900/90 text-amber-100 border-amber-700'
      : 'bg-slate-900/90 text-slate-100 border-slate-700';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl font-body text-xs transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${bgStyle}`}
      role="alert"
    >
      <span className="font-medium">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={() => {
            onRetry();
            onClose();
          }}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-[10px] uppercase transition-all"
        >
          🔄 Retry
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className="text-white/60 hover:text-white text-sm font-bold pl-1"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
