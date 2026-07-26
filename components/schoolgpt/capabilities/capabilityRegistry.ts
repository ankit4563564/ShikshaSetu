import { AttendanceAnalysisCapability } from './attendance';
import { StudentReportCapability } from './report';
import { PTMSummaryCapability } from './ptm';

export const allCapabilities = [
  AttendanceAnalysisCapability,
  StudentReportCapability,
  PTMSummaryCapability,
];

export function findCapabilityForIntent(intent: string) {
  return allCapabilities.find((cap) => cap.canHandle(intent)) || null;
}
