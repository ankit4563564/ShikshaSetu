/**
 * Performance Analytics
 * 
 * Provides longitudinal performance data for students.
 * Pulls real data from grades, attendance, and homework tables.
 */

import { createClient } from '@/lib/supabase/client';

export interface PerformanceDataPoint {
  date: string;
  attendanceRate: number;
  homeworkCompletionRate: number;
  averageGrade: number;
}

export interface LongitudinalPerformance {
  studentId: string;
  studentName: string;
  data: PerformanceDataPoint[];
  trends: {
    attendance: 'improving' | 'stable' | 'declining';
    homework: 'improving' | 'stable' | 'declining';
    grades: 'improving' | 'stable' | 'declining';
  };
}

/**
 * Get longitudinal performance data for a student
 */
export async function getLongitudinalPerformance(studentId: string, days: number = 90): Promise<LongitudinalPerformance> {
  const supabase = createClient();

  try {
    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('first_name, last_name, display_name')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      throw new Error('Student not found');
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get attendance data
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (attendanceError) throw attendanceError;

    // Get homework data
    const { data: homework, error: homeworkError } = await supabase
      .from('homework')
      .select('due_date, is_submitted')
      .eq('student_id', studentId)
      .gte('due_date', startDate)
      .order('due_date', { ascending: true });

    if (homeworkError) throw homeworkError;

    // Get grades data
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('assessment_date, score, max_score')
      .eq('student_id', studentId)
      .gte('assessment_date', startDate)
      .order('assessment_date', { ascending: true });

    if (gradesError) throw gradesError;

    // Group data by week
    const weeklyData = new Map<string, PerformanceDataPoint>();
    
    // Initialize weekly buckets
    const weeks = Math.ceil(days / 7);
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(Date.now() - (weeks - 1 - i) * 7 * 24 * 60 * 60 * 1000);
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyData.set(weekKey, {
        date: weekKey,
        attendanceRate: 0,
        homeworkCompletionRate: 0,
        averageGrade: 0,
      });
    }

    // Aggregate attendance by week
    const attendanceByWeek = new Map<string, { present: number; total: number }>();
    (attendance || []).forEach(a => {
      const weekStart = new Date(a.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!attendanceByWeek.has(weekKey)) {
        attendanceByWeek.set(weekKey, { present: 0, total: 0 });
      }
      const stats = attendanceByWeek.get(weekKey)!;
      stats.total++;
      if (a.status === 'present') stats.present++;
    });

    // Aggregate homework by week
    const homeworkByWeek = new Map<string, { submitted: number; total: number }>();
    (homework || []).forEach(h => {
      const weekStart = new Date(h.due_date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!homeworkByWeek.has(weekKey)) {
        homeworkByWeek.set(weekKey, { submitted: 0, total: 0 });
      }
      const stats = homeworkByWeek.get(weekKey)!;
      stats.total++;
      if (h.is_submitted) stats.submitted++;
    });

    // Aggregate grades by week
    const gradesByWeek = new Map<string, { scores: number[] }>();
    (grades || []).forEach(g => {
      const weekStart = new Date(g.assessment_date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!gradesByWeek.has(weekKey)) {
        gradesByWeek.set(weekKey, { scores: [] });
      }
      const stats = gradesByWeek.get(weekKey)!;
      stats.scores.push((g.score / g.max_score) * 100);
    });

    // Build final data points
    const dataPoints: PerformanceDataPoint[] = [];
    weeklyData.forEach((point, weekKey) => {
      const attStats = attendanceByWeek.get(weekKey);
      const hwStats = homeworkByWeek.get(weekKey);
      const gradeStats = gradesByWeek.get(weekKey);

      dataPoints.push({
        date: weekKey,
        attendanceRate: attStats ? (attStats.present / attStats.total) * 100 : 0,
        homeworkCompletionRate: hwStats ? (hwStats.submitted / hwStats.total) * 100 : 0,
        averageGrade: gradeStats && gradeStats.scores.length > 0 
          ? gradeStats.scores.reduce((a, b) => a + b, 0) / gradeStats.scores.length 
          : 0,
      });
    });

    // Calculate trends
    const recentData = dataPoints.slice(-4);
    const olderData = dataPoints.slice(0, -4);
    
    const avgRecent = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    const recentAttendance = avgRecent(recentData.map(d => d.attendanceRate));
    const olderAttendance = olderData.length > 0 ? avgRecent(olderData.map(d => d.attendanceRate)) : recentAttendance;
    
    const recentHomework = avgRecent(recentData.map(d => d.homeworkCompletionRate));
    const olderHomework = olderData.length > 0 ? avgRecent(olderData.map(d => d.homeworkCompletionRate)) : recentHomework;
    
    const recentGrades = avgRecent(recentData.map(d => d.averageGrade));
    const olderGrades = olderData.length > 0 ? avgRecent(olderData.map(d => d.averageGrade)) : recentGrades;

    const trends = {
      attendance: recentAttendance > olderAttendance + 5 ? 'improving' : recentAttendance < olderAttendance - 5 ? 'declining' : 'stable',
      homework: recentHomework > olderHomework + 5 ? 'improving' : recentHomework < olderHomework - 5 ? 'declining' : 'stable',
      grades: recentGrades > olderGrades + 5 ? 'improving' : recentGrades < olderGrades - 5 ? 'declining' : 'stable',
    };

    return {
      studentId,
      studentName: student.display_name || `${student.first_name} ${student.last_name}`,
      data: dataPoints,
      trends,
    };
  } catch (error) {
    console.error('Failed to fetch longitudinal performance:', error);
    return {
      studentId,
      studentName: 'Unknown',
      data: [],
      trends: { attendance: 'stable', homework: 'stable', grades: 'stable' },
    };
  }
}
