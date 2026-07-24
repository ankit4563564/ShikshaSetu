/**
 * AI Narration domain types.
 *
 * Defines the shape of narration results and audience configuration
 * for the plain-language summary generator.
 */

export type NarrationAudience = 'parent' | 'teacher';

export type NarrationRequest = {
  studentId: string;
  audience: NarrationAudience;
};

export type NarrationResponse = {
  studentId: string;
  audience: NarrationAudience;
  summary: string;
  generatedAt: string; // ISO 8601
};
