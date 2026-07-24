/**
 * Realistic Conversation Templates
 * 
 * Every conversation in the platform pre-populated with 8-12 messages
 * spanning multiple days, creating the illusion of weeks of real history.
 * 
 * Messages are interconnected — same events appear across portals
 * with consistent context and narrative.
 */

import type { ConversationMessage } from '@/lib/conversation/conversationTokens';

// ─── HELPER: Generate timestamp for realistic intervals ────────────────────

const NOW = Date.now();
const DAY_MS = 86400000;

// Times: now - relative milliseconds from midnight
const TIME = {
  now: NOW,
  
  // Today
  this_morning_830am: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (8.5 * 3600000),
  this_morning_845am: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (8.75 * 3600000),
  this_morning_900am: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (9 * 3600000),
  this_morning_915am: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (9.25 * 3600000),
  this_morning_920am: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (9.33 * 3600000),
  this_afternoon_145pm: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (13.75 * 3600000),
  this_afternoon_300pm: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (15 * 3600000),
  this_evening_600pm: NOW - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (18 * 3600000),
  
  // Yesterday
  yesterday_800am: NOW - DAY_MS - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (8 * 3600000),
  yesterday_815am: NOW - DAY_MS - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (8.25 * 3600000),
  yesterday_200pm: NOW - DAY_MS - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (14 * 3600000),
  yesterday_445pm: NOW - DAY_MS - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (16.75 * 3600000),
  
  // 2 days ago
  two_days_ago_830am: NOW - (DAY_MS * 2) - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (8.5 * 3600000),
  two_days_ago_330pm: NOW - (DAY_MS * 2) - (new Date().getHours() * 3600000) - (new Date().getMinutes() * 60000) + (15.5 * 3600000),
};

// ─── TEMPLATE 1: Teacher ↔ Parent — Morning Wellness Check ─────────────────

export const TEACHER_PARENT_WELLNESS_CONVERSATION: ConversationMessage[] = [
  // Yesterday
  {
    id: 'msg-001',
    type: 'other',
    content: "Aarav wasn't feeling well yesterday. He had a headache and seemed a bit down.",
    senderName: 'Ananya Sharma (Parent)',
    senderRole: 'Parent',
    timestamp: TIME.yesterday_445pm,
    status: 'read',
  },
  {
    id: 'msg-002',
    type: 'other',
    content: "Thank you for informing me. I'll keep an eye on him and make sure he's not overworked.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.yesterday_445pm + 120000,
    status: 'read',
  },
  {
    id: 'msg-system-001',
    type: 'system',
    content: 'Attendance marked at 8:07 AM',
    senderName: 'System',
    timestamp: TIME.this_morning_830am,
  },
  {
    id: 'msg-003',
    type: 'other',
    content: "He looks much better today! He actively participated in the Math class discussion.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.this_morning_900am,
    status: 'read',
  },
  {
    id: 'msg-004',
    type: 'user',
    content: "That's wonderful to hear! Thank you for keeping an eye on him. 😊",
    senderName: 'You',
    timestamp: TIME.this_morning_900am + 180000,
    status: 'delivered',
  },
  {
    id: 'msg-005',
    type: 'other',
    content: "Could you please remind him to bring the Science notebook tomorrow? We're starting a new chapter on chemical reactions.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.this_morning_915am,
    status: 'read',
  },
  {
    id: 'msg-006',
    type: 'user',
    content: "Absolutely! I'll remind him tonight. Thank you, Mrs. Rao.",
    senderName: 'You',
    timestamp: TIME.this_morning_920am,
    status: 'delivered',
  },
  {
    id: 'msg-system-002',
    type: 'system',
    content: "Parent acknowledged teacher's message",
    senderName: 'System',
    timestamp: TIME.this_morning_920am,
  },
  {
    id: 'msg-007',
    type: 'ai',
    content: "📊 **Morning wellness update**: Aarav reported feeling unwell yesterday but is performing well today. No concerns detected. Parent communication: active and engaged.",
    senderName: 'AI Summary',
    timestamp: TIME.this_afternoon_300pm,
  },
];

export const TEACHER_PARENT_WELLNESS_HEADER = {
  title: 'Mrs. Kavita Rao',
  subtitle: 'Class Teacher (Math & Science)',
  tertiary: 'Aarav Sharma · Class 8A',
  quaternary: 'Usually replies within 1 hour',
};

// ─── TEMPLATE 2: Teacher ↔ Parent — Academic Progress ────────────────────

export const TEACHER_PARENT_ACADEMICS_CONVERSATION: ConversationMessage[] = [
  // 2 days ago
  {
    id: 'msg-001',
    type: 'other',
    content: "Unit Test results are ready. Aarav scored 91% in Mathematics — excellent work!",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.two_days_ago_330pm,
    status: 'read',
  },
  {
    id: 'msg-002',
    type: 'user',
    content: "That's fantastic! We're so proud of him. He studied really hard for this test.",
    senderName: 'You',
    timestamp: TIME.two_days_ago_330pm + 300000,
    status: 'delivered',
  },
  {
    id: 'msg-system-001',
    type: 'system',
    content: 'Mrs. Rao attached: Aarav_Math_Unit_Test_Report.pdf',
    senderName: 'System',
    timestamp: TIME.two_days_ago_330pm + 600000,
  },
  {
    id: 'msg-003',
    type: 'other',
    content: "His problem-solving approach has really matured. Chapter 6 on Algebraic Expressions was particularly strong. He's ready for advanced material.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.two_days_ago_330pm + 900000,
    status: 'read',
  },
  {
    id: 'msg-004',
    type: 'user',
    content: "That's wonderful to hear. What's the next step? Should we encourage him to do extra practice?",
    senderName: 'You',
    timestamp: TIME.two_days_ago_330pm + 1200000,
    status: 'delivered',
  },
  {
    id: 'msg-005',
    type: 'other',
    content: "Yes! I'd like him to attempt Challenge Set 7. It's at an advanced level, but I think he's ready. Due next Friday.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.two_days_ago_330pm + 1500000,
    status: 'read',
  },
  {
    id: 'msg-system-002',
    type: 'system',
    content: 'Homework assignment added: Challenge Set 7 (Math)',
    senderName: 'System',
    timestamp: TIME.two_days_ago_330pm + 1800000,
  },
  // Yesterday
  {
    id: 'msg-006',
    type: 'user',
    content: "Great! He started working on it last night. He's excited about the challenge. 🎯",
    senderName: 'You',
    timestamp: TIME.yesterday_815am,
    status: 'delivered',
  },
  {
    id: 'msg-007',
    type: 'other',
    content: "Perfect! That's the right attitude. Tell him to reach out if he gets stuck — we can discuss strategies in class.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.yesterday_815am + 300000,
    status: 'read',
  },
  {
    id: 'msg-ai-001',
    type: 'ai',
    content: "🏆 **Academic milestone**: Aarav achieved 91% on Math Unit Test. Advanced material recommended (Challenge Set 7). Parent engagement high. Next checkpoint: assignment completion by Jul 26.",
    senderName: 'AI Summary',
    timestamp: TIME.this_morning_845am,
  },
];

export const TEACHER_PARENT_ACADEMICS_HEADER = {
  title: 'Mrs. Kavita Rao',
  subtitle: 'Class Teacher (Math)',
  tertiary: 'Aarav Sharma · Class 8A',
  quaternary: 'Very responsive · Usually replies within 30 min',
};

// ─── TEMPLATE 3: Parent ↔ Parent — Co-Parent Coordination ────────────────

export const PARENT_PARENT_COORDINATION_CONVERSATION: ConversationMessage[] = [
  // 2 days ago
  {
    id: 'msg-001',
    type: 'user',
    content: "Hi! Are you coming to the PTM next week? I was thinking we could coordinate to discuss Aarav's progress together.",
    senderName: 'You',
    timestamp: TIME.two_days_ago_830am,
    status: 'delivered',
  },
  {
    id: 'msg-002',
    type: 'other',
    content: "Yes, I'll be there! That's a good idea. Mrs. Rao mentioned his test scores have been improving.",
    senderName: 'Parent Contact',
    timestamp: TIME.two_days_ago_830am + 600000,
    status: 'read',
  },
  {
    id: 'msg-003',
    type: 'other',
    content: "91% on the last Math test! I'm really proud of his effort.",
    senderName: 'Parent Contact',
    timestamp: TIME.two_days_ago_830am + 900000,
    status: 'read',
  },
  {
    id: 'msg-004',
    type: 'user',
    content: "That's fantastic! We should ask her about his progress in other subjects too, and maybe get tips on how we can support him better at home.",
    senderName: 'You',
    timestamp: TIME.two_days_ago_830am + 1200000,
    status: 'delivered',
  },
  {
    id: 'msg-system-001',
    type: 'system',
    content: 'Event reminder: Parent-Teacher Meeting on Jul 2 at 3:00 PM',
    senderName: 'System',
    timestamp: TIME.this_morning_830am,
  },
  {
    id: 'msg-005',
    type: 'other',
    content: "Perfect! I'll book the 3:30 PM slot so we have time to talk with her. See you then! 👍",
    senderName: 'Parent Contact',
    timestamp: TIME.this_afternoon_300pm,
    status: 'read',
  },
  {
    id: 'msg-006',
    type: 'user',
    content: "Sounds good. Let's plan to meet 10 minutes early so we can prepare our questions.",
    senderName: 'You',
    timestamp: TIME.this_afternoon_300pm + 300000,
    status: 'delivered',
  },
];

export const PARENT_PARENT_COORDINATION_HEADER = {
  title: 'Parent Contact',
  subtitle: 'Co-parent',
  tertiary: 'Aarav Sharma',
  quaternary: 'Online now',
};

// ─── TEMPLATE 4: Student ↔ SchoolGPT — Learning Support ─────────────────

export const STUDENT_SCHOOLGPT_LEARNING_CONVERSATION: ConversationMessage[] = [
  // Yesterday
  {
    id: 'msg-001',
    type: 'user',
    content: 'What should I study for the Math test next week?',
    senderName: 'You',
    timestamp: TIME.yesterday_200pm,
    status: 'read',
  },
  {
    id: 'msg-002',
    type: 'ai',
    content: 'Your Math Unit Test covers **Chapters 5–7** (Linear Equations, Algebraic Expressions, Geometry). Mrs. Rao expects you to focus on problem-solving, not just formulas. Your recent score of 91% shows you understand the concepts well!',
    senderName: 'SchoolGPT',
    timestamp: TIME.yesterday_200pm + 180000,
  },
  {
    id: 'msg-003',
    type: 'user',
    content: 'What was my score on the last test?',
    senderName: 'You',
    timestamp: TIME.yesterday_200pm + 300000,
    status: 'read',
  },
  {
    id: 'msg-004',
    type: 'ai',
    content: 'You scored **91%** on the last Math Unit Test (Jul 12). Your strongest area was Algebraic Expressions (97%). Area to focus: Geometry proofs (82%). Mrs. Rao suggested Challenge Set 7 to strengthen this area.',
    senderName: 'SchoolGPT',
    timestamp: TIME.yesterday_200pm + 450000,
  },
  {
    id: 'msg-005',
    type: 'user',
    content: 'Do you have a study plan for me?',
    senderName: 'You',
    timestamp: TIME.yesterday_200pm + 600000,
    status: 'read',
  },
  {
    id: 'msg-006',
    type: 'ai',
    content: '📚 **6-Day Study Plan for Math (Jul 22–27)**\n\n**Day 1–2**: Review Ch.5 (Linear Equations) — 10 practice problems each day\n**Day 3–4**: Quick review Ch.6 (you already mastered this)\n**Day 5**: Focus on Ch.7 (Geometry) — concentrate on proofs\n**Day 6**: Full mock test from last year\n\nYou\'re on track. Your 14-day homework streak is helping! 🔥',
    senderName: 'SchoolGPT',
    timestamp: TIME.yesterday_200pm + 750000,
  },
  {
    id: 'msg-007',
    type: 'user',
    content: 'Thanks! When is Challenge Set 7 due?',
    senderName: 'You',
    timestamp: TIME.yesterday_200pm + 900000,
    status: 'read',
  },
  {
    id: 'msg-008',
    type: 'ai',
    content: 'Challenge Set 7 is due **Friday, July 26** (4 days left). Mrs. Rao sees this as an enrichment task, not mandatory, but it will strengthen your Geometry skills. Your current pace suggests you can complete it by Wednesday.',
    senderName: 'SchoolGPT',
    timestamp: TIME.yesterday_200pm + 1050000,
  },
  {
    id: 'msg-system-001',
    type: 'system',
    content: 'Study reminder: Math revision recommended for 30 minutes today',
    senderName: 'System',
    timestamp: TIME.this_morning_830am,
  },
  {
    id: 'msg-009',
    type: 'user',
    content: 'I started Challenge Set 7 this morning. Got 3/10 on the first attempt.',
    senderName: 'You',
    timestamp: TIME.this_morning_900am,
    status: 'read',
  },
  {
    id: 'msg-010',
    type: 'ai',
    content: '👏 **Great start!** 3/10 on first attempt shows you\'re engaging with the material. Geometry proofs take practice. Focus on understanding **why** each step works, not just memorizing. Retry after reviewing the proof structure video. You\'ll improve quickly.',
    senderName: 'SchoolGPT',
    timestamp: TIME.this_morning_900am + 180000,
  },
];

export const STUDENT_SCHOOLGPT_HEADER = {
  title: 'SchoolGPT',
  subtitle: 'Your Personal AI School Guide',
  tertiary: 'Class 8A · Mathematics Focus',
  quaternary: 'Available 24/7 · Last active: now',
};

// ─── TEMPLATE 5: Admin ↔ Teacher — Class Coordination ──────────────────

export const ADMIN_TEACHER_COORDINATION_CONVERSATION: ConversationMessage[] = [
  // Yesterday
  {
    id: 'msg-001',
    type: 'user',
    content: 'Hi Mrs. Rao, we need to coordinate the PTM schedule for your class. Can you share your availability for next week?',
    senderName: 'Admin',
    timestamp: TIME.yesterday_800am,
    status: 'read',
  },
  {
    id: 'msg-002',
    type: 'other',
    content: 'I can do Tuesday and Wednesday from 2:00 PM to 5:00 PM. I have about 15–20 minutes per parent, so can accommodate 8–10 meetings per day.',
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.yesterday_800am + 900000,
    status: 'read',
  },
  {
    id: 'msg-system-001',
    type: 'system',
    content: 'Teacher PTM availability recorded: Tue 2–5 PM, Wed 2–5 PM',
    senderName: 'System',
    timestamp: TIME.yesterday_800am + 1200000,
  },
  {
    id: 'msg-003',
    type: 'user',
    content: "Perfect! I've opened your slots for parent booking. Parents can self-schedule starting tomorrow. Will you need any support materials prepared?",
    senderName: 'Admin',
    timestamp: TIME.yesterday_800am + 1800000,
    status: 'read',
  },
  {
    id: 'msg-004',
    type: 'other',
    content: "Yes, please prepare individual student progress reports. I'll need them by Monday so I can review before the meetings.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: TIME.yesterday_800am + 2100000,
    status: 'read',
  },
  {
    id: 'msg-005',
    type: 'user',
    content: 'Done! All reports will be ready by Monday 9 AM. The parents in your class are very engaged this year — 95% of slots already booked!',
    senderName: 'Admin',
    timestamp: TIME.this_morning_830am,
    status: 'read',
  },
  {
    id: 'msg-system-002',
    type: 'system',
    content: '19 out of 20 parents have scheduled PTM appointments with Mrs. Rao',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 300000,
  },
];

export const ADMIN_TEACHER_COORDINATION_HEADER = {
  title: 'Mrs. Kavita Rao',
  subtitle: 'Class Teacher',
  tertiary: 'Class 8A (20 students)',
  quaternary: 'Usually replies within 2 hours',
};

// ─── TEMPLATE 6: Bus Journey — Driver ↔ System ────────────────────────

export const DRIVER_BUS_JOURNEY_CONVERSATION: ConversationMessage[] = [
  // This morning - Route start
  {
    id: 'msg-system-001',
    type: 'system',
    content: '🚌 Route BUS-001 started. Morning trip initiated. 14 students expected.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am,
  },
  {
    id: 'msg-system-002',
    type: 'system',
    content: 'Stop 1 of 4: Sector 12 Market. Arrived 8:32 AM. All 4 students boarded.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 120000,
  },
  {
    id: 'msg-system-003',
    type: 'system',
    content: 'Stop 2 of 4: Rajouri Garden. Arrived 8:42 AM. 3 of 3 students boarded.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 720000,
  },
  {
    id: 'msg-system-004',
    type: 'system',
    content: '⚠️ Alert: Student Rohan Verma did not appear at Stop 2. Parent notified. Alternative arrangements requested.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 900000,
  },
  {
    id: 'msg-system-005',
    type: 'system',
    content: 'Stop 3 of 4: Paschim Vihar. Arrived 8:56 AM. 4 of 4 students boarded.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 1560000,
  },
  {
    id: 'msg-system-006',
    type: 'system',
    content: 'Stop 4 of 4: Pitampura Station. Arrived 9:08 AM. 3 of 3 students boarded.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 2280000,
  },
  {
    id: 'msg-system-007',
    type: 'system',
    content: '✅ School arrival: 9:14 AM. 14 students safely delivered (1 marked as no-show). Journey complete.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 2640000,
  },
  {
    id: 'msg-system-008',
    type: 'system',
    content: '📊 Morning route summary: 14/14 delivered, 0 incidents, 1 no-show. Route completion: 100%.',
    senderName: 'System',
    timestamp: TIME.this_morning_830am + 3000000,
  },
];

export const DRIVER_BUS_JOURNEY_HEADER = {
  title: 'Bus BUS-001 Route',
  subtitle: 'Live Morning Journey',
  tertiary: 'Driver: Rajesh Kumar',
  quaternary: 'Route active · 14 students on board',
};

// ─── EXPORT: All Templates ────────────────────────────────────────────────

export const CONVERSATION_TEMPLATES = {
  TEACHER_PARENT_WELLNESS: {
    messages: TEACHER_PARENT_WELLNESS_CONVERSATION,
    header: TEACHER_PARENT_WELLNESS_HEADER,
    description: 'Parent reports wellness concern, teacher responds with support',
  },
  TEACHER_PARENT_ACADEMICS: {
    messages: TEACHER_PARENT_ACADEMICS_CONVERSATION,
    header: TEACHER_PARENT_ACADEMICS_HEADER,
    description: 'Academic progress update, teacher recommends advanced work',
  },
  PARENT_PARENT: {
    messages: PARENT_PARENT_COORDINATION_CONVERSATION,
    header: PARENT_PARENT_COORDINATION_HEADER,
    description: 'Co-parents coordinating PTM attendance and strategy',
  },
  STUDENT_SCHOOLGPT: {
    messages: STUDENT_SCHOOLGPT_LEARNING_CONVERSATION,
    header: STUDENT_SCHOOLGPT_HEADER,
    description: 'Student receives study plan, AI tracks progress',
  },
  ADMIN_TEACHER: {
    messages: ADMIN_TEACHER_COORDINATION_CONVERSATION,
    header: ADMIN_TEACHER_COORDINATION_HEADER,
    description: 'Admin and teacher coordinate PTM scheduling',
  },
  DRIVER_JOURNEY: {
    messages: DRIVER_BUS_JOURNEY_CONVERSATION,
    header: DRIVER_BUS_JOURNEY_HEADER,
    description: 'Bus route journey with real-time stop tracking',
  },
};
