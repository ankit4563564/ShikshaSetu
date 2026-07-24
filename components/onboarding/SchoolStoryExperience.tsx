'use client';

import { memo, useCallback, useState } from 'react';
import { SchoolStoryButton } from './SchoolStoryButton';
import { SchoolStoryModal } from './SchoolStoryModal';
import { OnboardingMotionProvider } from './motion/OnboardingMotionProvider';
import type { OnboardingPhase } from './types';

type SchoolStoryExperienceProps = {
  landingTargetClass?: string;
};

function SchoolStoryExperienceComponent({
  landingTargetClass = 'landing-shell',
}: SchoolStoryExperienceProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<OnboardingPhase>('closed');

  const handleOpen = useCallback(() => {
    setPhase('opening');
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => setPhase('closed'), 320);
  }, []);

  const handlePhaseChange = useCallback((nextPhase: OnboardingPhase) => {
    setPhase(nextPhase);
  }, []);

  return (
    <OnboardingMotionProvider>
      <SchoolStoryButton onOpen={handleOpen} disabled={open && phase === 'launching'} />
      <SchoolStoryModal
        open={open}
        phase={phase}
        onClose={handleClose}
        onPhaseChange={handlePhaseChange}
        landingTargetClass={landingTargetClass}
      />
    </OnboardingMotionProvider>
  );
}

export const SchoolStoryExperience = memo(SchoolStoryExperienceComponent);
