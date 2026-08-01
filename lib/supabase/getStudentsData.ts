import { createClient } from './server';
import type { StudentInputData } from '@/lib/rules-engine/calculateStatus';

// Exact mock data representing the 3 seeded students from seed.sql
export interface StudentWithFlag extends StudentInputData {
  activeStatusFlag?: {
    id: string;
    status: 'on_track' | 'worth_watching' | 'needs_attention';
    isCorrected: boolean;
  } | null;
  classTeacherId?: string | null;
  grade?: string | null;
  section?: string | null;
  roll_number?: string | null;
  avatar_url?: string | null;
  house?: string | null;
}

// Generate 500 connected mock students systematically for Green Valley International School
export function generateSystematicMockData(): StudentWithFlag[] {
  const students: StudentWithFlag[] = [];
  const houses = ['Ruby', 'Emerald', 'Sapphire', 'Topaz'];
  const firstNames = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Kabir', 'Zara', 'Aditya', 'Meera', 'Arjun', 'Sanya', 'Sneha', 'Rahul', 'Nisha', 'Vikram', 'Pooja', 'Ravi', 'Kiran', 'Suresh', 'Deepa', 'Amit', 'Neha', 'Vijay', 'Jyoti', 'Sunil', 'Asha'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Khan', 'Mehta', 'Verma', 'Nair', 'Reddy', 'Joshi', 'Chauhan', 'Iyer', 'Kapoor', 'Menon', 'Bose', 'Das', 'Sen', 'Rao', 'Pillai', 'Naidu', 'Shetty', 'Pande', 'Bhat', 'Hegde', 'Gowda'];
  
  const teacherIds = [
    'a1000000-0000-4000-8000-000000000001', // Ms. Ananya Mehra
    'a1000000-0000-4000-8000-000000000002', // Mr. Vikram Joshi
    'a1000000-0000-4000-8000-000000000003'  // Ms. Kavita Deshmukh
  ];

  // Preserved principal students (Aarav, Priya, Rohan, Ananya, Kabir) with their fixed IDs
  const principalStudents = [
    { id: 'b1000000-0000-4000-8000-000000000001', first: 'Aarav', last: 'Sharma', status: 'on_track', roll: '801', house: 'Ruby' },
    { id: 'b1000000-0000-4000-8000-000000000002', first: 'Priya', last: 'Patel', status: 'needs_attention', roll: '802', house: 'Emerald' },
    { id: 'b1000000-0000-4000-8000-000000000003', first: 'Rohan', last: 'Singh', status: 'needs_attention', roll: '803', house: 'Sapphire' },
    { id: 'b1000000-0000-4000-8000-000000000004', first: 'Ananya', last: 'Gupta', status: 'worth_watching', roll: '804', house: 'Topaz' },
    { id: 'b1000000-0000-4000-8000-000000000005', first: 'Kabir', last: 'Khan', status: 'worth_watching', roll: '805', house: 'Ruby' }
  ];

  const startDate = new Date('2026-04-15');
  const totalDays = 90;

  for (let i = 0; i < 500; i++) {
    let id = '';
    let first = '';
    let last = '';
    let status: 'on_track' | 'worth_watching' | 'needs_attention' = 'on_track';
    let roll = '';
    let houseName = '';
    let grade = '8';
    let section = 'A';
    let teacherId = teacherIds[0];

    if (i < 5) {
      const p = principalStudents[i];
      id = p.id;
      first = p.first;
      last = p.last;
      status = p.status as any;
      roll = p.roll;
      houseName = p.house;
    } else {
      id = `b1000000-0000-4000-8000-000000000${(i + 1).toString().padStart(3, '0')}`;
      first = firstNames[i % firstNames.length];
      last = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      roll = (800 + i + 1).toString();
      houseName = houses[i % houses.length];
      
      // Distribute grades 1-12
      const gradeNum = 1 + (i % 12);
      grade = gradeNum.toString();
      section = ['A', 'B', 'C', 'D'][i % 4];
      teacherId = teacherIds[i % teacherIds.length];

      // Assign performance stats
      if (i % 15 === 0) status = 'needs_attention';
      else if (i % 8 === 0) status = 'worth_watching';
      else status = 'on_track';
    }

    // Generate Attendance (90 days)
    const attendance: any[] = [];
    // Generate Homework (12 items)
    const homework: any[] = [];
    // Generate Grades (6 tests)
    const gradesList: any[] = [];
    // Generate Mood (10 entries)
    const mood: any[] = [];

    // Helper to generate history
    for (let day = 0; day < totalDays; day++) {
      const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      if (isWeekend) continue;

      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Attendance status probability
      let attStatus: 'present' | 'absent' | 'late' | 'excused' = 'present';
      if (status === 'needs_attention' && day % 12 === 0) {
        attStatus = 'absent';
      } else if (status === 'worth_watching' && day % 20 === 0) {
        attStatus = 'late';
      }
      
      attendance.push({
        id: `att-${id}-${day}`,
        date: dateStr,
        status: attStatus,
        notes: attStatus === 'absent' ? 'Medical Leave' : null
      });
    }

    // Generate Homework (weekly items)
    const subjects = ['Math', 'Science', 'English', 'Social Studies'];
    for (let hwIdx = 0; hwIdx < 12; hwIdx++) {
      const sub = subjects[hwIdx % subjects.length];
      const due = new Date(startDate.getTime() + (hwIdx * 7 + 4) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const submitted = new Date(startDate.getTime() + (hwIdx * 7 + 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let isSubmitted = true;
      let submittedAt: string | null = submitted;

      if (status === 'needs_attention' && hwIdx % 3 === 0) {
        isSubmitted = false;
        submittedAt = null;
      } else if (status === 'worth_watching' && hwIdx % 5 === 0) {
        isSubmitted = false;
        submittedAt = null;
      }

      homework.push({
        id: `hw-${id}-${hwIdx}`,
        subject: sub,
        title: `${sub} assignment ${hwIdx + 1}`,
        dueDate: due,
        submittedAt,
        isSubmitted
      });
    }

    // Generate Grades (Tests)
    const assessments = [
      { name: 'Unit Test 1', max: 50, offsetDays: 15 },
      { name: 'Quiz 1', max: 20, offsetDays: 30 },
      { name: 'Mid-Term Exam', max: 100, offsetDays: 45 },
      { name: 'Unit Test 2', max: 50, offsetDays: 60 },
      { name: 'Quiz 2', max: 20, offsetDays: 75 },
      { name: 'Final Exam Prep', max: 100, offsetDays: 85 }
    ];

    assessments.forEach((asm, idx) => {
      let multiplier = 0.85; // On track
      if (status === 'needs_attention') multiplier = 0.55;
      else if (status === 'worth_watching') multiplier = 0.72;

      const score = Math.round(asm.max * (multiplier + (idx % 3) * 0.05));
      const testDate = new Date(startDate.getTime() + asm.offsetDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      gradesList.push({
        id: `gr-${id}-${idx}`,
        subject: idx % 2 === 0 ? 'Math' : 'Science',
        assessmentName: asm.name,
        score,
        maxScore: asm.max,
        assessmentDate: testDate
      });
    });

    // Generate Mood entries
    for (let mIdx = 0; mIdx < 10; mIdx++) {
      let val = 4;
      let label = 'calm';
      if (status === 'needs_attention') {
        val = 2;
        label = 'sad';
      } else if (mIdx % 3 === 0) {
        val = 5;
        label = 'happy';
      }
      
      const moodDate = new Date(startDate.getTime() + (mIdx * 9 + 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 09:00:00';
      mood.push({
        id: `mood-${id}-${mIdx}`,
        moodValue: val,
        moodLabel: label,
        note: val === 5 ? 'Loving the Green Valley sports facilities!' : null,
        checkedInAt: moodDate
      });
    }

    students.push({
      studentId: id,
      classTeacherId: teacherId,
      displayName: `${first} ${last}`,
      grade,
      section,
      roll_number: roll,
      house: houseName,
      activeStatusFlag: {
        id: `sf-${id}-flag`,
        status,
        isCorrected: false
      },
      attendance,
      homework,
      grades: gradesList,
      mood
    });
  }

  return students;
}

const SEEDED_STUDENTS_MOCK = generateSystematicMockData();

/**
 * Loads student input data. Tries querying via Supabase client first.
 * If that fails or isn't connected, it resolves with the exact seeded mock data.
 */
export async function getStudentsData(): Promise<StudentWithFlag[]> {
  try {
    const supabase = createClient();
    
    // 1. Fetch Students
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, display_name, class_teacher_id, grade, section, roll_number, avatar_url, house');

    if (studentError || !students || students.length === 0) {
      throw new Error(studentError?.message || 'No students found');
    }

    const studentIds = students.map((student) => student.id);

    // 2. Fetch each relation once for the whole roster.
    console.log('[getStudentsData] Fetching data for studentIds:', studentIds);
    
    const [
      { data: attendance, error: attendanceError },
      { data: homework, error: homeworkError },
      { data: grades, error: gradesError },
      { data: mood, error: moodError },
      { data: flags, error: flagsError },
    ] = await Promise.all([
      supabase.from('attendance').select('id, student_id, date, status, notes').in('student_id', studentIds),
      supabase.from('homework').select('id, student_id, subject, title, due_date, submitted_at, is_submitted').in('student_id', studentIds),
      supabase.from('grades').select('id, student_id, subject, assessment_name, score, max_score, assessment_date').in('student_id', studentIds),
      supabase.from('mood_checkins').select('id, student_id, mood_value, mood_label, note, checked_in_at').in('student_id', studentIds),
      supabase.from('status_flags')
        .select(`
          id,
          student_id,
          status,
          resolved_at,
          false_positive_corrections (
            id
          )
        `)
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }),
    ]);

    console.log('[getStudentsData] Homework query result:', { error: homeworkError, recordCount: homework?.length || 0 });

    const relatedError = attendanceError || homeworkError || gradesError || moodError || flagsError;
    if (relatedError) {
      throw new Error(relatedError.message);
    }

    const groupByStudent = <T extends { student_id: string }>(records: T[] | null) => {
      const grouped = new Map<string, T[]>();
      for (const record of records || []) {
        const group = grouped.get(record.student_id) || [];
        group.push(record);
        grouped.set(record.student_id, group);
      }
      return grouped;
    };

    const attendanceByStudent = groupByStudent(attendance);
    const homeworkByStudent = groupByStudent(homework);
    const gradesByStudent = groupByStudent(grades);
    const moodByStudent = groupByStudent(mood);
    const flagsByStudent = groupByStudent(flags);

    return students.map((student) => {
      const recentFlag = flagsByStudent.get(student.id)?.[0] || null;
      const activeStatusFlag = recentFlag ? {
        id: recentFlag.id,
        status: recentFlag.status as 'on_track' | 'worth_watching' | 'needs_attention',
        isCorrected: recentFlag.false_positive_corrections && recentFlag.false_positive_corrections.length > 0,
      } : null;

      return {
        studentId: student.id,
        classTeacherId: student.class_teacher_id,
        displayName: student.display_name,
        grade: student.grade,
        section: student.section,
        roll_number: student.roll_number,
        avatar_url: student.avatar_url,
        house: student.house,
        activeStatusFlag,
        attendance: (attendanceByStudent.get(student.id) || []).map((att) => ({
          id: att.id,
          date: att.date,
          status: att.status as 'present' | 'absent' | 'late' | 'excused',
          notes: att.notes,
        })),
        homework: (homeworkByStudent.get(student.id) || []).map((hw) => ({
          id: hw.id,
          subject: hw.subject,
          title: hw.title,
          dueDate: hw.due_date,
          submittedAt: hw.submitted_at,
          isSubmitted: hw.is_submitted,
        })),
        grades: (gradesByStudent.get(student.id) || []).map((gr) => ({
          id: gr.id,
          subject: gr.subject,
          assessmentName: gr.assessment_name,
          score: Number(gr.score),
          maxScore: Number(gr.max_score),
          assessmentDate: gr.assessment_date,
        })),
        mood: (moodByStudent.get(student.id) || []).map((m) => ({
          id: m.id,
          moodValue: m.mood_value,
          moodLabel: m.mood_label,
          note: m.note,
          checkedInAt: m.checked_in_at,
        })),
      };
    });
  } catch (error) {
    console.warn('[Supabase Loader] Database query failed or placeholder keys used. Falling back to seeded mock data:', error);
    return SEEDED_STUDENTS_MOCK;
  }
}
