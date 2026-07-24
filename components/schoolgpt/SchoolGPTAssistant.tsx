'use client';

import { useState } from 'react';
import SchoolGPTChat from './SchoolGPTChat';
import SchoolGPTVoicePanel from './SchoolGPTVoicePanel';
import type { SchoolGPTRole } from '@/lib/schoolgpt/types';

interface SchoolGPTAssistantProps {
  role: SchoolGPTRole;
  studentId?: string;
  teacherId?: string;
  childrenIds?: string[];
  classGrade?: string;
  classSection?: string;
  compact?: boolean;
}

export default function SchoolGPTAssistant(props: SchoolGPTAssistantProps) {
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between ${props.compact ? 'mb-2' : 'mb-4'}`}>
        {!props.compact && (
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deep-teal/45">AI Assistant</p>
            <h2 className="font-display text-2xl font-extrabold text-deep-teal">SchoolGPT</h2>
            <p className="mt-1 text-xs text-deep-teal/55">Your AI school assistant. Ask me anything!</p>
          </div>
        )}
        <div className={`flex items-center gap-1 rounded-xl border border-deep-teal/10 bg-white/70 p-0.5 backdrop-blur-xl ${props.compact ? 'ml-auto' : ''}`}>
          <button type="button" onClick={() => setMode('chat')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${mode === 'chat' ? 'bg-deep-teal text-white shadow-sm' : 'text-deep-teal/40 hover:text-deep-teal'}`}
          >💬 Chat</button>
          <button type="button" onClick={() => setMode('voice')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${mode === 'voice' ? 'bg-deep-teal text-white shadow-sm' : 'text-deep-teal/40 hover:text-deep-teal'}`}
          >🎤 Voice</button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {mode === 'chat' ? (
          <SchoolGPTChat
            role={props.role}
            studentId={props.studentId}
            teacherId={props.teacherId}
            childrenIds={props.childrenIds}
            classGrade={props.classGrade}
            classSection={props.classSection}
          />
        ) : (
          <SchoolGPTVoicePanel
            role={props.role}
            studentId={props.studentId}
            teacherId={props.teacherId}
            childrenIds={props.childrenIds}
            classGrade={props.classGrade}
            classSection={props.classSection}
          />
        )}
      </div>
    </div>
  );
}
