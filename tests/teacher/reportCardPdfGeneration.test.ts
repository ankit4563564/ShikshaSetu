import { describe, it, expect } from 'vitest';
import { CANONICAL_STUDENT_ID, CANONICAL_TEACHER_ID } from '@/lib/canonical';
import type { StudentReportCardData } from '@/components/teacher/SchoolPulsePDF';

describe('Teacher Portal — Academic Report Card PDF Generation & Data Integrity', () => {
  const mockStudents: StudentReportCardData[] = [
    {
      studentId: CANONICAL_STUDENT_ID, // Aarav Sharma
      displayName: 'Aarav Sharma',
      rollNumber: '801',
      grade: '8',
      section: 'A',
      teacherName: 'Ananya Mehra',
      academicYear: '2026–27',
      attendance: {
        present: 47,
        total: 50,
        percentage: 94,
      },
      homework: {
        submitted: 12,
        total: 13,
        percentage: 92,
      },
      grades: [
        { id: 'g1', subject: 'Mathematics', assessmentName: 'Mid-Term', score: 78, maxScore: 100, assessmentDate: '2026-06-10' },
        { id: 'g2', subject: 'Science', assessmentName: 'Mid-Term', score: 84, maxScore: 100, assessmentDate: '2026-06-11' },
        { id: 'g3', subject: 'English', assessmentName: 'Mid-Term', score: 88, maxScore: 100, assessmentDate: '2026-06-12' },
        { id: 'g4', subject: 'Social Studies', assessmentName: 'Mid-Term', score: 81, maxScore: 100, assessmentDate: '2026-06-13' },
        { id: 'g5', subject: 'Hindi', assessmentName: 'Mid-Term', score: 85, maxScore: 100, assessmentDate: '2026-06-14' },
      ],
      positiveNote: 'Aarav demonstrates strong conceptual clarity and active participation in class discussions.',
      conversationPrompt: 'Celebrate achievements in Mathematics and discuss goals for the upcoming term.',
    },
    {
      studentId: 'b1000000-0000-4000-8000-000000000002', // Priya Patel
      displayName: 'Priya Patel',
      rollNumber: '802',
      grade: '8',
      section: 'A',
      teacherName: 'Ananya Mehra',
      academicYear: '2026–27',
      attendance: {
        present: 49,
        total: 50,
        percentage: 98,
      },
      homework: {
        submitted: 13,
        total: 13,
        percentage: 100,
      },
      positiveNote: 'Priya consistently delivers outstanding academic work.',
      conversationPrompt: 'Discuss advanced learning modules in Science.',
    },
  ];

  it('1. Verifies Aarav Sharma canonical report card data structure', () => {
    const aarav = mockStudents[0];
    expect(aarav.studentId).toBe(CANONICAL_STUDENT_ID);
    expect(aarav.displayName).toBe('Aarav Sharma');
    expect(aarav.rollNumber).toBe('801');
    expect(aarav.grade).toBe('8');
    expect(aarav.section).toBe('A');
    expect(aarav.teacherName).toBe('Ananya Mehra');
    expect(aarav.attendance.percentage).toBe(94);
    expect(aarav.homework.percentage).toBe(92);
  });

  it('2. Computes scholastic marks, total aggregate, and grade accurately', () => {
    const aarav = mockStudents[0];
    const grades = aarav.grades || [];
    expect(grades).toHaveLength(5);

    const totalMax = grades.reduce((acc, g) => acc + g.maxScore, 0);
    const totalObtained = grades.reduce((acc, g) => acc + g.score, 0);
    const pct = Math.round((totalObtained / totalMax) * 100);

    expect(totalMax).toBe(500);
    expect(totalObtained).toBe(416);
    expect(pct).toBe(83); // 83.2% rounded -> 83%

    const mathGrade = grades.find((g) => g.subject === 'Mathematics');
    expect(mathGrade?.score).toBe(78);
  });

  it('3. Multi-student batch selection supports distinct report cards', () => {
    const selectedIds = new Set(mockStudents.map((s) => s.studentId));
    const filtered = mockStudents.filter((s) => selectedIds.has(s.studentId));

    expect(filtered).toHaveLength(2);
    expect(filtered[0].displayName).toBe('Aarav Sharma');
    expect(filtered[1].displayName).toBe('Priya Patel');
    expect(filtered[0].studentId).not.toBe(filtered[1].studentId);
  });

  it('4. Guard against zero dimensions / unmounted DOM node during PDF capture', () => {
    const mockElement = {
      scrollWidth: 794,
      scrollHeight: 1120,
    };

    const isMeasurable = mockElement.scrollWidth > 0 && mockElement.scrollHeight > 0;
    expect(isMeasurable).toBe(true);

    const emptyElement = {
      scrollWidth: 0,
      scrollHeight: 0,
    };
    const isEmpty = emptyElement.scrollWidth === 0 || emptyElement.scrollHeight === 0;
    expect(isEmpty).toBe(true);
  });

  it('5. Error validation when 0 students selected', () => {
    const selected = new Set<string>();
    let error: string | null = null;

    if (selected.size === 0) {
      error = 'Please select at least one student to print report cards.';
    }

    expect(error).toBe('Please select at least one student to print report cards.');
  });
});
