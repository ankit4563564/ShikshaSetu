import type { EventInfo, ClubInfo } from '../models/index';

export const DEMO_EVENTS: EventInfo[] = [
  {
    id: 'ev-101',
    name: 'Annual Inter-House Sports Meet (Sports Day 2026)',
    category: 'Sports',
    startDate: '2026-08-14',
    endDate: '2026-08-15',
    description: 'Track and field events, sprint races, march past, relay competitions, and trophy distribution.',
    venue: 'Main School Athletics Ground',
    targetAudience: 'All Students, Teachers & Parents',
  },
  {
    id: 'ev-102',
    name: 'National STEM & Science Fair 2026',
    category: 'Academic',
    startDate: '2026-08-05',
    endDate: '2026-08-06',
    description: 'Working models, AI & Robotics exhibition, green energy projects judged by IIT professors.',
    venue: 'Auditorium & Innovation Hub',
    targetAudience: 'Grades 6 to 12',
  },
  {
    id: 'ev-103',
    name: 'Parent-Teacher Meeting (PTM Term 1)',
    category: 'PTM',
    startDate: '2026-07-26',
    endDate: '2026-07-26',
    description: 'Individual progress review, answer sheet inspection, and feedback collection.',
    venue: 'Respective Classrooms',
    targetAudience: 'Parents of All Grades',
  },
  {
    id: 'ev-104',
    name: 'Independence Day Cultural Celebration',
    category: 'Cultural',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    description: 'Flag hoisting ceremony, patriotic songs, dance performances, and sweet distribution.',
    venue: 'Central Courtyard',
    targetAudience: 'Whole School Community',
  },
];

export const DEMO_CLUBS: ClubInfo[] = [
  { id: 'c-101', name: 'Robotics & AI Club', description: 'Arduino programming, drone assembly, autonomous navigation, and bot wars.', teacherInCharge: 'Amitabh Sen', meetingDay: 'Wednesday', meetingTime: '02:30 PM - 03:45 PM', location: 'IT Lab A', memberCount: 28 },
  { id: 'c-102', name: 'Literary & Debate Society', description: 'Model United Nations preparation, extempore speaking, creative writing, and parliamentary debate.', teacherInCharge: 'Priya Nair', meetingDay: 'Tuesday', meetingTime: '02:30 PM - 03:45 PM', location: 'Conference Hall B', memberCount: 32 },
  { id: 'c-103', name: 'Eco Warriors & Sustainability Club', description: 'Organic gardening, solar energy audits, zero-waste campus initiatives.', teacherInCharge: 'Sunil Verma', meetingDay: 'Thursday', meetingTime: '02:30 PM - 03:45 PM', location: 'Biology Garden', memberCount: 24 },
  { id: 'c-104', name: 'Chess & Strategic Gaming Club', description: 'Grandmaster strategy analysis, blitz tournaments, and tactical training.', teacherInCharge: 'Ananya Sharma', meetingDay: 'Friday', meetingTime: '02:30 PM - 03:45 PM', location: 'Room 201', memberCount: 30 },
  { id: 'c-105', name: 'Performing Arts & Dramatics Club', description: 'Stage plays, street theatre (Nukkad Natak), scriptwriting, and voice modulation.', teacherInCharge: 'Sanjay Joshi', meetingDay: 'Monday', meetingTime: '02:30 PM - 03:45 PM', location: 'Auditorium', memberCount: 35 },
];

export function getUpcomingEvents(): EventInfo[] {
  return DEMO_EVENTS;
}

export function getSportsDayInfo(): EventInfo {
  return DEMO_EVENTS[0];
}
