'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { scaleIn, shakeError, pulseOnce } from '@/lib/animations';
import type { ScanOutput } from '@/lib/campus-id/types';
import { Avatar } from '@/components/shared/Avatar';

interface ScanResultDisplayProps {
  result: ScanOutput;
  onScanAgain: () => void;
}

export function ScanResultDisplay({ result, onScanAgain }: ScanResultDisplayProps) {
  const { validation } = result;
  const isSuccess = validation.valid;

  if (!isSuccess) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="error"
          variants={shakeError}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-warm-clay/30 bg-warm-clay p-6 text-white shadow-lg"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
              ✕
            </span>
            <div>
              <h3 className="font-display text-base font-extrabold uppercase tracking-wider">
                Scan Failed
              </h3>
              <p className="mt-1 text-xs font-semibold opacity-90">
                {validation.errorDetail || 'Unknown error'}
              </p>
            </div>
          </div>

          {validation.card && (
            <div className="mb-4 rounded-xl bg-white/20 p-4 backdrop-blur-sm">
              <p className="text-sm font-bold">Card: {validation.card.cardType.replace('_', ' ')}</p>
              <p className="text-xs opacity-80">Status: {validation.card.status}</p>
            </div>
          )}

          <button
            type="button"
            onClick={onScanAgain}
            className="w-full rounded-xl bg-white/30 py-3 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Try Again
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  const student = validation.student;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="success"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-sage/30 bg-sage p-6 text-white shadow-lg"
      >
        <motion.div
          variants={pulseOnce}
          initial="hidden"
          animate="visible"
          className="mb-4 flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
            ✓
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold uppercase tracking-wider">
              Verified
            </h3>
            <p className="mt-1 text-xs font-semibold opacity-90">
              Student identity confirmed
            </p>
          </div>
        </motion.div>

        {student && (
          <div className="mb-4 space-y-4">
            <div className="flex flex-col items-center justify-center py-2">
              <Avatar
                src={student.avatarUrl}
                alt={student.displayName}
                size="xl"
                rounded="full"
                showBorder
                className="shadow-md border-white/40"
              />
              <h3 className="mt-3 font-display text-lg font-bold">{student.displayName}</h3>
              <p className="text-xs font-semibold text-white/80">
                Class {student.grade}{student.section ? ` - ${student.section}` : ''}
                {student.rollNumber ? ` · Roll ${student.rollNumber}` : ''}
              </p>
            </div>

            <div className="rounded-xl bg-white/20 p-4 backdrop-blur-sm space-y-1.5">
              {student.house && (
                <div className="flex justify-between text-sm font-bold">
                  <span>House</span>
                  <span>{student.house}</span>
                </div>
              )}
              {student.academicYear && (
                <div className="flex justify-between text-sm font-bold">
                  <span>Academic Year</span>
                  <span>{student.academicYear}</span>
                </div>
              )}
              {student.busRoute && (
                <div className="flex justify-between text-sm font-bold">
                  <span>Bus Route</span>
                  <span>{student.busRoute}</span>
                </div>
              )}
              {student.guardianName && (
                <div className="flex justify-between text-sm font-bold">
                  <span>Guardian</span>
                  <span>{student.guardianName}</span>
                </div>
              )}
              {student.emergencyContact && (
                <div className="flex justify-between text-sm font-bold">
                  <span>Emergency</span>
                  <span>{student.emergencyContact}</span>
                </div>
              )}
              {student.medicalFlags && student.medicalFlags.length > 0 && (
                <div className="border-t border-white/20 pt-1.5 mt-1.5">
                  {student.medicalFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center gap-1.5 text-sm">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        flag.severity === 'critical' ? 'bg-white animate-pulse' :
                        flag.severity === 'warning' ? 'bg-marigold' :
                        'bg-white/60'
                      }`} />
                      <span className="font-semibold">{flag.description}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-white/20 pt-1.5 mt-1.5">
                <span>Verified at</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onScanAgain}
          className="w-full rounded-xl bg-white/30 py-3 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Scan Next
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
