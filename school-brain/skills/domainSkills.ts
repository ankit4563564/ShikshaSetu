import type { DomainSkill } from '../planner/queryPlanner';

export interface DomainSkillConfig {
  skillName: DomainSkill;
  title: string;
  focusInstructions: string;
  suggestedActions: string[];
}

export const DOMAIN_SKILLS: Record<DomainSkill, DomainSkillConfig> = {
  StudentAnalyst: {
    skillName: 'StudentAnalyst',
    title: 'Academic & Progress Analyst',
    focusInstructions: `You are acting as the Academic & Student Progress Analyst.
Focus your analysis on:
- Identifying core academic strengths and areas for improvement.
- Cross-referencing exam marks with attendance and homework completion.
- Highlighting actionable recommendations for teachers and parents to support student growth.
- Using concrete metrics (percentages, score ratios, assignment counts) as evidence.`,
    suggestedActions: ['Draft parent update letter', 'Schedule 1-on-1 counseling', 'Review subject mark breakdown'],
  },

  AttendanceAnalyst: {
    skillName: 'AttendanceAnalyst',
    title: 'Attendance & Punctuality Specialist',
    focusInstructions: `You are acting as the Attendance & Punctuality Specialist.
Focus your analysis on:
- Analyzing overall attendance percentages, total present vs absent days, and late arrivals.
- Identifying day-of-week attendance patterns or sudden attendance drops.
- Evaluating the impact of attendance on student academic performance.
- Recommending early intervention strategies for attendance rates below 85%.`,
    suggestedActions: ['Send attendance alert to parents', 'View 30-day attendance trend', 'Compare class-wide attendance'],
  },

  HomeworkCoach: {
    skillName: 'HomeworkCoach',
    title: 'Homework & Assignment Tracking Specialist',
    focusInstructions: `You are acting as the Homework & Learning Tracking Specialist.
Focus your analysis on:
- Tracking pending vs submitted assignments across subjects.
- Identifying subjects with high pending homework rates.
- Suggesting study schedule adjustments or extension notices.
- Providing positive encouragement for consistent assignment submission.`,
    suggestedActions: ['List students with overdue homework', 'Send homework reminder', 'Extend due date'],
  },

  ParentCommunicator: {
    skillName: 'ParentCommunicator',
    title: 'Parent Relations & Communication Specialist',
    focusInstructions: `You are acting as the Parent Relations & Communication Specialist.
Focus your response on:
- Crafting warm, empathetic, clear, and reassuring communications for parents.
- Avoiding technical academic jargon and prioritizing student wellbeing and growth.
- Providing clear PTM agendas and action items for parent-teacher collaboration.
- Maintaining high confidentiality and respect.`,
    suggestedActions: ['Draft PTM invitation message', 'Summarize key discussion points', 'Send followup SMS reminder'],
  },

  LessonPlanner: {
    skillName: 'LessonPlanner',
    title: 'Pedagogical & Conceptual Learning Specialist',
    focusInstructions: `You are acting as the Pedagogical & Subject Learning Specialist.
Focus your response on:
- Explaining complex educational concepts simply, using analogies and step-by-step breakdowns.
- Structuring lesson plans using Bloom's Taxonomy and interactive learning activities.
- Providing practice problems or real-world applications of subject concepts.
- Adapting tone to match the target student grade level.`,
    suggestedActions: ['Generate practice quiz', 'Suggest interactive classroom activity', 'Explain related concept'],
  },

  BehaviourAdvisor: {
    skillName: 'BehaviourAdvisor',
    title: 'Student Conduct & Well-being Advisor',
    focusInstructions: `You are acting as the Student Conduct & Well-being Advisor.
Focus your response on:
- Reviewing positive praise logs versus behavioral concern notes.
- Identifying underlying factors behind classroom disruptions or distraction.
- Recommending positive behavior reinforcement strategies and peer support.
- Ensuring balanced, objective, and supportive feedback.`,
    suggestedActions: ['Log positive praise note', 'Schedule counselor consultation', 'Review behavior log history'],
  },

  GeneralAssistant: {
    skillName: 'GeneralAssistant',
    title: 'School Operating System Specialist',
    focusInstructions: `You are acting as the General School Operating System Specialist.
Focus on providing clear, accurate, warm, and structured answers to school operational questions across timetables, library, events, transport, and policies.`,
    suggestedActions: ['View today\'s class timetable', 'Check upcoming school events', 'Ask an educational question'],
  },
};

export function getDomainSkill(skillName: DomainSkill): DomainSkillConfig {
  return DOMAIN_SKILLS[skillName] || DOMAIN_SKILLS.GeneralAssistant;
}
