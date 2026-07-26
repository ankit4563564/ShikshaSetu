'use server';

import { classifyIntent } from '@/school-brain/intents/intentClassifier';
import { resolveContextualReferences } from '@/school-brain/memory/conversationMemory';
import { planQueryExecution } from '@/school-brain/planner/queryPlanner';
import { executeHybridRetrieval } from '@/school-brain/retrieval/retriever';
import { generateSchoolGPTResponse, type SchoolGPTResponse } from '@/lib/schoolgpt/generateResponse';
import type { SchoolRole, SchoolBrainContext } from '@/school-brain/models/index';
import { generateProactiveInsights, type ProactiveInsightCard } from '@/school-brain/proactive/proactiveEngine';
import { evaluateClarificationNeed } from '@/school-brain/clarification/clarificationEngine';
import { generateActionObject, type ActionObject } from '@/school-brain/actions/actionExecutionEngine';
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
  retrieveStudentPerformance,
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

export async function askSchoolGPTAction(req: SchoolGPTRequest): Promise<SchoolGPTResponse & { actionObject?: ActionObject | null }> {

  await requireAuth();

  const history = req.history || [];
  // 1. Context Resolution & Pronoun Memory State
  const { resolvedQuery, state } = resolveContextualReferences(req.question, history);
  
  // 2. Intent Classification
  const classified = classifyIntent(resolvedQuery, history);

  const effectiveStudentId = req.studentId || state.currentStudentId || 'stu-aarav';

  const brainContext: SchoolBrainContext = {
    role: req.role,
    studentId: effectiveStudentId,
    teacherId: req.teacherId,
    childrenIds: req.childrenIds,
    classGrade: req.classGrade || state.currentClassGrade || '8',
    classSection: req.classSection || state.currentClassSection || 'A',
  };

  // 3. Clarification Check (Bypass LLM if query is ambiguous)
  const clarification = evaluateClarificationNeed(classified, req.question, brainContext);
  if (clarification && clarification.isAmbiguous) {
    console.log('[SchoolGPT Clarification Engine] Intercepted ambiguous query, prompting user for clarification.');
    return {
      text: `${clarification.question}\n\n${clarification.options.map((opt, i) => `${i + 1}. **${opt.label}**`).join('\n')}`,
      sources: ['Clarification Engine'],
      suggestedFollowUps: clarification.options.map(opt => opt.queryToTrigger),
      source: 'clarification_engine',
      confidence: 'HIGH',
    };
  }

  // 4. Query Planning Layer
  const queryPlan = planQueryExecution(classified, resolvedQuery, brainContext, state);
  const actionObject = generateActionObject(classified.intent, resolvedQuery, '', req.role);


  // 4. Live DB Retrieval Attempt
  let liveDbResult = '';
  try {
    switch (classified.intent) {
      case 'student_performance':
      case 'marks':
        liveDbResult = await retrieveStudentPerformance(effectiveStudentId);
        break;
      case 'attendance':
        if (req.role === 'student' || req.role === 'parent') liveDbResult = await retrieveAttendance(effectiveStudentId);
        else liveDbResult = await retrieveAttendanceTrends();
        break;
      case 'homework':
        liveDbResult = await retrieveHomework(effectiveStudentId);
        break;
      case 'timetable':
        liveDbResult = await retrieveTimetable(req.classGrade || '8', req.classSection || 'A');
        break;
      case 'exams':
        liveDbResult = await retrieveExams(effectiveStudentId, req.classGrade || '8');
        break;
      case 'who_needs_attention':
        liveDbResult = await retrieveStudentNeedingAttention(req.teacherId || 'all');
        break;
      case 'bus':
        liveDbResult = await retrieveBus(effectiveStudentId);
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
        liveDbResult = await retrieveClubs(effectiveStudentId);
        break;
      case 'faculty':
        liveDbResult = await retrieveTeachers(req.classGrade);
        break;
    }
  } catch (e) {
    console.warn('[SchoolGPT Actions] Live DB retriever fallback triggered:', e);
  }

  // 5. Targeted Hybrid Retrieval
  const retrievalResult = await executeHybridRetrieval(classified, resolvedQuery, brainContext, liveDbResult, queryPlan);

  // 6. Synthesize Final Response
  const res = await generateSchoolGPTResponse(
    resolvedQuery,
    retrievalResult.data,
    req.role,
    history,
    classified.intent,
    retrievalResult.confidence,
    retrievalResult.modulesConsulted,
    brainContext,
    queryPlan
  );

  return {
    ...res,
    actionObject,
  };
}


export async function getProactiveInsightsAction(role: SchoolRole): Promise<ProactiveInsightCard[]> {
  await requireAuth();
  return generateProactiveInsights(role);
}


