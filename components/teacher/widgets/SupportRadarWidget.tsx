'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface StudentStatus {
  id: string;
  name: string;
  score: string;
  status: 'ON_TRACK' | 'WATCHING' | 'ATTENTION';
  statusColor: string;
}

interface SupportRadarWidgetProps {
  grade: string;
  section: string;
  onAskWhy: (studentName: string) => void;
  onSelectStudent?: (studentId: string) => void;
}

export default function SupportRadarWidget({ grade, section, onAskWhy, onSelectStudent }: SupportRadarWidgetProps) {
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentStatuses() {
      try {
        const supabase = createClient();
        
        // Fetch students with their status flags
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, first_name, last_name, display_name')
          .eq('grade', grade)
          .eq('section', section)
          .limit(40);

        if (studentsError) throw studentsError;

        // Fetch status flags for these students
        const studentIds = studentsData?.map(s => s.id) || [];
        const { data: statusFlags, error: flagsError } = await supabase
          .from('status_flags')
          .select('student_id, status')
          .in('student_id', studentIds)
          .is('resolved_at', null);

        if (flagsError) throw flagsError;

        // Build status map
        const statusMap = new Map();
        statusFlags?.forEach(flag => {
          statusMap.set(flag.student_id, flag.status);
        });

        // Calculate homework completion rates for scoring
        const { data: homeworkData } = await supabase
          .from('homework')
          .select('student_id, is_submitted')
          .in('student_id', studentIds)
          .gte('due_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const homeworkMap = new Map();
        homeworkData?.forEach(hw => {
          if (!homeworkMap.has(hw.student_id)) {
            homeworkMap.set(hw.student_id, { total: 0, submitted: 0 });
          }
          const stats = homeworkMap.get(hw.student_id);
          stats.total++;
          if (hw.is_submitted) stats.submitted++;
        });

        // Build student status list
        const studentStatuses: StudentStatus[] = (studentsData || []).map(student => {
          const status = statusMap.get(student.id) || 'on_track';
          const hwStats = homeworkMap.get(student.id) || { total: 1, submitted: 1 };
          const score = hwStats.total > 0 ? Math.round((hwStats.submitted / hwStats.total) * 100) : 100;

          let displayStatus: 'ON_TRACK' | 'WATCHING' | 'ATTENTION';
          let statusColor: string;

          if (status === 'needs_attention') {
            displayStatus = 'ATTENTION';
            statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
          } else if (status === 'worth_watching') {
            displayStatus = 'WATCHING';
            statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
          } else {
            displayStatus = 'ON_TRACK';
            statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
          }

          return {
            id: student.id,
            name: student.display_name || `${student.first_name} ${student.last_name}`,
            score: `${score}%`,
            status: displayStatus,
            statusColor,
          };
        });

        // Sort by severity: ATTENTION first, then WATCHING, then ON_TRACK
        const severityOrder = { 'ATTENTION': 0, 'WATCHING': 1, 'ON_TRACK': 2 };
        studentStatuses.sort((a, b) => severityOrder[a.status] - severityOrder[b.status]);

        setStudents(studentStatuses);
      } catch (error) {
        console.error('Failed to load student statuses:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStudentStatuses();
  }, []);

  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs font-body hover:shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🚨</span>
          <h3 className="font-display text-sm font-extrabold text-slate-900">Student Support Radar</h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
          {loading ? 'Loading...' : `${students.length} Students`}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-slate-400">Loading student data...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">No students found</div>
      ) : (
        <div className="space-y-2.5">
          {students.map((s) => (
            <div
              key={s.id}
              className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-[10px]">
                  {s.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{s.name}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${s.statusColor}`}>
                    {s.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onSelectStudent && (
                  <button
                    type="button"
                    onClick={() => onSelectStudent(s.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] transition-all active:scale-95 border border-indigo-200"
                  >
                    View 360
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAskWhy(`Why does ${s.name} need attention?`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] transition-all active:scale-95 shadow-2xs flex items-center gap-1"
                >
                  <span>Ask Why</span>
                  <span className="text-[10px]">✨</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
