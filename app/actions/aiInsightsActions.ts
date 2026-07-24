'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { AiInsight, InsightCategory, InsightSeverity } from '@/lib/insights/types';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

const db = createAdminClient();

function mapInsight(row: any): AiInsight {
  return {
    id: row.id,
    generatedAt: row.generated_at,
    insightDate: row.insight_date,
    category: row.category,
    severity: row.severity,
    title: row.title,
    description: row.description,
    metrics: row.metrics || {},
    chartData: row.chart_data || {},
    recommendation: row.recommendation,
    actionSuggestions: row.action_suggestions || [],
    riskAlert: row.risk_alert,
    metadata: row.metadata || {},
    isDismissed: row.is_dismissed,
    createdAt: row.created_at,
  };
}

export async function getAiInsightsAction(
  date?: string,
  category?: InsightCategory,
  severity?: InsightSeverity,
  includeDismissed = false
): Promise<AiInsight[]> {
  await requireRole(['admin', 'teacher']);
  let query = db.from('ai_insights').select('id, generated_at, insight_date, category, severity, title, description, metrics, chart_data, recommendation, action_suggestions, risk_alert, metadata, is_dismissed, created_at');

  if (date) {
    query = query.eq('insight_date', date);
  } else {
    const { data: latestDate } = await db
      .from('ai_insights')
      .select('insight_date')
      .order('insight_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestDate?.insight_date) {
      query = query.eq('insight_date', latestDate.insight_date);
    }
  }

  if (category) query = query.eq('category', category);
  if (severity) query = query.eq('severity', severity);
  if (!includeDismissed) query = query.eq('is_dismissed', false);

  query = query.order('severity', { ascending: false }).order('generated_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(mapInsight);
}

export async function getAiInsightsByDateAction(date: string): Promise<AiInsight[]> {
  await requireRole(['admin', 'teacher']);
  return getAiInsightsAction(date);
}

export async function getAvailableInsightDatesAction(): Promise<string[]> {
  await requireRole(['admin', 'teacher']);
  const { data, error } = await db
    .from('ai_insights')
    .select('insight_date')
    .order('insight_date', { ascending: false })
    .limit(365);
  if (error) throw new Error(error.message);
  return [...new Set((data || []).map((d: any) => d.insight_date as string))] as string[];
}

export async function getInsightCategoriesAction(): Promise<InsightCategory[]> {
  return [
    'homework_completion',
    'attendance_trend',
    'bus_delays',
    'active_classes',
    'reward_redemption',
    'most_requested_reward',
    'most_discussed_topic',
    'students_needing_attention',
    'teacher_workload',
    'wellness_trend',
  ];
}

export async function generateInsightsNowAction(date?: string): Promise<{ success: boolean; error?: string; count?: number }> {
  await requireRole(['admin']);
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  try {
    const { error } = await db.rpc('generate_all_insights', { p_date: targetDate });
    if (error) throw new Error(error.message);

    const { count } = await db
      .from('ai_insights')
      .select('*', { count: 'exact', head: true })
      .eq('insight_date', targetDate);

    return { success: true, count: count || 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function dismissInsightAction(insightId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin', 'teacher']);
  const { error } = await db
    .from('ai_insights')
    .update({ is_dismissed: true })
    .eq('id', insightId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getInsightGenerationLogAction(limit = 10): Promise<any[]> {
  await requireRole(['admin']);
  const { data, error } = await db
    .from('insight_generation_log')
    .select('*')
    .order('run_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getInsightStatsAction(): Promise<{
  totalInsights: number;
  byCategory: { category: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
  lastGenerated: string | null;
}> {
  await requireRole(['admin']);
  const { data: insights } = await db.from('ai_insights').select('category, severity, insight_date');
  
  const categoryMap = new Map<string, number>();
  const severityMap = new Map<string, number>();
  let latestDate: string | null = null;

  for (const i of insights || []) {
    categoryMap.set(i.category, (categoryMap.get(i.category) || 0) + 1);
    severityMap.set(i.severity, (severityMap.get(i.severity) || 0) + 1);
    if (!latestDate || i.insight_date > latestDate) latestDate = i.insight_date;
  }

  return {
    totalInsights: insights?.length || 0,
    byCategory: [...categoryMap.entries()].map(([category, count]) => ({ category, count })),
    bySeverity: [...severityMap.entries()].map(([severity, count]) => ({ severity, count })),
    lastGenerated: latestDate,
  };
}

function getDateRange(mode: string, baseDate: string): { current: string; previous: string } {
  const d = new Date(baseDate);
  if (mode === 'today_yesterday') {
    const prev = new Date(d);
    prev.setDate(prev.getDate() - 1);
    return { current: baseDate, previous: prev.toISOString().split('T')[0] };
  }
  if (mode === 'week_week') {
    const prev = new Date(d);
    prev.setDate(prev.getDate() - 7);
    return { current: baseDate, previous: prev.toISOString().split('T')[0] };
  }
  const prev = new Date(d);
  prev.setMonth(prev.getMonth() - 1);
  return { current: baseDate, previous: prev.toISOString().split('T')[0] };
}

export async function getInsightComparisonAction(
  date: string,
  mode: string
): Promise<{
  current: number;
  previous: number;
  change: number;
  overall_change: number;
  current_insights: AiInsight[];
  previous_insights: AiInsight[];
} | null> {
  await requireRole(['admin', 'teacher']);
  const { current, previous } = getDateRange(mode, date);

  const [currentInsights, previousInsights] = await Promise.all([
    getAiInsightsAction(current),
    getAiInsightsAction(previous),
  ]);

  const calcScore = (insights: AiInsight[]) => {
    if (insights.length === 0) return 0;
    const severityWeights: Record<string, number> = { critical: 10, warning: 5, info: 2, positive: -3 };
    return insights.reduce((sum, i) => sum + (severityWeights[i.severity] || 0), 0);
  };

  const currentScore = calcScore(currentInsights);
  const previousScore = calcScore(previousInsights);
  const change = previousScore === 0 ? 0 : ((currentScore - previousScore) / Math.abs(previousScore)) * 100;

  const avgMetrics = (insights: AiInsight[]) => {
    const attInsight = insights.find(i => i.category === 'attendance_trend');
    const hwInsight = insights.find(i => i.category === 'homework_completion');
    return ((attInsight?.metrics?.average_rate || 0) + (hwInsight?.metrics?.completion_rate || 0)) / 2;
  };

  const currentAvg = avgMetrics(currentInsights);
  const previousAvg = avgMetrics(previousInsights);
  const overallChange = previousAvg === 0 ? 0 : ((currentAvg - previousAvg) / previousAvg) * 100;

  return {
    current: currentScore,
    previous: previousScore,
    change: Math.round(change * 10) / 10,
    overall_change: Math.round(overallChange * 10) / 10,
    current_insights: currentInsights,
    previous_insights: previousInsights,
  };
}
