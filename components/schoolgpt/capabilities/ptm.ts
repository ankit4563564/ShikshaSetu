import type { DomainContext } from '../context/types';

export const PTMSummaryCapability = {
  id: 'ptm-summary',
  name: 'Parent-Teacher Meeting Summary Brief',
  description: 'Drafts structured parent meeting briefs and official PDF summaries.',
  canHandle(intent: string) {
    return intent === 'ptm';
  },
  preferredSurface: 'document' as const,
  getPrompt(ctx: DomainContext) {
    return `Generate PTM summary update for Class ${ctx.classGrade || '8'}${ctx.classSection || 'A'}`;
  },
};
