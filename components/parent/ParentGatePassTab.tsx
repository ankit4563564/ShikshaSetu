'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGatePassQrContent } from '@/lib/gate/qrPassToken';

interface GatePass {
  id: string;
  status: 'pending' | 'approved' | 'used' | 'expired' | 'rejected' | 'revoked';
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
  guardianName?: string;
  isLoading?: boolean;
  timeLeftText?: string;
  onRequestPass: () => void;
  onCancelPass: (passId: string) => void;
}

export function ParentGatePassTab({
  activePass,
  studentName,
  guardianName = 'Sunita Sharma',
  isLoading = false,
  timeLeftText = '',
  onRequestPass,
  onCancelPass,
}: ParentGatePassTabProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  if (!activePass) {
    return (
      <div className="rounded-3xl border border-deep-teal/10 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎫</span>
              <h4 className="font-display text-base font-extrabold text-deep-teal">
                Need Early Student Pickup?
              </h4>
            </div>
            <p className="font-body text-xs text-deep-teal/60 max-w-sm">
              Generate an official school gate pass for {studentName}. Subject to class teacher verification and gate officer scanning.
            </p>
          </div>

          <button
            onClick={onRequestPass}
            disabled={isLoading}
            className="bg-deep-teal text-white font-display text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-deep-teal/90 active:scale-95 transition-all shadow-md shrink-0 disabled:opacity-50"
          >
            Request Pass +
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-deep-teal/5 text-center">
          <div className="p-2 bg-deep-teal/5 rounded-xl">
            <span className="text-[10px] font-bold text-deep-teal/50 uppercase block">Step 1</span>
            <span className="text-xs font-bold text-deep-teal">Parent Request</span>
          </div>
          <div className="p-2 bg-deep-teal/5 rounded-xl">
            <span className="text-[10px] font-bold text-deep-teal/50 uppercase block">Step 2</span>
            <span className="text-xs font-bold text-deep-teal">Teacher Verify</span>
          </div>
          <div className="p-2 bg-deep-teal/5 rounded-xl">
            <span className="text-[10px] font-bold text-deep-teal/50 uppercase block">Step 3</span>
            <span className="text-xs font-bold text-deep-teal">Gate QR Scan</span>
          </div>
        </div>
      </div>
    );
  }

  // Generate dynamic HMAC signed QR token for approved pass
  const qrContent = activePass.status === 'approved' ? generateGatePassQrContent(activePass.id) : '';

  return (
    <div className="rounded-3xl border border-deep-teal/10 bg-white p-6 shadow-xs space-y-4">
      {/* Pass Status Header */}
      <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-extrabold text-deep-teal">
            🎫 Gate Pass #{activePass.pass_code || activePass.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {activePass.status === 'pending' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              ⏳ Pending Approval
            </span>
          )}
          {activePass.status === 'approved' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Ready at Gate
            </span>
          )}
          {activePass.status === 'used' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-deep-teal/10 text-deep-teal">
              Checked Out
            </span>
          )}
          {activePass.status === 'rejected' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              Rejected
            </span>
          )}
        </div>
      </div>

      {/* Pending State */}
      {activePass.status === 'pending' && (
        <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
          <p className="font-body text-xs text-amber-900 leading-relaxed">
            Your pickup request for <span className="font-bold">{studentName}</span> has been sent to the class teacher for verification.
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-amber-800/70 font-semibold">
              Reason: {activePass.reason || 'Medical / Personal'}
            </span>
            <button
              onClick={() => onCancelPass(activePass.id)}
              disabled={isLoading}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* Approved State with QR & Passcode */}
      {activePass.status === 'approved' && (
        <div className="space-y-4">
          <div className="bg-sage/10 border border-sage/30 rounded-2xl p-5 text-center space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sage font-mono">
                Official Pickup Passcode
              </span>
              <h2 className="font-mono text-4xl font-black text-deep-teal tracking-widest mt-1">
                {activePass.pass_code}
              </h2>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowQrModal(!showQrModal)}
                className="bg-sage hover:bg-sage/90 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-xs"
              >
                {showQrModal ? 'Hide Digital QR' : 'Show Digital Gate QR'}
              </button>
            </div>

            {showQrModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-white rounded-2xl border border-sage/40 shadow-inner flex flex-col items-center space-y-2"
              >
                <div className="bg-slate-900 text-white font-mono text-[9px] p-3 rounded-xl break-all max-w-full select-all">
                  {qrContent}
                </div>
                <p className="text-[10px] text-deep-teal/60 font-semibold">
                  🔒 Show this QR code or 6-digit passcode at the school gate for pickup
                </p>
              </motion.div>
            )}

            {timeLeftText && (
              <p className="font-body text-xs text-sage font-extrabold">
                ⏳ {timeLeftText}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-deep-teal/60 px-1">
            <span>Authorized Pickup: <strong className="text-deep-teal">{guardianName}</strong></span>
            <button
              onClick={() => onCancelPass(activePass.id)}
              disabled={isLoading}
              className="text-rose-600 hover:underline font-bold"
            >
              Cancel Pass
            </button>
          </div>
        </div>
      )}

      {/* Used / Checked Out State */}
      {activePass.status === 'used' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-bold">✓</span>
            <h5 className="font-display text-sm font-bold text-emerald-800">
              Safe Checkout Confirmed
            </h5>
          </div>
          <p className="font-body text-xs text-emerald-700">
            {studentName} was securely checked out at the school gate
            {activePass.used_at
              ? ` at ${new Date(activePass.used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : ''} by authorized guardian.
          </p>
          <button
            onClick={onRequestPass}
            className="text-xs font-bold text-deep-teal hover:underline pt-1 block"
          >
            Request New Pass for another day →
          </button>
        </div>
      )}

      {/* Rejected / Revoked State */}
      {(activePass.status === 'rejected' || activePass.status === 'revoked') && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
          <h5 className="font-display text-xs font-bold text-rose-800">
            Pass {activePass.status === 'revoked' ? 'Revoked' : 'Rejected'} by Staff
          </h5>
          <p className="font-body text-xs text-rose-700">
            Reason: {activePass.rejection_reason || 'Safety restriction / school hours.'}
          </p>
          <button
            onClick={onRequestPass}
            className="text-xs font-bold text-deep-teal hover:underline pt-1 block"
          >
            Submit New Request →
          </button>
        </div>
      )}
    </div>
  );
}
