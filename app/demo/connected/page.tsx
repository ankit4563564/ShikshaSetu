import React from 'react';
import { ConnectedExperienceCenter } from '@/components/demo/ConnectedExperienceCenter';

export const metadata = {
  title: 'Connected Experience Center | ShikshaSetu',
  description: 'Live orchestration layer showing real-time cross-portal state synchronization across Teacher, Parent, Student, and Principal.',
};

export default function ConnectedExperiencePage() {
  return <ConnectedExperienceCenter />;
}
