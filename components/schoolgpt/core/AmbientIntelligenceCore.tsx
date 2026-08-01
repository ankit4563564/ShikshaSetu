'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { askSchoolGPTAction } from '@/app/actions/schoolgptActions';
import { useContextRegistry } from '../context/ContextRegistry';
import { parseToAIResponse, type AIResponse, type SurfacePreference, type AIActionItem } from './AIResponseContract';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  aiResponse?: AIResponse;
}

interface AmbientAICoreValue {
  conversation: ChatMessage[];
  lastAIResponse: AIResponse | null;
  isLoading: boolean;
  activeSurface: SurfacePreference;
  activeActionModalPayload: AIActionItem | null;
  ask: (question: string) => Promise<void>;
  executeAction: (action: AIActionItem) => void;
  closeActionModal: () => void;
  setSurface: (surface: SurfacePreference) => void;
  resetConversation: () => void;
}

const AmbientAICoreContext = createContext<AmbientAICoreValue | undefined>(undefined);

export function AmbientIntelligenceCoreProvider({ children }: { children: React.ReactNode }) {
  const { context } = useContextRegistry();
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [lastAIResponse, setLastAIResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSurface, setActiveSurface] = useState<SurfacePreference>('inline');
  const [activeActionModalPayload, setActiveActionModalPayload] = useState<AIActionItem | null>(null);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || isLoading) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        content: q,
        timestamp: Date.now(),
      };

      setConversation((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Handle Landing Page & Demo Mode responses directly without requiring auth
      if (context.role === 'landing') {
        setTimeout(() => {
          let textResponse = '';
          const lowerQ = q.toLowerCase();

          if (lowerQ.includes('what can schoolgpt do') || lowerQ.includes('can schoolgpt do')) {
            textResponse = `✨ **SchoolGPT** is the universal ambient intelligence layer for the connected school ecosystem.\n\nIt connects gate entry security, live bus telemetry, classroom attendance, academic progress, and automated parent updates into one unified real-time system.`;
          } else if (lowerQ.includes('connected school day')) {
            textResponse = `🏫 **A Connected School Day in Action**:\n\n• **08:14 AM**: Child scans RFID pass at campus gate. Attendance is instantly logged and parent receives immediate notification.\n• **08:30 AM**: Automatic roll call frees up 15 minutes of teacher classroom time.\n• **02:15 PM**: Live bus GPS transmits ETA and pickup notifications to parents.\n• **04:00 PM**: AI generates student homework digests and progress updates.`;
          } else if (lowerQ.includes('bus tracking') || lowerQ.includes('where is the bus')) {
            textResponse = `🚌 **Live Transit Telemetry**:\n\nSchoolGPT receives real-time GPS telemetry from school buses every 4 seconds. Parents receive automated geofenced alerts when the bus is 1 km away, while school administrators monitor driver speeds, route schedules, and student safety status.`;
          } else if (lowerQ.includes('teachers save time') || lowerQ.includes('save time')) {
            textResponse = `⏱️ **Saving Teachers 1+ Hours Daily**:\n\n• Automated gate-synced attendance registers (saves 15 mins/class).\n• 1-Click PTM summary generator from continuous student telemetry.\n• Instant AI quiz, assignment, and rubric creation.`;
          } else if (lowerQ.includes('whatsapp')) {
            textResponse = `💬 **Structured Security vs. WhatsApp Clutter**:\n\nUnlike noisy WhatsApp groups where urgent notices get lost, SchoolGPT provides verified, encrypted role-based routing. Parents receive official arrival signals, homework checklists, and bus tracking without noise.`;
          } else if (lowerQ.includes('ai help') || lowerQ.includes('use ai')) {
            textResponse = `🧠 **Privacy-First Ambient Intelligence**:\n\nSchoolGPT uses role-scoped LLMs and deterministic rule engines. It monitors engagement trends, predicts attendance drops, and highlights students needing academic support—without compromising student privacy.`;
          } else if (lowerQ.includes('attention') || lowerQ.includes('students need attention')) {
            textResponse = `🎯 **Class 8A Attention Radar** (Demo):\n\n2 students need support today:\n1. **Aarav Sharma**: Missing Science assignment.\n2. **Priya Singh**: Slight attendance drop on Mondays.\n\n*Action*: Send 1-click update to parents.`;
          } else if (lowerQ.includes('ptm summary') || lowerQ.includes('ptm')) {
            textResponse = `✉️ **Class 8A PTM Summary** (Demo):\n\n• Attendance Rate: **96.4%**\n• Top Subject: Mathematics (Algebra)\n• Focus Area: Physics Chapter 3 diagrams\n• 31/32 parents confirmed for Friday PTM.`;
          } else if (lowerQ.includes('aarav') || lowerQ.includes('reached school')) {
            textResponse = `🛡️ **Arrival Status** (Demo):\n\nAarav Sharma scanned RFID pass at Campus Gate #2 at **08:14 AM**. Gate security photo verified.`;
          } else if (lowerQ.includes('homework')) {
            textResponse = `📚 **Homework Digest** (Demo):\n\n1. **Mathematics**: Ch 5 Algebra (Submitted)\n2. **Science**: Ch 3 Lab Diagram (Due Tomorrow)\n3. **English**: Essay Draft (Assigned)`;
          } else if (lowerQ.includes('attendance')) {
            textResponse = `📊 **Attendance Report** (Demo):\n\nClass 8A Attendance: **96.4%** present today (31/32 students present).`;
          } else if (lowerQ.includes('exam') || lowerQ.includes('exams')) {
            textResponse = `📅 **Upcoming Exams** (Demo):\n\n• **Physics Unit Test**: Thursday 10:00 AM\n• **Chemistry Lab Practical**: Next Monday 11:30 AM`;
          } else if (lowerQ.includes('chapter 5')) {
            textResponse = `💡 **Physics Chapter 5 Overview** (Demo):\n\nWork & Energy: Energy cannot be created or destroyed, only transformed. Key formula: $KE = \\frac{1}{2}mv^2$.`;
          } else if (lowerQ.includes('practice questions') || lowerQ.includes('quiz')) {
            textResponse = `🎯 **Practice Quiz** (Demo):\n\n1. What is the SI unit of work?\n2. State the law of conservation of energy.\n3. Calculate KE of a 2kg mass at 3 m/s.`;
          } else if (lowerQ.includes('transport') || lowerQ.includes('fleet')) {
            textResponse = `🚌 **Fleet Telemetry** (Demo):\n\n18/18 school buses active on route. 0 speed violations. Average delay: +1.2 mins.`;
          } else if (lowerQ.includes('workload')) {
            textResponse = `👩‍🏫 **Teacher Workload Overview** (Demo):\n\n12 faculty members active, 42 classes conducted today, 128 student submissions processed.`;
          } else if (lowerQ.includes('analytics')) {
            textResponse = `📈 **School Operational Analytics** (Demo):\n\n• Attendance Rate: **96.9%**\n• Parent Alert Delivery: **99.4%**\n• Teacher Time Saved: **15 mins/class**`;
          } else {
            textResponse = `✨ **SchoolGPT Assistant**: You are viewing the **${context.isDemoMode && context.demoRole ? context.demoRole.toUpperCase() + ' Demo' : 'Universal Product Guide'}**.\n\nSelect an experience card above or click one of the portal buttons below to enter a live authenticated workspace!`;
          }

          const structuredAI = parseToAIResponse(
            textResponse,
            'HIGH',
            ['SchoolGPT Product Engine', 'Demo Telemetry']
          );
          setLastAIResponse(structuredAI);

          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role: 'assistant',
            content: textResponse,
            timestamp: Date.now(),
            aiResponse: structuredAI,
          };

          setConversation((prev) => [...prev, assistantMsg]);
          setIsLoading(false);
        }, 400);
        return;
      }

      try {
        const history = conversation.map((m) => ({ role: m.role, content: m.content }));
        const response = await askSchoolGPTAction({
          question: q,
          history,
          role: context.role as any,
          studentId: context.studentId,
          classGrade: context.classGrade,
          classSection: context.classSection,
        });

        const structuredAI = parseToAIResponse(
          response.text,
          (response.confidence as any) || 'HIGH',
          response.sources || ['School Database', 'Academic Portal']
        );

        setLastAIResponse(structuredAI);

        // Escalation Engine: set preferred surface based on AI Response Contract
        if (structuredAI.preferredSurface && structuredAI.preferredSurface !== 'inline') {
          setActiveSurface(structuredAI.preferredSurface);
        }

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'assistant',
          content: response.text,
          timestamp: Date.now(),
          aiResponse: structuredAI,
        };

        setConversation((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error('[Ambient AI Core] Error executing query:', err);
        setConversation((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: "I'm temporarily unable to reach school records. Please try again in a moment.",
            timestamp: Date.now(),
            aiResponse: parseToAIResponse(
              "I'm temporarily unable to reach school records. Please try again in a moment.",
              'LIMITED',
              []
            ),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversation, context, isLoading]
  );

  const executeAction = useCallback((action: AIActionItem) => {
    if (action.actionType === 'pdf' || action.actionType === 'whatsapp' || action.actionType === 'copy') {
      setActiveActionModalPayload(action);
    } else if (action.actionType === 'workspace') {
      setActiveSurface('workspace');
    }
  }, []);

  const closeActionModal = useCallback(() => {
    setActiveActionModalPayload(null);
  }, []);

  const resetConversation = useCallback(() => {
    setConversation([]);
    setLastAIResponse(null);
    setActiveSurface('inline');
  }, []);

  return (
    <AmbientAICoreContext.Provider
      value={{
        conversation,
        lastAIResponse,
        isLoading,
        activeSurface,
        activeActionModalPayload,
        ask,
        executeAction,
        closeActionModal,
        setSurface: setActiveSurface,
        resetConversation,
      }}
    >
      {children}
    </AmbientAICoreContext.Provider>
  );
}

export function useAmbientAICore() {
  const ctx = useContext(AmbientAICoreContext);
  if (!ctx) {
    throw new Error('useAmbientAICore must be used within AmbientIntelligenceCoreProvider');
  }
  return ctx;
}
