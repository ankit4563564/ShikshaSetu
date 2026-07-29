'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GatePass {
  id: string;
  status: 'pending' | 'approved' | 'used' | 'expired' | 'rejected';
  pickup_window_start: string;
  pickup_window_end: string;
  pass_code: string | null;
  reason: string | null;
  used_at: string | null;
  rejection_reason: string | null;
}

interface ParentGatePassTabProps {
  activePass: GatePass | null;
  studentName: string;
  isLoading?: boolean;
  timeLeftText?: string;
  onRequestPass: () => void;
  onCancelPass: (passId: string) => void;
}

export function ParentGatePassTab({
  activePass,
  studentName,
  isLoading = false,
  timeLeftText = '',
  onRequestPass,
  onCancelPass,
}: ParentGatePassTabProps) {
  if (!activePass) {
    return (
      <div className="rounded-2xl border border-deep-teal/5 bg-white p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-display text-sm font-bold text-deep-teal">Need early student pickup?</h4>
          <p className="font-body text-2xs text-deep-teal/50">Request a gate pass for teacher approval.</p>
        </div>
        <button
          onClick={onRequestPass}
          disabled={isLoading}
          className="bg-deep-teal text-white font-display text-2xs font-bold py-2.5 px-4 rounded-xl hover:bg-deep-teal/90 active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          Request Pass
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-deep-teal/5 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
        <span className="font-display text-xs font-extrabold text-deep-teal/40 uppercase tracking-widest">
          🎫 Active Gate Pass
        </span>
        <div className="flex items-center gap-1.5">
          {activePass.status === 'pending' && (
            <>
              <span className="h-2 w-2 rounded-full bg-marigold animate-ping" />
              <span className="text-[10px] text-marigold font-bold uppercase tracking-wider">Pending</span>
            </>
          )}
          {activePass.status === 'approved' && (
            <>
              <span className="h-2 w-2 rounded-full bg-sage shadow-[0_0_8px_rgba(107,144,128,0.5)]" />
              <span className="text-[10px] text-sage font-bold uppercase tracking-wider">Approved</span>
            </>
          )}
          {activePass.status === 'rejected' && (
            <>
              <span className="h-2 w-2 rounded-full bg-warm-clay" />
              <span className="text-[10px] text-warm-clay font-bold uppercase tracking-wider">Rejected</span>
            </>
          )}
          {activePass.status === 'used' && (
            <span className="text-[10px] text-deep-teal/40 font-bold uppercase tracking-wider">Used</span>
          )}
          {activePass.status === 'expired' && (
            <span className="text-[10px] text-deep-teal/40 font-bold uppercase tracking-wider">Expired</span>
          )}
        </div>
      </div>

      {activePass.status === 'pending' && (
        <div className="space-y-2">
          <p className="font-body text-xs text-deep-teal/70">
            Pending teacher approval...
          </p>
          <button
            onClick={() => onCancelPass(activePass.id)}
            disabled={isLoading}
            className="text-xs text-warm-clay hover:underline font-bold bg-transparent border-0 p-0 disabled:opacity-50"
          >
            Cancel Request
          </button>
        </div>
      )}

      {activePass.status === 'approved' && (
        <div className="space-y-3">
          <div className="bg-sage/5 border border-sage/20 rounded-xl p-4 text-center">
            <p className="font-body text-[10px] text-deep-teal/50 font-bold uppercase tracking-widest mb-1">
              Pass Code
            </p>
            <h2 className="font-mono text-3xl font-extrabold text-deep-teal tracking-widest animate-pulse">
              {activePass.pass_code}
            </h2>
            {timeLeftText && (
              <p className="font-body text-2xs text-sage font-semibold mt-2">
                ⏳ {timeLeftText}
              </p>
            )}
          </div>
          <div className="flex justify-between items-center text-2xs font-semibold text-deep-teal/50">
            <span>Reason: {activePass.reason}</span>
            <button
              onClick={() => onCancelPass(activePass.id)}
              disabled={isLoading}
              className="text-warm-clay hover:underline font-bold bg-transparent border-0 p-0 disabled:opacity-50"
            >
              Cancel Pass
            </button>
          </div>
        </div>
      )}

      {activePass.status === 'rejected' && (
        <div className="space-y-2">
          <p className="font-body text-xs text-warm-clay font-bold">
            Rejected: {activePass.rejection_reason || 'No reason specified'}
          </p>
          <button
            onClick={onRequestPass}
            disabled={isLoading}
            className="text-xs text-deep-teal hover:underline font-bold bg-transparent border-0 p-0 disabled:opacity-50"
          >
            Request Another Pass
          </button>
        </div>
      )}

      {['used', 'expired'].includes(activePass.status) && (
        <div className="space-y-2">
          <p className="font-body text-xs text-deep-teal/50 italic">
            This pass has been {activePass.status}.
          </p>
          <button
            onClick={onRequestPass}
            disabled={isLoading}
            className="text-xs text-deep-teal hover:underline font-bold bg-transparent border-0 p-0 disabled:opacity-50"
          >
            Request Gate Pass
          </button>
        </div>
      )}
    </div>
  );
}
