'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampusScanner } from '@/components/campus-id/CampusScanner';
import {
  verifyGatePassTokenAction,
  confirmGateCheckoutAction,
  emergencyPickupAction,
} from '@/app/actions/gatePassActions';
import { createClient } from '@/lib/supabase/client';
import type { VerifyGatePassResult, GateCheckoutResult } from '@/lib/gate/types';
import { GATE_DAILY_STATS } from '@/lib/demo/schoolUniverse';

type SidePanel = 'verification' | 'log' | 'emergency';

export default function GatePortalClient() {
  const [sidePanel, setSidePanel] = useState<SidePanel>('verification');
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Step 1 Verification state
  const [verifyResult, setVerifyResult] = useState<VerifyGatePassResult | null>(null);

  // Step 2 Checkout result state
  const [checkoutResult, setCheckoutResult] = useState<GateCheckoutResult | null>(null);

  // Emergency Pickup Form state
  const [emergencyStudentId, setEmergencyStudentId] = useState('');
  const [emergencyGuardianId, setEmergencyGuardianId] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyStatus, setEmergencyStatus] = useState<string | null>(null);

  const [scanHistory, setScanHistory] = useState<any[]>([]);

  // Scan or Manual Verification (Step 1)
  const handleVerify = async (codeOrToken: string) => {
    setIsVerifying(true);
    setCheckoutResult(null);
    try {
      const result = await verifyGatePassTokenAction(codeOrToken);
      setVerifyResult(result);
      setSidePanel('verification');
      setScanHistory((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          studentName: result.studentName || 'Unknown',
          status: result.status,
          message: result.message,
        },
        ...prev,
      ].slice(0, 20));
    } catch (err: any) {
      setVerifyResult({
        success: false,
        status: 'invalid',
        message: err?.message || 'Verification error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Confirm Checkout (Step 2)
  const handleConfirmCheckout = async () => {
    if (!verifyResult || !verifyResult.passId) return;
    setIsConfirming(true);
    try {
      const operationId = crypto.randomUUID();
      const res = await confirmGateCheckoutAction(verifyResult.passId, operationId);
      setCheckoutResult(res);
      if (res.success) {
        setVerifyResult((prev) => prev ? { ...prev, status: 'used', usedAt: res.usedAt } : null);
      }
    } catch (err: any) {
      setCheckoutResult({
        success: false,
        status: 'invalid',
        message: err?.message || 'Checkout failed',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Submit Emergency Override
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyStudentId || !emergencyGuardianId || !emergencyReason.trim()) return;
    setIsConfirming(true);
    setEmergencyStatus(null);
    try {
      const operationId = crypto.randomUUID();
      const res = await emergencyPickupAction({
        studentId: emergencyStudentId,
        guardianId: emergencyGuardianId,
        reason: emergencyReason,
        operationId,
      });
      if (res.success) {
        setEmergencyStatus(`✓ Emergency Override Logged: ${res.studentName} released to ${res.guardianName}.`);
        setEmergencyReason('');
      } else {
        setEmergencyStatus(`✕ Error: ${res.message}`);
      }
    } catch (err: any) {
      setEmergencyStatus(`✕ Override failed: ${err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('gate-audit-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gate_pass_audit_logs' }, (payload: any) => {
        if (payload.new) {
          const log = payload.new;
          setScanHistory((prev) => [
            {
              timestamp: new Date(log.created_at).toLocaleTimeString(),
              studentName: log.details || 'Gate Event',
              status: log.action,
              message: log.details,
            },
            ...prev,
          ].slice(0, 20));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="gate-portal-shell min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 font-body">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">ShikshaSetu Campus Security</p>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white">Gate Console & Dismissal Safety</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidePanel('emergency')}
            className="bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 text-xs font-bold px-3 py-2 rounded-xl transition-all"
          >
            ⚠️ Emergency Override
          </button>
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Online-First Verification Active
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: QR Scanner & Manual Code Input (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>📷 Scan Pass QR Token</span>
              {isVerifying && <span className="text-xs text-teal-400 animate-pulse">Verifying...</span>}
            </h2>

            <CampusScanner
              onScan={(qr) => handleVerify(qr)}
              scanMode="gate_exit"
            />

            {/* Manual Code Input */}
            <div className="pt-4 border-t border-slate-700/60 space-y-2">
              <label className="text-xs font-bold text-slate-400">Manual 6-Digit Pass Code Entry</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. 849201"
                  maxLength={6}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-lg font-mono font-bold text-white tracking-widest focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => handleVerify(manualCode)}
                  disabled={isVerifying || manualCode.length < 6}
                  className="bg-teal-600 text-white font-bold text-xs px-4 rounded-xl hover:bg-teal-500 disabled:opacity-50 transition-all"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Contrast Safety Verification Card (7 cols) */}
        <div className="lg:col-span-7">
          {sidePanel === 'emergency' ? (
            <div className="bg-slate-800/90 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  ⚠️ Emergency Student Pickup Override
                </h3>
                <button onClick={() => setSidePanel('verification')} className="text-xs text-slate-400 hover:text-white">
                  Close
                </button>
              </div>

              <form onSubmit={handleEmergencySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Student ID / Name</label>
                  <input
                    type="text"
                    value={emergencyStudentId}
                    onChange={(e) => setEmergencyStudentId(e.target.value)}
                    placeholder="Enter student ID (e.g. stu-101)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Authorized Guardian ID / Name</label>
                  <input
                    type="text"
                    value={emergencyGuardianId}
                    onChange={(e) => setEmergencyGuardianId(e.target.value)}
                    placeholder="Enter guardian ID (e.g. g-101)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mandatory Override Reason</label>
                  <textarea
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="e.g. Phone dead / emergency medical pickup verified with guardian ID card"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 h-20"
                    required
                  />
                </div>

                {emergencyStatus && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${emergencyStatus.startsWith('✓') ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'}`}>
                    {emergencyStatus}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isConfirming}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {isConfirming ? 'Logging Override...' : 'Confirm Emergency Override & Release Student'}
                </button>
              </form>
            </div>
          ) : !verifyResult ? (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <p className="text-4xl">🎫</p>
              <h3 className="text-lg font-bold text-slate-300">Ready for Scan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Scan parent digital QR pass or enter 6-digit code. Verification results will display here immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Verification Result Card */}
              {verifyResult.status === 'valid' || verifyResult.status === 'expiring_soon' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-6 text-emerald-100 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
                    <span className="flex items-center gap-2 bg-emerald-500 text-slate-950 font-black text-sm px-3 py-1 rounded-full uppercase tracking-wider">
                      ✓ VERIFIED — SAFE TO RELEASE
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Window ends: {verifyResult.windowEnd ? new Date(verifyResult.windowEnd).toLocaleTimeString() : 'Today'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Student</p>
                      <h3 className="text-2xl font-black text-white">{verifyResult.studentName}</h3>
                      <p className="text-xs font-bold text-emerald-300">{verifyResult.studentGrade} - Section {verifyResult.studentSection}</p>
                    </div>

                    <div className="space-y-1 bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/50">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Authorized Pickup Person</p>
                      <h4 className="text-lg font-bold text-white">{verifyResult.guardianName}</h4>
                      {verifyResult.guardianPhone && <p className="text-xs text-emerald-300 font-mono">📞 {verifyResult.guardianPhone}</p>}
                    </div>
                  </div>

                  {verifyResult.pickupReason && (
                    <p className="text-xs text-emerald-300 bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-800/60">
                      <span className="font-bold">Reason:</span> {verifyResult.pickupReason}
                    </p>
                  )}

                  {/* Step 2 Confirmation Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleConfirmCheckout}
                      disabled={isConfirming}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg py-4 rounded-xl transition-all shadow-lg active:scale-98 disabled:opacity-50"
                    >
                      {isConfirming ? 'Confirming Checkout...' : '[ CONFIRM CHECKOUT ]'}
                    </button>
                  </div>
                </motion.div>
              ) : verifyResult.status === 'used' ? (
                <div className="bg-amber-950/80 border-2 border-amber-500 rounded-2xl p-6 text-amber-100 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 bg-amber-500 text-slate-950 font-black text-sm px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                    ⚠️ ALREADY USED
                  </div>
                  <h3 className="text-xl font-bold text-white">{verifyResult.studentName}</h3>
                  <p className="text-xs text-amber-300">{verifyResult.message}</p>
                  {verifyResult.usedAt && (
                    <p className="text-xs font-mono text-amber-400">Checked out at: {new Date(verifyResult.usedAt).toLocaleTimeString()}</p>
                  )}
                </div>
              ) : (
                <div className="bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-6 text-rose-100 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 bg-rose-600 text-white font-black text-sm px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                    ✕ DO NOT RELEASE
                  </div>
                  <h3 className="text-xl font-bold text-white">{verifyResult.studentName || 'Student Dismissal Blocked'}</h3>
                  <p className="text-sm font-bold text-rose-200">{verifyResult.message}</p>
                  <p className="text-xs text-rose-400">Pass status: <span className="uppercase font-mono">{verifyResult.status}</span></p>
                </div>
              )}

              {/* Checkout Toast Result */}
              {checkoutResult && (
                <div className={`p-4 rounded-xl text-sm font-bold shadow-lg border ${checkoutResult.success ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500' : 'bg-rose-900/90 text-rose-100 border-rose-500'}`}>
                  {checkoutResult.message}
                </div>
              )}
            </div>
          )}

          {/* Recent Scan Audit Trail Log */}
          <div className="mt-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Gate Audit Log</h4>
            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No recent scans in session.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {scanHistory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-mono text-slate-400 text-[10px]">{item.timestamp}</span>
                    <span className="font-bold text-slate-200">{item.studentName}</span>
                    <span className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded ${item.status === 'valid' || item.status === 'use_success' ? 'bg-emerald-950 text-emerald-400' : item.status === 'emergency_override' ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
