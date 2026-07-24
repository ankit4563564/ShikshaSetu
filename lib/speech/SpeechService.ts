'use client';

export const SPEECH_LANGUAGES = {
  en: { label: 'English', recognitionLocale: 'en-IN' },
  hi: { label: 'Hindi', recognitionLocale: 'hi-IN' },
  ta: { label: 'Tamil', recognitionLocale: 'ta-IN' },
  te: { label: 'Telugu', recognitionLocale: 'te-IN' },
  kn: { label: 'Kannada', recognitionLocale: 'kn-IN' },
  ml: { label: 'Malayalam', recognitionLocale: 'ml-IN' },
  mr: { label: 'Marathi', recognitionLocale: 'mr-IN' },
  gu: { label: 'Gujarati', recognitionLocale: 'gu-IN' },
  bn: { label: 'Bengali', recognitionLocale: 'bn-IN' },
  pa: { label: 'Punjabi', recognitionLocale: 'pa-IN' },
} as const;

export type SupportedSpeechLanguage = keyof typeof SPEECH_LANGUAGES;

export function getBrowserLocale(siteLanguage?: string): SupportedSpeechLanguage {
  if (siteLanguage && siteLanguage in SPEECH_LANGUAGES) {
    return siteLanguage as SupportedSpeechLanguage;
  }
  if (typeof navigator === 'undefined') return 'en';
  const browserLang = (navigator.language || 'en-IN').split('-')[0].toLowerCase();
  if (browserLang in SPEECH_LANGUAGES) {
    return browserLang as SupportedSpeechLanguage;
  }
  return 'en';
}

type RecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => RecognitionInstance;

export type SpeechErrorCode = 'unsupported' | 'permission_denied' | 'empty_speech' | 'timeout' | 'network' | 'unavailable';

export interface SpeechCallbacks {
  onInterim: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError: (error: { code: SpeechErrorCode; message: string }) => void;
  onEnd: () => void;
}

export interface SpeechProvider {
  isSupported(): boolean;
  start(language: SupportedSpeechLanguage, callbacks: SpeechCallbacks): void;
  stop(): void;
  dispose(): void;
}

function browserError(error: string): { code: SpeechErrorCode; message: string } {
  if (error === 'not-allowed' || error === 'service-not-allowed') {
    return { code: 'permission_denied', message: 'Microphone permission was denied. Allow microphone access and try again.' };
  }
  if (error === 'no-speech') {
    return { code: 'empty_speech', message: 'No speech was detected. Please try again or type your note.' };
  }
  if (error === 'network') {
    return { code: 'network', message: 'Speech recognition needs a network connection. Check your connection and try again.' };
  }
  return { code: 'unavailable', message: 'Speech recognition could not start. Please try again or type your note.' };
}

/** Browser provider. A future provider (including Bhashini) only needs this interface. */
export class BrowserSpeechProvider implements SpeechProvider {
  private recognition: RecognitionInstance | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private hasFinalResult = false;

  isSupported() {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  start(language: SupportedSpeechLanguage, callbacks: SpeechCallbacks) {
    if (!this.isSupported()) {
      callbacks.onError({ code: 'unsupported', message: 'Speech recognition is not supported in this browser. You can type your note instead.' });
      return;
    }

    this.dispose();
    const Recognition = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) as RecognitionConstructor;
    const recognition = new Recognition();
    this.recognition = recognition;
    this.hasFinalResult = false;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANGUAGES[language].recognitionLocale;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const value = event.results[i][0]?.transcript?.trim() || '';
        if (event.results[i].isFinal) final += `${value} `;
        else interim += `${value} `;
      }
      if (interim) callbacks.onInterim(interim.trim());
      if (final) {
        this.hasFinalResult = true;
        callbacks.onFinal(final.trim());
      }
    };
    recognition.onerror = (event) => callbacks.onError(browserError(event.error));
    recognition.onend = () => {
      this.clearTimeout();
      callbacks.onEnd();
    };

    try {
      recognition.start();
      this.timeout = setTimeout(() => {
        if (!this.hasFinalResult) callbacks.onError({ code: 'timeout', message: 'Recording timed out. Please try again or type your note.' });
        recognition.stop();
      }, 30_000);
    } catch {
      callbacks.onError({ code: 'unavailable', message: 'Speech recognition is already active or unavailable. Please try again.' });
    }
  }

  stop() {
    this.recognition?.stop();
  }

  dispose() {
    this.clearTimeout();
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition.abort();
      this.recognition = null;
    }
  }

  private clearTimeout() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
  }
}

export class SpeechService {
  constructor(private readonly provider: SpeechProvider = new BrowserSpeechProvider()) {}
  isSupported() { return this.provider.isSupported(); }
  start(language: SupportedSpeechLanguage, callbacks: SpeechCallbacks) { this.provider.start(language, callbacks); }
  stop() { this.provider.stop(); }
  dispose() { this.provider.dispose(); }
}
