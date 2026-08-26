'use server';

import { createClient } from '@/lib/supabase/server';
import { createScopedClient } from '@/lib/supabase/scoped';
import { getAuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { revalidatePath } from 'next/cache';
import {
  CANONICAL_STUDENT_ID,
  CANONICAL_PRIYA_STUDENT_ID,
  CANONICAL_ROHAN_STUDENT_ID,
  CANONICAL_ANANYA_G_STUDENT_ID,
  CANONICAL_KABIR_STUDENT_ID,
  CANONICAL_TEACHER_ID,
  CANONICAL_GUARDIAN_ID,
  CANONICAL_RAJESH_GUARDIAN_ID,
  CANONICAL_SCHOOL_ID,
} from '@/lib/canonical';

export interface MasterStudent {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  grade: string;
  section: string;
  roll_number: string;
  house?: string | null;
  guardian_name?: string | null;
  guardian_id?: string | null;
  relationship?: string | null;
  created_at: string;
}

export interface MasterParent {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  phone?: string | null;
  email?: string | null;
  relationship: string;
  linked_students: { id: string; name: string; grade: string; section: string }[];
}

export interface MasterTeacher {
  id: string;
  display_name: string;
  subject: string;
  grade: string;
  section: string;
  email?: string | null;
  phone?: string | null;
}

export interface MasterClass {
  id: string;
  grade: string;
  section: string;
  class_teacher_name: string;
  total_students: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Global Store for Live Demo State Synchronization
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  var __SHIKSHASETU_MASTER_STUDENTS__: MasterStudent[] | undefined;
  var __SHIKSHASETU_MASTER_PARENTS__: MasterParent[] | undefined;
  var __SHIKSHASETU_MASTER_TEACHERS__: MasterTeacher[] | undefined;
}

if (!globalThis.__SHIKSHASETU_MASTER_STUDENTS__) {
  globalThis.__SHIKSHASETU_MASTER_STUDENTS__ = [
    {
      id: CANONICAL_STUDENT_ID,
      first_name: 'Aarav',
      last_name: 'Sharma',
      display_name: 'Aarav Sharma',
      grade: '8',
      section: 'A',
      roll_number: '801',
      house: 'Ruby',
      guardian_name: 'Sunita Sharma',
      guardian_id: CANONICAL_GUARDIAN_ID,
      relationship: 'Mother',
      created_at: new Date().toISOString(),
    },
    {
      id: CANONICAL_PRIYA_STUDENT_ID,
      first_name: 'Priya',
      last_name: 'Patel',
      display_name: 'Priya Patel',
      grade: '8',
      section: 'A',
      roll_number: '802',
      house: 'Emerald',
      guardian_name: 'Rajesh Patel',
      guardian_id: CANONICAL_RAJESH_GUARDIAN_ID,
      relationship: 'Father',
      created_at: new Date().toISOString(),
    },
    {
      id: CANONICAL_ROHAN_STUDENT_ID,
      first_name: 'Rohan',
      last_name: 'Singh',
      display_name: 'Rohan Singh',
      grade: '8',
      section: 'A',
      roll_number: '803',
      house: 'Sapphire',
      guardian_name: 'Vikram Singh',
      guardian_id: 'c1000000-0000-4000-8000-000000000003',
      relationship: 'Father',
      created_at: new Date().toISOString(),
    },
    {
      id: CANONICAL_ANANYA_G_STUDENT_ID,
      first_name: 'Ananya',
      last_name: 'Gupta',
      display_name: 'Ananya Gupta',
      grade: '8',
      section: 'A',
      roll_number: '804',
      house: 'Topaz',
      guardian_name: 'Meenakshi Gupta',
      guardian_id: 'c1000000-0000-4000-8000-000000000004',
      relationship: 'Mother',
      created_at: new Date().toISOString(),
    },
    {
      id: CANONICAL_KABIR_STUDENT_ID,
      first_name: 'Kabir',
      last_name: 'Khan',
      display_name: 'Kabir Khan',
      grade: '8',
      section: 'A',
      roll_number: '805',
      house: 'Ruby',
      guardian_name: 'Farhan Khan',
      guardian_id: 'c1000000-0000-4000-8000-000000000005',
      relationship: 'Father',
      created_at: new Date().toISOString(),
    },
  ];
}

if (!globalThis.__SHIKSHASETU_MASTER_PARENTS__) {
  globalThis.__SHIKSHASETU_MASTER_PARENTS__ = [
    {
      id: CANONICAL_GUARDIAN_ID,
      first_name: 'Sunita',
      last_name: 'Sharma',
      display_name: 'Sunita Sharma',
      phone: '+91 98765 43210',
      email: 'sunita.sharma@example.com',
      relationship: 'Mother',
      linked_students: [{ id: CANONICAL_STUDENT_ID, name: 'Aarav Sharma', grade: '8', section: 'A' }],
    },
    {
      id: CANONICAL_RAJESH_GUARDIAN_ID,
      first_name: 'Rajesh',
      last_name: 'Patel',
      display_name: 'Rajesh Patel',
      phone: '+91 98765 43211',
      email: 'rajesh.patel@example.com',
      relationship: 'Father',
      linked_students: [{ id: CANONICAL_PRIYA_STUDENT_ID, name: 'Priya Patel', grade: '8', section: 'A' }],
    },
  ];
}

if (!globalThis.__SHIKSHASETU_MASTER_TEACHERS__) {
  globalThis.__SHIKSHASETU_MASTER_TEACHERS__ = [
    {
      id: CANONICAL_TEACHER_ID,
      display_name: 'Ananya Mehra',
      subject: 'Mathematics & Science',
      grade: '8',
      section: 'A',
      email: 'ananya.mehra@shikshasetu.edu',
      phone: '+91 98765 11223',
    },
  ];
}

export async function getMasterStudentsAction(): Promise<MasterStudent[]> {
  try {
    const context = await getAuthContext('admin');
    const scopedDb = createScopedClient(context);
    const { data, error } = await scopedDb
      .from('students')
      .select('id, first_name, last_name, display_name, grade, section, roll_number, house, created_at')
      .order('roll_number', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((s: any) => ({
        ...s,
        guardian_name: s.display_name === 'Aarav Sharma' ? 'Sunita Sharma' : s.display_name === 'Priya Patel' ? 'Rajesh Patel' : 'Guardian',
        relationship: s.display_name === 'Aarav Sharma' ? 'Mother' : 'Father',
      }));
    }
  } catch {
    // Database fallback
  }

  return globalThis.__SHIKSHASETU_MASTER_STUDENTS__ || [];
}

export async function saveMasterStudentAction(student: Partial<MasterStudent>): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getAuthContext('admin');
    const scopedDb = createScopedClient(context);

    if (student.id) {
      // Update
      await scopedDb
        .from('students')
        .update({
          first_name: student.first_name,
          last_name: student.last_name,
          display_name: student.display_name || `${student.first_name} ${student.last_name}`.trim(),
          grade: student.grade,
          section: student.section,
          roll_number: student.roll_number,
        })
        .eq('id', student.id);
    } else {
      // Insert
      const newId = `b1000000-0000-4000-8000-${String(Date.now()).slice(-12)}`;
      await scopedDb.from('students').insert({
        id: newId,
        first_name: student.first_name,
        last_name: student.last_name,
        display_name: student.display_name || `${student.first_name} ${student.last_name}`.trim(),
        grade: student.grade || '8',
        section: student.section || 'A',
        roll_number: student.roll_number || '806',
        school_id: CANONICAL_SCHOOL_ID,
      });
    }
  } catch {
    // In-memory fallback
  }

  // Update in-memory master state
  const list = globalThis.__SHIKSHASETU_MASTER_STUDENTS__ || [];
  if (student.id) {
    const idx = list.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...student } as MasterStudent;
    }
  } else {
    const newStudent: MasterStudent = {
      id: `b1000000-0000-4000-8000-${String(Date.now()).slice(-12)}`,
      first_name: student.first_name || 'New',
      last_name: student.last_name || 'Student',
      display_name: student.display_name || `${student.first_name || 'New'} ${student.last_name || 'Student'}`.trim(),
      grade: student.grade || '8',
      section: student.section || 'A',
      roll_number: student.roll_number || '806',
      house: student.house || 'Ruby',
      guardian_name: student.guardian_name || null,
      relationship: student.relationship || 'Guardian',
      created_at: new Date().toISOString(),
    };
    list.push(newStudent);
  }

  try {
    revalidatePath('/admin');
    revalidatePath('/teacher');
  } catch {
    // Revalidation is active during HTTP requests
  }
  return { success: true };
}

export async function getMasterParentsAction(): Promise<MasterParent[]> {
  return globalThis.__SHIKSHASETU_MASTER_PARENTS__ || [];
}

export async function linkStudentToParentAction(
  studentId: string,
  guardianId: string,
  relationship: string = 'Mother'
): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getAuthContext('admin');
    const scopedDb = createScopedClient(context);

    await scopedDb.from('student_guardians').upsert({
      student_id: studentId,
      guardian_id: guardianId,
      relationship,
    });
  } catch {
    // In-memory fallback
  }

  // Update in-memory links
  const students = globalThis.__SHIKSHASETU_MASTER_STUDENTS__ || [];
  const parents = globalThis.__SHIKSHASETU_MASTER_PARENTS__ || [];

  const student = students.find(s => s.id === studentId);
  const parent = parents.find(p => p.id === guardianId);

  if (student && parent) {
    student.guardian_id = parent.id;
    student.guardian_name = parent.display_name;
    student.relationship = relationship;

    if (!parent.linked_students.some(s => s.id === student.id)) {
      parent.linked_students.push({
        id: student.id,
        name: student.display_name,
        grade: student.grade,
        section: student.section,
      });
    }
  }

  try {
    revalidatePath('/admin');
    revalidatePath('/parent');
  } catch {
    // Revalidation is active during HTTP requests
  }
  return { success: true };
}

export async function getMasterTeachersAction(): Promise<MasterTeacher[]> {
  return globalThis.__SHIKSHASETU_MASTER_TEACHERS__ || [];
}

export async function getMasterClassesAction(): Promise<MasterClass[]> {
  return [
    { id: 'cls-8a', grade: '8', section: 'A', class_teacher_name: 'Ananya Mehra', total_students: 15 },
    { id: 'cls-8b', grade: '8', section: 'B', class_teacher_name: 'Vikram Seth', total_students: 14 },
    { id: 'cls-9a', grade: '9', section: 'A', class_teacher_name: 'Pooja Sharma', total_students: 16 },
    { id: 'cls-10a', grade: '10', section: 'A', class_teacher_name: 'Ramesh Gupta', total_students: 18 },
  ];
}
