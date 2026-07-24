import type { PolicyInfo } from '../models/index';

export const SCHOOL_POLICIES: PolicyInfo[] = [
  {
    category: 'Uniform & Dress Code',
    title: 'School Uniform Policy',
    summary: 'Strict compliance with prescribed summer and winter uniforms is mandatory for all students.',
    details: [
      'Summer Uniform (Mon, Tue, Thu, Fri): Navy blue trousers/skirt, light blue striped shirt, school tie, black polished leather shoes, and navy blue socks.',
      'House Uniform (Wednesday): House color t-shirt (Vayu-Blue, Agni-Red, Jal-Teal, Prithvi-Green), white shorts/track pants, and white sports shoes.',
      'Winter Uniform: Navy blue blazer with school crest, full-sleeved shirt, grey woollen trousers/skirt, and official school sweater.',
      'Hair & Accessories: Hair must be neat and trimmed. No jewelry, makeup, or fancy wristwatches are allowed.',
    ],
  },
  {
    category: 'Discipline',
    title: 'Code of Conduct & Discipline Policy',
    summary: 'SchoolGPT enforces a positive, respectful, and safe learning environment for all members of the school community.',
    details: [
      'Punctuality: Students must arrive at campus before 07:50 AM. Three late arrivals result in a parent notification.',
      'Gadget Policy: Mobile phones and electronic devices are strictly prohibited unless authorized by a teacher for academic work.',
      'Zero Tolerance: Bullying, physical aggression, property damage, or cheating during examinations will lead to immediate suspension.',
      'Positive Reinforcement: Merits and House Points are awarded weekly for exemplary conduct, kindness, and academic effort.',
    ],
  },
  {
    category: 'Visitor Management',
    title: 'Campus Access & Visitor Policy',
    summary: 'Ensuring campus security and student safety at all access gates.',
    details: [
      'Gate Pass Requirement: All visitors, including parents and vendors, must register at Gate 1 with government-issued photo ID.',
      'Visiting Hours: Parents may meet teachers or administrators between 02:15 PM and 03:30 PM on designated days with prior appointment.',
      'Early Pickup: Students will only be released early with an approved digital gate pass from the Principal or Vice-Principal.',
    ],
  },
  {
    category: 'Transport & Safety',
    title: 'School Bus & Transport Policy',
    summary: 'Safe, punctual, and monitored transportation for all commuting students.',
    details: [
      'Bus Boarding: Students must be at their assigned bus stop 5 minutes prior to scheduled pickup time.',
      'Behavior on Bus: Standing, shouting, or extending hands out of windows is strictly forbidden.',
      'Route Change: Requests for temporary route or stop changes must be submitted 24 hours in advance via the parent portal.',
    ],
  },
  {
    category: 'Fees & Financials',
    title: 'Fee Payment & Refund Policy',
    summary: 'Guidelines for quarterly fee submission, late fees, and online payment modes.',
    details: [
      'Payment Due Dates: Fees are due on the 10th of April, July, October, and January.',
      'Late Fine: A late fee of ₹50 per day is applicable after the due date up to 15 days, after which student portal access is restricted.',
      'Payment Modes: Payments are accepted via UPI, Credit/Debit cards, NetBanking on SchoolGPT Parent Portal, or Demand Draft.',
    ],
  },
  {
    category: 'Health & Infirmary',
    title: 'Health & First-Aid Policy',
    summary: 'Comprehensive medical care and emergency protocols handled by the school nurse.',
    details: [
      'Infirmary Care: Minor injuries, fever, and ailments are treated at the campus Health Room.',
      'Medication Administration: Prescription drugs must be handed to the school nurse with a signed parent consent letter.',
      'Emergency Contact: In case of acute illness or injury, parents are contacted immediately while initial emergency care is administered.',
    ],
  },
];

export function getPolicyByCategory(categoryOrKeyword: string): PolicyInfo[] {
  const lower = categoryOrKeyword.toLowerCase();
  return SCHOOL_POLICIES.filter(p =>
    p.category.toLowerCase().includes(lower) ||
    p.title.toLowerCase().includes(lower) ||
    p.summary.toLowerCase().includes(lower) ||
    p.details.some(d => d.toLowerCase().includes(lower))
  );
}

export function getAllPoliciesFormatted(): string {
  return SCHOOL_POLICIES.map(p =>
    `[${p.category}: ${p.title}]\nSummary: ${p.summary}\nKey Rules:\n${p.details.map(d => `• ${d}`).join('\n')}`
  ).join('\n\n');
}
