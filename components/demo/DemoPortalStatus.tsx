'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoRunner } from './DemoRunnerContext';
import { DEMO_STEP_DEFINITIONS } from '@/lib/demo/demoConstants';

const PORTALS = [
  { id: 'gate', label: 'Gate', icon: '🏫', color: 'deep-teal' },
  { id: 'teacher', label: 'Teacher', icon: '👩‍🏫', color: 'sage' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧', color: 'primary' },
  { id: 'driver', label: 'Driver', icon: '🚌', color: 'marigold' },
  { id: 'student', label: 'Student', icon: '🎓', color: 'deep-teal' },
  { id: 'vendor', label: 'Vendor', icon: '🛒', color: 'warm-clay' },
  { id: 'admin', label: 'Admin', icon: '📊', color: 'purple' },
] as const;

interface PortalUpdate {
  portal: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'sync';
}

const PORTAL_TYPES = ['info', 'success', 'warning', 'sync'] as const;

export function DemoPortalStatus() {
  const { stepStatuses, currentStepIndex, isRunning, isPaused } = useDemoRunner();
  const [portalUpdates, setPortalUpdates] = useState<PortalUpdate[]>([]);

  // Generate portal updates based on step execution
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const currentStep = DEMO_STEP_DEFINITIONS[currentStepIndex];
    if (!currentStep) return;

    const affectedPortals = currentStep.portal === 'all' 
      ? PORTALS.map(p => p.id) 
      : [currentStep.portal];

    const newUpdates: PortalUpdate[] = affectedPortals.map(portalId => ({
      portal: portalId,
      message: currentStep.description,
      timestamp: new Date().toISOString(),
      type: 'sync',
    }));

    setPortalUpdates(prev => [...newUpdates, ...prev].slice(0, 25));
  }, [currentStepIndex, isRunning, isPaused]);

  // Add completion updates
  useEffect(() => {
    stepStatuses.forEach((status, index) => {
      if (status.status === 'completed' && status.completedAt) {
        const step = DEMO_STEP_DEFINITIONS[index];
        const affectedPortals = step.portal === 'all' 
          ? PORTALS.map(p => p.id) 
          : [step.portal];

        affectedPortals.forEach(portalId => {
          setPortalUpdates(prev => {
            // Check if this exact completion update already exists
            const exists = prev.some(u => 
              u.portal === portalId && 
              u.message.includes(step.title) && 
              u.type === 'success'
            );
if (!exists) {
            const newUpdate: PortalUpdate = {
              portal: portalId,
              message: `✓ ${step.title}`,
              timestamp: status.completedAt!,
              type: 'success',
            };
            return [newUpdate, ...prev].slice(0, 25);
          }
            return prev;
          });
        });
      }
    });
  }, [stepStatuses]);

  return (
    <div className="demo-portal-status rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-sm font-extrabold text-deep-teal">Live Portal Updates</p>
        <div className="flex items-center gap-2 text-[10px] font-bold text-deep-teal/50">
          <span className={`h-2 w-2 rounded-full ${isRunning && !isPaused ? 'bg-sage animate-pulse' : 'bg-deep-teal/30'}`} />
          {isRunning ? (isPaused ? 'Paused' : 'Live') : 'Idle'}
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
        {PORTALS.map(portal => {
          const portalUpdatesForThis = portalUpdates.filter(u => u.portal === portal.id).slice(0, 3);
          const hasUpdates = portalUpdatesForThis.length > 0;
          
          // Determine if portal is active
          const isActive = currentStepIndex >= 0 && 
            (DEMO_STEP_DEFINITIONS[currentStepIndex].portal === 'all' || 
             DEMO_STEP_DEFINITIONS[currentStepIndex].portal === portal.id);
          
          return (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-xl p-3 transition-all duration-300 ${
                isActive && isRunning && !isPaused
                  ? 'border-2 bg-sage/5 shadow-[0_0_0_2px_rgba(126,174,60,0.15)]'
                  : 'border border-white/80 bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{portal.icon}</span>
                <span className="font-display text-sm font-extrabold text-deep-teal">{portal.label}</span>
                {isActive && isRunning && !isPaused && (
                  <motion.span
                    className="flex h-1.5 w-1.5 rounded-full bg-sage animate-pulse"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>

              {hasUpdates ? (
                <div className="space-y-1.5">
                  {portalUpdatesForThis.map((update, i) => (
                    <motion.div
                      key={`${update.timestamp}-${i}`}
                      initial={{ opacity: 0, y: 10, x: -10 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-2 text-[10px] leading-relaxed ${
                        update.type === 'success' ? 'text-sage' :
                        update.type === 'warning' ? 'text-marigold' :
                        update.type === 'sync' ? 'text-primary' :
                        'text-deep-teal/60'
                      }`}
                    >
                      <span className="flex-shrink-0 text-sage">✦</span>
                      <span className="font-medium">{update.message}</span>
                      <span className="flex-shrink-0 text-deep-teal/30 font-mono">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-deep-teal/30 italic"
                >
                  Waiting for activity...
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>

      {portalUpdates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-deep-teal/30"
        >
          <p className="text-lg mb-1">🎬</p>
          <p className="text-sm font-medium">Start the demo to see live updates</p>
          <p className="text-[10px] mt-1">Each portal will show real-time activity</p>
        </motion.div>
      )}
    </div>
  );
}