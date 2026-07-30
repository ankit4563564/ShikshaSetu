'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ConnectedExperienceCenter() {
  const [step, setStep] = useState<'initial' | 'approved' | 'completed'>('initial');
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

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
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Helping Aarav get back on track
            </h1>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-base">Aarav Sharma</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm">Grade 8A</span>
            </div>
            <p className="text-sm text-slate-300 max-w-md">
              Three missed assignments suggested Aarav might need a little support.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset Demo
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-1 py-4">
          <div className={`w-2 h-2 rounded-full ${step === 'initial' ? 'bg-teal-400' : 'bg-emerald-400'}`} />
          <div className={`w-8 h-0.5 ${step !== 'initial' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'approved' ? 'bg-teal-400' : step === 'completed' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
          <div className={`w-8 h-0.5 ${step === 'completed' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'completed' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
        </div>

        {/* Visual Connected Story */}
        <div className="relative py-8">
          
          {/* Teacher Node */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center ${step === 'initial' ? 'opacity-100' : 'opacity-60'}`}
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">👩‍🏫</span>
              </div>
              <p className="text-sm font-medium text-slate-300">Mrs. Kavita Rao</p>
              <p className="text-xs text-slate-500">Teacher</p>
            </motion.div>
          </div>

          {/* Connection Lines */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-slate-700" />
          
          {/* Aarav - Center */}
          <div className="flex justify-center py-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 ${
                step === 'initial' ? 'ring-4 ring-teal-500/30' : 
                step === 'approved' ? 'ring-4 ring-emerald-500/30' : 
                'ring-4 ring-emerald-500/50'
              }`}>
                <span className="text-3xl font-bold text-white">AS</span>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">Aarav Sharma</p>
                <p className="text-sm text-slate-400">Grade 8A</p>
                <p className={`text-xs mt-1 ${step === 'initial' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {step === 'initial' ? 'Needs support' : step === 'approved' ? 'Getting help' : 'Back on track ✓'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Connection Lines to nodes */}
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-slate-700" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-slate-700" />

          {/* Surrounding Nodes */}
          <div className="flex justify-center gap-8 pt-20">
            
            {/* Parent Node */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: step !== 'initial' ? 1 : 0.4, x: 0 }}
              className="text-center"
            >
              <div className={`w-14 h-14 rounded-full bg-slate-800 border-2 flex items-center justify-center mx-auto mb-2 ${
                step !== 'initial' ? 'border-emerald-500' : 'border-slate-700'
              }`}>
                <span className="text-lg">👩</span>
              </div>
              <p className="text-sm font-medium text-slate-300">Priya Sharma</p>
              <p className="text-xs text-slate-500">Parent</p>
              {step !== 'initial' && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-400 mt-1"
                >
                  ✓ Informed
                </motion.p>
              )}
            </motion.div>

            {/* Student Support Node */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step !== 'initial' ? 1 : 0.4, y: 0 }}
              className="text-center"
            >
              <div className={`w-14 h-14 rounded-full bg-slate-800 border-2 flex items-center justify-center mx-auto mb-2 ${
                step === 'approved' ? 'border-teal-500' : 
                step === 'completed' ? 'border-emerald-500' : 
                'border-slate-700'
              }`}>
                <span className="text-lg">📘</span>
              </div>
              <p className="text-sm font-medium text-slate-300">Algebra Practice</p>
              <p className="text-xs text-slate-500">15 min</p>
              {step === 'approved' && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-teal-400 mt-1"
                >
                  Assigned
                </motion.p>
              )}
              {step === 'completed' && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-400 mt-1"
                >
                  ✓ Completed
                </motion.p>
              )}
            </motion.div>

            {/* School Node */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: step !== 'initial' ? 1 : 0.4, x: 0 }}
              className="text-center"
            >
              <div className={`w-14 h-14 rounded-full bg-slate-800 border-2 flex items-center justify-center mx-auto mb-2 ${
                step !== 'initial' ? 'border-emerald-500' : 'border-slate-700'
              }`}>
                <span className="text-lg">🏫</span>
              </div>
              <p className="text-sm font-medium text-slate-300">School Memory</p>
              <p className="text-xs text-slate-500">Outcome</p>
              {step !== 'initial' && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-400 mt-1"
                >
                  ✓ Recorded
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Initial State - Evidence */}
        {step === 'initial' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Mrs. Kavita Rao</h2>
              <p className="text-sm text-slate-300">"Aarav may need a little support."</p>
            </div>
            
            {/* Evidence Chips */}
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">HOMEWORK</p>
                <p className="text-sm font-medium text-amber-400">3 missed</p>
              </div>
              <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">ATTENDANCE</p>
                <p className="text-sm font-medium text-amber-400">96% → 89%</p>
              </div>
              <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">CLASSROOM</p>
                <p className="text-sm font-medium text-amber-400">Participation ↓</p>
              </div>
            </div>

            {/* Prepared Support */}
            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-2">Prepared for Mrs. Rao</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">Parent update</span>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">15-min Algebra practice</span>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">Tomorrow's check-in</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Approving...' : 'Approve Support'}
              </motion.button>
              <button
                onClick={() => setShowExplanation(true)}
                className="px-4 py-3 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Why this suggestion?
              </button>
            </div>
          </motion.div>
        )}

        {/* Approved State - Student Action */}
        {step === 'approved' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📘</span>
              </div>
              <h2 className="text-xl font-semibold text-white">Algebra Recovery Practice</h2>
              <p className="text-sm text-slate-400">15 min</p>
              <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                A short practice to help Aarav catch up.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={loading}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Completing...' : 'Mark Practice Complete'}
            </motion.button>
          </motion.div>
        )}

        {/* Completed State - Payoff */}
        {step === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-emerald-300 mb-2">Support Loop Complete</h2>
              <p className="text-lg text-white">Aarav is back on track.</p>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                One teacher decision coordinated support across home, classroom, and school.
              </p>
            </div>

            {/* School Memory */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-3">SCHOOL MEMORY</p>
              <p className="text-sm text-slate-300 mb-2">"What helped Aarav?"</p>
              <div className="space-y-1">
                <p className="text-sm text-emerald-400">✓ Short recovery practice</p>
                <p className="text-sm text-emerald-400">✓ Parent informed</p>
                <p className="text-sm text-emerald-400">✓ Teacher follow-up</p>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Saved so future support starts with context, not from zero.
              </p>
            </div>
          </motion.div>
        )}

        {/* Narrative Timeline */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-3">TODAY</p>
          <div className="space-y-2">
            <div className="flex gap-3">
              <span className="text-xs text-slate-600 w-12">09:12</span>
              <span className="text-sm text-slate-300">Aarav's pattern was noticed</span>
            </div>
            {step !== 'initial' && (
              <>
                <div className="flex gap-3">
                  <span className="text-xs text-slate-600 w-12">09:14</span>
                  <span className="text-sm text-slate-300">Mrs. Rao approved support</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs text-slate-600 w-12">09:14</span>
                  <span className="text-sm text-slate-300">Priya received an update</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs text-slate-600 w-12">09:14</span>
                  <span className="text-sm text-slate-300">Practice assigned to Aarav</span>
                </div>
              </>
            )}
            {step === 'completed' && (
              <>
                <div className="flex gap-3">
                  <span className="text-xs text-slate-600 w-12">09:29</span>
                  <span className="text-sm text-slate-300">Aarav completed practice</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs text-slate-600 w-12">09:29</span>
                  <span className="text-sm text-slate-300">Outcome remembered</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Explanation Modal */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExplanation(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Why Aarav was flagged</h2>
              
              <div className="space-y-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">HOMEWORK</p>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                  </div>
                  <p className="text-sm text-slate-300 mt-1">3 consecutive misses</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-2">ATTENDANCE</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">96%</span>
                    <span className="text-slate-600">──────→</span>
                    <span className="text-sm text-amber-400">89%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-2">CLASS PARTICIPATION</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Normal</span>
                    <span className="text-slate-600">──────→</span>
                    <span className="text-sm text-amber-400">Lower</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-slate-400 mb-2">Suggested response</p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">Parent communication</p>
                  <p className="text-sm text-slate-300">+ Short recovery practice</p>
                  <p className="text-sm text-slate-300">+ Teacher check-in</p>
                </div>
              </div>

              <button
                onClick={() => setShowExplanation(false)}
                className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
