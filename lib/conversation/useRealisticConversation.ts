/**
 * Conversation Realism Hook
 * 
 * Automatically populates conversations with realistic history.
 * Use in any portal to make conversations feel alive from first load.
 */

'use client';

import { useState, useEffect } from 'react';
import type { ConversationMessage } from '@/lib/conversation/conversationTokens';
import { CONVERSATION_TEMPLATES } from '@/lib/conversation/realisticTemplates';

type TemplateKey = keyof typeof CONVERSATION_TEMPLATES;

interface UseRealisticConversationOptions {
  templateKey: TemplateKey;
  autoLoad?: boolean;
  delayMs?: number;
}

/**
 * Hook: Automatically load realistic conversation history
 * 
 * Usage:
 * ```tsx
 * const { messages, header, isLoading } = useRealisticConversation({
 *   templateKey: 'TEACHER_PARENT_ACADEMICS',
 *   autoLoad: true,
 *   delayMs: 300,
 * });
 * 
 * return <Conversation messages={messages} header={header} isLoading={isLoading} />;
 * ```
 */
export function useRealisticConversation(options: UseRealisticConversationOptions) {
  const { templateKey, autoLoad = true, delayMs = 300 } = options;
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [header, setHeader] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(autoLoad);

  useEffect(() => {
    if (!autoLoad) return;

    // Simulate loading delay for realism
    const timer = setTimeout(() => {
      const template = CONVERSATION_TEMPLATES[templateKey];
      if (template) {
        setMessages(template.messages);
        setHeader(template.header);
      }
      setIsLoading(false);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [templateKey, autoLoad, delayMs]);

  return {
    messages,
    header,
    isLoading,
    setMessages,
    setHeader,
  };
}

/**
 * Utility: Get a template by key
 */
export function getConversationTemplate(key: TemplateKey) {
  return CONVERSATION_TEMPLATES[key];
}

/**
 * Utility: Get all available templates
 */
export function getAllConversationTemplates() {
  return CONVERSATION_TEMPLATES;
}

/**
 * Utility: Add new message to existing conversation
 * Simulates realistic delivery/read states
 */
export function addMessageRealistic(
  messages: ConversationMessage[],
  newMessage: Omit<ConversationMessage, 'id' | 'timestamp' | 'status'>,
  options?: {
    delay?: number;
    setStatus?: boolean;
  }
): Promise<ConversationMessage[]> {
  return new Promise(resolve => {
    const { delay = 500, setStatus = true } = options || {};

    setTimeout(() => {
      const message: ConversationMessage = {
        ...newMessage,
        id: `msg-${Date.now()}`,
        timestamp: Date.now(),
        status: setStatus ? 'sent' : undefined,
      };

      resolve([...messages, message]);
    }, delay);
  });
}

/**
 * Utility: Format conversation for cross-portal reference
 * Ensures the same event is referenced consistently across portals
 */
export function createCrossPortalReference(
  eventType: 'wellness_concern' | 'academic_milestone' | 'attendance_event' | 'homework_update' | 'ptm_reminder' | 'bus_notification',
  data: Record<string, any>
): ConversationMessage {
  const NOW = Date.now();

  const references: Record<string, ConversationMessage> = {
    wellness_concern: {
      id: `ref-wellness-${data.studentId || 'unknown'}`,
      type: 'system',
      content: `⚠️ Morning wellbeing concern recorded for ${data.studentName || 'student'}. Teacher notified.`,
      senderName: 'System',
      timestamp: NOW,
    },
    academic_milestone: {
      id: `ref-academic-${data.studentId || 'unknown'}`,
      type: 'system',
      content: `🏆 ${data.studentName || 'Student'} achieved ${data.score || 'excellent'} on ${data.subject || 'test'}. Progress recorded.`,
      senderName: 'System',
      timestamp: NOW,
    },
    attendance_event: {
      id: `ref-attendance-${data.studentId || 'unknown'}`,
      type: 'system',
      content: `✅ Attendance marked at ${new Date(NOW).toLocaleTimeString()}. ${data.studentName || 'Student'} verified.`,
      senderName: 'System',
      timestamp: NOW,
    },
    homework_update: {
      id: `ref-homework-${data.assignmentId || 'unknown'}`,
      type: 'system',
      content: `📝 Assignment "${data.assignmentName || 'homework'}" submitted successfully by ${data.studentName || 'student'}.`,
      senderName: 'System',
      timestamp: NOW,
    },
    ptm_reminder: {
      id: `ref-ptm-${data.teacherId || 'unknown'}`,
      type: 'system',
      content: `📅 Parent-Teacher Meeting reminder: ${data.teacherName || 'Teacher'} on ${data.date || 'scheduled date'} at ${data.time || 'scheduled time'}.`,
      senderName: 'System',
      timestamp: NOW,
    },
    bus_notification: {
      id: `ref-bus-${data.studentId || 'unknown'}`,
      type: 'system',
      content: `🚌 ${data.studentName || 'Student'} ${data.action || 'boarded'} at ${data.stop || 'bus stop'} at ${new Date(NOW).toLocaleTimeString()}.`,
      senderName: 'System',
      timestamp: NOW,
    },
  };

  return references[eventType] || references.attendance_event;
}

/**
 * Example: How to use in a component
 * 
 * export default function TeacherParentChat() {
 *   const { messages, header, isLoading } = useRealisticConversation({
 *     templateKey: 'TEACHER_PARENT_ACADEMICS',
 *     autoLoad: true,
 *   });
 * 
 *   const [composerText, setComposerText] = useState('');
 * 
 *   const handleSend = async (text: string) => {
 *     const updatedMessages = await addMessageRealistic(
 *       messages,
 *       {
 *         type: 'user',
 *         content: text,
 *         senderName: 'You',
 *       },
 *       { delay: 300, setStatus: true }
 *     );
 *     setMessages(updatedMessages);
 *     setComposerText('');
 *   };
 * 
 *   return (
 *     <Conversation
 *       header={header}
 *       messages={messages}
 *       composerState={{
 *         text: composerText,
 *         isDisabled: false,
 *         isSending: false,
 *         placeholder: 'Reply...',
 *       }}
 *       onComposerChange={setComposerText}
 *       onComposerSubmit={handleSend}
 *       isLoading={isLoading}
 *     />
 *   );
 * }
 */

/**
 * Cross-Portal Consistency Map
 * 
 * When the same event happens, reference it consistently across portals:
 * 
 * Event: "Aarav had a rough morning"
 * 
 * Parent Portal:
 *   → Parent chat with teacher: "He had a rough morning."
 *   → Admin dashboard: Parent communication metric increased
 * 
 * Teacher Portal:
 *   → Teacher chat with parent: Sees parent's "He had a rough morning."
 *   → AI insight: "Morning wellness concern recorded"
 * 
 * Student Portal:
 *   → Morning wellness check-in reflected
 *   → SchoolGPT references: "I noticed you had a challenging morning..."
 * 
 * Admin Dashboard:
 *   → Activity feed: "Parent reported wellness concern for Aarav"
 *   → Parent engagement metric: +1
 *   → Teacher notification: Priority inbox
 */

export const CROSS_PORTAL_CONSISTENCY = {
  WELLNESS_CONCERN: {
    parentPortal: 'Parent can report "rough morning" in chat',
    teacherPortal: 'Teacher receives parent message and can respond',
    studentPortal: 'Wellness check-in reflects the concern',
    adminDashboard: 'Activity feed shows "Parent wellness report"',
    schoolgpt: 'AI contextualizes: "I noticed a challenging morning..."',
  },
  ACADEMIC_MILESTONE: {
    parentPortal: 'Parent sees test score notification in chat',
    teacherPortal: 'Teacher discusses results and next steps',
    studentPortal: 'Achievement recorded, study plan generated',
    adminDashboard: 'Academic milestone added to student profile',
    schoolgpt: 'AI references score in study recommendations',
  },
  HOMEWORK_UPDATE: {
    parentPortal: 'Parent receives homework submission notification',
    teacherPortal: 'Teacher sees submission in grading queue',
    studentPortal: 'Submission confirmation shown',
    adminDashboard: 'Homework completion rate metric updated',
    schoolgpt: 'AI tracks assignment completion for streak',
  },
  BUS_NOTIFICATION: {
    parentPortal: 'Parent sees "Bus departed" notification',
    teacherPortal: 'Teacher can see attendance confirmation',
    studentPortal: 'Student sees boarding confirmation',
    adminDashboard: 'Route tracking updated in real-time',
    driverPortal: 'Driver confirms boarding/deboarding',
  },
};
