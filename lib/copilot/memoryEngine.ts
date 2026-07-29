/**
 * School Memory Engine — ShikshaSetu
 * Core Principle: "Every interaction becomes institutional knowledge."
 *
 * Provides historical pattern matching, longitudinal student memory,
 * and evidence-based intervention success metrics from real database records.
 */

import { createClient } from '@/lib/supabase/client';

export interface HistoricalCase {
  id: string;
  pattern: string;
  count: number;
  interventions: {
    name: string;
    successRate: number;
    description: string;
  }[];
  recommendedApproach: string;
}

export interface StudentLongitudinalMemory {
  studentId: string;
  studentName: string;
  timeline: {
    month: string;
    event: string;
    type: 'positive' | 'challenge' | 'milestone';
  }[];
  institutionalInsight: string;
  independenceTrend: string;
}

/**
 * Query School Memory for historical case evidence from database
 */
export async function getSchoolMemoryEvidence(signalType?: string): Promise<HistoricalCase> {
  const supabase = createClient();

  try {
    // Query past interventions with similar signal types
    const { data: interventions, error } = await supabase
      .from('interventions')
      .select('*, students(first_name, last_name, display_name)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !interventions) {
      // Return fallback data on error
      return {
        id: 'case_hw_drop_01',
        pattern: 'No historical data available',
        count: 0,
        interventions: [],
        recommendedApproach: 'No sufficient historical data for this pattern.',
      };
    }

    // Filter by signal type if provided
    const filteredInterventions = signalType 
      ? interventions.filter(inv => inv.signal_type === signalType)
      : interventions;

    // Calculate success rates by intervention type
    const interventionTypes = new Map<string, { count: number; completed: number }>();
    filteredInterventions.forEach(inv => {
      const type = inv.signal_type || 'unknown';
      if (!interventionTypes.has(type)) {
        interventionTypes.set(type, { count: 0, completed: 0 });
      }
      const stats = interventionTypes.get(type)!;
      stats.count++;
      if (inv.status === 'completed') stats.completed++;
    });

    // Build interventions array
    const interventionsData = Array.from(interventionTypes.entries()).map(([name, stats]) => ({
      name,
      successRate: stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0,
      description: `${stats.completed} of ${stats.count} similar cases resolved successfully.`,
    }));

    return {
      id: 'case_' + (signalType || 'general'),
      pattern: signalType || 'General intervention patterns',
      count: filteredInterventions.length,
      interventions: interventionsData,
      recommendedApproach: interventionsData.length > 0 
        ? `Based on ${filteredInterventions.length} historical cases, most successful approach: ${interventionsData[0].name}`
        : 'No sufficient historical data for this pattern.',
    };
  } catch (error) {
    console.error('Failed to fetch school memory evidence:', error);
    return {
      id: 'case_error',
      pattern: 'Error loading historical data',
      count: 0,
      interventions: [],
      recommendedApproach: 'Failed to load historical data.',
    };
  }
}

/**
 * Query School Memory for longitudinal student history from database
 */
export async function getStudentLongitudinalMemory(studentId: string): Promise<StudentLongitudinalMemory> {
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

    // Get intervention history
    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (interventionsError) throw interventionsError;

    // Convert to timeline format
    const timeline = (interventions || []).map(inv => {
      const date = new Date(inv.created_at);
      const month = date.toLocaleString('default', { month: 'long' });
      const type = inv.status === 'completed' ? 'milestone' : 'challenge';
      return {
        month,
        event: inv.title || 'Support intervention',
        type,
      };
    });

    // Get ecosystem events for pattern analysis
    const { data: events } = await supabase
      .from('ecosystem_events')
      .select('event_type, title')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Extract insights from events
    const taskCompletedCount = events?.filter(e => e.event_type === 'task_completed').length || 0;
    const interventionApprovedCount = events?.filter(e => e.event_type === 'intervention_approved').length || 0;

    const institutionalInsight = taskCompletedCount > 3 
      ? 'Student consistently follows through on assigned tasks and responds well to structured interventions.'
      : interventionApprovedCount > 0 
      ? 'Student has received support interventions - tracking response patterns.'
      : 'No significant intervention history yet.';

    const independenceTrend = taskCompletedCount > 5
      ? 'Student shows strong independence in completing tasks without reminders.'
      : 'Student may benefit from additional support structure.';

    return {
      studentId,
      studentName: student.display_name || `${student.first_name} ${student.last_name}`,
      timeline,
      institutionalInsight,
      independenceTrend,
    };
  } catch (error) {
    console.error('Failed to fetch student longitudinal memory:', error);
    // Return fallback data on error
    return {
      studentId,
      studentName: 'Unknown Student',
      timeline: [],
      institutionalInsight: 'Unable to load institutional insights.',
      independenceTrend: 'Unable to determine independence trend.',
    };
  }
}
