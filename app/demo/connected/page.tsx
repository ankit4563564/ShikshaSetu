import React from 'react';
import { ConnectedExperienceCenter } from '@/components/demo/ConnectedExperienceCenter';

export const metadata = {
  title: 'Connected Experience Center | ShikshaSetu',
  description: 'Live orchestration layer showing real-time cross-portal state synchronization across Teacher, Parent, Student, and Principal.',
};

// Force dynamic rendering since this page uses client-side state
export const dynamic = 'force-dynamic';

export default function ConnectedExperiencePage() {
  return <ConnectedExperienceCenter />;
}
