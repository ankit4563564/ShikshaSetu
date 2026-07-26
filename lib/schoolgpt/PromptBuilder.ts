import type { SchoolGPTRole } from './types';

export interface SuggestedPrompt {
  label: string;
  prompt: string;
  category: string;
}

export const ROLE_SUGGESTED_PROMPTS: Record<SchoolGPTRole, SuggestedPrompt[]> = {
  teacher: [
    { label: 'Why is Aarav struggling?', prompt: 'Why is Aarav struggling with attendance and math homework?', category: 'Student Focus' },
    { label: 'Compare Class 8A and 8B', prompt: 'Compare Class 8A and 8B morning attendance and quiz completion.', category: 'Class Comparison' },
    { label: 'Draft PTM Summary', prompt: 'Draft a PTM progress summary for Aarav Sharma to send to his parent.', category: 'PTM Report' },
    { label: 'Generate Math Quiz', prompt: 'Generate a 5-question quick quiz on Class 8 Geometry.', category: 'Lesson Creator' },
  ],
  parent: [
    { label: 'Where is Aarav\'s bus?', prompt: 'Where is Bus 04 right now and what is the ETA to Saket stop?', category: 'Live Transit' },
    { label: 'Today\'s Homework', prompt: 'What homework was assigned for Class 8-B today?', category: 'Academics' },
    { label: 'Attendance Check', prompt: 'Was Aarav scanned in safely at the campus gate today?', category: 'Gate Safety' },
    { label: 'Message Teacher', prompt: 'Draft a message to Ms. Priya about Aarav\'s doctor appointment.', category: 'Communication' },
  ],
  student: [
    { label: 'Explain Chapter 4', prompt: 'Explain Physics Chapter 4 (Motion) in simple 3 bullet points.', category: 'Learning' },
    { label: 'Practice Quiz', prompt: 'Give me a 3-question practice quiz for tomorrow\'s Math test.', category: 'Study Tool' },
    { label: 'Homework Checklist', prompt: 'What homework assignments do I have due tomorrow?', category: 'Quests' },
  ],
  admin: [
    { label: 'Campus Health Index', prompt: 'What is today\'s overall campus attendance and transit health index?', category: 'Campus Command' },
    { label: 'Check Bus Delays', prompt: 'Are there any bus fleet delays or speed alerts active right now?', category: 'Transport' },
    { label: 'Gate Scan Summary', prompt: 'Summarize morning gate entry scans across Gate 1 and Gate 2.', category: 'Security' },
    { label: 'Fee Collection Status', prompt: 'What is the quarterly fee collection percentage for Class 8?', category: 'Operations' },
  ],
  driver: [
    { label: 'Show Pickup Route', prompt: 'Show my assigned Saket Route #4 stop sequence and ETAs.', category: 'Navigation' },
    { label: 'Students Onboard', prompt: 'How many students are currently scanned onboard Bus 04?', category: 'Roster' },
    { label: 'Emergency Contact', prompt: 'What is the school transport control desk emergency phone number?', category: 'Safety' },
  ],
  gate: [
    { label: 'Verify Gate Pass', prompt: 'Verify digital pickup gate pass for Aarav Sharma.', category: 'Gate Pass' },
    { label: 'Today\'s Exit Log', prompt: 'Show all approved early exits for today.', category: 'Security Log' },
    { label: 'Visitor Status', prompt: 'Check visitor pass registration for Gate 1.', category: 'Visitors' },
  ],
  vendor: [
    { label: 'Today\'s Orders', prompt: 'Show cafeteria inventory deliveries scheduled for today.', category: 'Deliveries' },
  ],
};

export class PromptBuilder {
  static getSuggestedPrompts(role: SchoolGPTRole): SuggestedPrompt[] {
    return ROLE_SUGGESTED_PROMPTS[role] || ROLE_SUGGESTED_PROMPTS.student;
  }
}
