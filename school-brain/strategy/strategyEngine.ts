import type { ResponseStrategy } from '../planner/queryPlanner';

export interface StrategyDirective {
  strategyName: ResponseStrategy;
  structureFormat: string;
  toneGuidance: string;
  requireExplainability: boolean;
}

export const STRATEGY_DIRECTIVES: Record<ResponseStrategy, StrategyDirective> = {
  QuickFact: {
    strategyName: 'QuickFact',
    structureFormat: `Structure: Provide a concise 1-2 sentence direct answer. Bullet points (•) for fast reading if listing 2-3 items. Avoid long intros or filler words.`,
    toneGuidance: `Tone: Direct, warm, crisp, and precise.`,
    requireExplainability: false,
  },

  AnalyticalReport: {
    strategyName: 'AnalyticalReport',
    structureFormat: `Structure: Organize your response into 4 distinct sections:
1. 📌 OBSERVATION: State the key finding or main status clearly.
2. 📊 EVIDENCE: Present specific retrieved numbers, scores, percentages, or logs.
3. 💡 REASONING: Explain WHY this conclusion was reached based strictly on the evidence.
4. 🚀 SUGGESTED NEXT STEP: Give 1-2 practical, actionable recommendations.`,
    toneGuidance: `Tone: Analytical, objective, evidence-driven, and supportive.`,
    requireExplainability: true,
  },

  ComparisonDashboard: {
    strategyName: 'ComparisonDashboard',
    structureFormat: `Structure: Present a comparative analysis:
- Summary of comparison criteria.
- Side-by-side comparison breakdown for each entity (Entity A vs Entity B across Attendance, Marks, Homework, Conduct).
- Comparative Insights & Diagnostic Conclusion.
- Action Plan.`,
    toneGuidance: `Tone: Objective, balanced, structured, and insightful.`,
    requireExplainability: true,
  },

  TimelineView: {
    strategyName: 'TimelineView',
    structureFormat: `Structure: Present chronological progression:
- Recent Trend Overview.
- Chronological Milestones / Period Breakdown.
- Trajectory Analysis (Improving, Stable, or Declining).
- Recommended Followup.`,
    toneGuidance: `Tone: Clear, chronological, and trend-focused.`,
    requireExplainability: true,
  },

  PedagogicalGuide: {
    strategyName: 'PedagogicalGuide',
    structureFormat: `Structure: Present an educational explanation:
- Conceptual Definition & Core Idea.
- Simple Analogy / Real-world Example.
- Step-by-Step Breakdown or Key Principles.
- Practice Question or Reflection.`,
    toneGuidance: `Tone: Inspiring, clear, educational, and engaging.`,
    requireExplainability: false,
  },

  DirectToolResponse: {
    strategyName: 'DirectToolResponse',
    structureFormat: `Structure: Present verified database record directly in clean prose.`,
    toneGuidance: `Tone: Clear, factual, and instant.`,
    requireExplainability: false,
  },
};

export function getStrategyDirective(strategy: ResponseStrategy): StrategyDirective {
  return STRATEGY_DIRECTIVES[strategy] || STRATEGY_DIRECTIVES.AnalyticalReport;
}
