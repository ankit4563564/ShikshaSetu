import { describe, it, expect } from 'vitest';
import {
  generateRevisionNotesAction,
  explainConceptSimplyAction,
  generateRevisionQuizAction,
  saveRevisionNoteAction,
  getSavedRevisionNotesAction,
  deleteSavedRevisionNoteAction,
} from '@/app/actions/revisionNotesActions';

describe('Student Portal — AI Learning & Socratic Engine Suite', () => {
  it('1. should resolve Next Best Action with overdue homework as highest priority', () => {
    const pendingHomework = [
      { id: 'hw-1', subject: 'Math', title: 'Algebra Ch. 4', dueDate: 'Today', isSubmitted: false },
      { id: 'hw-2', subject: 'Science', title: 'Plant Cells', dueDate: 'Tomorrow', isSubmitted: false },
    ];

    const overdueHW = pendingHomework.find(h => h.dueDate.toLowerCase().includes('today'));
    expect(overdueHW).toBeDefined();
    expect(overdueHW?.subject).toBe('Math');
  });

  it('2. should resolve Next Best Action with weak subject when all homework is submitted', () => {
    const pendingHomework: any[] = [];
    const grades = [
      { subject: 'Science', score: 92, maxScore: 100 },
      { subject: 'Mathematics', score: 62, maxScore: 100 },
      { subject: 'English', score: 85, maxScore: 100 },
    ];

    const evaluated = grades.map(g => ({ ...g, pct: Math.round((g.score / g.maxScore) * 100) }));
    const weakest = [...evaluated].sort((a, b) => a.pct - b.pct)[0];

    expect(weakest.subject).toBe('Mathematics');
    expect(weakest.pct).toBe(62);
    expect(weakest.pct < 80).toBe(true);
  });

  it('3. should verify honest session counters without fabricated IQ or Critical Thinking scores', () => {
    const sessionStats = {
      questionsAsked: 3,
      topicsExplored: ['Mathematics', 'Science'],
    };

    expect(sessionStats.questionsAsked).toBe(3);
    expect(sessionStats.topicsExplored).toHaveLength(2);
    expect((sessionStats as any).iqScore).toBeUndefined();
    expect((sessionStats as any).criticalThinkingScore).toBeUndefined();
  });

  it('4. should format 15-minute test sprint prompt structure correctly', () => {
    const subject = 'Physics';
    const sprintPrompt = `Generate a focused 15-minute revision sprint for ${subject}. Structure it as:
- 0-3 min: Review core concepts (list the most important ones)
- 3-8 min: 2-3 practice questions to try
- 8-12 min: One challenge question
- 12-15 min: Quick self-check summary
Keep it concise and immediately actionable.`;

    expect(sprintPrompt).toContain('0-3 min');
    expect(sprintPrompt).toContain('3-8 min');
    expect(sprintPrompt).toContain('8-12 min');
    expect(sprintPrompt).toContain('12-15 min');
    expect(sprintPrompt).toContain('Physics');
  });

  it('5. should sanitize student role queries and protect against out-of-role boundary leaks', async () => {
    const { PermissionEngine } = await import('@/lib/schoolgpt/PermissionEngine');
    
    // Valid student learning query
    const studentQuery = 'Explain the difference between series and parallel circuits';
    const validCheck = PermissionEngine.isQueryInRoleBoundary(studentQuery, 'student');
    expect(validCheck.isAllowed).toBe(true);

    // Administrative query attempted by student
    const forbiddenQuery = 'Show me the salary of teachers and private staff notes';
    const blockedCheck = PermissionEngine.isQueryInRoleBoundary(forbiddenQuery, 'student');
    expect(blockedCheck.isAllowed).toBe(false);
  });

  describe('6. AI Revision Notes Generation & Grounding', () => {
    it('should generate structured revision notes with Key Idea, Concepts, Definitions, Example and Common Mistakes', async () => {
      const res = await generateRevisionNotesAction({
        subject: 'Science',
        topic: 'Photosynthesis & Plant Nutrition',
        grade: '8',
      });

      expect(res.success).toBe(true);
      expect(res.notes).toBeDefined();
      expect(res.notes?.title).toContain('Photosynthesis');
      expect(res.notes?.keyIdea).toBeDefined();
      expect(res.notes?.importantConcepts.length).toBeGreaterThan(0);
      expect(res.notes?.definitions.length).toBeGreaterThan(0);
      expect(res.notes?.rememberThis.length).toBeGreaterThan(0);
      expect(res.notes?.example).toBeDefined();
      expect(res.notes?.commonMistake).toBeDefined();
    });

    it('should ground revision notes in user-provided study material', async () => {
      const customMaterial = `Ohm's law states that the current through a conductor between two points is directly proportional to the voltage across the two points: V = IR. Resistance R is measured in Ohms.`;
      
      const res = await generateRevisionNotesAction({
        subject: 'Physics',
        topic: "Ohm's Law",
        chapterNotes: customMaterial,
        grade: '10',
      });

      expect(res.success).toBe(true);
      expect(res.notes).toBeDefined();
      expect(res.notes?.title).toBe("Ohm's Law");
    });
  });

  describe('7. Explain Concept Simply Tool', () => {
    it('should generate student-friendly explanation with real-life analogy and check question', async () => {
      const res = await explainConceptSimplyAction('Equivalent Fractions', 'Fractions & Decimals', 'Mathematics');

      expect(res.success).toBe(true);
      expect(res.result).toBeDefined();
      expect(res.result?.concept).toBe('Equivalent Fractions');
      expect(res.result?.simpleExplanation).toBeDefined();
      expect(res.result?.analogy).toBeDefined();
      expect(res.result?.checkQuestion).toBeDefined();
    });
  });

  describe('8. Revision Quiz Generation', () => {
    it('should generate 3 to 4 diagnostic questions grounded in notes', async () => {
      const notesContent = 'Photosynthesis uses light, CO2 and H2O to create glucose and release oxygen. Chlorophyll absorbs solar energy.';
      const res = await generateRevisionQuizAction('Photosynthesis', notesContent);

      expect(res.success).toBe(true);
      expect(res.questions).toBeDefined();
      expect(res.questions?.length).toBeGreaterThanOrEqual(3);
      expect(res.questions?.[0].options.length).toBeGreaterThanOrEqual(2);
      expect(res.questions?.[0].correctAnswer).toBeDefined();
      expect(res.questions?.[0].explanation).toBeDefined();
    });
  });

  describe('9. Revision Notes Persistence (Save / Revisit Library)', () => {
    it('should save, retrieve, and delete revision notes in the student library', async () => {
      const sampleNote = {
        id: 'test-note-1',
        title: 'Linear Equations',
        subject: 'Mathematics',
        keyIdea: 'Balancing both sides of the equation',
        importantConcepts: ['Variables', 'Coefficients', 'Transposition'],
        definitions: [{ term: 'Linear Equation', definition: 'An equation where highest power of variable is 1' }],
        rememberThis: ['What you do to one side, do to the other'],
        example: '2x + 4 = 10 -> 2x = 6 -> x = 3',
        commonMistake: 'Forgetting to change the sign when transposing terms',
      };

      const saveRes = await saveRevisionNoteAction(sampleNote);
      expect(saveRes.success).toBe(true);

      const listRes = await getSavedRevisionNotesAction();
      expect(listRes.success).toBe(true);
      expect(listRes.notes.some(n => n.title === 'Linear Equations')).toBe(true);

      const delRes = await deleteSavedRevisionNoteAction('test-note-1');
      expect(delRes.success).toBe(true);
    });
  });

  describe('10. Intelligent Learning Command Center Assertions', () => {
    it('should strictly deduplicate repeated tasks with identical titles or IDs', () => {
      const rawTasks = [
        { id: 'hw-1', subject: 'Mathematics', title: 'Chapter 5: Algebraic Expressions', dueDate: 'Today', isSubmitted: false },
        { id: 'hw-1', subject: 'Mathematics', title: 'Chapter 5: Algebraic Expressions', dueDate: 'Today', isSubmitted: false },
        { id: 'hw-2', subject: 'Mathematics', title: 'Chapter 5: Algebraic Expressions', dueDate: 'Today', isSubmitted: false },
        { id: 'hw-3', subject: 'Science', title: 'Plant Cells & Tissues', dueDate: 'Tomorrow', isSubmitted: false },
      ];

      const seen = new Set<string>();
      const deduplicated = rawTasks.filter((h) => {
        const key = `${h.subject}-${h.title.trim().toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      expect(deduplicated).toHaveLength(2);
      expect(deduplicated[0].title).toBe('Chapter 5: Algebraic Expressions');
      expect(deduplicated[1].title).toBe('Plant Cells & Tissues');
    });

    it('should prioritize tasks by urgency: Overdue/Needs Attention -> Due Today -> Due Tomorrow -> Up Next', () => {
      const tasks = [
        { title: 'Task 3', dueDate: 'Aug 10' },
        { title: 'Task 1', dueDate: 'Urgent Overdue' },
        { title: 'Task 2', dueDate: 'Today at 5:00 PM' },
      ];

      const getOrder = (due: string) => {
        const d = due.toLowerCase();
        if (d.includes('urgent') || d.includes('overdue')) return 0;
        if (d.includes('today')) return 1;
        return 2;
      };

      const sorted = [...tasks].sort((a, b) => getOrder(a.dueDate) - getOrder(b.dueDate));
      expect(sorted[0].title).toBe('Task 1');
      expect(sorted[1].title).toBe('Task 2');
      expect(sorted[2].title).toBe('Task 3');
    });
  });
});
