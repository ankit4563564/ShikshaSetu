import { describe, it, expect } from 'vitest';
import { classifyIntent } from '@/school-brain/intents/intentClassifier';
import { resolveContextualReferences } from '@/school-brain/memory/conversationMemory';
import { planQueryExecution } from '@/school-brain/planner/queryPlanner';
import { executeHybridRetrieval } from '@/school-brain/retrieval/retriever';
import { generateSchoolGPTResponse } from '@/lib/schoolgpt/generateResponse';

describe('SchoolMitra AI Grounding & Query-Intent Pipeline Tests', () => {
  const teacherContext = {
    role: 'teacher' as const,
    teacherId: 'a1000000-0000-4000-8000-000000000001',
    classGrade: '8',
    classSection: 'A',
  };

  it('1. "is this class going well" -> classifies as student_performance/class overview and NEVER returns Multi-Student Comparative Analysis', async () => {
    const query = 'is this class going well';
    const history = [
      { role: 'user', content: 'Tell me about Aarav and Rohan' },
      { role: 'assistant', content: 'Aarav and Rohan are enrolled in Class 8A.' },
    ];

    // Context resolution should NOT convert "this class" into student pronouns
    const { resolvedQuery } = resolveContextualReferences(query, history as any);
    expect(resolvedQuery).not.toContain('referring to students');

    const classified = classifyIntent(resolvedQuery, history);
    expect(classified.intent).toBe('student_performance');

    const plan = planQueryExecution(classified, resolvedQuery, teacherContext);
    expect(plan.needsComparison).toBe(false);

    const retrieval = await executeHybridRetrieval(classified, resolvedQuery, teacherContext, undefined, plan);
    expect(retrieval.data).not.toContain('Multi-Student Comparative Analysis');
    expect(retrieval.data).toContain('Class 8A');

    const response = await generateSchoolGPTResponse(query, retrieval.data, 'teacher', history as any, classified.intent, 'HIGH', retrieval.modulesConsulted, teacherContext, plan);
    expect(response.text).not.toContain('Multi-Student Comparative Analysis');
    expect(response.text).toContain('Class 8A');
    expect(response.text.toLowerCase()).toContain('attendance');
  });

  it('2. "who needs the most help" -> returns students needing attention', async () => {
    const query = 'who needs the most help';
    const classified = classifyIntent(query);
    expect(classified.intent).toBe('who_needs_attention');

    const plan = planQueryExecution(classified, query, teacherContext);
    expect(plan.needsComparison).toBe(false);

    const retrieval = await executeHybridRetrieval(classified, query, teacherContext, undefined, plan);
    expect(retrieval.data).toContain('Attention');

    const response = await generateSchoolGPTResponse(query, retrieval.data, 'teacher', [], classified.intent, 'HIGH', retrieval.modulesConsulted, teacherContext, plan);
    expect(response.text).toMatch(/Priya|Rohan|Aarav/);
  });

  it('3. "compare Aarav and Rohan" -> triggers explicit comparative analysis', async () => {
    const query = 'compare Aarav and Rohan';
    const classified = classifyIntent(query);

    const plan = planQueryExecution(classified, query, teacherContext);
    expect(plan.needsComparison).toBe(true);

    const retrieval = await executeHybridRetrieval(classified, query, teacherContext, undefined, plan);
    expect(retrieval.data).toContain('Multi-Student Comparative Analysis');
    expect(retrieval.data).toContain('Aarav');
    expect(retrieval.data).toContain('Rohan');
  });

  it('4. "what should I teach next" -> returns pedagogical recommendation for Equivalent Fractions', async () => {
    const query = 'what should I teach next';
    const classified = classifyIntent(query);

    const plan = planQueryExecution(classified, query, teacherContext);
    const retrieval = await executeHybridRetrieval(classified, query, teacherContext, undefined, plan);

    const response = await generateSchoolGPTResponse(query, retrieval.data, 'teacher', [], classified.intent, 'HIGH', retrieval.modulesConsulted, teacherContext, plan);
    expect(response.text).toContain('Equivalent Fractions');
  });

  it('5. "explain equivalent fractions differently" -> returns visual concept explanation', async () => {
    const query = 'explain equivalent fractions differently';
    const classified = classifyIntent(query);

    const plan = planQueryExecution(classified, query, teacherContext);
    const retrieval = await executeHybridRetrieval(classified, query, teacherContext, undefined, plan);

    const response = await generateSchoolGPTResponse(query, retrieval.data, 'teacher', [], classified.intent, 'HIGH', retrieval.modulesConsulted, teacherContext, plan);
    expect(response.text.toLowerCase()).toContain('chocolate');
    expect(response.text).toContain('Equivalent Fractions');
  });

  it('6. "draft a message to Aarav\'s mother" -> drafts a personalized parent communication', async () => {
    const query = "draft a message to Aarav's mother";
    const classified = classifyIntent(query);

    const plan = planQueryExecution(classified, query, teacherContext);
    const retrieval = await executeHybridRetrieval(classified, query, teacherContext, undefined, plan);

    const response = await generateSchoolGPTResponse(query, retrieval.data, 'teacher', [], classified.intent, 'HIGH', retrieval.modulesConsulted, teacherContext, plan);
    expect(response.text).toContain('Sunita');
    expect(response.text).toContain('Aarav');
  });

  it('7. "how is Aarav doing" -> returns individual performance summary for Aarav', async () => {
    const query = 'how is Aarav doing';
    const classified = classifyIntent(query);
    expect(classified.intent).toBe('student_performance');

    const plan = planQueryExecution(classified, query, teacherContext);
    expect(plan.needsComparison).toBe(false);

    const retrieval = await executeHybridRetrieval(classified, query, teacherContext, undefined, plan);
    expect(retrieval.data).toContain('Aarav');
    expect(retrieval.data).not.toContain('Multi-Student Comparative Analysis');

    const response = await generateSchoolGPTResponse(query, retrieval.data, 'teacher', [], classified.intent, 'HIGH', retrieval.modulesConsulted, teacherContext, plan);
    expect(response.text).toContain('Aarav');
  });
});
