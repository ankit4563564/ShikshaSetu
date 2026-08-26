import { describe, it, expect } from 'vitest';
import { CANONICAL_STUDENT_ID } from '@/lib/canonical';
import {
  StudentReportCardData,
  buildReportCardPDF,
  getSubjectMarksForStudent,
} from '@/lib/pdf/reportCardGenerator';

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
    const marks = getSubjectMarksForStudent(aarav);
    expect(marks).toHaveLength(5);

    const totalMax = marks.reduce((acc, g) => acc + g.maxMarks, 0);
    const totalObtained = marks.reduce((acc, g) => acc + g.score, 0);
    const pct = Math.round((totalObtained / totalMax) * 100);

    expect(totalMax).toBe(500);
    expect(totalObtained).toBe(416);
    expect(pct).toBe(83); // 83.2% rounded -> 83%

    const mathGrade = marks.find((g) => g.subject === 'Mathematics');
    expect(mathGrade?.score).toBe(78);
    expect(mathGrade?.grade).toBe('B+');
  });

  it('3. Generates genuine non-empty vector PDF with valid header and structure for 1 student', () => {
    const aarav = mockStudents[0];
    const doc = buildReportCardPDF([aarav]);
    const arrayBuffer = doc.output('arraybuffer');

    expect(arrayBuffer.byteLength).toBeGreaterThan(2000);
    const headerStr = Buffer.from(arrayBuffer).toString('utf-8', 0, 5);
    expect(headerStr).toBe('%PDF-');
  });

  it('4. Multi-student batch selection produces multi-page PDF with all students', () => {
    const doc = buildReportCardPDF(mockStudents);
    const pageCount = doc.getNumberOfPages();
    expect(pageCount).toBe(2);

    const arrayBuffer = doc.output('arraybuffer');
    expect(arrayBuffer.byteLength).toBeGreaterThan(4000);
  });

  it('5. Guard against empty student array', () => {
    expect(() => buildReportCardPDF([])).toThrow('Cannot generate PDF: No student data provided.');
  });
});
