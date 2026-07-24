export interface SportsEvent {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string;
  participants: string[];
  results?: string;
}

export interface SportsFacility {
  name: string;
  location: string;
  capacity: string;
  available: boolean;
}

export const SPORTS_EVENTS: SportsEvent[] = [
  {
    id: 'sports-001',
    name: 'Annual Sports Day',
    date: '2025-11-15',
    type: 'inter-house',
    description: 'Annual inter-house sports competition with track events, relay races, and team sports.',
    participants: [
      'b1000000-0000-4000-8000-000000000001',
      'b1000000-0000-4000-8000-000000000002',
      'b1000000-0000-4000-8000-000000000003',
      'b1000000-0000-4000-8000-000000000005',
      'b1000000-0000-4000-8000-000000000006',
      'b1000000-0000-4000-8000-000000000007',
      'b1000000-0000-4000-8000-000000000008',
      'b1000000-0000-4000-8000-000000000009',
      'b1000000-0000-4000-8000-000000000011',
      'b1000000-0000-4000-8000-000000000012',
    ],
    results: '1st - Sun House, 2nd - Earth House, 3rd - Fire House',
  },
  {
    id: 'sports-002',
    name: 'Inter-School Cricket Tournament',
    date: '2025-10-08',
    type: 'inter-school',
    description: 'District-level under-14 cricket tournament hosted at our school ground.',
    participants: [
      'b1000000-0000-4000-8000-000000000001',
      'b1000000-0000-4000-8000-000000000003',
      'b1000000-0000-4000-8000-000000000005',
      'b1000000-0000-4000-8000-000000000007',
      'b1000000-0000-4000-8000-000000000011',
    ],
    results: 'School team reached semi-finals',
  },
  {
    id: 'sports-003',
    name: 'Basketball Championship',
    date: '2025-11-25',
    type: 'tournament',
    description: 'Zonal basketball championship for under-15 boys and girls teams.',
    participants: [
      'b1000000-0000-4000-8000-000000000006',
      'b1000000-0000-4000-8000-000000000008',
      'b1000000-0000-4000-8000-000000000013',
    ],
    results: 'Girls team won 2nd position',
  },
  {
    id: 'sports-004',
    name: 'Swimming Trials',
    date: '2025-12-05',
    type: 'practice',
    description: 'Swimming trials for selecting school team for district-level competition.',
    participants: [
      'b1000000-0000-4000-8000-000000000002',
      'b1000000-0000-4000-8000-000000000008',
      'b1000000-0000-4000-8000-000000000014',
    ],
  },
  {
    id: 'sports-005',
    name: 'Inter-House Badminton',
    date: '2025-09-15',
    type: 'inter-house',
    description: 'Inter-house badminton tournament for singles and doubles categories.',
    participants: [
      'b1000000-0000-4000-8000-000000000004',
      'b1000000-0000-4000-8000-000000000006',
      'b1000000-0000-4000-8000-000000000010',
      'b1000000-0000-4000-8000-000000000012',
    ],
    results: 'Singles Winner - Ananya G (Earth House), Doubles Winner - Fire House',
  },
  {
    id: 'sports-006',
    name: 'Athletics Meet',
    date: '2025-10-22',
    type: 'inter-house',
    description: 'Track and field events including 100m, 200m, 400m, long jump, and shot put.',
    participants: [
      'b1000000-0000-4000-8000-000000000001',
      'b1000000-0000-4000-8000-000000000003',
      'b1000000-0000-4000-8000-000000000007',
      'b1000000-0000-4000-8000-000000000009',
      'b1000000-0000-4000-8000-000000000014',
      'b1000000-0000-4000-8000-000000000015',
    ],
    results: '100m Winner - Arjun, 400m Winner - Aarav, Long Jump - Ishaan',
  },
  {
    id: 'sports-007',
    name: 'Football Friendly Match',
    date: '2025-12-18',
    type: 'inter-school',
    description: 'Friendly football match with Delhi Public School, Vasant Vihar.',
    participants: [
      'b1000000-0000-4000-8000-000000000001',
      'b1000000-0000-4000-8000-000000000005',
      'b1000000-0000-4000-8000-000000000007',
      'b1000000-0000-4000-8000-000000000011',
      'b1000000-0000-4000-8000-000000000012',
    ],
    results: 'Match ended 2-1 in our favour',
  },
  {
    id: 'sports-008',
    name: 'Table Tennis Tournament',
    date: '2026-01-15',
    type: 'tournament',
    description: 'City-level under-14 table tennis championship.',
    participants: [
      'b1000000-0000-4000-8000-000000000009',
      'b1000000-0000-4000-8000-000000000010',
    ],
  },
  {
    id: 'sports-009',
    name: 'Yoga Day Celebration',
    date: '2025-06-21',
    type: 'practice',
    description: 'International Yoga Day celebration with mass yoga session for all students.',
    participants: [],
  },
  {
    id: 'sports-010',
    name: 'Upcoming Sports Day 2026',
    date: '2026-02-28',
    type: 'inter-house',
    description: 'Annual sports day for the 2025-26 academic year with new events including tug-of-war.',
    participants: [],
  },
];

export const SPORTS_FACILITIES: SportsFacility[] = [
  {
    name: 'Basketball Court',
    location: 'Sports Block - Ground Floor',
    capacity: '10 players',
    available: true,
  },
  {
    name: 'Cricket Ground',
    location: 'Main Sports Ground - East Wing',
    capacity: '22 players',
    available: true,
  },
  {
    name: 'Football Field',
    location: 'Main Sports Ground - West Wing',
    capacity: '22 players',
    available: true,
  },
  {
    name: 'Swimming Pool',
    location: 'Sports Block - Basement',
    capacity: '30 swimmers',
    available: false,
  },
  {
    name: 'Badminton Court',
    location: 'Sports Block - First Floor',
    capacity: '8 players',
    available: true,
  },
  {
    name: 'Table Tennis Room',
    location: 'Sports Block - First Floor',
    capacity: '8 players',
    available: true,
  },
  {
    name: 'Athletics Track',
    location: 'Main Sports Ground - Perimeter',
    capacity: '50 runners',
    available: true,
  },
  {
    name: 'Gym',
    location: 'Sports Block - Ground Floor',
    capacity: '15 persons',
    available: true,
  },
];

export function getUpcomingSportsEvents(): SportsEvent[] {
  const now = new Date();
  return SPORTS_EVENTS.filter((e) => new Date(e.date) >= now).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getSportsFacilities(): SportsFacility[] {
  return SPORTS_FACILITIES;
}
