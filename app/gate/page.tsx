'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampusScanner } from '@/components/campus-id/CampusScanner';
import { processScanWithPortalAction } from '@/app/actions/campusIdActions';
import { fadeSlideUp, scaleIn, shakeError, staggerContainer } from '@/lib/animations';
import { createClient } from '@/lib/supabase/client';
import type { ScanOutput, ScanMode } from '@/lib/campus-id/types';
import {
  GATE_ENTRY_LOG,
  GATE_DAILY_STATS,
  ANNOUNCEMENTS,
} from '@/lib/demo/schoolUniverse';

type GateMode = 'entry' | 'exit';
type SidePanel = 'result' | 'log' | 'stats';

export default function GateVerificationPage() {
  const [activeMode, setActiveMode]       = useState<GateMode>('entry');
  const [sidePanel, setSidePanel]         = useState<SidePanel>('log');
  const [lastResult, setLastResult]       = useState<ScanOutput | null>(null);
  const [scanHistory, setScanHistory]     = useState<ScanOutput[]>([]);
  const [isVerifying, setIsVerifying]     = useState(false);

  const handleScan = async (qrContent: string, mode: ScanMode): Promise<ScanOutput> => {
    setIsVerifying(true);
    try {
      const result = await processScanWithPortalAction(qrContent, mode, 'gate', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      });
      handleResult(result);
      setSidePanel('result');
      return result;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResult = (result: ScanOutput) => {
    setLastResult(result);
    setScanHistory((prev) => [result, ...prev].slice(0, 20));
  };

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('gate-scan-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scan_events', filter: 'scanner_portal=eq.gate' }, (payload: any) => {
        if (payload.new) {
          const event = payload.new;
          const scanOutput: ScanOutput = {
            eventId: event.id,
            actions: [],
            validation: {
              valid: event.result === 'success',
              result: event.result,
              errorDetail: event.result !== 'success' ? `Scan ${event.result}` : undefined,
            },
          };
          setScanHistory((prev) => [scanOutput, ...prev].slice(0, 20));
          setLastResult(scanOutput);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gate_passes' }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const scanMode: ScanMode = activeMode === 'entry' ? 'gate_entry' : 'gate_exit';
  const modeLabel = activeMode === 'entry' ? 'Entry' : 'Exit';

  const statusColor = (s: string) => {
    if (s === 'verified')   return 'bg-sage/10 text-sage';
    if (s === 'late')       return 'bg-amber-100 text-amber-700';
    if (s === 'visitor')    return 'bg-blue-100 text-blue-700';
    if (s === 'gate-pass')  return 'bg-purple-100 text-purple-700';
    return 'bg-deep-teal/10 text-deep-teal';
  };

  return (
    <div className="gate-portal-shell min-h-screen bg-paper text-ink">
      <header className="gate-portal-header">
        <div>
          <p className="gate-eyebrow">ShikshaSetu Security</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-deep-teal">Gate Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-sage bg-sage/10 px-3 py-1 rounded-full border border-sage/20">
            <span className="h-2 w-2 rounded-full bg-sage animate-pulse" />
            Dynamic QR Pass Verification (Server-Validated)
          </span>
          <span className="text-[10px] font-bold text-deep-teal/70 bg-deep-teal/5 px-2.5 py-1 rounded-full">{GATE_DAILY_STATS.totalEntries} Scans Today</span>
        </div>
      </header>

      <div className="gate-portal-layout">
        {/* ── Sidebar ── */}
        <aside className="gate-sidebar" aria-label="Gate navigation">
          <div className="gate-sidebar-mark" aria-hidden="true">🛡️</div>
          <button type="button" onClick={() => setActiveMode('entry')}
            className={`gate-sidebar-item ${activeMode === 'entry' ? 'gate-sidebar-item-active' : ''}`}>
            <span>🚪</span><span>Entry</span>
          </button>
          <button type="button" onClick={() => setActiveMode('exit')}
            className={`gate-sidebar-item ${activeMode === 'exit' ? 'gate-sidebar-item-active' : ''}`}>
            <span>🚶</span><span>Exit</span>
          </button>
        </aside>

        <main className="gate-portal-main">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">

            {/* Heading row */}
            <motion.div variants={fadeSlideUp} className="gate-console-heading">
              <div>
                <p className="gate-eyebrow">Main entrance · {modeLabel}</p>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-deep-teal">Gate Verification</h2>
                <p className="font-body text-sm text-deep-teal/60 mt-2">
                  Scan ShikshaSetu Digital Campus Pass or enter 6-digit code manually.
                </p>
              </div>
              <div className="gate-entry-count">
                <span className="gate-live-dot" /> Live verification
              </div>
            </motion.div>

            {/* Daily stats strip */}
            <motion.div variants={fadeSlideUp} className="mb-4 grid grid-cols-4 gap-2">
              {[
                { label: 'Students in', value: GATE_DAILY_STATS.studentsIn,   color: 'text-sage'       },
                { label: 'Staff in',    value: GATE_DAILY_STATS.staffIn,      color: 'text-primary'    },
                { label: 'Late',        value: GATE_DAILY_STATS.lateArrivals, color: 'text-amber-600'  },
                { label: 'Alerts',      value: GATE_DAILY_STATS.alerts,       color: 'text-warm-clay'  },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-white/80 bg-white/70 p-3 text-center backdrop-blur-xl">
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-bold uppercase text-deep-teal/40">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Mode switch */}
            <motion.section variants={fadeSlideUp} className="mb-4 flex gap-2 rounded-xl border border-deep-teal/10 bg-white p-2">
              <button type="button" onClick={() => setActiveMode('entry')}
                className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${activeMode === 'entry' ? 'bg-deep-teal text-white shadow-sm' : 'text-deep-teal/60 hover:text-deep-teal'}`}>
                🚪 Gate Entry
              </button>
              <button type="button" onClick={() => setActiveMode('exit')}
                className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${activeMode === 'exit' ? 'bg-deep-teal text-white shadow-sm' : 'text-deep-teal/60 hover:text-deep-teal'}`}>
                🚶 Gate Exit
              </button>
            </motion.section>

            <div className="gate-portal-grid">
              {/* ── Scanner panel ── */}
              <motion.section variants={fadeSlideUp} className="gate-scan-panel" aria-labelledby="scan-title">
                <div className="gate-panel-heading">
                  <div>
                    <p className="gate-eyebrow">Checkpoint A</p>
                    <h3 id="scan-title" className="font-display text-xl font-extrabold text-deep-teal">Scan Campus Pass</h3>
                  </div>
                  <span className="gate-camera-status"><span className="gate-live-dot" /> QR Ready</span>
                </div>
                <div className="bg-white border border-deep-teal/10 rounded-2xl p-6 shadow-sm">
                  <CampusScanner
                    mode={scanMode}
                    onScan={handleScan}
                    allowManualEntry={true}
                    modeLabel={`Gate ${modeLabel}`}
                    modeDescription={`Scan Campus Pass for ${modeLabel.toLowerCase()}`}
                  />
                </div>
              </motion.section>

              {/* ── Right panel ── */}
              <aside className="gate-result-panel" aria-live="polite">

                {/* Panel tabs */}
                <div className="mb-4 flex gap-1 rounded-xl border border-deep-teal/10 bg-white/60 p-1">
                  {([
                    { key: 'result', label: '🪪 Result' },
                    { key: 'log',    label: '📋 Today\'s Log' },
                    { key: 'stats',  label: '📊 Stats' },
                  ] as { key: SidePanel; label: string }[]).map(t => (
                    <button key={t.key} type="button" onClick={() => setSidePanel(t.key)}
                      className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all ${
                        sidePanel === t.key ? 'bg-deep-teal text-white shadow-sm' : 'text-deep-teal/50 hover:text-deep-teal'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Result sub-panel */}
                {sidePanel === 'result' && (
                  <AnimatePresence mode="wait">
                    {!lastResult && !isVerifying && (
                      <motion.div key="empty" variants={fadeSlideUp} initial="hidden" animate="visible" className="gate-empty-state">
                        <span className="text-4xl" aria-hidden>🪪</span>
                        <p className="text-sm font-bold text-deep-teal/50">Scan a Campus Pass to see the verification result here.</p>
                      </motion.div>
                    )}
                    {isVerifying && (
                      <motion.div key="verifying" variants={fadeSlideUp} initial="hidden" animate="visible" className="flex items-center justify-center gap-2 py-8">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
                        <span className="text-sm font-bold text-deep-teal/60">Verifying securely…</span>
                      </motion.div>
                    )}
                    {lastResult && !isVerifying && (
                      <GateResultCard key="scan" result={lastResult} />
                    )}
                  </AnimatePresence>
                )}

                {/* Today's log sub-panel */}
                {sidePanel === 'log' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">{GATE_ENTRY_LOG.length} events today</p>
                    {GATE_ENTRY_LOG.map(entry => (
                      <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-deep-teal/5 bg-white px-4 py-2.5">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${statusColor(entry.status)}`}>
                          {entry.mode === 'entry' ? '↓' : '↑'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-deep-teal truncate">{entry.name}</p>
                          <p className="text-[10px] text-deep-teal/40">
                            {entry.type === 'student' ? `Class ${entry.grade}` : entry.grade}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[10px] text-deep-teal/40">{entry.time}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold capitalize ${statusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats sub-panel */}
                {sidePanel === 'stats' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">School day summary</p>
                    {[
                      { label: 'Total gate events',  value: GATE_DAILY_STATS.totalEntries },
                      { label: 'Students verified',  value: GATE_DAILY_STATS.studentsIn   },
                      { label: 'Staff on campus',    value: GATE_DAILY_STATS.staffIn      },
                      { label: 'Visitor passes',     value: GATE_DAILY_STATS.visitors     },
                      { label: 'Late arrivals',      value: GATE_DAILY_STATS.lateArrivals },
                      { label: 'Gate pass exits',    value: GATE_DAILY_STATS.gatePassExits },
                      { label: 'Open alerts',        value: GATE_DAILY_STATS.alerts       },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between rounded-xl border border-deep-teal/5 bg-white px-4 py-2.5">
                        <span className="text-xs font-bold text-deep-teal/60">{s.label}</span>
                        <span className="text-sm font-extrabold text-deep-teal">{s.value}</span>
                      </div>
                    ))}

                    {/* Active announcement */}
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Latest notice</p>
                      <p className="mt-1 text-xs font-bold text-amber-900">{ANNOUNCEMENTS[0].title}</p>
                      <p className="text-[11px] text-amber-800/70">{ANNOUNCEMENTS[0].body}</p>
                    </div>
                  </div>
                )}

                <p className="gate-data-note text-deep-teal/40 text-[11px] mt-4">
                  Campus Pass scans are recorded as arrival/departure events.
                </p>
              </aside>
            </div>

            <p className="gate-footer text-deep-teal/30 text-[11px] text-center mt-6">
              ShikshaSetu Gate Security System v2.0 — Digital Campus Pass Powered
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function GateResultCard({ result }: { result: ScanOutput }) {
  const { validation } = result;
  if (!validation.valid) {
    return (
      <motion.div variants={shakeError} initial="hidden" animate="visible"
        className="gate-result-summary rounded-xl border-2 border-warm-clay/30 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-clay/10 text-warm-clay text-lg font-bold">✕</span>
          <div>
            <strong className="text-sm font-extrabold uppercase tracking-wider text-warm-clay">SCAN FAILED</strong>
            <p className="text-xs mt-0.5 text-deep-teal/60">{validation.errorDetail || 'Unknown error'}</p>
          </div>
        </div>
      </motion.div>
    );
  }
  const student = validation.student;
  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible"
      className="gate-result-summary rounded-xl border-2 border-sage/30 bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/10 text-sage text-lg font-bold">✓</span>
        <div>
          <strong className="text-sm font-extrabold uppercase tracking-wider text-sage">VERIFIED</strong>
          <p className="text-xs mt-0.5 text-deep-teal/60">Student identity confirmed</p>
        </div>
      </div>
      {student && (
        <div className="rounded-xl bg-deep-teal/5 p-4 space-y-1.5">
          <p className="font-bold text-deep-teal">{student.displayName}</p>
          <p className="text-xs font-semibold text-deep-teal/60">Class {student.grade}{student.section ? ` - ${student.section}` : ''}</p>
          {student.house && <p className="text-xs font-semibold text-deep-teal/60">House: {student.house}</p>}
        </div>
      )}
    </motion.div>
  );
}
