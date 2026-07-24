import type { SupportedSpeechLanguage } from '@/lib/speech/SpeechService';
import type { SchoolGPTRole } from '@/lib/schoolgpt/types';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface VoiceConfig {
  language: SupportedSpeechLanguage;
  rate: number;
  pitch: number;
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  language: 'en',
  rate: 1.0,
  pitch: 1.0,
};

export interface VoiceAssistantProps {
  role: SchoolGPTRole;
  studentId?: string;
  teacherId?: string;
  childrenIds?: string[];
  classGrade?: string;
  classSection?: string;
}
