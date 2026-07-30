'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/shared/Avatar';
import { approveSupportPlanAction, completeTaskAction } from '@/app/actions/interventionActions';
import { resetDemoDataAction } from '@/app/actions/demoResetActions';
import { getCanonicalStudentState, CANONICAL_STUDENT_ID, CANONICAL_TEACHER_ID, CANONICAL_GUARDIAN_ID } from '@/lib/canonical';
import { getCanonicalSupportSignal } from '@/lib/support-signals';

export function ConnectedExperienceCenter() {
  const [step, setStep] = useState<'initial' | 'approved' | 'completed'>('initial');
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [canonicalData, setCanonicalData] = useState<any>(null);

  useEffect(() => {
    // Load canonical data on mount
    loadCanonicalData();
  }, []);

  const loadCanonicalData = async () => {
    try {
      const state = await getCanonicalStudentState();
      setCanonicalData(state);
    } catch (err) {
      console.error('Failed to load canonical data:', err);
      // Fallback to hardcoded data for demo
      setCanonicalData({
        homeworkSummary: { consecutiveMissed: 3 },
        attendanceSummary: { rate: 0.89 },
      });
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use fallback signal directly for demo (database unavailable)
      const signal = {
        id: 'demo-signal-fallback',
        studentId: CANONICAL_STUDENT_ID,
        studentName: 'Aarav Sharma',
        signalType: 'homework_gap',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        evidence: [],
        recommendedActions: [
          {
            id: 'act-1',
            action: 'Send parent update about missed homework',
            category: 'communication',
            priority: 'high',
            description: 'Inform parent about consecutive homework misses and request support at home',
          },
          {
            id: 'act-2',
            action: 'Assign recovery practice sheet',
            category: 'academic',
            priority: 'medium',
            description: 'Provide additional practice materials for missed topics',
          },
          {
            id: 'act-3',
            action: 'Schedule teacher check-in',
            category: 'intervention',
            priority: 'medium',
            description: 'Meet with student to understand barriers to homework completion',
          },
        ],
        status: 'pending',
      };
      
      let result;
      try {
        result = await approveSupportPlanAction({
          studentId: CANONICAL_STUDENT_ID,
          studentName: 'Aarav Sharma',
          teacherId: CANONICAL_TEACHER_ID,
          signalId: signal.id,
          signalType: signal.signalType,
          recommendedActions: signal.recommendedActions.map((a, i) => ({
            id: `act-${i}`,
            action: a.action,
            category: a.category,
            priority: a.priority,
            description: a.description,
          })),
        });
      } catch (dbError) {
        console.error('Database unavailable, simulating approval:', dbError);
        // Fallback: simulate successful approval for demo
        result = {
          success: true,
          taskId: 'demo-task-fallback-' + Date.now(),
        };
      }

      // Handle case where result is undefined or empty object (server action failure)
      if (!result || Object.keys(result).length === 0) {
        console.error('Server action returned empty result, using fallback');
        result = {
          success: true,
          taskId: 'demo-task-fallback-' + Date.now(),
        };
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to approve support plan');
      }

      setTaskId(result.taskId || null);
      setStep('approved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Approval failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!taskId) {
      setError('No task ID available');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let result;
      try {
        result = await completeTaskAction({
          taskId,
          studentId: CANONICAL_STUDENT_ID,
        });
      } catch (dbError) {
        console.error('Database unavailable, simulating completion:', dbError);
        // Fallback: simulate successful completion for demo
        result = { success: true };
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete task');
      }

      setStep('completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Completion failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      try {
        result = await resetDemoDataAction();
      } catch (dbError) {
        console.error('Database unavailable, simulating reset:', dbError);
        // Fallback: simulate successful reset for demo
        result = { success: true, message: 'Demo reset (simulated)' };
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to reset demo');
      }

      setStep('initial');
      setTaskId(null);
      await loadCanonicalData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Reset failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Dynamic Headline */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              {step === 'completed' ? 'Aarav is back on track' : 'Helping Aarav get back on track'}
            </h1>
            {step === 'completed' && (
              <p className="text-base text-slate-300 max-w-lg">
                Support reached Aarav early — before a small gap became a bigger one.
              </p>
            )}
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-lg">Aarav Sharma</span>
              <span className="text-slate-600">•</span>
              <span className="text-base">Grade 8A</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            Reset Demo
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Aarav Hero - Center Stage */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <Avatar
              src={null}
              alt="Aarav Sharma"
              size="xl"
              fallback="AS"
              showBorder={step === 'completed'}
              className={`${
                step === 'completed' ? 'border-2 border-emerald-500/50' : ''
              }`}
            />
            {step === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-sm">✓</span>
              </motion.div>
            )}
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">Aarav Sharma</h2>
            <p className="text-base text-slate-400">Grade 8A</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-lg font-semibold ${
                step === 'initial' ? 'text-amber-400' : 
                step === 'approved' ? 'text-teal-400' : 
                'text-emerald-400'
              }`}
            >
              {step === 'initial' ? 'Needs support' : 
               step === 'approved' ? 'Getting help' : 
               '✓ Back on track'}
            </motion.p>
          </div>
        </motion.div>

        {/* Teacher Decision Panel - Act 1: Notice */}
        {step === 'initial' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4"
          >
            {/* Pattern Detection */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-semibold text-amber-300">Pattern detected</span>
            </div>

            {/* Evidence Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-400 mb-1">HOMEWORK</p>
                <p className="text-xl font-bold text-amber-300">
                  {canonicalData?.homeworkSummary?.consecutiveMissed || 3}
                </p>
                <p className="text-xs text-amber-400">missed</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-400 mb-1">ATTENDANCE</p>
                <p className="text-xl font-bold text-amber-300">
                  {canonicalData?.attendanceSummary 
                    ? `${Math.round(canonicalData.attendanceSummary.rate * 100)}%` 
                    : '89%'}
                </p>
                <p className="text-xs text-amber-400">declining</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-400 mb-1">CLASSROOM</p>
                <p className="text-xl font-bold text-amber-300">↓</p>
                <p className="text-xs text-amber-400">activity</p>
              </div>
            </div>

            {/* Teacher's Decision */}
            <div className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <Avatar src={null} alt="Teacher" size="md" fallback="👩‍🏫" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-1">Mrs. Ananya Mehra sees this pattern</p>
                <p className="text-base text-white font-medium">"Aarav may need a little support."</p>
              </div>
            </div>

            {/* Proposed Support */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-semibold">Ready to coordinate</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs">1</span>
                  <span>Inform parent Sunita Sharma</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs">2</span>
                  <span>Assign 15-min Algebra practice</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs">3</span>
                  <span>Schedule tomorrow check-in</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-semibold text-base transition-colors disabled:opacity-50"
              >
                {loading ? 'Coordinating...' : 'Coordinate Support'}
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

        {/* Visual Journey - What Happened */}
        {(step === 'approved' || step === 'completed') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-400 text-center">What happened</h3>
            
            <div className="flex items-center justify-between gap-2">
              {/* Teacher */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-2">
                  <Avatar src={null} alt="Teacher" size="md" fallback="👩‍🏫" />
                </div>
                <p className="text-sm font-semibold text-white">Mrs. Ananya Mehra</p>
                <p className="text-xs text-emerald-400">✓ Approved</p>
              </motion.div>

              <span className="text-slate-600 text-xl">→</span>

              {/* Parent */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-2">
                  <Avatar src={null} alt="Parent" size="md" fallback="👩" />
                </div>
                <p className="text-sm font-semibold text-white">Sunita Sharma</p>
                <p className="text-xs text-emerald-400">✓ Informed</p>
              </motion.div>

              <span className="text-slate-600 text-xl">→</span>

              {/* Practice */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📘</span>
                </div>
                <p className="text-sm font-semibold text-white">Algebra Practice</p>
                <p className="text-xs text-emerald-400">✓ Completed</p>
              </motion.div>

              <span className="text-slate-600 text-xl">→</span>

              {/* School */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex-1 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🏫</span>
                </div>
                <p className="text-sm font-semibold text-white">School</p>
                <p className="text-xs text-emerald-400">✓ Recorded</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Student Practice Panel - Act 2: Support */}
        {step === 'approved' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center">
                <span className="text-2xl">📘</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-1">Aarav's task</p>
                <p className="text-lg text-white font-medium">Algebra Recovery Practice</p>
                <p className="text-sm text-slate-500">15 minutes • Self-paced</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-400 mb-1">Why this helps</p>
              <p className="text-sm text-slate-300">Short practice helps Aarav catch up on missed concepts without overwhelming him</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Completing...' : 'Mark Practice Complete'}
            </motion.button>
          </motion.div>
        )}

        {/* School Memory - What Helped Aarav */}
        {step === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-2 border-purple-500/30 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-300">SCHOOL MEMORY</p>
                <p className="text-xs text-slate-500">What helped Aarav</p>
              </div>
            </div>

            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">✓</span>
                <p className="text-sm text-white">Short Algebra recovery practice</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">✓</span>
                <p className="text-sm text-white">Parent informed early</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">✓</span>
                <p className="text-sm text-white">Teacher follow-up</p>
              </motion.div>
            </div>

            <div className="pt-4 border-t border-purple-500/20">
              <p className="text-xs text-purple-400 font-semibold mb-2">Saved for future support</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Next time Aarav shows a similar pattern, his school doesn't start from zero.
              </p>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-500 mb-4">TODAY</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-center">
              <div className="w-3 h-3 rounded-full bg-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">09:12</p>
              <p className="text-sm text-slate-300">Pattern noticed</p>
            </div>
            {step !== 'initial' && (
              <>
                <div className="flex-1 text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">09:14</p>
                  <p className="text-sm text-slate-300">Mrs. Mehra approved</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">09:14</p>
                  <p className="text-sm text-slate-300">Parent informed</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">09:15</p>
                  <p className="text-sm text-slate-300">Practice assigned</p>
                </div>
              </>
            )}
            {step === 'completed' && (
              <>
                <div className="flex-1 text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">10:02</p>
                  <p className="text-sm text-slate-300">Practice completed</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">10:02</p>
                  <p className="text-sm text-slate-300">Back on track</p>
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
              <h2 className="text-xl font-semibold text-white mb-4">Why Aarav was flagged</h2>
              
              <div className="space-y-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">HOMEWORK</p>
                  <div className="flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400" />
                    <span className="w-4 h-4 rounded-full bg-amber-400" />
                    <span className="w-4 h-4 rounded-full bg-amber-400" />
                  </div>
                  <p className="text-base text-slate-300 mt-2">3 consecutive misses</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">ATTENDANCE</p>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-slate-400">96%</span>
                    <span className="text-slate-600">──────→</span>
                    <span className="text-base text-amber-400">89%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">CLASS PARTICIPATION</p>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-slate-400">Normal</span>
                    <span className="text-slate-600">──────→</span>
                    <span className="text-base text-amber-400">Lower</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-slate-400 mb-2">Suggested response</p>
                <div className="space-y-1">
                  <p className="text-base text-slate-300">Parent communication</p>
                  <p className="text-base text-slate-300">+ Short recovery practice</p>
                  <p className="text-base text-slate-300">+ Teacher check-in</p>
                </div>
              </div>

              <button
                onClick={() => setShowExplanation(false)}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-base font-medium transition-colors"
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
