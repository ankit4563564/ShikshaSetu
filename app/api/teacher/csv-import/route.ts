import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';
import { requireRole } from '@/lib/auth/routeGuard';

interface CsvRow {
  [key: string]: string;
}

interface ColumnMapping {
  studentName: string;
  date?: string;
  presentAbsent?: string;
  subject?: string;
  score?: string;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['teacher', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { data, mapping, importType } = body as {
      data: CsvRow[];
      mapping: ColumnMapping;
      importType: 'attendance' | 'grades';
    };
    const teacherId = auth.roleId;

    const supabase = createClient();

    // Fetch all students to map names to IDs
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, display_name')
      .eq('class_teacher_id', teacherId);

    if (studentsError || !students) {
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    // Create name-to-ID mapping
    const studentNameMap = new Map<string, string>();
    students.forEach((student) => {
      studentNameMap.set(student.display_name.toLowerCase(), student.id);
      // Also map first name for flexibility
      const firstName = student.display_name.split(' ')[0].toLowerCase();
      studentNameMap.set(firstName, student.id);
    });

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const affectedStudentIds = new Set<string>();

    if (importType === 'attendance') {
      // Process attendance import
      for (const row of data) {
        try {
          const studentName = row[mapping.studentName]?.trim();
          if (!studentName) {
            failedCount++;
            errors.push(`Missing student name in row`);
            continue;
          }

          const studentId = studentNameMap.get(studentName.toLowerCase());
          if (!studentId) {
            failedCount++;
            errors.push(`Student not found: ${studentName}`);
            continue;
          }

          const date = mapping.date ? row[mapping.date] : new Date().toISOString().split('T')[0];
          const status = mapping.presentAbsent ? row[mapping.presentAbsent]?.toLowerCase() : 'present';
          
          // Normalize status
          let normalizedStatus: 'present' | 'absent' | 'late' = 'present';
          if (status.includes('absent') || status === 'a') {
            normalizedStatus = 'absent';
          } else if (status.includes('late') || status === 'l') {
            normalizedStatus = 'late';
          }

          // Check if record already exists
          const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .eq('student_id', studentId)
            .eq('date', date)
            .maybeSingle();

          if (existing) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('attendance')
              .update({
                status: normalizedStatus,
                marked_by: teacherId,
                marked_at: new Date().toISOString(),
              })
              .eq('id', existing.id);

            if (updateError) throw updateError;
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('attendance')
              .insert({
                student_id: studentId,
                date,
                status: normalizedStatus,
                marked_by: teacherId,
                marked_at: new Date().toISOString(),
              });

            if (insertError) throw insertError;
          }

          successCount++;
          affectedStudentIds.add(studentId);
        } catch (err: any) {
          failedCount++;
          errors.push(`Row processing error: ${err.message}`);
        }
      }
    } else if (importType === 'grades') {
      // Process grades import
      for (const row of data) {
        try {
          const studentName = row[mapping.studentName]?.trim();
          if (!studentName) {
            failedCount++;
            errors.push(`Missing student name in row`);
            continue;
          }

          const studentId = studentNameMap.get(studentName.toLowerCase());
          if (!studentId) {
            failedCount++;
            errors.push(`Student not found: ${studentName}`);
            continue;
          }

          if (!mapping.subject || !mapping.score) {
            failedCount++;
            errors.push(`Missing subject or score mapping`);
            continue;
          }

          const subject = row[mapping.subject]?.trim();
          const scoreStr = row[mapping.score]?.trim();
          const date = mapping.date ? row[mapping.date] : new Date().toISOString().split('T')[0];

          if (!subject || !scoreStr) {
            failedCount++;
            errors.push(`Missing subject or score in row`);
            continue;
          }

          const score = parseFloat(scoreStr);
          if (isNaN(score)) {
            failedCount++;
            errors.push(`Invalid score: ${scoreStr}`);
            continue;
          }

          // Insert grade record
          const { error: insertError } = await supabase
            .from('grades')
            .insert({
              student_id: studentId,
              subject,
              assessment_name: `CSV Import - ${date}`,
              score,
              max_score: 100, // Default max score
              assessment_date: date,
              recorded_by: teacherId,
            });

          if (insertError) throw insertError;

          successCount++;
          affectedStudentIds.add(studentId);
        } catch (err: any) {
          failedCount++;
          errors.push(`Row processing error: ${err.message}`);
        }
      }
    }

    await recordEcosystemEvent(supabase, {
      eventType: 'academic_records_imported',
      actorId: teacherId,
      actorRole: 'teacher',
      title: `${importType === 'attendance' ? 'Attendance' : 'Grade'} records imported`,
      body: `${successCount} records imported, ${failedCount} failed.`,
      metadata: {
        importType,
        successCount,
        failedCount,
        affectedStudentIds: Array.from(affectedStudentIds),
      },
    });

    // Revalidate every existing module that reads student status derived from
    // attendance/grade data.
    revalidatePath('/teacher');
    revalidatePath('/parent');
    revalidatePath('/student');
    revalidatePath('/admin');

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error: any) {
    console.error('[CSV Import] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
