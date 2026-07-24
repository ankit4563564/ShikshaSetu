'use server';

import { classifyIntent } from '@/school-brain/intents/intentClassifier';
import { resolveContextualReferences } from '@/school-brain/memory/conversationMemory';
import { executeHybridRetrieval } from '@/school-brain/retrieval/retriever';
import { generateSchoolGPTResponse, type SchoolGPTResponse } from '@/lib/schoolgpt/generateResponse';
import type { SchoolRole, SchoolBrainContext } from '@/school-brain/models/index';
import { requireAuth } from '@/lib/auth/getUser';
import {
  retrieveAttendance,
  retrieveAttendanceTrends,
  retrieveHomework,
  retrieveTimetable,
  retrieveClubs,
  retrieveTeachers,
  retrieveStudentNeedingAttention,
  retrieveEvents,
  retrieveBus,
  retrieveExams,
  retrieveNotices,
  retrieveLibrary,
  retrieveRules,
} from '@/lib/schoolgpt/retrievers';

interface SchoolGPTRequest {
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  role: SchoolRole;
  studentId?: string;
  teacherId?: string;
  childrenIds?: string[];
  classGrade?: string;
  classSection?: string;
}

export async function askSchoolGPTAction(req: SchoolGPTRequest): Promise<SchoolGPTResponse> {
  await requireAuth();

  const history = req.history || [];
  const { resolvedQuery } = resolveContextualReferences(req.question, history);
  const classified = classifyIntent(resolvedQuery, history);

  const brainContext: SchoolBrainContext = {
    role: req.role,
    studentId: req.studentId,
    teacherId: req.teacherId,
    childrenIds: req.childrenIds,
    classGrade: req.classGrade,
    classSection: req.classSection,
  };

  // 1. Try fetching from Live DB for the detected intent (if connected)
  let liveDbResult = '';
  try {
    switch (classified.intent) {
      case 'attendance':
        if (req.role === 'student' && req.studentId) liveDbResult = await retrieveAttendance(req.studentId);
        else if (req.role === 'teacher' || req.role === 'admin') liveDbResult = await retrieveAttendanceTrends();
        break;
      case 'homework':
        if (req.studentId) liveDbResult = await retrieveHomework(req.studentId);
        break;
      case 'timetable':
        liveDbResult = await retrieveTimetable(req.classGrade || '8', req.classSection || 'A');
        break;
      case 'exams':
        liveDbResult = await retrieveExams(req.studentId, req.classGrade || '8');
        break;
      case 'who_needs_attention':
        liveDbResult = await retrieveStudentNeedingAttention(req.teacherId || 'all');
        break;
      case 'bus':
        if (req.studentId) liveDbResult = await retrieveBus(req.studentId);
        break;
      case 'events':
        liveDbResult = await retrieveEvents();
        break;
      case 'announcements':
        liveDbResult = await retrieveNotices();
        break;
      case 'library':
        liveDbResult = await retrieveLibrary();
        break;
      case 'rules':
        liveDbResult = await retrieveRules();
        break;
      case 'clubs':
        liveDbResult = await retrieveClubs(req.studentId);
        break;
      case 'faculty':
        liveDbResult = await retrieveTeachers(req.classGrade);
        break;
    }
  } catch (e) {
    console.warn('[SchoolGPT Actions] Live DB retriever fallback triggered:', e);
  }

  // 2. Perform 4-Tier Hybrid Knowledge Retrieval
  const retrievalResult = await executeHybridRetrieval(classified, resolvedQuery, brainContext, liveDbResult);

  // 3. Synthesize Final Context-Aware LLM / Fallback Response
  return generateSchoolGPTResponse(
    resolvedQuery,
    retrievalResult.data,
    req.role,
    history,
    classified.intent,
    retrievalResult.confidence,
    retrievalResult.modulesConsulted
  );
}
