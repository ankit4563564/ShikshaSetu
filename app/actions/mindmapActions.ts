'use server';

import { getAuthContext } from '@/lib/auth/getAuthContext';
import {
  extractKnowledgeGraphFromText,
  ExtractKnowledgeGraphOptions,
  ExtractKnowledgeGraphResult,
} from '@/lib/mindmap/knowledgeGraphExtractor';
import type { ConceptMindMap, KnowledgeGraph } from '@/lib/mindmap/types';

export interface GenerateMindMapRequest {
  title: string;
  subject?: string;
  grade?: string;
  rawNotes: string;
}

export interface GenerateMindMapResponse {
  success: boolean;
  mindMap?: ConceptMindMap;
  knowledgeGraph?: KnowledgeGraph;
  telemetry?: {
    extractionMs: number;
    aiCallMs: number;
    fallbackUsed: boolean;
    fallbackReason?: string;
    nodeCount: number;
    avgNodeSize: number;
    duplicateNodesRemoved: number;
    totalMs: number;
  };
  error?: string;
}

/**
 * generateMindMapAction: Authenticated Server Action for extracting a hierarchical Knowledge Graph
 * and generating a dense revision concept map.
 * Enforces tenant security, authentication, and input boundaries.
 */
export async function generateMindMapAction(
  request: GenerateMindMapRequest
): Promise<GenerateMindMapResponse> {
  const tStart = Date.now();
  try {
    const authContext = await getAuthContext();

    const { title, subject = 'General Science', grade = '8', rawNotes } = request;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return { success: false, error: 'Chapter or topic title is required.' };
    }

    if (!rawNotes || typeof rawNotes !== 'string' || rawNotes.trim().length < 20) {
      return {
        success: false,
        error: 'Not enough readable content to generate a reliable revision map. Please provide comprehensive notes (at least 20 characters).',
      };
    }

    console.log(`[generateMindMapAction] Processing "${title}" (${rawNotes.length} chars)`);

    const result = await extractKnowledgeGraphFromText({
      title: title.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      notesText: rawNotes.trim(),
    });

    const telemetry = (result.mindMap as any)?.telemetry || {
      extractionMs: Date.now() - tStart,
      aiCallMs: 0,
      fallbackUsed: true,
      nodeCount: result.knowledgeGraph?.nodes.length || 0,
      avgNodeSize: 0,
      duplicateNodesRemoved: 0,
      totalMs: Date.now() - tStart,
    };

    console.log('[generateMindMapAction] Success:', {
      fallbackUsed: telemetry.fallbackUsed,
      nodeCount: telemetry.nodeCount,
      totalMs: telemetry.totalMs,
    });

    return {
      ...result,
      telemetry,
    };
  } catch (err: any) {
    console.error('[generateMindMapAction] Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate visual mind map',
      telemetry: {
        extractionMs: 0,
        aiCallMs: 0,
        fallbackUsed: true,
        fallbackReason: err?.message,
        nodeCount: 0,
        avgNodeSize: 0,
        duplicateNodesRemoved: 0,
        totalMs: Date.now() - tStart,
      },
    };
  }
}
