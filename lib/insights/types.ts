export type InsightCategory = 
  | 'homework_completion'
  | 'attendance_trend'
  | 'bus_delays'
  | 'active_classes'
  | 'reward_redemption'
  | 'most_requested_reward'
  | 'most_discussed_topic'
  | 'students_needing_attention'
  | 'teacher_workload'
  | 'wellness_trend';

export type InsightSeverity = 'info' | 'warning' | 'critical' | 'positive';

export interface AiInsight {
  id: string;
  generatedAt: string;
  insightDate: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  metrics: Record<string, any>;
  chartData: Record<string, any>;
  recommendation: string | null;
  actionSuggestions: string[];
  riskAlert: boolean;
  metadata: Record<string, any>;
  isDismissed: boolean;
  createdAt: string;
}

export interface InsightChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export interface InsightComparison {
  current: number;
  previous: number;
  change: number;
  overall_change: number;
  current_insights: AiInsight[];
  previous_insights: AiInsight[];
}

export interface InsightGenerationLog {
  id: string;
  runAt: string;
  insightDate: string;
  status: 'running' | 'completed' | 'failed';
  insightsGenerated: number;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
}

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  homework_completion: 'Homework Completion',
  attendance_trend: 'Attendance Trend',
  bus_delays: 'Bus Delays',
  active_classes: 'Active Classes',
  reward_redemption: 'Reward Redemption',
  most_requested_reward: 'Most Requested Reward',
  most_discussed_topic: 'Most Discussed Topic',
  students_needing_attention: 'Students Needing Attention',
  teacher_workload: 'Teacher Workload',
  wellness_trend: 'Wellness Trend',
};

export const INSIGHT_CATEGORY_ICONS: Record<InsightCategory, string> = {
  homework_completion: '📚',
  attendance_trend: '📊',
  bus_delays: '🚌',
  active_classes: '🏫',
  reward_redemption: '🪙',
  most_requested_reward: '🏆',
  most_discussed_topic: '💬',
  students_needing_attention: '🚨',
  teacher_workload: '👩‍🏫',
  wellness_trend: '💚',
};

export const SEVERITY_COLORS: Record<InsightSeverity, { bg: string; text: string; border: string; badge: string }> = {
  info: { bg: 'bg-deep-teal/10', text: 'text-deep-teal', border: 'border-deep-teal/20', badge: 'bg-deep-teal/10 text-deep-teal' },
  warning: { bg: 'bg-marigold/10', text: 'text-marigold', border: 'border-marigold/20', badge: 'bg-marigold/10 text-marigold' },
  critical: { bg: 'bg-warm-clay/10', text: 'text-warm-clay', border: 'border-warm-clay/20', badge: 'bg-warm-clay/10 text-warm-clay' },
  positive: { bg: 'bg-sage/10', text: 'text-sage', border: 'border-sage/20', badge: 'bg-sage/10 text-sage' },
};

export const SEVERITY_ICONS: Record<InsightSeverity, string> = {
  critical: '🔴',
  warning: '🟠',
  info: '🔵',
  positive: '🟢',
};

export function getCategoryColor(category: InsightCategory): string {
  const colors: Record<InsightCategory, string> = {
    homework_completion: 'deep-teal',
    attendance_trend: 'primary',
    bus_delays: 'marigold',
    active_classes: 'sage',
    reward_redemption: 'purple',
    most_requested_reward: 'warm-clay',
    most_discussed_topic: 'deep-teal',
    students_needing_attention: 'warm-clay',
    teacher_workload: 'primary',
    wellness_trend: 'sage',
  };
  return colors[category] || 'deep-teal';
}