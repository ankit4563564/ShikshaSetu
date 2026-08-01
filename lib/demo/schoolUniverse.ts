/**
 * ShikshaSetu Demo Universe
 * Single source of truth for all demo data across every portal.
 * Every portal pulls from this file so names, events and numbers are consistent.
 */

// ─── SCHOOL ────────────────────────────────────────────────────────────────
export const SCHOOL = {
  name: 'Delhi Public School, Sector 14',
  shortName: 'DPS-14',
  city: 'New Delhi',
  academicYear: '2025–26',
  currentTerm: 'Term 2',
  principal: 'Mrs. Sunanda Iyer',
  totalStudents: 847,
  totalTeachers: 62,
  totalClasses: 28,
};

// ─── STUDENTS ──────────────────────────────────────────────────────────────
export const STUDENTS = [
  { id: 's001', name: 'Aarav Sharma',    grade: '8A', rollNo: 'DPS14/8A/01', coins: 340, streak: 14, avatar: '/aarav.png',  busStop: 'Sector 12 Market',   house: 'Ashoka' },
  { id: 's002', name: 'Priya Mehta',     grade: '8A', rollNo: 'DPS14/8A/02', coins: 210, streak: 7,  avatar: '/priya.png',  busStop: 'Rajouri Garden',     house: 'Chanakya' },
  { id: 's003', name: 'Rohan Verma',     grade: '8B', rollNo: 'DPS14/8B/03', coins: 155, streak: 3,  avatar: '/rohan.png',  busStop: 'Paschim Vihar',     house: 'Tagore' },
  { id: 's004', name: 'Ananya Singh',    grade: '9A', rollNo: 'DPS14/9A/04', coins: 420, streak: 21, avatar: '/ananya.png', busStop: 'Sector 12 Market',   house: 'Ashoka' },
  { id: 's005', name: 'Kabir Malhotra',  grade: '9B', rollNo: 'DPS14/9B/05', coins: 90,  streak: 2,  avatar: '/kabir.png',  busStop: 'Pitampura Station',  house: 'Chanakya' },
  { id: 's006', name: 'Ishaan Gupta',    grade: '7C', rollNo: 'DPS14/7C/06', coins: 275, streak: 10, avatar: null,          busStop: 'Paschim Vihar',     house: 'Tagore' },
  { id: 's007', name: 'Meera Joshi',     grade: '7C', rollNo: 'DPS14/7C/07', coins: 190, streak: 8,  avatar: null,          busStop: 'Sector 12 Market',   house: 'Bose' },
  { id: 's008', name: 'Arjun Kapoor',    grade: '10A', rollNo: 'DPS14/10A/08', coins: 510, streak: 28, avatar: null,         busStop: 'Rajouri Garden',     house: 'Bose' },
];

export const PRIMARY_STUDENT = STUDENTS[0]; // Aarav — the "logged-in" student

// ─── TEACHERS ──────────────────────────────────────────────────────────────
export const TEACHERS = [
  { id: 't001', name: 'Mrs. Kavita Rao',      subject: 'Mathematics',       grade: '8A', emoji: '📐' },
  { id: 't002', name: 'Mr. Deepak Nair',      subject: 'Science',           grade: '8A', emoji: '🔬' },
  { id: 't003', name: 'Ms. Preethi Anand',    subject: 'English',           grade: '8A', emoji: '📚' },
  { id: 't004', name: 'Mr. Sanjay Sharma',    subject: 'Social Studies',    grade: '8A', emoji: '🌍' },
  { id: 't005', name: 'Ms. Ritu Chauhan',     subject: 'Computer Science',  grade: '8A', emoji: '💻' },
  { id: 't006', name: 'Mr. Vinod Pillai',     subject: 'Physical Education', grade: 'All', emoji: '🏃' },
];

export const CLASS_TEACHER = TEACHERS[0]; // Mrs. Kavita Rao

// ─── TODAY'S SCHEDULE (Aarav's timetable) ──────────────────────────────────
export const TODAYS_SCHEDULE = [
  { period: 1, time: '8:00–8:45',   subject: 'Mathematics',      teacher: 'Mrs. Kavita Rao',   room: 'R-201', status: 'done',    icon: '📐' },
  { period: 2, time: '8:45–9:30',   subject: 'Science',          teacher: 'Mr. Deepak Nair',   room: 'Lab-1', status: 'done',    icon: '🔬' },
  { period: 3, time: '9:30–10:15',  subject: 'English',          teacher: 'Ms. Preethi Anand', room: 'R-202', status: 'done',    icon: '📚' },
  { period: 0, time: '10:15–10:30', subject: 'Break',            teacher: '',                  room: '',      status: 'done',    icon: '☕' },
  { period: 4, time: '10:30–11:15', subject: 'Social Studies',   teacher: 'Mr. Sanjay Sharma', room: 'R-203', status: 'current', icon: '🌍' },
  { period: 5, time: '11:15–12:00', subject: 'Computer Science', teacher: 'Ms. Ritu Chauhan',  room: 'Lab-2', status: 'upcoming', icon: '💻' },
  { period: 0, time: '12:00–12:45', subject: 'Lunch',            teacher: '',                  room: '',      status: 'upcoming', icon: '🍱' },
  { period: 6, time: '12:45–1:30',  subject: 'Physical Ed.',     teacher: 'Mr. Vinod Pillai',  room: 'Ground', status: 'upcoming', icon: '🏃' },
];

// ─── HOMEWORK ──────────────────────────────────────────────────────────────
export const HOMEWORK = [
  { id: 'hw1', subject: 'Mathematics',   title: 'Algebra – Ch.6 Ex. 6.3 (Q1–Q10)', dueDate: 'Today',     submitted: true,  submittedAt: '8:02 AM',   grade: null },
  { id: 'hw2', subject: 'Science',       title: 'Write lab report: Acid-Base Test', dueDate: 'Tomorrow',  submitted: false, submittedAt: null,        grade: null },
  { id: 'hw3', subject: 'English',       title: 'Essay: My Favourite Festival (300 words)', dueDate: 'Thu 24 Jul', submitted: false, submittedAt: null, grade: null },
  { id: 'hw4', subject: 'Social Studies', title: 'Map: Label all states of India', dueDate: 'Fri 25 Jul', submitted: false, submittedAt: null,       grade: null },
  { id: 'hw5', subject: 'Mathematics',   title: 'Ch.5 Practice Test', dueDate: 'Mon 21 Jul',  submitted: true,  submittedAt: '7:55 PM', grade: '18/20' },
  { id: 'hw6', subject: 'English',       title: 'Grammar worksheet – Tenses',       dueDate: 'Fri 18 Jul', submitted: true,  submittedAt: '6:30 PM', grade: '9/10' },
];

// ─── ACHIEVEMENTS ──────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'a1', title: '14-Day Streak!',        desc: 'Submitted homework 14 days in a row', icon: '🔥', date: 'Today',        coins: 50,  rarity: 'rare' },
  { id: 'a2', title: 'Perfect Attendance',    desc: 'Present every day this month',        icon: '🏆', date: 'Jul 15',       coins: 100, rarity: 'epic' },
  { id: 'a3', title: 'Math Star',             desc: 'Scored 95%+ in three tests in a row', icon: '⭐', date: 'Jul 10',       coins: 75,  rarity: 'rare' },
  { id: 'a4', title: 'First Submission',      desc: 'Submitted an assignment',             icon: '✅', date: 'Jun 12',       coins: 10,  rarity: 'common' },
  { id: 'a5', title: 'Club Member',           desc: 'Joined the Robotics Club',            icon: '🤖', date: 'Jun 5',        coins: 25,  rarity: 'common' },
];

// ─── UPCOMING EXAMS ────────────────────────────────────────────────────────
export const UPCOMING_EXAMS = [
  { id: 'e1', subject: 'Mathematics',   date: 'Mon 28 Jul', time: '9:00 AM', type: 'Unit Test', syllabus: 'Ch. 5–7 (Algebra & Geometry)', daysLeft: 6 },
  { id: 'e2', subject: 'Science',       date: 'Wed 30 Jul', time: '9:00 AM', type: 'Unit Test', syllabus: 'Ch. 4–6 (Chemical Reactions)', daysLeft: 8 },
  { id: 'e3', subject: 'English',       date: 'Fri 1 Aug',  time: '9:00 AM', type: 'Unit Test', syllabus: 'Grammar, Comprehension, Writing', daysLeft: 10 },
];

// ─── AI STUDY TIPS ─────────────────────────────────────────────────────────
export const AI_STUDY_TIPS = [
  { subject: 'Mathematics', tip: 'Your Algebra scores jumped from 72% to 91% — keep revising Ch.6 with practice sets.', icon: '📐' },
  { subject: 'Science',     tip: 'Lab report writing is worth 20% of your term grade. Draft it tonight while the experiment is fresh.', icon: '🔬' },
  { subject: 'General',     tip: "You've maintained a 14-day streak — don't break it! Complete tomorrow's Science report before dinner.", icon: '🔥' },
];

// ─── ATTENDANCE ────────────────────────────────────────────────────────────
export const ATTENDANCE_SUMMARY = {
  totalDays: 68,
  present: 66,
  absent: 1,
  late: 1,
  streak: 14,
  percentage: 97,
};

// ─── GATE ENTRY LOG (today) ────────────────────────────────────────────────
export const GATE_ENTRY_LOG = [
  { id: 'g1',  time: '7:48 AM', name: 'Aarav Sharma',   grade: '8A', type: 'student', mode: 'entry', status: 'verified' },
  { id: 'g2',  time: '7:50 AM', name: 'Ananya Singh',   grade: '9A', type: 'student', mode: 'entry', status: 'verified' },
  { id: 'g3',  time: '7:51 AM', name: 'Priya Mehta',    grade: '8A', type: 'student', mode: 'entry', status: 'verified' },
  { id: 'g4',  time: '7:55 AM', name: 'Mr. Deepak Nair',grade: 'Staff', type: 'staff', mode: 'entry', status: 'verified' },
  { id: 'g5',  time: '8:02 AM', name: 'Rohan Verma',    grade: '8B', type: 'student', mode: 'entry', status: 'verified' },
  { id: 'g6',  time: '8:10 AM', name: 'Kabir Malhotra', grade: '9B', type: 'student', mode: 'entry', status: 'late' },
  { id: 'g7',  time: '8:22 AM', name: 'Meera Joshi',    grade: '7C', type: 'student', mode: 'entry', status: 'late' },
  { id: 'g8',  time: '9:30 AM', name: 'Mrs. Sunita Sharma', grade: 'Visitor', type: 'visitor', mode: 'entry', status: 'visitor' },
  { id: 'g9',  time: '10:15 AM', name: 'Ishaan Gupta',  grade: '7C', type: 'student', mode: 'exit',  status: 'gate-pass' },
  { id: 'g10', time: '11:40 AM', name: 'Arjun Kapoor',  grade: '10A', type: 'student', mode: 'entry', status: 'verified' },
];

export const GATE_DAILY_STATS = {
  totalEntries: 312,
  studentsIn: 298,
  staffIn: 11,
  visitors: 3,
  lateArrivals: 14,
  gatePassExits: 2,
  alerts: 1,
};

// ─── VENDOR / CANTEEN ──────────────────────────────────────────────────────
export const VENDOR_REDEMPTIONS_TODAY = [
  { id: 'r1',  time: '10:18 AM', student: 'Aarav Sharma',   item: 'Veggie Wrap',       coins: 40, grade: '8A' },
  { id: 'r2',  time: '10:19 AM', student: 'Ananya Singh',   item: 'Fresh Lime Soda',   coins: 20, grade: '9A' },
  { id: 'r3',  time: '10:22 AM', student: 'Ishaan Gupta',   item: 'Sandwich Combo',    coins: 55, grade: '7C' },
  { id: 'r4',  time: '10:25 AM', student: 'Priya Mehta',    item: 'Fruit Bowl',        coins: 30, grade: '8A' },
  { id: 'r5',  time: '10:27 AM', student: 'Arjun Kapoor',   item: 'Cold Coffee',       coins: 35, grade: '10A' },
  { id: 'r6',  time: '12:02 PM', student: 'Rohan Verma',    item: 'Veggie Wrap',       coins: 40, grade: '8B' },
  { id: 'r7',  time: '12:05 PM', student: 'Meera Joshi',    item: 'Mango Lassi',       coins: 25, grade: '7C' },
  { id: 'r8',  time: '12:08 PM', student: 'Kabir Malhotra', item: 'Sandwich Combo',    coins: 55, grade: '9B' },
];

export const VENDOR_MENU_ITEMS = [
  { id: 'v1', name: 'Veggie Wrap',     coins: 40, stock: 12, popular: true  },
  { id: 'v2', name: 'Sandwich Combo',  coins: 55, stock: 8,  popular: true  },
  { id: 'v3', name: 'Fruit Bowl',      coins: 30, stock: 20, popular: false },
  { id: 'v4', name: 'Fresh Lime Soda', coins: 20, stock: 30, popular: false },
  { id: 'v5', name: 'Cold Coffee',     coins: 35, stock: 5,  popular: true  },
  { id: 'v6', name: 'Mango Lassi',     coins: 25, stock: 15, popular: false },
];

export const VENDOR_STATS_TODAY = {
  totalRedemptions: 8,
  totalCoins: 300,
  topItem: 'Veggie Wrap',
  lowStockAlerts: 2,
};

// ─── SCHOOL ANNOUNCEMENTS ──────────────────────────────────────────────────
export const ANNOUNCEMENTS = [
  { id: 'an1', title: 'Annual Sports Day – Registrations Open',    body: 'Register for your track, field or team events by Friday 25 Jul.', date: 'Today',    priority: 'high',   author: 'Mrs. Sunanda Iyer' },
  { id: 'an2', title: 'Unit Test Schedule Released',               body: 'Maths on 28 Jul, Science on 30 Jul, English on 1 Aug.', date: 'Yesterday', priority: 'high',   author: 'Academics Dept.' },
  { id: 'an3', title: 'Library – New Books Arrived',               body: '42 new books added to Sci-Fi and History sections.', date: 'Jul 20',    priority: 'normal', author: 'Ms. Gita Pillai' },
  { id: 'an4', title: 'Parent-Teacher Meeting – 2 Aug',            body: 'Slots available 10 AM – 1 PM. Book via the app.', date: 'Jul 19',    priority: 'normal', author: 'Admin Office' },
  { id: 'an5', title: 'Robotics Club – Inter-school Competition',  body: 'DPS-14 team qualified for the zonal round on 5 Aug!', date: 'Jul 18',    priority: 'normal', author: 'Mr. Vijay Kumar' },
];

// ─── ADMIN ACTIVITY FEED ───────────────────────────────────────────────────
export const ADMIN_ACTIVITY_FEED = [
  { id: 'af1', time: '11:38 AM', event: 'Aarav Sharma redeemed 40 coins at canteen',   icon: '🪙', type: 'reward'  },
  { id: 'af2', time: '11:22 AM', event: 'Bus BUS-001 completed morning route (14/14)',  icon: '🚌', type: 'transport' },
  { id: 'af3', time: '10:52 AM', event: 'Gate pass approved: Ishaan Gupta (Class 7C)', icon: '🚪', type: 'gate'     },
  { id: 'af4', time: '10:15 AM', event: 'Mrs. Kavita Rao logged attendance for 8A',    icon: '✅', type: 'academic' },
  { id: 'af5', time: '9:44 AM',  event: 'Kabir Malhotra marked late arrival',          icon: '⏰', type: 'alert'    },
  { id: 'af6', time: '8:55 AM',  event: 'Ananya Singh achieved 21-day streak badge',   icon: '🏆', type: 'reward'   },
  { id: 'af7', time: '8:30 AM',  event: '298 students verified at main gate',          icon: '🛡️', type: 'gate'    },
  { id: 'af8', time: '8:05 AM',  event: 'Bus BUS-001 departed Sector 12 (on time)',   icon: '🚌', type: 'transport' },
];

// ─── VENDOR LIVE ACTIVITY (Ecosystem Connected) ────────────────────────────
export const LIVE_ACTIVITY = [
  { icon: '🏆', event: 'Aarav Sharma earned Homework Streak badge (day 14)', source: 'Teacher Recognition (Mrs. Kavita)', time: '12:08 PM' },
  { icon: '🪙', event: 'Kabir Malhotra redeemed Sandwich Combo (55 coins)', source: 'Campus Coin Redemption', time: '12:05 PM' },
  { icon: '📚', event: 'Meera Joshi submitted Science homework on time', source: 'Academic Achievement', time: '12:03 PM' },
  { icon: '🪙', event: 'Rohan Verma redeemed Veggie Wrap (40 coins)', source: 'Campus Coin Redemption', time: '12:02 PM' },
  { icon: '⚡', event: 'Ananya Singh hit 21-day perfect streak milestone', source: 'Daily Achievement Badge', time: '11:58 AM' },
  { icon: '🪙', event: 'Arjun Kapoor redeemed Cold Coffee (35 coins)', source: 'Campus Coin Redemption', time: '10:27 AM' },
  { icon: '👥', event: 'Parent timeline synced with Aarav\'s redemption activity', source: 'Ecosystem Sync', time: '10:18 AM' },
  { icon: '🔗', event: 'SchoolGPT indexed morning achievements for insights', source: 'AI Analytics', time: '9:15 AM' },
];

// ─── DEPARTMENT SUMMARIES ──────────────────────────────────────────────────
export const DEPT_SUMMARIES = [
  { dept: 'Academics',  status: 'good',    metric: '94% attendance today',    icon: '📚', action: 'View reports' },
  { dept: 'Transport',  status: 'good',    metric: '1 route active, all safe', icon: '🚌', action: 'Live map' },
  { dept: 'Security',   status: 'warning', metric: '1 unresolved alert',       icon: '🛡️', action: 'Review' },
  { dept: 'Canteen',    status: 'good',    metric: '8 redemptions today',      icon: '🍽️', action: 'Inventory' },
  { dept: 'Library',    status: 'good',    metric: '12 books issued today',    icon: '📖', action: 'Catalogue' },
];

// ─── SCHOOLGPT CONVERSATION HISTORY ────────────────────────────────────────
export const SCHOOLGPT_HISTORY: Array<{ role: 'user' | 'assistant'; content: string; time: string }> = [
  { role: 'user',      content: "What's my attendance this month?",                                                           time: 'Yesterday 4:12 PM' },
  { role: 'assistant', content: "You've attended **66 out of 68 school days** this month — that's a **97% attendance rate**. You missed 1 day (Jul 3) and were late once (Jul 9). Keep it up — you're on a 14-day perfect streak right now! 🔥", time: 'Yesterday 4:12 PM' },
  { role: 'user',      content: "When is the Maths unit test?",                                                               time: 'Yesterday 4:13 PM' },
  { role: 'assistant', content: "Your **Mathematics Unit Test** is on **Monday, 28 July** at 9:00 AM. The syllabus covers **Chapters 5–7** (Algebra & Geometry). You have 6 days to prepare. Want me to suggest a study plan?", time: 'Yesterday 4:13 PM' },
  { role: 'user',      content: "Yes please!",                                                                                time: 'Yesterday 4:14 PM' },
  { role: 'assistant', content: "Here's a 6-day plan for Maths:\n- **Day 1–2:** Revise Ch.5 (Linear Equations) — do 10 practice problems each day.\n- **Day 3–4:** Ch.6 (Algebraic Expressions) — you already scored 91% here, just a quick review.\n- **Day 5:** Ch.7 (Geometry basics) — focus on theorem proofs.\n- **Day 6:** Full mock test from last year's paper.\nGood luck, Aarav! 📐", time: 'Yesterday 4:14 PM' },
  { role: 'user',      content: "Where is my bus stop?",                                                                      time: 'Today 7:32 AM' },
  { role: 'assistant', content: "Your bus stop is **Sector 12 Market**. Bus **BUS-001** (Rajesh Kumar, conductor) picks up from there at **7:35 AM**. This morning the bus departed on time. You boarded at 7:37 AM ✅", time: 'Today 7:32 AM' },
];
