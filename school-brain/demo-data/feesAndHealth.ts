export interface FeeStructure {
  gradeCategory: string;
  tuitionFeeQuarterly: number;
  transportFeeQuarterly: number;
  labAndTechFeeQuarterly: number;
  totalQuarterly: number;
}

export const DEMO_FEE_STRUCTURE: FeeStructure[] = [
  { gradeCategory: 'Primary (Grades 1-5)', tuitionFeeQuarterly: 12000, transportFeeQuarterly: 4500, labAndTechFeeQuarterly: 1500, totalQuarterly: 18000 },
  { gradeCategory: 'Middle School (Grades 6-8)', tuitionFeeQuarterly: 15000, transportFeeQuarterly: 4500, labAndTechFeeQuarterly: 2500, totalQuarterly: 22000 },
  { gradeCategory: 'Senior School (Grades 9-10)', tuitionFeeQuarterly: 18000, transportFeeQuarterly: 4500, labAndTechFeeQuarterly: 3500, totalQuarterly: 26000 },
  { gradeCategory: 'Senior Secondary (Grades 11-12)', tuitionFeeQuarterly: 22000, transportFeeQuarterly: 4500, labAndTechFeeQuarterly: 4500, totalQuarterly: 31000 },
];

export interface HealthRecord {
  studentName: string;
  grade: string;
  section: string;
  visitDate: string;
  reason: string;
  treatment: string;
  attendingNurse: string;
  parentNotified: boolean;
}

export const DEMO_HEALTH_RECORDS: HealthRecord[] = [
  { studentName: 'Kabir Mehta', grade: '8', section: 'A', visitDate: '2026-07-20', reason: 'Mild headache and dizziness', treatment: 'Rest in infirmary for 45 mins, ORS hydration solution administered.', attendingNurse: 'Nurse Sushma', parentNotified: true },
  { studentName: 'Rohan Gupta', grade: '8', section: 'A', visitDate: '2026-07-18', reason: 'Minor ankle sprain during PE class', treatment: 'Cold compress ice pack, crepe bandage applied.', attendingNurse: 'Nurse Sushma', parentNotified: true },
  { studentName: 'Diya Patel', grade: '8', section: 'A', visitDate: '2026-07-15', reason: 'Routine vision checkup', treatment: 'Passed 20/20 vision test.', attendingNurse: 'Nurse Sushma', parentNotified: false },
];

export const DEMO_HOUSE_POINTS = [
  { houseName: 'Agni', color: 'Red', points: 420, rank: 1, captain: 'Sneha Reddy' },
  { houseName: 'Prithvi', color: 'Green', points: 395, rank: 2, captain: 'Ananya Iyer' },
  { houseName: 'Vayu', color: 'Blue', points: 370, rank: 3, captain: 'Aarav Singh' },
  { houseName: 'Jal', color: 'Teal', points: 345, rank: 4, captain: 'Arnav Kashyap' },
];
