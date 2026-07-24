import type { ClubInfo } from '../models/index.ts';

export interface House {
  name: string;
  color: string;
  motto: string;
}

export interface SchoolProfile {
  name: string;
  motto: string;
  established: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  principal: { name: string; qualification: string };
  vicePrincipal: { name: string; qualification: string };
  academicYear: {
    start: string;
    end: string;
    terms: { name: string; start: string; end: string }[];
  };
  timings: {
    school: string;
    office: string;
    library: string;
    labs: string;
  };
  grades: string[];
  sections: string[];
  medium: string;
  houses: House[];
  infrastructure: string[];
}

export const SCHOOL_PROFILE: SchoolProfile = {
  name: "Shiksha Setu International School",
  motto: "Knowledge, Character, Service",
  established: 1998,
  address: "42 Knowledge Avenue, Green Park, New Delhi - 110017",
  phone: "+91-11-2651-XXXX",
  email: "info@shikshasetu.edu.in",
  website: "www.shikshasetu.edu.in",
  principal: {
    name: "Dr. Meera Krishnamurthy",
    qualification: "Ph.D. Education, IIT Delhi"
  },
  vicePrincipal: {
    name: "Mr. Sunil Bhatia",
    qualification: "M.Ed., JNU"
  },
  academicYear: {
    start: "2025-04-01",
    end: "2026-03-31",
    terms: [
      { name: "Term 1", start: "2025-04-01", end: "2025-09-30" },
      { name: "Term 2", start: "2025-10-01", end: "2026-03-31" }
    ]
  },
  timings: {
    school: "08:00 - 14:30",
    office: "07:30 - 16:00",
    library: "07:30 - 16:30",
    labs: "08:00 - 15:00"
  },
  grades: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
  sections: ["A", "B", "C", "D"],
  medium: "English (CBSE affiliated, school code 27856)",
  houses: [
    { name: "Tagore", color: "#E74C3C", motto: "Beauty in Truth" },
    { name: "Teresa", color: "#3498DB", motto: "Love and Service" },
    { name: "Kalam", color: "#2ECC71", motto: "Dream Big" },
    { name: "Khan", color: "#F39C12", motto: "Fearless Learning" }
  ],
  infrastructure: [
    "3 academic blocks",
    "Science labs (Physics, Chemistry, Biology)",
    "Computer lab",
    "Library with 15000+ books",
    "Auditorium (500 capacity)",
    "Sports complex",
    "Swimming pool",
    "Multi-purpose court",
    "Canteen",
    "Medical room",
    "Art room",
    "Music room",
    "Robotics lab"
  ]
};

export const CLUBS: ClubInfo[] = [
  {
    id: "club-001",
    name: "Robotics Club",
    description: "Design and build robots for inter-school competitions",
    teacherName: "Sunita Reddy",
    meetingDay: 3,
    meetingTime: "12:00",
    meetingLocation: "Robotics Lab",
    members: [
      "b1000000-0000-4000-8000-000000000001",
      "b1000000-0000-4000-8000-000000000007",
      "b1000000-0000-4000-8000-000000000012",
      "b1000000-0000-4000-8000-000000000019",
      "b1000000-0000-4000-8000-000000000026"
    ]
  },
  {
    id: "club-002",
    name: "Science Club",
    description: "Explore scientific concepts through experiments and projects",
    teacherName: "Lakshmi Iyer",
    meetingDay: 2,
    meetingTime: "12:00",
    meetingLocation: "Science Lab",
    members: [
      "b1000000-0000-4000-8000-000000000003",
      "b1000000-0000-4000-8000-000000000008",
      "b1000000-0000-4000-8000-000000000015",
      "b1000000-0000-4000-8000-000000000020",
      "b1000000-0000-4000-8000-000000000033"
    ]
  },
  {
    id: "club-003",
    name: "Literary Club",
    description: "Creative writing, poetry, and literature appreciation",
    teacherName: "Rajesh Sharma",
    meetingDay: 1,
    meetingTime: "12:00",
    meetingLocation: "Library",
    members: [
      "b1000000-0000-4000-8000-000000000002",
      "b1000000-0000-4000-8000-000000000004",
      "b1000000-0000-4000-8000-000000000011",
      "b1000000-0000-4000-8000-000000000013",
      "b1000000-0000-4000-8000-000000000022"
    ]
  },
  {
    id: "club-004",
    name: "Art Club",
    description: "Drawing, painting, and visual arts",
    teacherName: "Deepak Menon",
    meetingDay: 4,
    meetingTime: "12:00",
    meetingLocation: "Art Room",
    members: [
      "b1000000-0000-4000-8000-000000000005",
      "b1000000-0000-4000-8000-000000000010",
      "b1000000-0000-4000-8000-000000000014",
      "b1000000-0000-4000-8000-000000000025",
      "b1000000-0000-4000-8000-000000000030"
    ]
  },
  {
    id: "club-005",
    name: "Music Club",
    description: "Vocal and instrumental music practice",
    teacherName: "Fatima Khan",
    meetingDay: 5,
    meetingTime: "12:00",
    meetingLocation: "Music Room",
    members: [
      "b1000000-0000-4000-8000-000000000006",
      "b1000000-0000-4000-8000-000000000009",
      "b1000000-0000-4000-8000-000000000016",
      "b1000000-0000-4000-8000-000000000028",
      "b1000000-0000-4000-8000-000000000035"
    ]
  },
  {
    id: "club-006",
    name: "Sports Club",
    description: "Cricket, football, basketball, and athletics",
    teacherName: "Amit Kumar",
    meetingDay: 4,
    meetingTime: "12:00",
    meetingLocation: "Sports Complex",
    members: [
      "b1000000-0000-4000-8000-000000000001",
      "b1000000-0000-4000-8000-000000000003",
      "b1000000-0000-4000-8000-000000000005",
      "b1000000-0000-4000-8000-000000000007",
      "b1000000-0000-4000-8000-000000000009",
      "b1000000-0000-4000-8000-000000000017",
      "b1000000-0000-4000-8000-000000000024"
    ]
  },
  {
    id: "club-007",
    name: "Eco Club",
    description: "Environmental awareness and sustainability projects",
    teacherName: "Suresh Patel",
    meetingDay: 1,
    meetingTime: "12:00",
    meetingLocation: "School Garden",
    members: [
      "b1000000-0000-4000-8000-000000000004",
      "b1000000-0000-4000-8000-000000000008",
      "b1000000-0000-4000-8000-000000000018",
      "b1000000-0000-4000-8000-000000000021",
      "b1000000-0000-4000-8000-000000000031"
    ]
  },
  {
    id: "club-008",
    name: "Debate Club",
    description: "Public speaking, MUN, and debate competitions",
    teacherName: "Priya Nair",
    meetingDay: 2,
    meetingTime: "12:00",
    meetingLocation: "Auditorium",
    members: [
      "b1000000-0000-4000-8000-000000000002",
      "b1000000-0000-4000-8000-000000000006",
      "b1000000-0000-4000-8000-000000000010",
      "b1000000-0000-4000-8000-000000000023",
      "b1000000-0000-4000-8000-000000000032"
    ]
  }
];

export const EVENTS = [
  { name: "Annual Day", type: "cultural", startDate: "2025-12-20", endDate: "2025-12-20", description: "Annual day celebration with cultural performances", venue: "Auditorium" },
  { name: "Sports Day", type: "sports", startDate: "2025-11-15", endDate: "2025-11-16", description: "Inter-house sports competition", venue: "Sports Complex" },
  { name: "Science Exhibition", type: "academic", startDate: "2025-08-10", endDate: "2025-08-11", description: "Student science project exhibition", venue: "Main Block" },
  { name: "Independence Day", type: "national", startDate: "2025-08-15", endDate: "2025-08-15", description: "Independence Day flag hoisting ceremony", venue: "School Ground" },
  { name: "Republic Day", type: "national", startDate: "2026-01-26", endDate: "2026-01-26", description: "Republic Day celebration with parade", venue: "School Ground" },
  { name: "Teachers' Day", type: "celebration", startDate: "2025-09-05", endDate: "2025-09-05", description: "Student-organized appreciation for teachers" },
  { name: "PTM Term 1", type: "ptm", startDate: "2025-09-20", endDate: "2025-09-20", description: "Parent-Teacher Meeting for Term 1 results" },
  { name: "PTM Term 2", type: "ptm", startDate: "2026-03-15", endDate: "2026-03-15", description: "Parent-Teacher Meeting for Term 2 results" },
  { name: "Winter Carnival", type: "cultural", startDate: "2025-12-21", endDate: "2025-12-21", description: "Fun fair with stalls and games", venue: "School Ground" },
  { name: "Art Week", type: "cultural", startDate: "2025-10-06", endDate: "2025-10-11", description: "Week-long art exhibition and workshops", venue: "Art Room" }
];

export const HOLIDAYS = [
  { date: "2025-04-14", name: "Dr. Ambedkar Jayanti" },
  { date: "2025-04-18", name: "Good Friday" },
  { date: "2025-05-01", name: "May Day" },
  { date: "2025-06-17", name: "Eid ul-Adha" },
  { date: "2025-08-15", name: "Independence Day" },
  { date: "2025-08-19", name: "Janmashtami" },
  { date: "2025-10-02", name: "Gandhi Jayanti" },
  { date: "2025-10-20", name: "Diwali Break" },
  { date: "2025-10-21", name: "Diwali Break" },
  { date: "2025-10-22", name: "Diwali Break" },
  { date: "2025-11-05", name: "Guru Nanak Jayanti" },
  { date: "2025-12-25", name: "Christmas" },
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-10", name: "Holi" }
];

export const NOTICES = [
  {
    title: "School Reopening After Summer Break",
    body: "School reopens on 1st April 2025. Students must bring their updated notebooks and ID cards. Kindly ensure all fees are cleared before rejoining.",
    postedBy: "Principal's Office",
    postedAt: "2025-03-25T09:00:00",
    targetAudience: ["student", "parent"]
  },
  {
    title: "Bus Route Changes for New Session",
    body: "Some bus routes have been updated for the new academic year. Please check with the transport office for your updated stop timings.",
    postedBy: "Transport Dept",
    postedAt: "2025-03-28T10:00:00",
    targetAudience: ["student", "parent"]
  },
  {
    title: "PTM Schedule - Term 1",
    body: "Parent-Teacher Meeting for Term 1 results will be held on 20th September 2025 (Saturday) from 9:00 AM to 1:00 PM.",
    postedBy: "Principal's Office",
    postedAt: "2025-09-10T08:00:00",
    targetAudience: ["parent"]
  },
  {
    title: "Annual Day Rehearsals",
    body: "Annual Day rehearsals will begin from 1st December. All participating students must report to the auditorium during their allocated slots.",
    postedBy: "Cultural Committee",
    postedAt: "2025-11-28T09:00:00",
    targetAudience: ["student"]
  },
  {
    title: "Exam Schedule - Mid Term",
    body: "Mid-term examinations will begin from 15th September. Students are advised to start preparing. Time-table will be shared in class.",
    postedBy: "Exam Cell",
    postedAt: "2025-08-25T09:00:00",
    targetAudience: ["student", "parent", "teacher"]
  }
];

export const POLICIES = [
  {
    category: "Attendance",
    title: "Minimum Attendance Policy",
    content: "Students must maintain minimum 75% attendance to be eligible for final examinations. Leaves require prior written application or medical certificate within 3 days."
  },
  {
    category: "Discipline",
    title: "Uniform Policy",
    content: "Students must wear the prescribed school uniform on all school days. Casual dress is allowed only on birthdays with prior permission."
  },
  {
    category: "Fees",
    title: "Fee Payment Schedule",
    content: "School fees are due by the 10th of each month. Late payment attracts a fine of Rs. 100 per week. Fees can be paid online or at the school office."
  },
  {
    category: "Library",
    title: "Library Rules",
    content: "Students can borrow up to 2 books at a time for 14 days. Late return incurs a fine of Rs. 5 per day per book. Reference books cannot be borrowed."
  },
  {
    category: "Examination",
    title: "Assessment Policy",
    content: "Internal assessment includes periodic tests (20 marks), half-yearly (40 marks), and annual (40 marks). Students scoring below 33% in any subject will be given remedial classes."
  },
  {
    category: "Safety",
    title: "Student Safety Protocol",
    content: "Students must carry ID cards at all times. Visitors are allowed only with prior appointment. Emergency contact details must be updated annually."
  },
  {
    category: "Transport",
    title: "Bus Rules",
    content: "Students must be at their bus stop 5 minutes before scheduled time. Misconduct on the bus may result in transport suspension. Students must wear seat belts."
  }
];

export const BUS_ROUTES = [
  {
    routeId: "R1",
    routeName: "Route 1 - Green Park / Hauz Khas",
    driverName: "Mohammad Irfan",
    busNumber: "DL-01-AB-1234",
    stops: ["Green Park Metro", "Hauz Khas Village", "Aurobindo Market", "Saket", "School"]
  },
  {
    routeId: "R2",
    routeName: "Route 2 - Lajpat Nagar / Nehru Place",
    driverName: "Vijay Kumar",
    busNumber: "DL-02-CD-5678",
    stops: ["Lajpat Nagar", "Kailash Colony", "Nehru Place", "Kalkaji", "School"]
  },
  {
    routeId: "R3",
    routeName: "Route 3 - Vasant Kunj / Chanakyapuri",
    driverName: "Rajinder Singh",
    busNumber: "DL-03-EF-9012",
    stops: ["Vasant Kunj", "Munirka", "Dhaula Kuan", "Chanakyapuri", "School"]
  },
  {
    routeId: "R4",
    routeName: "Route 4 - Dwarka / Janakpuri",
    driverName: "Sunil Yadav",
    busNumber: "DL-04-GH-3456",
    stops: ["Dwarka Sec 12", "Janakpuri", "Tagore Garden", "Rajouri Garden", "School"]
  },
  {
    routeId: "R5",
    routeName: "Route 5 - Greater Kailash / CR Park",
    driverName: "Amit Sharma",
    busNumber: "DL-05-IJ-7890",
    stops: ["Greater Kailash I", "CR Park", "Kalu Sarai", "Maidan Garhi", "School"]
  }
];

export const CANTEEN_MENU = [
  {
    dayOfWeek: 1,
    meals: [
      { type: "Breakfast", items: ["Poha", "Boiled Eggs", "Bread Butter"] },
      { type: "Lunch", items: ["Rajma Chawal", "Roti", "Mixed Veg", "Salad", "Curd"] },
      { type: "Snack", items: ["Samosa", "Lemon Tea"] }
    ]
  },
  {
    dayOfWeek: 2,
    meals: [
      { type: "Breakfast", items: ["Upma", "Idli Sambar", "Fruit Bowl"] },
      { type: "Lunch", items: ["Chole Bhature", "Rice", "Aloo Gobi", "Salad", "Raita"] },
      { type: "Snack", items: ["Bread Pakora", "Milk"] }
    ]
  },
  {
    dayOfWeek: 3,
    meals: [
      { type: "Breakfast", items: ["Paratha Curd", "Cornflakes", "Banana"] },
      { type: "Lunch", items: ["Paneer Butter Masala", "Naan", "Jeera Rice", "Dal", "Salad"] },
      { type: "Snack", items: ["Momos", "Soup"] }
    ]
  },
  {
    dayOfWeek: 4,
    meals: [
      { type: "Breakfast", items: ["Aloo Tikki", "Sprouts", "Toast"] },
      { type: "Lunch", items: ["Veg Biryani", "Boondi Raita", "Salad", "Gulab Jamun"] },
      { type: "Snack", items: ["Dhokla", "Chai"] }
    ]
  },
  {
    dayOfWeek: 5,
    meals: [
      { type: "Breakfast", items: ["Dosa Sambar", "Muesli", "Apple"] },
      { type: "Lunch", items: ["Dal Makhani", "Rice", "Butter Roti", "Aloo Matar", "Halwa"] },
      { type: "Snack", items: ["Sandwich", "Juice"] }
    ]
  }
];

export const RULES = [
  "Students must reach school by 7:55 AM. Late comers will be marked absent for the first period.",
  "Mobile phones are strictly prohibited inside the school campus.",
  "Students must address all teachers and staff with respect.",
  "Damaging school property will result in fine and disciplinary action.",
  "Students must not leave the school premises during school hours without permission.",
  "Bullying in any form is a punishable offense.",
  "Students must keep the school premises clean and use dustbins.",
  "Birthday celebrations in school are allowed with simple distribution of toffees only."
];

export function getSchoolInfo(): SchoolProfile {
  return SCHOOL_PROFILE;
}

export function getPrincipalInfo() {
  return {
    name: SCHOOL_PROFILE.principal.name,
    qualification: SCHOOL_PROFILE.principal.qualification,
    office: "Ground Floor, Main Block"
  };
}

export function getVicePrincipalInfo() {
  return {
    name: SCHOOL_PROFILE.vicePrincipal.name,
    qualification: SCHOOL_PROFILE.vicePrincipal.qualification,
    office: "Ground Floor, Main Block"
  };
}

export function getHouseByName(name: string): House | undefined {
  return SCHOOL_PROFILE.houses.find(h => h.name.toLowerCase() === name.toLowerCase());
}

export function getAllHouses(): House[] {
  return SCHOOL_PROFILE.houses;
}

export function getAcademicYear() {
  return SCHOOL_PROFILE.academicYear;
}

export function getCurrentTerm(): string {
  const now = new Date();
  for (const term of SCHOOL_PROFILE.academicYear.terms) {
    const start = new Date(term.start);
    const end = new Date(term.end);
    if (now >= start && now <= end) {
      return term.name;
    }
  }
  return "Vacation";
}

export function getSchoolTimings() {
  return SCHOOL_PROFILE.timings;
}

export function getBusRoutes() {
  return BUS_ROUTES;
}

export function getBusRouteById(routeId: string) {
  return BUS_ROUTES.find(r => r.routeId === routeId);
}

export function getNotices(audience?: string) {
  if (!audience) return NOTICES;
  return NOTICES.filter(n => n.targetAudience.includes(audience));
}

export function getHolidays() {
  return HOLIDAYS;
}

export function getUpcomingEvents() {
  const now = new Date();
  return EVENTS.filter(e => new Date(e.startDate) >= now).sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export function getPolicies(category?: string) {
  if (!category) return POLICIES;
  return POLICIES.filter(p => p.category.toLowerCase() === category.toLowerCase());
}
