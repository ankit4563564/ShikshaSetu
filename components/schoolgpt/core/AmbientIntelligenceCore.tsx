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

      try {
        const history = conversation.map((m) => ({ role: m.role, content: m.content }));
        const response = await askSchoolGPTAction({
          question: q,
          history,
          role: context.role,
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
            content: 'Sorry, I encountered an error looking up data. Please try again.',
            timestamp: Date.now(),
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
