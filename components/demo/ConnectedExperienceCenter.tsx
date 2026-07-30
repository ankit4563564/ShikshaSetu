'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function ConnectedExperienceCenter() {
  const [step, setStep] = useState<'initial' | 'approved' | 'completed'>('initial');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('approved');
    setLoading(false);
  };

  const handleComplete = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('completed');
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setStep('initial');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">LIVE STUDENT SUPPORT</h1>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-lg">Aarav Sharma</span>
              <span className="text-slate-600">·</span>
              <span className="text-base">Grade 8A</span>
              <span className="text-slate-600">·</span>
              <span className="text-base">Homework support case</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset Demo
          </button>
        </div>

        {/* Lifecycle */}
        <div className="flex items-center gap-2 py-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-300`}>
            <span className="text-sm">✓</span>
            <span className="text-sm font-medium">Signal Detected</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            step === 'initial' ? 'bg-teal-500/10 text-teal-300' :
            step === 'approved' || step === 'completed' ? 'bg-emerald-500/10 text-emerald-300' :
            'bg-slate-800/50 text-slate-500'
          }`}>
            {(step === 'approved' || step === 'completed') && <span className="text-sm">✓</span>}
            {step === 'initial' && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
            <span className="text-sm font-medium">{step === 'initial' ? 'Awaiting Teacher' : 'Teacher Approved'}</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            step === 'approved' || step === 'completed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800/50 text-slate-500'
          }`}>
            {(step === 'approved' || step === 'completed') && <span className="text-sm">✓</span>}
            <span className="text-sm font-medium">Parent Informed</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            step === 'approved' ? 'bg-teal-500/10 text-teal-300' :
            step === 'completed' ? 'bg-emerald-500/10 text-emerald-300' :
            'bg-slate-800/50 text-slate-500'
          }`}>
            {step === 'approved' && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
            {step === 'completed' && <span className="text-sm">✓</span>}
            <span className="text-sm font-medium">Practice Assigned</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            step === 'completed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800/50 text-slate-500'
          }`}>
            {step === 'completed' && <span className="text-sm">✓</span>}
            <span className="text-sm font-medium">Outcome Tracked</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Main Story */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Teacher Card */}
            {step === 'initial' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">Teacher Review</h2>
                <p className="text-slate-300">Aarav may need additional support</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Evidence:</p>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• 3 consecutive homework misses</li>
                    <li>• Attendance declined this week</li>
                    <li>• Reduced classroom participation</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Prepared support:</p>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>✓ Parent update drafted</li>
                    <li>✓ Algebra recovery practice prepared</li>
                    <li>✓ 10-minute check-in suggested</li>
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Approving...' : 'Approve Support Plan'}
                </motion.button>
              </div>
            )}

            {/* Approved State */}
            {step === 'approved' && (
              <>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h2 className="text-lg font-semibold text-emerald-300">Support plan approved</h2>
                      <p className="text-sm text-slate-400">Mrs. Kavita Rao • Approved just now</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-sm font-medium text-slate-400">Parent Informed</span>
                    </div>
                    <p className="text-sm text-slate-300">New update from Mrs. Rao</p>
                    <p className="text-xs text-slate-500">Support message delivered</p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-sm font-medium text-slate-400">Student Supported</span>
                    </div>
                    <p className="text-sm text-slate-300">Algebra Practice Sheet B</p>
                    <p className="text-xs text-slate-500">Assigned to today's roadmap</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleComplete}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Completing...' : 'Mark Task Complete'}
                    </motion.button>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-sm font-medium text-slate-400">School Updated</span>
                    </div>
                    <p className="text-sm text-slate-300">Intervention #88</p>
                    <p className="text-xs text-slate-500">Active support case logged</p>
                  </div>
                </div>
              </>
            )}

            {/* Completed State */}
            {step === 'completed' && (
              <>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h2 className="text-lg font-semibold text-emerald-300">Task completed successfully</h2>
                      <p className="text-sm text-slate-400">Practice sheet completed • Outcome tracked</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-sm font-medium text-slate-400">Parent Informed</span>
                    </div>
                    <p className="text-sm text-slate-300">New update from Mrs. Rao</p>
                    <p className="text-xs text-slate-500">Support message delivered</p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-sm font-medium text-slate-400">Student Completed</span>
                    </div>
                    <p className="text-sm text-slate-300">Algebra Practice Sheet B</p>
                    <p className="text-xs text-slate-500">Completed successfully</p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-sm font-medium text-slate-400">School Updated</span>
                    </div>
                    <p className="text-sm text-slate-300">Intervention #88</p>
                    <p className="text-xs text-slate-500">Outcome tracked</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Live Activity */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Live Activity</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-800/50">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-300">System</p>
                  <p className="text-xs text-slate-500">Support signal detected</p>
                  <p className="text-[11px] text-slate-600">Just now</p>
                </div>
              </div>
              {step === 'approved' && (
                <div className="flex items-start gap-3 pb-3 border-b border-slate-800/50">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                    T
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300">Teacher</p>
                    <p className="text-xs text-slate-500">Support plan approved</p>
                    <p className="text-[11px] text-slate-600">Just now</p>
                  </div>
                </div>
              )}
              {step === 'completed' && (
                <div className="flex items-start gap-3 pb-3 border-b border-slate-800/50">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300">Student</p>
                    <p className="text-xs text-slate-500">Practice completed</p>
                    <p className="text-[11px] text-slate-600">Just now</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
