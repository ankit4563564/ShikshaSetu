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
  
  // 1.5 Strict Role Boundary Check Interception
  const { PermissionEngine } = await import('@/lib/schoolgpt/PermissionEngine');
  const boundaryCheck = PermissionEngine.isQueryInRoleBoundary(resolvedQuery, req.role as any);
  if (!boundaryCheck.isAllowed) {
    console.log(`[SchoolGPT Permission Engine] Intercepted out-of-boundary query for role ${req.role}: "${resolvedQuery}"`);
    return {
      text: boundaryCheck.refusalReason || "This query falls outside the permissions for your active portal role.",
      sources: ['Permission Boundary Engine'],
      suggestedFollowUps: req.role === 'student'
        ? ['Explain Physics Chapter 4', 'Give me practice quiz', 'What homework is due tomorrow?']
        : req.role === 'parent'
        ? ['Where is the bus?', 'Today attendance log', 'Message class teacher']
        : ['Who needs support today?', 'Draft PTM Summary'],
      source: 'permission_boundary_engine',
      confidence: 'HIGH',
    };
  }

  // 2. Intent Classification
  const classified = classifyIntent(resolvedQuery, history);

  const effectiveStudentId = req.studentId || state.currentStudentId || 'b1000000-0000-4000-8000-000000000001';

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


  // 4. Live DB Retrieval Attempt with Auto-Retry
  let liveDbResult = '';
  let dbRetrievalFailed = false;
  let dbRetrievalError: Error | null = null;

  const retrieveWithRetry = async (retriever: () => Promise<string>, maxRetries = 2): Promise<string> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await retriever();
      } catch (e) {
        const error = e as Error;
        console.error(`[SchoolGPT Actions] DB retrieval attempt ${attempt}/${maxRetries} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait 500ms before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return '';
  };

  try {
    switch (classified.intent) {
      case 'student_performance':
      case 'marks':
        liveDbResult = await retrieveWithRetry(() => retrieveStudentPerformance(effectiveStudentId));
        break;
      case 'attendance':
        if (req.role === 'student' || req.role === 'parent') liveDbResult = await retrieveWithRetry(() => retrieveAttendance(effectiveStudentId));
        else liveDbResult = await retrieveWithRetry(() => retrieveAttendanceTrends());
        break;
      case 'homework':
        liveDbResult = await retrieveWithRetry(() => retrieveHomework(effectiveStudentId));
        break;
      case 'timetable':
        liveDbResult = await retrieveWithRetry(() => retrieveTimetable(req.classGrade || '8', req.classSection || 'A'));
        break;
      case 'exams':
        liveDbResult = await retrieveWithRetry(() => retrieveExams(effectiveStudentId, req.classGrade || '8'));
        break;
      case 'who_needs_attention':
        liveDbResult = await retrieveWithRetry(() => retrieveStudentNeedingAttention(req.teacherId || 'all'));
        break;
      case 'bus':
        liveDbResult = await retrieveWithRetry(() => retrieveBus(effectiveStudentId));
        break;
      case 'events':
        liveDbResult = await retrieveWithRetry(() => retrieveEvents());
        break;
      case 'announcements':
        liveDbResult = await retrieveWithRetry(() => retrieveNotices());
        break;
      case 'library':
        liveDbResult = await retrieveWithRetry(() => retrieveLibrary());
        break;
      case 'rules':
        liveDbResult = await retrieveWithRetry(() => retrieveRules());
        break;
      case 'clubs':
        liveDbResult = await retrieveWithRetry(() => retrieveClubs(effectiveStudentId));
        break;
      case 'faculty':
        liveDbResult = await retrieveWithRetry(() => retrieveTeachers(req.classGrade));
        break;
    }
  } catch (e) {
    dbRetrievalFailed = true;
    dbRetrievalError = e as Error;
    console.error('[SchoolGPT Actions] DB retrieval failed after retries:', e);
  }

  // 5. Targeted Hybrid Retrieval
  const retrievalResult = await executeHybridRetrieval(classified, resolvedQuery, brainContext, liveDbResult, queryPlan);

  // 6. Synthesize Final Response
  let res;
  if (dbRetrievalFailed) {
    // Fallback: Use portal context when DB fails
    console.log('[SchoolGPT Actions] Using fallback response due to DB failure');
    res = await generateSchoolGPTResponse(
      resolvedQuery,
      retrievalResult.data,
      req.role,
      history,
      classified.intent,
      'MEDIUM', // Lower confidence when using fallback
      retrievalResult.modulesConsulted,
      brainContext,
      queryPlan
    );
    
    // Add fallback indicator to response
    res.text = res.text + '\n\n*Using available portal information*';
    res.sources = ['Available Portal Information'];
    res.confidence = 'MEDIUM';
  } else {
    res = await generateSchoolGPTResponse(
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
  }

  // 7. Role Security & Permission Guard Inspection
  const { ResponseGuard } = await import('@/lib/schoolgpt/ResponseGuard');
  const sanitizedText = ResponseGuard.sanitizeResponse(res.text, req.role as any);

  return {
    ...res,
    text: sanitizedText,
    actionObject,
    dbRetrievalFailed, // Pass this flag to UI for fallback UI
  };
}


export async function getProactiveInsightsAction(role: SchoolRole): Promise<ProactiveInsightCard[]> {
  await requireAuth();
  return generateProactiveInsights(role);
}


