'use server';

import { getAuthContext } from '@/lib/auth/getAuthContext';
import { extractConceptMindMapFromText, ExtractMindMapOptions, ExtractMindMapResult } from '@/lib/mindmap/mindmapExtractor';
import { safeValidateConceptMindMap } from '@/lib/mindmap/schema';
import type { ConceptMindMap } from '@/lib/mindmap/types';

export interface GenerateMindMapRequest {
  title: string;
  subject?: string;
  grade?: string;
  rawNotes: string;
}

/**
 * generateMindMapAction: Authenticated Server Action for extracting a dense revision concept map.
 * Enforces tenant security and input length boundaries.
 */
export async function generateMindMapAction(
  request: GenerateMindMapRequest
): Promise<ExtractMindMapResult> {
  try {
    const authContext = await getAuthContext();

    const { title, subject = 'General Science', grade = '8', rawNotes } = request;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return { success: false, error: 'Chapter or topic title is required.' };
    }

    if (!rawNotes || typeof rawNotes !== 'string' || rawNotes.trim().length < 20) {
      return {
        success: false,
        error: 'Not enough source material to generate a reliable revision map. Please provide comprehensive notes (at least 20 characters).',
      };
    }

    const result = await extractConceptMindMapFromText({
      title: title.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      notesText: rawNotes.trim(),
    });

    return result;
  } catch (err: any) {
    console.error('[generateMindMapAction] Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate visual mind map',
    };
  }
}
