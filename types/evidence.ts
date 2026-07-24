export type EvidenceStatus = 'on-track' | 'worth-watching' | 'needs-attention';

export type EvidenceItem = {
  id: string;
  status: EvidenceStatus;
  headline: string;
  bullets: string[];
};
