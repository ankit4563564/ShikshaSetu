'use client';

import { memo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  m,
  useReducedMotion,
} from 'framer-motion';
import { AmbientBackground } from './AmbientBackground';
import { IntroCinematic } from './IntroCinematic';
import { RoleCardGrid } from './RoleCardGrid';
import { LiveEcosystemStrip } from './LiveEcosystemStrip';
import { JourneyTimeline } from './JourneyTimeline';
import { useFocusTrap } from './hooks/useFocusTrap';
import { useOnboardingNavigation } from './hooks/useOnboardingNavigation';
import type { OnboardingPhase, SchoolRoleOption } from './types';
import {
  INTRO_DURATION_MS,
  OPEN_DURATION_MS,
} from './constants';
import { backdropVariants, modalShellVariants } from './motion/variants';

type SchoolStoryModalProps = {
  open: boolean;
  phase: OnboardingPhase;
  onClose: () => void;
  onPhaseChange: (phase: OnboardingPhase) => void;
  landingTargetClass?: string;
};

function SchoolStoryModalComponent({
  open,
  phase,
  onClose,
  onPhaseChange,
  landingTargetClass = 'landing-shell',
}: SchoolStoryModalProps) {
  const reduceMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const selectedRoleRef = useRef<SchoolRoleOption | null>(null);
  const { navigateToPortal } = useOnboardingNavigation();
  const mounted = typeof window !== 'undefined';

  useFocusTrap(open, modalRef);

  useEffect(() => {
    if (!mounted) return;

    const target = document.querySelector(`.${landingTargetClass}`);
    if (!target) return;

    if (open) {
      target.classList.add(
        'school-story-landing-dimmed',
        'transition-[transform,filter]',
        'duration-[350ms]',
        'ease-[cubic-bezier(0.16,1,0.3,1)]',
      );
      document.body.style.overflow = 'hidden';
    } else {
      target.classList.remove('school-story-landing-dimmed');
      document.body.style.overflow = '';
    }

    return () => {
      target.classList.remove('school-story-landing-dimmed');
      document.body.style.overflow = '';
    };
  }, [open, landingTargetClass, mounted]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      onPhaseChange('intro');
    }, reduceMotion ? 80 : OPEN_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [open, onPhaseChange, reduceMotion]);

  useEffect(() => {
    if (phase !== 'intro') return;

    const timer = window.setTimeout(() => {
      onPhaseChange('roles');
    }, reduceMotion ? 300 : INTRO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [phase, onPhaseChange, reduceMotion]);

  const handleSelectRole = useCallback(
    (role: SchoolRoleOption) => {
      selectedRoleRef.current = role;
      onPhaseChange('confirming');
    },
    [onPhaseChange],
  );

  const handleTimelineComplete = useCallback(() => {
    const role = selectedRoleRef.current;
    if (!role) return;

    onPhaseChange('launching');
    navigateToPortal(role.id);
  }, [navigateToPortal, onPhaseChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <m.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <m.button
            type="button"
            aria-label="Close onboarding"
            className="absolute inset-0 bg-[rgba(15,35,42,0.55)] backdrop-blur-[10px]"
            variants={backdropVariants}
            onClick={onClose}
          />

          <m.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="school-story-modal-title"
            aria-describedby="school-story-modal-description"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            variants={modalShellVariants}
            className="relative z-10 flex max-h-[min(92vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-[#0f232a]/92 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
          >
            <AmbientBackground />

            <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6 bg-white/5">
              <div>
                <p
                  id="school-story-modal-title"
                  className="font-display text-sm font-extrabold tracking-[0.2em] text-white uppercase"
                >
                  ShikshaSetu
                </p>
                <p id="school-story-modal-description" className="sr-only">
                  Immersive onboarding to choose your school role and enter a connected demo journey.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              >
                ESC
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-10">
              <AnimatePresence mode="wait">
                {phase === 'intro' && <IntroCinematic key="intro" />}

                {phase === 'roles' && (
                  <m.div
                    key="roles"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mx-auto mb-8 max-w-2xl text-center">
                      <p className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                        Choose whose story you&apos;d like to experience.
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/70">
                        Step into a connected school day — no login required for the demo.
                      </p>
                    </div>

                    <RoleCardGrid onSelect={handleSelectRole} />
                    <LiveEcosystemStrip />
                  </m.div>
                )}

                {phase === 'confirming' && (
                  <JourneyTimeline
                    key="timeline"
                    onComplete={handleTimelineComplete}
                  />
                )}

                {phase === 'launching' && (
                  <m.div
                    key="launching"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex min-h-[320px] items-center justify-center"
                  >
                    <p className="font-display text-xl font-extrabold text-white/90">
                      Opening your portal...
                    </p>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export const SchoolStoryModal = memo(SchoolStoryModalComponent);
