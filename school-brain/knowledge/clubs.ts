export interface Club {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  meetingDay: number;
  meetingTime: string;
  meetingLocation: string;
  members: string[];
  maxMembers: number;
}

export const CLUBS: Club[] = [
  {
    id: 'club-001',
    name: 'Robotics Club',
    description: 'Learn to design, build, and program robots using Arduino and Raspberry Pi. Students participate in inter-school robotics competitions.',
    teacherId: 'a1000000-0000-4000-8000-000000000001',
    teacherName: 'Ananya Mehra',
    meetingDay: 3,
    meetingTime: '15:00',
    meetingLocation: 'Lab 1',
    members: [
      'b1000000-0000-4000-8000-000000000001',
      'b1000000-0000-4000-8000-000000000003',
      'b1000000-0000-4000-8000-000000000006',
      'b1000000-0000-4000-8000-000000000007',
      'b1000000-0000-4000-8000-000000000008',
    ],
    maxMembers: 20,
  },
  {
    id: 'club-002',
    name: 'Drama Club',
    description: 'Explore theatrical arts, from scriptwriting to stage performance. The club puts on two major productions each year.',
    teacherId: 'a1000000-0000-4000-8000-000000000009',
    teacherName: 'Fatima Khan',
    meetingDay: 2,
    meetingTime: '15:00',
    meetingLocation: 'Auditorium',
    members: [
      'b1000000-0000-4000-8000-000000000002',
      'b1000000-0000-4000-8000-000000000004',
      'b1000000-0000-4000-8000-000000000010',
      'b1000000-0000-4000-8000-000000000013',
    ],
    maxMembers: 25,
  },
  {
    id: 'club-003',
    name: 'Art Club',
    description: 'Express creativity through painting, sketching, sculpture, and digital art. Works are displayed at the annual Art Exhibition.',
    teacherId: 'a1000000-0000-4000-8000-000000000008',
    teacherName: 'Deepak Menon',
    meetingDay: 4,
    meetingTime: '14:30',
    meetingLocation: 'Art Room',
    members: [
      'b1000000-0000-4000-8000-000000000004',
      'b1000000-0000-4000-8000-000000000011',
      'b1000000-0000-4000-8000-000000000015',
    ],
    maxMembers: 20,
  },
  {
    id: 'club-004',
    name: 'Chess Club',
    description: 'Develop strategic thinking through chess. Members train for district and state level chess tournaments.',
    teacherId: 'a1000000-0000-4000-8000-000000000002',
    teacherName: 'Vikram Joshi',
    meetingDay: 1,
    meetingTime: '15:00',
    meetingLocation: 'Library',
    members: [
      'b1000000-0000-4000-8000-000000000005',
      'b1000000-0000-4000-8000-000000000009',
      'b1000000-0000-4000-8000-000000000012',
    ],
    maxMembers: 15,
  },
  {
    id: 'club-005',
    name: 'Music Club',
    description: 'Learn vocal and instrumental music spanning Indian classical, devotional, and contemporary genres.',
    teacherId: 'a1000000-0000-4000-8000-000000000009',
    teacherName: 'Fatima Khan',
    meetingDay: 5,
    meetingTime: '15:00',
    meetingLocation: 'Music Room',
    members: [
      'b1000000-0000-4000-8000-000000000010',
      'b1000000-0000-4000-8000-000000000015',
      'b1000000-0000-4000-8000-000000000013',
    ],
    maxMembers: 20,
  },
  {
    id: 'club-006',
    name: 'Science Club',
    description: 'Conduct experiments, build models, and explore scientific concepts beyond the classroom curriculum.',
    teacherId: 'a1000000-0000-4000-8000-000000000003',
    teacherName: 'Kavita Deshmukh',
    meetingDay: 3,
    meetingTime: '15:30',
    meetingLocation: 'Science Lab',
    members: [
      'b1000000-0000-4000-8000-000000000001',
      'b1000000-0000-4000-8000-000000000002',
      'b1000000-0000-4000-8000-000000000003',
    ],
    maxMembers: 18,
  },
  {
    id: 'club-007',
    name: 'Debate Club',
    description: 'Sharpen public speaking and argumentation skills. Participate in inter-school debate and Model UN competitions.',
    teacherId: 'a1000000-0000-4000-8000-000000000004',
    teacherName: 'Rajesh Sharma',
    meetingDay: 4,
    meetingTime: '15:00',
    meetingLocation: 'Hall B',
    members: [
      'b1000000-0000-4000-8000-000000000011',
      'b1000000-0000-4000-8000-000000000012',
      'b1000000-0000-4000-8000-000000000014',
    ],
    maxMembers: 20,
  },
  {
    id: 'club-008',
    name: 'Photography Club',
    description: 'Learn photography fundamentals, composition techniques, and basic photo editing. Document school events and activities.',
    teacherId: 'a1000000-0000-4000-8000-000000000007',
    teacherName: 'Sunita Reddy',
    meetingDay: 5,
    meetingTime: '14:30',
    meetingLocation: 'Computer Lab',
    members: [
      'b1000000-0000-4000-8000-000000000006',
      'b1000000-0000-4000-8000-000000000008',
    ],
    maxMembers: 15,
  },
  {
    id: 'club-009',
    name: 'Eco Club',
    description: 'Promote environmental awareness through tree plantation drives, waste management, and sustainability projects.',
    teacherId: 'a1000000-0000-4000-8000-000000000011',
    teacherName: 'Lakshmi Iyer',
    meetingDay: 2,
    meetingTime: '14:30',
    meetingLocation: 'Garden',
    members: [
      'b1000000-0000-4000-8000-000000000005',
      'b1000000-0000-4000-8000-000000000009',
    ],
    maxMembers: 20,
  },
  {
    id: 'club-010',
    name: 'Coding Club',
    description: 'Learn programming languages, web development, and app building. Solve coding challenges and build projects.',
    teacherId: 'a1000000-0000-4000-8000-000000000007',
    teacherName: 'Sunita Reddy',
    meetingDay: 1,
    meetingTime: '15:30',
    meetingLocation: 'Computer Lab',
    members: [
      'b1000000-0000-4000-8000-000000000007',
      'b1000000-0000-4000-8000-000000000008',
      'b1000000-0000-4000-8000-000000000001',
    ],
    maxMembers: 20,
  },
];

export function getClubById(id: string): Club | undefined {
  return CLUBS.find((club) => club.id === id);
}

export function getClubByName(name: string): Club | undefined {
  return CLUBS.find(
    (club) => club.name.toLowerCase() === name.toLowerCase()
  );
}

export function getClubsByTeacher(teacherId: string): Club[] {
  return CLUBS.filter((club) => club.teacherId === teacherId);
}

export function getClubsByStudent(studentId: string): Club[] {
  return CLUBS.filter((club) => club.members.includes(studentId));
}

export function getClubMembers(clubId: string): string[] {
  const club = getClubById(clubId);
  return club ? club.members : [];
}
