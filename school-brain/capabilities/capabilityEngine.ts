export interface CapabilityExplanation {
  message: string;
  availableCapabilities: string[];
  alternativeAction: string;
}

export function handleUnconnectedCapability(domain: string): CapabilityExplanation {
  switch (domain.toLowerCase()) {
    case 'fee_gateway_live':
      return {
        message: 'I don\'t currently have direct access to live bank gateway payment transactions in this view.',
        availableCapabilities: [
          'quarterly fee structure breakdown',
          'pending fee balance per student',
          'official school fee policies and payment due dates',
        ],
        alternativeAction: 'Meanwhile, I can explain the quarterly fee structure or help you check recorded fee statuses.',
      };

    case 'live_gps_tracking':
      return {
        message: 'I don\'t currently have active live satellite GPS stream feeds for this bus vehicle.',
        availableCapabilities: [
          'assigned bus route details and driver phone numbers',
          'scheduled morning pickup and evening drop times',
          'total number of students riding Bus 3 or Route 1',
        ],
        alternativeAction: 'Meanwhile, I can provide the driver contact information and scheduled stop timings.',
      };

    default:
      return {
        message: 'I don\'t currently have direct real-time sync with that external module in this demo context.',
        availableCapabilities: [
          'student attendance & academic performance trends',
          'class timetables, exam schedules & syllabus topics',
          'school policies, canteen menus, library records & events',
        ],
        alternativeAction: 'Meanwhile, I can answer general educational questions, draft lesson plans, or look up registered school records.',
      };
  }
}

export function formatCapabilityFallback(explanation: CapabilityExplanation): string {
  return `${explanation.message}\n\nOnce live integration is connected, I will be able to provide:\n${explanation.availableCapabilities.map(c => `• ${c}`).join('\n')}\n\n${explanation.alternativeAction}`;
}
