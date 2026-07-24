export interface SchoolEvent {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  description: string;
  venue: string;
  targetAudience: string[];
  organizer: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  postedAt: string;
  expiresAt: string;
  targetAudience: string[];
}

export interface Holiday {
  name: string;
  date: string;
  type: string;
  description: string;
}

export const EVENTS: SchoolEvent[] = [
  {
    id: 'event-001',
    name: 'Annual Day Celebration',
    type: 'cultural',
    startDate: '2025-12-20',
    endDate: '2025-12-20',
    description: 'Grand annual day function featuring cultural performances by students, prize distribution, and the principal\'s address.',
    venue: 'School Auditorium',
    targetAudience: ['students', 'parents', 'teachers'],
    organizer: 'Cultural Committee',
  },
  {
    id: 'event-002',
    name: 'Sports Day',
    type: 'sports',
    startDate: '2025-11-15',
    endDate: '2025-11-16',
    description: 'Annual inter-house sports competition with athletics, relay races, and team sports.',
    venue: 'School Sports Ground',
    targetAudience: ['students', 'parents', 'teachers'],
    organizer: 'Sports Department',
  },
  {
    id: 'event-003',
    name: 'Science Fair 2025',
    type: 'academic',
    startDate: '2025-08-25',
    endDate: '2025-08-26',
    description: 'Students display science models and experiments. Judges from local universities will evaluate projects.',
    venue: 'School Hall A & Hall B',
    targetAudience: ['students', 'teachers'],
    organizer: 'Science Department',
  },
  {
    id: 'event-004',
    name: 'Math Olympiad',
    type: 'competition',
    startDate: '2025-09-20',
    endDate: '2025-09-20',
    description: 'Inter-class mathematics competition for students of classes 6-9. Top performers qualify for the district level.',
    venue: 'Exam Hall',
    targetAudience: ['students'],
    organizer: 'Mathematics Department',
  },
  {
    id: 'event-005',
    name: 'Inter-House Debate Competition',
    type: 'competition',
    startDate: '2025-10-10',
    endDate: '2025-10-10',
    description: 'Debate competition between the four houses on current affairs topics.',
    venue: 'Hall B',
    targetAudience: ['students', 'teachers'],
    organizer: 'English Department',
  },
  {
    id: 'event-006',
    name: 'Diwali Celebration',
    type: 'cultural',
    startDate: '2025-10-20',
    endDate: '2025-10-20',
    description: 'School-wide Diwali celebration with rangoli competition, diya decoration, and cultural program.',
    venue: 'School Campus',
    targetAudience: ['students', 'teachers'],
    organizer: 'Cultural Committee',
  },
  {
    id: 'event-007',
    name: 'Christmas Party',
    type: 'cultural',
    startDate: '2025-12-25',
    endDate: '2025-12-25',
    description: 'Christmas celebration with Santa Claus visit, carol singing, gift exchange, and special lunch.',
    venue: 'School Auditorium',
    targetAudience: ['students', 'teachers'],
    organizer: 'Cultural Committee',
  },
  {
    id: 'event-008',
    name: 'Republic Day Celebration',
    type: 'holiday',
    startDate: '2026-01-26',
    endDate: '2026-01-26',
    description: 'Flag hoisting ceremony, parade by NCC cadets, and cultural performances marking Republic Day.',
    venue: 'School Ground',
    targetAudience: ['students', 'parents', 'teachers'],
    organizer: 'Administration',
  },
  {
    id: 'event-009',
    name: 'Annual School Picnic',
    type: 'cultural',
    startDate: '2026-02-14',
    endDate: '2026-02-14',
    description: 'Annual school picnic to Wonder City amusement park. Bus transportation provided.',
    venue: 'Wonder City Amusement Park',
    targetAudience: ['students', 'teachers'],
    organizer: 'Student Welfare Committee',
  },
  {
    id: 'event-010',
    name: 'Holi Celebration',
    type: 'cultural',
    startDate: '2026-03-10',
    endDate: '2026-03-10',
    description: 'Eco-friendly Holi celebration with organic colours, music, and special thandai drink.',
    venue: 'School Ground',
    targetAudience: ['students', 'teachers'],
    organizer: 'Cultural Committee',
  },
  {
    id: 'event-011',
    name: "Teacher's Day",
    type: 'cultural',
    startDate: '2025-09-05',
    endDate: '2025-09-05',
    description: "Students organize a special program to honor teachers with performances, speeches, and handmade cards.",
    venue: 'School Auditorium',
    targetAudience: ['students', 'teachers'],
    organizer: 'Student Council',
  },
  {
    id: 'event-012',
    name: "Children's Day",
    type: 'cultural',
    startDate: '2025-11-14',
    endDate: '2025-11-14',
    description: "Special celebration for Children's Day with games, fun activities, and movie screening.",
    venue: 'School Campus',
    targetAudience: ['students', 'teachers'],
    organizer: 'Student Council',
  },
  {
    id: 'event-013',
    name: 'Investiture Ceremony',
    type: 'academic',
    startDate: '2025-04-15',
    endDate: '2025-04-15',
    description: 'Formal ceremony to invest the newly elected student council with badges and responsibilities.',
    venue: 'School Auditorium',
    targetAudience: ['students', 'parents', 'teachers'],
    organizer: 'Administration',
  },
  {
    id: 'event-014',
    name: 'Book Week',
    type: 'academic',
    startDate: '2025-07-21',
    endDate: '2025-07-26',
    description: 'Week-long celebration of reading with book fair, author visits, and reading competitions.',
    venue: 'School Library',
    targetAudience: ['students', 'teachers'],
    organizer: 'Library Committee',
  },
  {
    id: 'event-015',
    name: 'Art Exhibition',
    type: 'cultural',
    startDate: '2026-01-18',
    endDate: '2026-01-19',
    description: 'Annual art exhibition showcasing student artwork including paintings, sculptures, and digital art.',
    venue: 'Art Gallery & Hall A',
    targetAudience: ['students', 'parents', 'teachers'],
    organizer: 'Art Department',
  },
  {
    id: 'event-016',
    name: 'Music Concert',
    type: 'cultural',
    startDate: '2026-02-07',
    endDate: '2026-02-07',
    description: 'Annual music concert featuring school choir, solo performances, and instrumental renditions.',
    venue: 'School Auditorium',
    targetAudience: ['students', 'parents', 'teachers'],
    organizer: 'Music Department',
  },
  {
    id: 'event-017',
    name: 'Career Guidance Workshop',
    type: 'workshop',
    startDate: '2025-12-13',
    endDate: '2025-12-13',
    description: 'Workshop for class 9 students on career options, streams, and guidance from industry professionals.',
    venue: 'Hall B',
    targetAudience: ['students', 'parents'],
    organizer: 'Counseling Department',
  },
  {
    id: 'event-018',
    name: 'Parent Orientation Session',
    type: 'ptm',
    startDate: '2025-04-05',
    endDate: '2025-04-05',
    description: 'Orientation for new parents covering school rules, curriculum, and communication channels.',
    venue: 'School Auditorium',
    targetAudience: ['parents'],
    organizer: 'Administration',
  },
  {
    id: 'event-019',
    name: 'Field Trip to Science Museum',
    type: 'academic',
    startDate: '2025-09-27',
    endDate: '2025-09-27',
    description: 'Educational field trip to the National Science Museum for classes 7 and 8.',
    venue: 'National Science Museum',
    targetAudience: ['students'],
    organizer: 'Science Department',
  },
  {
    id: 'event-020',
    name: 'Summer Camp 2025',
    type: 'workshop',
    startDate: '2025-06-02',
    endDate: '2025-06-14',
    description: 'Two-week summer camp with activities including art, sports, coding, and outdoor adventure.',
    venue: 'School Campus',
    targetAudience: ['students'],
    organizer: 'Student Welfare Committee',
  },
];

export const NOTICES: Notice[] = [
  {
    id: 'notice-001',
    title: 'Annual Day Rehearsals',
    body: 'All students participating in the Annual Day function are required to attend rehearsals daily from 3:00 PM to 5:00 PM starting December 10.',
    postedBy: 'Principal Mrs. Sharma',
    postedAt: '2025-12-05T09:00:00',
    expiresAt: '2025-12-20T18:00:00',
    targetAudience: ['students'],
  },
  {
    id: 'notice-002',
    title: 'Winter Uniform Notice',
    body: 'Winter uniform is mandatory from November 15 onwards. Students must wear blazers and closed shoes. No sports shoes allowed.',
    postedBy: 'Vice Principal Mr. Gupta',
    postedAt: '2025-11-10T08:30:00',
    expiresAt: '2026-03-31T18:00:00',
    targetAudience: ['students', 'parents'],
  },
  {
    id: 'notice-003',
    title: 'Fee Submission Deadline',
    body: 'Q3 fee payments are due by December 15. Late payments will attract a penalty of ₹200. Please submit at the accounts office.',
    postedBy: 'Accounts Office',
    postedAt: '2025-12-01T09:00:00',
    expiresAt: '2025-12-15T18:00:00',
    targetAudience: ['parents'],
  },
  {
    id: 'notice-004',
    title: 'Sports Day Results',
    body: 'Congratulations to all participants. House results: 1st - Sunhouse, 2nd - Earth House, 3rd - Fire House, 4th - Water House.',
    postedBy: 'Sports Department',
    postedAt: '2025-11-17T10:00:00',
    expiresAt: '2025-12-17T18:00:00',
    targetAudience: ['students', 'teachers'],
  },
  {
    id: 'notice-005',
    title: 'Library Late Fee',
    body: 'Overdue book fines have been revised to ₹2 per day per book. Students with outstanding fines will not receive report cards.',
    postedBy: 'Librarian Mrs. Nair',
    postedAt: '2025-12-10T09:00:00',
    expiresAt: '2026-06-30T18:00:00',
    targetAudience: ['students', 'parents'],
  },
  {
    id: 'notice-006',
    title: 'PTM Schedule',
    body: 'Parent-Teacher Meeting for classes 7 and 8 will be held on December 21 from 8:00 AM to 12:00 PM. Prior appointment not required.',
    postedBy: 'Principal Mrs. Sharma',
    postedAt: '2025-12-15T09:00:00',
    expiresAt: '2025-12-21T12:00:00',
    targetAudience: ['parents'],
  },
  {
    id: 'notice-007',
    title: 'Lab Safety Rules',
    body: 'All students must follow lab safety protocols. No experiments without teacher supervision. Report any breakages immediately.',
    postedBy: 'Science Department',
    postedAt: '2025-11-20T08:30:00',
    expiresAt: '2026-06-30T18:00:00',
    targetAudience: ['students'],
  },
  {
    id: 'notice-008',
    title: 'Bus Route Changes',
    body: 'Due to road construction near Vasant Kunj, Bus Route 3 will take a detour via Nelson Mandela Marg from December 8.',
    postedBy: 'Transport Manager',
    postedAt: '2025-12-05T08:00:00',
    expiresAt: '2026-01-31T18:00:00',
    targetAudience: ['students', 'parents'],
  },
  {
    id: 'notice-009',
    title: 'Inter-School Competition',
    body: 'Students interested in participating in the Inter-School Science Quiz (Dec 15) should register with Mr. Verma by December 8.',
    postedBy: 'Science Department',
    postedAt: '2025-12-02T09:00:00',
    expiresAt: '2025-12-08T18:00:00',
    targetAudience: ['students'],
  },
  {
    id: 'notice-010',
    title: 'Holiday Homework',
    body: 'Winter break homework has been uploaded to the school portal. Last date of submission is January 6, 2026.',
    postedBy: 'Academic Coordinator',
    postedAt: '2025-12-18T09:00:00',
    expiresAt: '2026-01-06T18:00:00',
    targetAudience: ['students', 'parents'],
  },
];

export const HOLIDAYS: Holiday[] = [
  {
    name: 'Summer Vacation',
    date: '2025-05-24',
    type: 'vacation',
    description: 'School closed for summer vacation from May 24 to June 30.',
  },
  {
    name: 'Rath Yatra',
    date: '2025-06-27',
    type: 'festival',
    description: 'School closed on account of Rath Yatra.',
  },
  {
    name: 'Independence Day',
    date: '2025-08-15',
    type: 'national',
    description: 'National holiday celebrating India\'s Independence Day.',
  },
  {
    name: 'Janmashtami',
    date: '2025-08-16',
    type: 'festival',
    description: 'School closed on account of Janmashtami.',
  },
  {
    name: 'Ganesh Chaturthi',
    date: '2025-08-27',
    type: 'festival',
    description: 'School closed on account of Ganesh Chaturthi.',
  },
  {
    name: 'Gandhi Jayanti',
    date: '2025-10-02',
    type: 'national',
    description: 'National holiday marking the birthday of Mahatma Gandhi.',
  },
  {
    name: 'Dussehra',
    date: '2025-10-02',
    type: 'festival',
    description: 'School closed on account of Dussehra.',
  },
  {
    name: 'Diwali Vacation',
    date: '2025-10-18',
    type: 'vacation',
    description: 'School closed for Diwali vacation from October 18 to October 24.',
  },
  {
    name: 'Guru Nanak Jayanti',
    date: '2025-11-05',
    type: 'festival',
    description: 'School closed on account of Guru Nanak Jayanti.',
  },
  {
    name: 'Christmas Vacation',
    date: '2025-12-24',
    type: 'vacation',
    description: 'School closed for Christmas and New Year vacation from December 24 to January 1.',
  },
  {
    name: 'Republic Day',
    date: '2026-01-26',
    type: 'national',
    description: 'National holiday celebrating Republic Day of India.',
  },
  {
    name: 'Maha Shivaratri',
    date: '2026-02-15',
    type: 'festival',
    description: 'School closed on account of Maha Shivaratri.',
  },
  {
    name: 'Holi',
    date: '2026-03-10',
    type: 'festival',
    description: 'School closed on account of Holi.',
  },
  {
    name: 'Id-ul-Fitr',
    date: '2026-03-21',
    type: 'festival',
    description: 'School closed on account of Id-ul-Fitr.',
  },
  {
    name: 'Good Friday',
    date: '2026-04-03',
    type: 'festival',
    description: 'School closed on account of Good Friday.',
  },
];

export function getUpcomingEvents(count: number = 5): SchoolEvent[] {
  const now = new Date();
  return EVENTS.filter((e) => new Date(e.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, count);
}

export function getEventsByType(type: string): SchoolEvent[] {
  return EVENTS.filter((e) => e.type.toLowerCase() === type.toLowerCase());
}

export function getEventByName(name: string): SchoolEvent | undefined {
  return EVENTS.find(
    (e) => e.name.toLowerCase() === name.toLowerCase()
  );
}

export function getActiveNotices(): Notice[] {
  const now = new Date();
  return NOTICES.filter((n) => {
    const expires = new Date(n.expiresAt);
    return expires >= now;
  });
}

export function getHolidaysInMonth(month: number, year: number): Holiday[] {
  return HOLIDAYS.filter((h) => {
    const d = new Date(h.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
}

export function getNextHoliday(): Holiday | undefined {
  const now = new Date();
  return HOLIDAYS.filter((h) => new Date(h.date) >= now).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];
}

export function isHoliday(date: string): boolean {
  return HOLIDAYS.some((h) => h.date === date);
}
