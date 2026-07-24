import type { Portal } from '@/types';

export type OnboardingPhase =
  | 'closed'
  | 'opening'
  | 'intro'
  | 'roles'
  | 'confirming'
  | 'launching';

export type SchoolRole = Portal;

export type SchoolRoleOption = {
  id: SchoolRole;
  emoji: string;
  title: string;
  description: string;
  portalLabel: string;
  isHero?: boolean;
  badge?: string;
};

export type TimelineStep = {
  id: string;
  emoji: string;
  label: string;
};
