'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SpeechService, getBrowserLocale } from '@/lib/speech/SpeechService';
import { askSchoolGPTAction } from '@/app/actions/schoolgptActions';
import type { SchoolGPTMessage } from '@/lib/schoolgpt/types';
import type { SupportedSpeechLanguage } from '@/lib/speech/SpeechService';
import type { VoiceState, VoiceConfig, VoiceAssistantProps } from '@/lib/schoolgpt/voiceTypes';
import { DEFAULT_VOICE_CONFIG } from '@/lib/schoolgpt/voiceTypes';

function generateId(): string {
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface UseSchoolGPTVoiceReturn {
  state: VoiceState;
  messages: SchoolGPTMessage[];
  interim: string;
  error: string | null;
  language: SupportedSpeechLanguage;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  cancelSpeech: () => void;
  clearHistory: () => void;
  setLanguage: (lang: SupportedSpeechLanguage) => void;
  config: VoiceConfig;
  setConfig: (config: Partial<VoiceConfig>) => void;
}

export function useSchoolGPTVoice(props: VoiceAssistantProps): UseSchoolGPTVoiceReturn {
  const [state, setState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<SchoolGPTMessage[]>([
    {
      id: 'voice-welcome',
      role: 'assistant',
      content: `Hello! I'm SchoolGPT Voice. Tap the mic and ask me anything about school.`,
      timestamp: Date.now(),
    },
  ]);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<SupportedSpeechLanguage>(() => getBrowserLocale('en'));
  const [config, setConfigState] = useState<VoiceConfig>(DEFAULT_VOICE_CONFIG);

  const speechRef = useRef<SpeechService | null>(null);
  const processingRef = useRef(false);
  const pendingTranscript = useRef('');
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    speechRef.current = new SpeechService();
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      speechRef.current?.dispose();
      synthRef.current?.cancel();
    };
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    const synth = synthRef.current;
    if (!synth) {
      onDone?.();
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'en' ? 'en-IN' : `${language}-IN`;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.onend = () => {
      setState(prev => prev === 'speaking' ? 'idle' : prev);
      onDone?.();
    };
    utterance.onerror = () => {
      setState(prev => prev === 'speaking' ? 'idle' : prev);
      onDone?.();
    };
    setState('speaking');
    synth.speak(utterance);
  }, [language, config.rate, config.pitch]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setState(prev => prev === 'speaking' ? 'idle' : prev);
  }, []);

  const processQuery = useCallback(async (transcript: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    const userMsg: SchoolGPTMessage = {
      id: generateId(),
      role: 'user',
      content: transcript,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setState('processing');

    try {
      const response = await askSchoolGPTAction({
        question: transcript,
        role: props.role,
        studentId: props.studentId,
        teacherId: props.teacherId,
        childrenIds: props.childrenIds,
        classGrade: props.classGrade,
        classSection: props.classSection,
      });

      const assistantMsg: SchoolGPTMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      speak(response.text);
    } catch {
      const errMsg: SchoolGPTMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
      setState('idle');
    } finally {
      processingRef.current = false;
    }
  }, [props, speak]);

  const startListening = useCallback(() => {
    setError(null);
    const service = speechRef.current;
    if (!service?.isSupported()) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setInterim('');
    pendingTranscript.current = '';
    setState('listening');

    service.start(language, {
      onInterim: (text) => {
        setInterim(text);
      },
      onFinal: (text) => {
        if (pendingTranscript.current) {
          pendingTranscript.current += ' ' + text;
        } else {
          pendingTranscript.current = text;
        }
        setInterim('');
        setState('processing');
        processQuery(text);
      },
      onError: (err) => {
        setError(err.message);
        setState('idle');
      },
      onEnd: () => {
        setState(prev => {
          if (prev === 'listening') return 'idle';
          return prev;
        });
      },
    });
  }, [language, processQuery]);

  const stopListening = useCallback(() => {
    speechRef.current?.stop();
    setState(prev => prev === 'listening' ? 'idle' : prev);
    setInterim('');
  }, []);

  const cancelSpeech = useCallback(() => {
    stopSpeaking();
  }, [stopSpeaking]);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: 'voice-welcome',
        role: 'assistant',
        content: `History cleared. Tap the mic and ask me anything about school.`,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const setLanguage = useCallback((lang: SupportedSpeechLanguage) => {
    setLanguageState(lang);
    setConfigState(prev => ({ ...prev, language: lang }));
  }, []);

  const setConfig = useCallback((partial: Partial<VoiceConfig>) => {
    setConfigState(prev => ({ ...prev, ...partial }));
  }, []);

  return {
    state,
    messages,
    interim,
    error,
    language,
    isSupported: typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    startListening,
    stopListening,
    cancelSpeech,
    clearHistory,
    setLanguage,
    config,
    setConfig,
  };
}
