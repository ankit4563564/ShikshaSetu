/**
 * Unified Conversation Component Integration Guide
 * 
 * How to use the premium Conversation component across all portals
 */

import { CONVERSATION_TOKENS, type ConversationMessage, type ConversationHeader, type QuickReply } from '@/lib/conversation/conversationTokens';

// ─── EXAMPLE 1: Teacher ↔ Parent Chat ──────────────────────────────────────

export const EXAMPLE_TEACHER_PARENT_MESSAGES: ConversationMessage[] = [
  {
    id: 'msg-001',
    type: 'other',
    content: "Hi Mrs. Sharma! I wanted to check in about Aarav's progress in Math.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: Date.now() - 7200000,
    status: 'read',
  },
  {
    id: 'msg-002',
    type: 'user',
    content: 'Hi Mrs. Rao! Yes, we received the unit test results. He scored 91% — great improvement from last month.',
    senderName: 'Ananya Sharma',
    timestamp: Date.now() - 6900000,
    status: 'read',
  },
  {
    id: 'msg-003',
    type: 'other',
    content: 'Exactly! His problem-solving has really matured. He was one of the first to complete Chapter 6 correctly.',
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: Date.now() - 6600000,
    status: 'read',
  },
  {
    id: 'msg-004',
    type: 'system',
    content: 'Mrs. Rao attached: Aarav_Math_Progress_Report_Jul2026.pdf',
    senderName: 'System',
    timestamp: Date.now() - 6300000,
  },
  {
    id: 'msg-005',
    type: 'other',
    content: "I'd like to see him attempt Challenge Set 7 next. It's at an advanced level, but I think he's ready.",
    senderName: 'Mrs. Kavita Rao',
    senderRole: 'Class Teacher',
    timestamp: Date.now() - 6000000,
    status: 'read',
  },
  {
    id: 'msg-006',
    type: 'user',
    content: "Sounds great! We'll encourage him to try it this weekend. Should we set a deadline?",
    senderName: 'Ananya Sharma',
    timestamp: Date.now() - 5700000,
    status: 'delivered',
  },
];

export const EXAMPLE_TEACHER_PARENT_HEADER: ConversationHeader = {
  title: 'Mrs. Kavita Rao',
  subtitle: 'Class Teacher',
  tertiary: 'Mathematics & Science',
  quaternary: 'Usually replies within 2 hours',
  avatar: null,
  status: 'online',
};

export const EXAMPLE_TEACHER_PARENT_QUICK_REPLIES: QuickReply[] = [
  {
    id: 'qr-001',
    label: 'Schedule PTM',
    emoji: '📅',
    action: () => console.log('Schedule PTM'),
  },
  {
    id: 'qr-002',
    label: 'Request report',
    emoji: '📋',
    action: () => console.log('Request report'),
  },
  {
    id: 'qr-003',
    label: 'Share concern',
    emoji: '💭',
    action: () => console.log('Share concern'),
  },
];

// ─── EXAMPLE 2: SchoolGPT Chat ──────────────────────────────────────────────

export const EXAMPLE_SCHOOLGPT_MESSAGES: ConversationMessage[] = [
  {
    id: 'gpt-001',
    type: 'user',
    content: 'What is my attendance this month?',
    senderName: 'You',
    timestamp: Date.now() - 3600000,
    status: 'read',
  },
  {
    id: 'gpt-002',
    type: 'ai',
    content: "You've attended 66 out of 68 school days this month — that's a 97% attendance rate. You missed 1 day (Jul 3) and were late once (Jul 9). Keep it up — you're on a 14-day perfect streak right now! 🔥",
    senderName: 'SchoolGPT',
    timestamp: Date.now() - 3570000,
    status: 'read',
  },
  {
    id: 'gpt-003',
    type: 'user',
    content: 'When is the Maths unit test?',
    senderName: 'You',
    timestamp: Date.now() - 3300000,
    status: 'read',
  },
  {
    id: 'gpt-004',
    type: 'ai',
    content: 'Your Mathematics Unit Test is on Monday, 28 July at 9:00 AM. The syllabus covers Chapters 5–7 (Algebra & Geometry). You have 6 days to prepare. Want me to suggest a study plan?',
    senderName: 'SchoolGPT',
    timestamp: Date.now() - 3270000,
    status: 'read',
  },
  {
    id: 'gpt-005',
    type: 'user',
    content: 'Yes please!',
    senderName: 'You',
    timestamp: Date.now() - 3000000,
    status: 'read',
  },
  {
    id: 'gpt-006',
    type: 'ai',
    content: "Here's a 6-day plan for Maths:\n\n• Day 1–2: Revise Ch.5 (Linear Equations) — do 10 practice problems each day.\n• Day 3–4: Ch.6 (Algebraic Expressions) — you already scored 91% here, just a quick review.\n• Day 5: Ch.7 (Geometry basics) — focus on theorem proofs.\n• Day 6: Full mock test from last year's paper.\n\nGood luck! 📐",
    senderName: 'SchoolGPT',
    timestamp: Date.now() - 2970000,
    status: 'read',
  },
];

export const EXAMPLE_SCHOOLGPT_HEADER: ConversationHeader = {
  title: 'SchoolGPT',
  subtitle: 'AI Assistant',
  tertiary: 'Your personal school guide',
  avatar: null,
  status: 'online',
};

// ─── INTEGRATION PATTERNS ──────────────────────────────────────────────────

/**
 * Pattern: How to replace TeacherChat component
 * 
 * BEFORE:
 *   <TeacherChat studentId={id} />
 * 
 * AFTER:
 *   <Conversation
 *     header={teacherChatHeader}
 *     messages={teacherChatMessages}
 *     quickReplies={teacherQuickReplies}
 *     composerState={composerState}
 *     onComposerChange={setComposerText}
 *     onComposerSubmit={handleSendMessage}
 *     onQuickReply={handleQuickReply}
 *     isTyping={isTeacherTyping}
 *   />
 * 
 * Benefits:
 * - Consistent styling across all chat interfaces
 * - Shared animation language
 * - Unified composer behavior
 * - Same message bubble design
 * - Same timestamp formatting
 * - Auto-scroll handling
 * - Typing indicators
 * - Quick reply suggestions
 */

/**
 * Pattern: How to replace ParentChat component
 * 
 * Use the exact same Conversation component
 * Only change the data (header, messages, quickReplies)
 */

/**
 * Pattern: How to replace SchoolGPT chat
 * 
 * Use the exact same Conversation component
 * Set type='ai' for SchoolGPT responses
 * Set type='user' for student questions
 * Handle streaming responses with isTyping={true}
 */

/**
 * Pattern: How to use in Admin or Vendor chats
 * 
 * If admin sends a system-wide message:
 *   type: 'system'
 *   content: 'New policy: Afternoon buses leave at 3:30 PM'
 * 
 * If vendor responds:
 *   type: 'other'
 *   senderName: 'Canteen Manager'
 *   content: 'Acknowledged. Adjusted closing time accordingly.'
 */

// ─── COMPONENTS TO RETIRE ──────────────────────────────────────────────────

/**
 * These separate chat components should be removed once Conversation is integrated:
 * 
 * ❌ components/teacher/TeacherChat.tsx
 * ❌ components/parent/ParentChat.tsx (if exists)
 * ❌ components/schoolgpt/SchoolGPTChat.tsx (replace with Conversation)
 * ❌ Any other custom chat UI
 * 
 * ✅ Replace all with: <Conversation {...props} />
 */

// ─── CONFIGURATION BY PORTAL ────────────────────────────────────────────────

export const PORTAL_CONVERSATION_CONFIG = {
  teacher: {
    placeholder: 'Reply to Mrs. Rao...',
    showQuickReplies: true,
    maxMessageLength: 1000,
    supportAttachments: true,
  },
  parent: {
    placeholder: 'Message to teacher...',
    showQuickReplies: true,
    maxMessageLength: 1000,
    supportAttachments: true,
  },
  student: {
    placeholder: 'Ask SchoolGPT...',
    showQuickReplies: true,
    maxMessageLength: 500,
    supportAttachments: false,
  },
  admin: {
    placeholder: 'Type announcement...',
    showQuickReplies: false,
    maxMessageLength: 2000,
    supportAttachments: false,
  },
  vendor: {
    placeholder: 'Reply to school...',
    showQuickReplies: false,
    maxMessageLength: 1000,
    supportAttachments: false,
  },
  driver: {
    placeholder: 'Update drivers...',
    showQuickReplies: false,
    maxMessageLength: 500,
    supportAttachments: false,
  },
};

// ─── DESIGN SYSTEM CHECKLIST ────────────────────────────────────────────────

/**
 * ✅ Unified message bubbles
 * ✅ Consistent spacing (CONVERSATION_TOKENS)
 * ✅ Premium typography hierarchy
 * ✅ Date separators with visual hierarchy
 * ✅ Grouped consecutive messages (no repeated avatars)
 * ✅ Elegant composer with focus state
 * ✅ Quick reply chips with hover state
 * ✅ Typing indicator animation
 * ✅ Auto-scroll to latest message
 * ✅ Message status indicators (sent/delivered/read)
 * ✅ Soft shadows and minimal borders
 * ✅ Smooth animations (300ms message enter, 200ms scroll)
 * ✅ Responsive on mobile/tablet/desktop
 * ✅ Header with role and status info
 * ✅ Empty state messaging
 * ✅ Loading state
 * ✅ Accessibility (keyboard navigation, ARIA labels)
 */
