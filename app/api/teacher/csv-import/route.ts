import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';

interface CsvRow {
  [key: string]: string;
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const context = await getAuthContext();
    const scopedDb = createScopedClient(context);

    const body = await request.json();
    const { data, importType } = body as {
      data: CsvRow[];
      importType: 'students' | 'teachers' | 'guardians' | 'attendance';
    };

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'CSV file contains no data rows' }, { status: 400 });
    }

    let successCount = 0;
    let warningCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    // ── 1. STUDENTS BULK IMPORT ──
    if (importType === 'students') {
      requirePermission(context, 'users:manage');

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const displayName = row['Name'] || row['display_name'] || row['Student Name'] || row['student_name'];
        const grade = row['Grade'] || row['grade'] || '8';
        const section = row['Section'] || row['section'] || 'A';
        const rollNumber = row['Roll Number'] || row['roll_number'] || row['Roll'] || `${i + 1}`;
        const house = row['House'] || row['house'] || null;

        if (!displayName || !displayName.trim()) {
          failedCount++;
          errors.push(`Row ${i + 1}: Missing student name`);
          continue;
        }

        // Duplicate check on roll number within same grade & section
        const { data: existing } = await scopedDb
          .from('students')
          .select('id')
          .eq('grade', grade)
          .eq('section', section)
          .eq('roll_number', rollNumber)
          .maybeSingle();

        if (existing) {
          // Update existing student
          const { error: updateError } = await scopedDb
            .from('students')
            .update({ display_name: displayName.trim(), house })
            .eq('id', existing.id);

          if (updateError) {
            failedCount++;
            errors.push(`Row ${i + 1} (${displayName}): ${updateError.message}`);
          } else {
            successCount++;
            warningCount++;
            warnings.push(`Row ${i + 1}: Updated existing student (Roll #${rollNumber})`);
          }
        } else {
          // Insert new student
          const { error: insertError } = await scopedDb
            .from('students')
            .insert({
              display_name: displayName.trim(),
              grade,
              section,
              roll_number: rollNumber,
              house,
              school_id: context.schoolId,
            });

          if (insertError) {
            failedCount++;
            errors.push(`Row ${i + 1} (${displayName}): ${insertError.message}`);
          } else {
            successCount++;
          }
        }
      }

      await recordEcosystemEvent(scopedDb, {
        eventType: 'academic_records_imported',
        actorId: context.userId,
        actorRole: (context.role === 'principal' ? 'admin' : context.role) as any,
        title: 'Bulk Students Roster Imported',
        body: `Imported ${successCount} students successfully.`,
        metadata: { successCount, warningCount, failedCount },
      });
    }

    // ── 2. TEACHERS BULK IMPORT ──
    else if (importType === 'teachers') {
      requirePermission(context, 'users:manage');

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const name = row['Name'] || row['name'] || row['Teacher Name'];
        const email = row['Email'] || row['email'];
        const subject = row['Subject'] || row['subject'] || row['Specialization'] || 'General';

        if (!name || !name.trim()) {
          failedCount++;
          errors.push(`Row ${i + 1}: Missing teacher name`);
          continue;
        }

        const { error: insertError } = await scopedDb
          .from('teachers')
          .insert({
            name: name.trim(),
            email: email ? email.trim().toLowerCase() : null,
            subject_specialization: subject,
            school_id: context.schoolId,
          });

        if (insertError) {
          failedCount++;
          errors.push(`Row ${i + 1} (${name}): ${insertError.message}`);
        } else {
          successCount++;
        }
      }
    }

    // ── 3. GUARDIANS BULK IMPORT ──
    else if (importType === 'guardians') {
      requirePermission(context, 'users:manage');

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const guardianName = row['Guardian Name'] || row['guardian_name'] || row['Name'];
        const phone = row['Phone'] || row['phone'] || row['Mobile'];
        const studentName = row['Student Name'] || row['student_name'];
        const relationship = row['Relationship'] || row['relationship'] || 'parent';

        if (!guardianName || !guardianName.trim()) {
          failedCount++;
          errors.push(`Row ${i + 1}: Missing guardian name`);
          continue;
        }

        // Insert or find guardian
        const { data: guardian, error: gError } = await scopedDb
          .from('guardians')
          .insert({
            name: guardianName.trim(),
            phone: phone ? phone.trim() : null,
            school_id: context.schoolId,
          })
          .select('id')
          .single();

        if (gError || !guardian) {
          failedCount++;
          errors.push(`Row ${i + 1} (${guardianName}): ${gError?.message || 'Failed to create guardian'}`);
          continue;
        }

        successCount++;

        // Link to student if student name provided
        if (studentName) {
          const { data: student } = await scopedDb
            .from('students')
            .select('id')
            .ilike('display_name', `%${studentName.trim()}%`)
            .maybeSingle();

          if (student) {
            try {
              await scopedDb
                .from('guardian_access')
                .insert({
                  student_id: student.id,
                  guardian_id: guardian.id,
                  relationship,
                  can_pickup: true,
                });
            } catch {}
          }
        }
      }
    }

    // ── 4. ATTENDANCE BULK IMPORT ──
    else if (importType === 'attendance') {
      requirePermission(context, 'attendance:write');

      const { data: students } = await scopedDb.from('students').select('id, display_name');
      const studentNameMap = new Map<string, string>();
      (students || []).forEach((student: any) => {
        studentNameMap.set((student.display_name || '').toLowerCase(), student.id);
      });

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const studentName = (row['Student Name'] || row['student_name'] || row['Name'])?.trim();
        if (!studentName) {
          failedCount++;
          errors.push(`Row ${i + 1}: Missing student name`);
          continue;
        }

        const studentId = studentNameMap.get(studentName.toLowerCase());
        if (!studentId) {
          failedCount++;
          errors.push(`Row ${i + 1}: Student not found (${studentName})`);
          continue;
        }

        const date = row['Date'] || row['date'] || new Date().toISOString().split('T')[0];
        const statusStr = (row['Status'] || row['status'] || 'present').toLowerCase();
        const status = statusStr.includes('absent') || statusStr === 'a' ? 'absent' : statusStr.includes('late') ? 'late' : 'present';

        const { error: attError } = await scopedDb.from('attendance').insert({
          student_id: studentId,
          date,
          status,
          marked_by: context.userId,
        });

        if (attError) {
          failedCount++;
          errors.push(`Row ${i + 1} (${studentName}): ${attError.message}`);
        } else {
          successCount++;
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/teacher');

    return NextResponse.json({
      success: true,
      importType,
      successCount,
      warningCount,
      failedCount,
      warnings: warnings.slice(0, 10),
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'CSV import failed' }, { status: 500 });
  }
}
