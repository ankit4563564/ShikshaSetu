/**
 * Rules-engine domain types.
 *
 * Defines the shape of configurable rules that the engine
 * evaluates against student data to produce EvidenceStatus values.
 */

export type RuleDimension =
  | 'attendance'
  | 'assignment-completion'
  | 'grade-trend'
  | 'engagement';

export type RuleThreshold = {
  /** The data dimension this rule evaluates. */
  dimension: RuleDimension;
  /** Below this value → 'needs-attention'. */
  lower: number;
  /** Above this value → 'on-track'. Between lower and upper → 'worth-watching'. */
  upper: number;
};

export type Rule = {
  id: string;
  label: string;
  thresholds: RuleThreshold[];
};
