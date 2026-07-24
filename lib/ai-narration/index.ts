export * from './generateExplanation';
export * from './generateParentNote';
export * from './categorizeVoiceNote';
export * from './processSpeechTranscript';
export type NarrationResult = {
  studentId: string;
  summary: string;
  generatedAt: Date;
};
