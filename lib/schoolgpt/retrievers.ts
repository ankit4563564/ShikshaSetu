import { createAdminClient } from '@/lib/supabase/admin';

const adminDb = createAdminClient();

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function dayOfWeekName(day: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[day] || 'Unknown';
}

export async function retrieveAttendance(studentId: string) {
  const { data, error } = await adminDb
    .from('attendance')
    .select('date, status')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .limit(60);

  if (error || !data) return 'Could not fetch attendance data.';

  const total = data.length;
  const present = data.filter((r: any) => r.status === 'present').length;
  const absent = data.filter((r: any) => r.status === 'absent').length;
  const late = data.filter((r: any) => r.status === 'late').length;
  const excused = data.filter((r: any) => r.status === 'excused').length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return `Attendance records for last ${total} days: Present ${present}, Absent ${absent}, Late ${late}, Excused ${excused}. Overall attendance rate: ${pct}%.`;
}

export async function retrieveAttendanceTrends() {
  const { data, error } = await adminDb
    .from('attendance')
    .select('date, status')
    .order('date', { ascending: false })
    .limit(200);

  if (error || !data || data.length === 0) return 'No attendance data available for trend analysis.';

  const present = data.filter((r: any) => r.status === 'present').length;
  const absent = data.filter((r: any) => r.status === 'absent').length;
  const total = data.length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return `School-wide attendance rate: ${rate}% (${present} present, ${absent} absent out of ${total} records).`;
}

export async function retrieveHomework(studentId: string) {
  console.log('[SchoolGPT Retriever] Querying homework for studentId:', studentId);
  
  const { data, error } = await adminDb
    .from('homework')
    .select('subject, title, due_date, is_submitted')
    .eq('student_id', studentId)
    .order('due_date', { ascending: false })
    .limit(20);

  console.log('[SchoolGPT Retriever] Homework query result:', { error, recordCount: data?.length || 0 });

  if (error || !data || data.length === 0) return 'No homework records found.';

  const pending = data.filter((h: any) => !h.is_submitted);
  const submitted = data.filter((h: any) => h.is_submitted);
  const total = data.length;
  
  console.log('[SchoolGPT Retriever] Homework stats:', { total, submitted: submitted.length, pending: pending.length });
  
  const lines = data.slice(0, 10).map((h: any) =>
    `${h.is_submitted ? '✓' : '○'} ${h.subject}: ${h.title} (due ${h.due_date})`
  );

  return `Homework Summary\n• Total assignments: ${total}\n• Completed: ${submitted.length}\n• Pending: ${pending.length}\n\nRecent assignments:\n${lines.join('\n')}`;
}

export async function retrieveTimetable(classGrade: string, classSection?: string) {
  const today = new Date().getDay() - 1;
  const dayFilter = today >= 0 && today <= 4 ? today : 0;

  const { data, error } = await adminDb
    .from('timetable')
    .select('day_of_week, period_number, subject, start_time, end_time, room')
    .eq('class_grade', classGrade)
    .eq(classSection ? 'class_section' : 'class_section', classSection || 'A')
    .order('day_of_week')
    .order('period_number');

  if (error || !data || data.length === 0) return 'Timetable information is not available for this class.';

  const todayClasses = data.filter((r: any) => r.day_of_week === dayFilter);
  if (todayClasses.length > 0) {
    const lines = todayClasses.map((p: any) =>
      `Period ${p.period_number}: ${p.subject} (${p.start_time?.slice(0, 5)}-${p.end_time?.slice(0, 5)}) Room ${p.room || 'N/A'}`
    );
    return `Today's schedule (${dayOfWeekName(dayFilter)}) for Grade ${classGrade}${classSection || ''}:\n${lines.join('\n')}`;
  }

  const allLines = data
    .filter((r: any) => r.day_of_week >= 0 && r.day_of_week <= 4)
    .map((r: any) =>
      `${dayOfWeekName(r.day_of_week)} Period ${r.period_number}: ${r.subject} (${r.start_time?.slice(0, 5)}-${r.end_time?.slice(0, 5)}) Room ${r.room || 'N/A'}`
    );

  if (allLines.length === 0) return 'No timetable entries found.';
  return `Full timetable for Grade ${classGrade}${classSection || ''}:\n${allLines.join('\n')}`;
}

export async function retrieveClubs(studentId?: string) {
  if (studentId) {
    const { data, error } = await adminDb
      .from('club_members')
      .select('clubs(id, name, description, meeting_day, meeting_time, meeting_location)')
      .eq('student_id', studentId);

    if (error || !data || data.length === 0) return 'You are not enrolled in any clubs.';

    const clubs = data
      .map((cm: any) => cm.clubs)
      .filter(Boolean)
      .map((c: any) =>
        `• ${c.name}${c.meeting_day != null ? ` - ${dayOfWeekName(c.meeting_day)}${c.meeting_time ? ` at ${c.meeting_time.slice(0, 5)}` : ''}` : ''}${c.meeting_location ? ` in ${c.meeting_location}` : ''}${c.description ? ` (${c.description})` : ''}`
      );

    return `Your clubs:\n${clubs.join('\n')}`;
  }

  const { data, error } = await adminDb
    .from('clubs')
    .select('id, name, description, meeting_day, meeting_time, meeting_location, teacher_id')
    .eq('is_active', true);

  if (error || !data || data.length === 0) return 'No active clubs found.';

  const lines = data.map((c: any) =>
    `• ${c.name}${c.meeting_day != null ? ` - ${dayOfWeekName(c.meeting_day)}${c.meeting_time ? ` at ${c.meeting_time.slice(0, 5)}` : ''}` : ''}${c.meeting_location ? ` in ${c.meeting_location}` : ''}`
  );

  return `Active clubs:\n${lines.join('\n')}`;
}

export async function retrieveTeachers(classGrade?: string) {
  let query = adminDb.from('teachers').select('id, first_name, last_name, email, subjects, is_class_teacher');

  if (classGrade) {
    const { data: students, error: stuErr } = await adminDb
      .from('students')
      .select('class_teacher_id')
      .eq('grade', classGrade)
      .limit(1);

    if (!stuErr && students && students.length > 0) {
      query = query.eq('id', students[0].class_teacher_id);
    }
  }

  const { data, error } = await query.order('first_name');

  if (error || !data || data.length === 0) return 'No teachers found.';

  const lines = data.map((t: any) =>
    `• ${t.first_name} ${t.last_name}${t.subjects?.length ? ` (${t.subjects.join(', ')})` : ''}${t.is_class_teacher ? ' — Class Teacher' : ''}`
  );

  return `Teachers:\n${lines.join('\n')}`;
}

export async function retrieveStudentNeedingAttention(teacherId: string) {
  const { data: flags, error } = await adminDb
    .from('status_flags')
    .select('student_id, status, created_at')
    .eq('action_status', 'unseen')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !flags || flags.length === 0) return 'No students currently needing attention.';

  const studentIds = [...new Set(flags.map((f: any) => f.student_id))];
  const { data: students } = await adminDb
    .from('students')
    .select('id, display_name, grade, section')
    .in('id', studentIds);

  const studentMap = new Map((students || []).map((s: any) => [s.id, s]));

  const lines = flags.slice(0, 10).map((f: any) => {
    const s = studentMap.get(f.student_id) as any;
    return `• ${s?.display_name || 'Unknown'} (Grade ${s?.grade || '?'}${s?.section || ''}) — ${f.status}`;
  });

  return `Students needing attention (${studentIds.length} total):\n${lines.join('\n')}`;
}

export async function retrieveEvents() {
  const today = todayDate();

  const { data, error } = await adminDb
    .from('school_calendar')
    .select('name, type, start_date, end_date, description')
    .gte('end_date', today)
    .order('start_date')
    .limit(10);

  if (!error && data && data.length > 0) {
    const lines = data.map((e: any) =>
      `• ${e.name} (${e.type}) — ${e.start_date} to ${e.end_date}${e.description ? `: ${e.description}` : ''}`
    );
    return `Upcoming events:\n${lines.join('\n')}`;
  }

  const { data: allEvents } = await adminDb
    .from('school_calendar')
    .select('name, type, start_date, end_date, description')
    .order('start_date', { ascending: false })
    .limit(10);

  if (!allEvents || allEvents.length === 0) return 'No school events found.';

  const lines = allEvents.map((e: any) =>
    `• ${e.name} (${e.type}) — ${e.start_date} to ${e.end_date}${e.description ? `: ${e.description}` : ''}`
  );

  return `School events:\n${lines.join('\n')}`;
}

export async function retrieveBus(studentId: string) {
  const { data: student } = await adminDb
    .from('students')
    .select('id')
    .eq('id', studentId)
    .single();

  if (!student) return 'Student not found.';

  const { data: stopAssignments } = await adminDb
    .from('student_stops')
    .select('stop_id')
    .eq('student_id', studentId);

  if (!stopAssignments || stopAssignments.length === 0) return 'No bus stop assigned for this student.';

  const stopIds = stopAssignments.map((s: any) => s.stop_id);
  const { data: stops } = await adminDb
    .from('bus_stops')
    .select('stop_name, bus_identifier, arrival_time')
    .in('id', stopIds)
    .order('stop_order');

  if (!stops || stops.length === 0) return 'Bus stop information not found.';

  const lines = stops.map((s: any) =>
    `• ${s.stop_name} (Bus ${s.bus_identifier}) — pickup at ${s.arrival_time?.slice(0, 5)}`
  );

  return `Bus information:\n${lines.join('\n')}`;
}

export async function retrieveExams(studentId?: string, classGrade?: string) {
  if (studentId) {
    const { data, error } = await adminDb
      .from('grades')
      .select('subject, assessment_name, score, max_score, assessment_date')
      .eq('student_id', studentId)
      .order('assessment_date', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) return 'No exam or grade data available.';

    const lines = data.map((g: any) =>
      `• ${g.subject}: ${g.assessment_name} — ${g.score}/${g.max_score} (${Math.round((g.score / g.max_score) * 100)}%) on ${g.assessment_date}`
    );

    return `Exam results (last ${data.length}):\n${lines.join('\n')}`;
  }

  if (classGrade) {
    const { data, error } = await adminDb
      .from('exams')
      .select('subject, exam_name, exam_date, is_published')
      .eq('class_grade', classGrade)
      .order('exam_date', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) return 'No exams found for this grade.';

    const lines = data.map((e: any) =>
      `• ${e.exam_name} — ${e.subject} on ${e.exam_date}${e.is_published ? ' (Published)' : ' (Not yet published)'}`
    );

    return `Exams for Grade ${classGrade}:\n${lines.join('\n')}`;
  }

  const { data, error } = await adminDb
    .from('exams')
    .select('subject, exam_name, exam_date, class_grade, is_published')
    .order('exam_date', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) return 'No exams found.';

  const lines = data.map((e: any) =>
    `• ${e.exam_name} — ${e.subject} (Grade ${e.class_grade}) on ${e.exam_date}`
  );

  return `Recent exams:\n${lines.join('\n')}`;
}

export async function retrieveNotices() {
  const { data, error } = await adminDb
    .from('notices')
    .select('title, body, posted_at, expires_at, target_audience')
    .order('posted_at', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) return 'No notices have been posted.';

  const lines = data.map((n: any) =>
    `• ${n.title}${n.body ? `: ${n.body.length > 150 ? n.body.slice(0, 150) + '…' : n.body}` : ''}`
  );

  return `Recent notices:\n${lines.join('\n')}`;
}

export async function retrieveLibrary() {
  const { data, error } = await adminDb
    .from('library_books')
    .select('title, author, category, total_copies, available_copies')
    .order('title')
    .limit(20);

  if (error || !data || data.length === 0) return 'No library books found in the system.';

  const lines = data.map((b: any) =>
    `• ${b.title} by ${b.author}${b.category ? ` [${b.category}]` : ''} — ${b.available_copies}/${b.total_copies} available`
  );

  return `Library inventory:\n${lines.join('\n')}`;
}

export async function retrieveRules() {
  const { data, error } = await adminDb
    .from('school_rules')
    .select('category, title, content')
    .eq('is_active', true)
    .order('category')
    .order('title');

  if (error || !data || data.length === 0) return 'No school rules found in the system.';

  const byCategory: Record<string, string[]> = {};
  for (const rule of data) {
    if (!byCategory[rule.category]) byCategory[rule.category] = [];
    byCategory[rule.category].push(`• ${rule.title}: ${rule.content.length > 200 ? rule.content.slice(0, 200) + '…' : rule.content}`);
  }

  const lines = Object.entries(byCategory).map(([cat, rules]) =>
    `[${cat}]\n${rules.join('\n')}`
  );

  return `School rules:\n${lines.join('\n\n')}`;
}

export async function retrieveStudentPerformance(studentId: string) {
  const parts: string[] = [];

  const att = await retrieveAttendance(studentId);
  parts.push(att);

  const hw = await retrieveHomework(studentId);
  parts.push(hw);

  const exams = await retrieveExams(studentId);
  if (exams !== 'No exam or grade data available.') parts.push(exams);

  return parts.join('\n\n');
}
