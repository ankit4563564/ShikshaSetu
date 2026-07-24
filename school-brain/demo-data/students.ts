import type { StudentProfile } from '../models/index';

export const DEMO_STUDENTS: StudentProfile[] = [
  // Class 8A (Class Teacher: Ananya Sharma t-101)
  {
    id: 's-8a-01', firstName: 'Aarav', lastName: 'Singh', displayName: 'Aarav Singh',
    grade: '8', section: 'A', rollNumber: '8A01', dateOfBirth: '2012-03-15',
    classTeacherId: 't-101', classTeacherName: 'Ananya Sharma', parentName: 'Vikram Singh', parentPhone: '9810011101', parentEmail: 'vikram.singh@gmail.com',
    busRoute: 'Route 3', busStop: 'Green Park Metro', busNumber: 'Bus 3', clubs: ['c-101', 'c-104'],
    housePoints: 45, houseName: 'Vayu', bloodGroup: 'B+', emergencyContact: '9810011101', medicalNotes: 'Mild asthma',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 2, attendanceRate: 94
  },
  {
    id: 's-8a-02', firstName: 'Diya', lastName: 'Patel', displayName: 'Diya Patel',
    grade: '8', section: 'A', rollNumber: '8A02', dateOfBirth: '2012-07-22',
    classTeacherId: 't-101', classTeacherName: 'Ananya Sharma', parentName: 'Suresh Patel', parentPhone: '9810011102', parentEmail: 'suresh.patel@gmail.com',
    busRoute: 'Route 2', busStop: 'Lajpat Nagar', busNumber: 'Bus 2', clubs: ['c-102', 'c-105'],
    housePoints: 60, houseName: 'Agni', bloodGroup: 'O+', emergencyContact: '9810011102', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 1, attendanceRate: 98
  },
  {
    id: 's-8a-03', firstName: 'Rohan', lastName: 'Gupta', displayName: 'Rohan Gupta',
    grade: '8', section: 'A', rollNumber: '8A03', dateOfBirth: '2012-01-10',
    classTeacherId: 't-101', classTeacherName: 'Ananya Sharma', parentName: 'Amit Gupta', parentPhone: '9810011103', parentEmail: 'amit.gupta@gmail.com',
    busRoute: 'Route 3', busStop: 'Vasant Kunj', busNumber: 'Bus 3', clubs: ['c-101'],
    housePoints: 20, houseName: 'Jal', bloodGroup: 'A+', emergencyContact: '9810011103', medicalNotes: 'Spectacles prescribed',
    feeStatus: 'Pending', feeDueAmount: 12500, libraryIssuedBooksCount: 0, attendanceRate: 78
  },
  {
    id: 's-8a-04', firstName: 'Ananya', lastName: 'Iyer', displayName: 'Ananya Iyer',
    grade: '8', section: 'A', rollNumber: '8A04', dateOfBirth: '2012-09-12',
    classTeacherId: 't-101', classTeacherName: 'Ananya Sharma', parentName: 'Raman Iyer', parentPhone: '9810011104', parentEmail: 'raman.iyer@gmail.com',
    busRoute: 'Route 5', busStop: 'Greater Kailash I', busNumber: 'Bus 5', clubs: ['c-103', 'c-106'],
    housePoints: 85, houseName: 'Prithvi', bloodGroup: 'A-', emergencyContact: '9810011104', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 3, attendanceRate: 99
  },
  {
    id: 's-8a-05', firstName: 'Kabir', lastName: 'Mehta', displayName: 'Kabir Mehta',
    grade: '8', section: 'A', rollNumber: '8A05', dateOfBirth: '2012-05-18',
    classTeacherId: 't-101', classTeacherName: 'Ananya Sharma', parentName: 'Sanjay Mehta', parentPhone: '9810011105', parentEmail: 'sanjay.mehta@gmail.com',
    busRoute: 'Route 4', busStop: 'Dwarka Sec 12', busNumber: 'Bus 4', clubs: ['c-104'],
    housePoints: 30, houseName: 'Vayu', bloodGroup: 'O-', emergencyContact: '9810011105', medicalNotes: 'Lactose intolerant',
    feeStatus: 'Overdue', feeDueAmount: 18000, libraryIssuedBooksCount: 1, attendanceRate: 72
  },

  // Class 8B (Class Teacher: Sunil Verma t-104)
  {
    id: 's-8b-01', firstName: 'Vivaan', lastName: 'Sharma', displayName: 'Vivaan Sharma',
    grade: '8', section: 'B', rollNumber: '8B01', dateOfBirth: '2012-02-28',
    classTeacherId: 't-104', classTeacherName: 'Sunil Verma', parentName: 'Alok Sharma', parentPhone: '9810011106', parentEmail: 'alok.sharma@gmail.com',
    busRoute: 'Route 2', busStop: 'Kailash Colony', busNumber: 'Bus 2', clubs: ['c-101', 'c-102'],
    housePoints: 50, houseName: 'Agni', bloodGroup: 'B-', emergencyContact: '9810011106', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 1, attendanceRate: 92
  },
  {
    id: 's-8b-02', firstName: 'Sanya', lastName: 'Chawla', displayName: 'Sanya Chawla',
    grade: '8', section: 'B', rollNumber: '8B02', dateOfBirth: '2012-11-14',
    classTeacherId: 't-104', classTeacherName: 'Sunil Verma', parentName: 'Deepak Chawla', parentPhone: '9810011107', parentEmail: 'deepak.chawla@gmail.com',
    busRoute: 'Route 1', busStop: 'South Extension', busNumber: 'Bus 1', clubs: ['c-105'],
    housePoints: 40, houseName: 'Jal', bloodGroup: 'AB+', emergencyContact: '9810011107', medicalNotes: 'Dust allergy',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 2, attendanceRate: 96
  },
  {
    id: 's-8b-03', firstName: 'Dev', lastName: 'Tiwari', displayName: 'Dev Tiwari',
    grade: '8', section: 'B', rollNumber: '8B03', dateOfBirth: '2012-04-03',
    classTeacherId: 't-104', classTeacherName: 'Sunil Verma', parentName: 'Ramesh Tiwari', parentPhone: '9810011108', parentEmail: 'ramesh.tiwari@gmail.com',
    busRoute: 'Route 3', busStop: 'Hauz Khas', busNumber: 'Bus 3', clubs: ['c-104'],
    housePoints: 15, houseName: 'Prithvi', bloodGroup: 'O+', emergencyContact: '9810011108', medicalNotes: 'None',
    feeStatus: 'Overdue', feeDueAmount: 14500, libraryIssuedBooksCount: 1, attendanceRate: 80
  },

  // Class 9A (Class Teacher: Rajesh Mehra t-102)
  {
    id: 's-9a-01', firstName: 'Ishaan', lastName: 'Verma', displayName: 'Ishaan Verma',
    grade: '9', section: 'A', rollNumber: '9A01', dateOfBirth: '2011-08-19',
    classTeacherId: 't-102', classTeacherName: 'Rajesh Mehra', parentName: 'Nitin Verma', parentPhone: '9810011109', parentEmail: 'nitin.verma@gmail.com',
    busRoute: 'Route 1', busStop: 'Defence Colony', busNumber: 'Bus 1', clubs: ['c-101', 'c-103'],
    housePoints: 70, houseName: 'Agni', bloodGroup: 'A+', emergencyContact: '9810011109', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 1, attendanceRate: 95
  },
  {
    id: 's-9a-02', firstName: 'Tara', lastName: 'Kapoor', displayName: 'Tara Kapoor',
    grade: '9', section: 'A', rollNumber: '9A02', dateOfBirth: '2011-10-30',
    classTeacherId: 't-102', classTeacherName: 'Rajesh Mehra', parentName: 'Sunil Kapoor', parentPhone: '9810011110', parentEmail: 'sunil.kapoor@gmail.com',
    busRoute: 'Route 3', busStop: 'Vasant Vihar', busNumber: 'Bus 3', clubs: ['c-102'],
    housePoints: 90, houseName: 'Vayu', bloodGroup: 'B+', emergencyContact: '9810011110', medicalNotes: 'Peanut allergy',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 2, attendanceRate: 97
  },
  {
    id: 's-9a-03', firstName: 'Yash', lastName: 'Bhasin', displayName: 'Yash Bhasin',
    grade: '9', section: 'A', rollNumber: '9A03', dateOfBirth: '2011-06-12',
    classTeacherId: 't-102', classTeacherName: 'Rajesh Mehra', parentName: 'Gaurav Bhasin', parentPhone: '9810011111', parentEmail: 'gaurav.bhasin@gmail.com',
    busRoute: 'Route 3', busStop: 'Green Park Metro', busNumber: 'Bus 3', clubs: ['c-104'],
    housePoints: 35, houseName: 'Jal', bloodGroup: 'O+', emergencyContact: '9810011111', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 0, attendanceRate: 91
  },

  // Class 9B (Class Teacher: Meenakshi Sundaram t-109)
  {
    id: 's-9b-01', firstName: 'Kavya', lastName: 'Reddy', displayName: 'Kavya Reddy',
    grade: '9', section: 'B', rollNumber: '9B01', dateOfBirth: '2011-03-25',
    classTeacherId: 't-109', classTeacherName: 'Meenakshi Sundaram', parentName: 'Venkat Reddy', parentPhone: '9810011112', parentEmail: 'venkat.reddy@gmail.com',
    busRoute: 'Route 5', busStop: 'Nehru Place', busNumber: 'Bus 5', clubs: ['c-103', 'c-105'],
    housePoints: 75, houseName: 'Prithvi', bloodGroup: 'AB-', emergencyContact: '9810011112', medicalNotes: 'Asthma inhaler required',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 1, attendanceRate: 96
  },
  {
    id: 's-9b-02', firstName: 'Aditya', lastName: 'Joshi', displayName: 'Aditya Joshi',
    grade: '9', section: 'B', rollNumber: '9B02', dateOfBirth: '2011-12-05',
    classTeacherId: 't-109', classTeacherName: 'Meenakshi Sundaram', parentName: 'Prakash Joshi', parentPhone: '9810011113', parentEmail: 'prakash.joshi@gmail.com',
    busRoute: 'Route 4', busStop: 'Janakpuri East', busNumber: 'Bus 4', clubs: ['c-101'],
    housePoints: 25, houseName: 'Vayu', bloodGroup: 'B+', emergencyContact: '9810011113', medicalNotes: 'None',
    feeStatus: 'Pending', feeDueAmount: 11000, libraryIssuedBooksCount: 0, attendanceRate: 83
  },

  // Class 10A (Class Teacher: Priya Nair t-103)
  {
    id: 's-10a-01', firstName: 'Sneha', lastName: 'Reddy', displayName: 'Sneha Reddy',
    grade: '10', section: 'A', rollNumber: '10A01', dateOfBirth: '2010-11-05',
    classTeacherId: 't-103', classTeacherName: 'Priya Nair', parentName: 'Pratap Reddy', parentPhone: '9810011114', parentEmail: 'pratap.reddy@gmail.com',
    busRoute: 'Route 1', busStop: 'Hauz Khas Village', busNumber: 'Bus 1', clubs: ['c-102', 'c-103'],
    housePoints: 95, houseName: 'Agni', bloodGroup: 'AB+', emergencyContact: '9810011114', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 2, attendanceRate: 99
  },
  {
    id: 's-10a-02', firstName: 'Arnav', lastName: 'Kashyap', displayName: 'Arnav Kashyap',
    grade: '10', section: 'A', rollNumber: '10A02', dateOfBirth: '2010-04-14',
    classTeacherId: 't-103', classTeacherName: 'Priya Nair', parentName: 'Vivek Kashyap', parentPhone: '9810011115', parentEmail: 'vivek.kashyap@gmail.com',
    busRoute: 'Route 3', busStop: 'Green Park Metro', busNumber: 'Bus 3', clubs: ['c-101', 'c-104'],
    housePoints: 80, houseName: 'Jal', bloodGroup: 'O+', emergencyContact: '9810011115', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 1, attendanceRate: 97
  },

  // Class 7A (Class Teacher: Kavita Deshmukh t-105)
  {
    id: 's-7a-01', firstName: 'Riya', lastName: 'Saxena', displayName: 'Riya Saxena',
    grade: '7', section: 'A', rollNumber: '7A01', dateOfBirth: '2013-05-14',
    classTeacherId: 't-105', classTeacherName: 'Kavita Deshmukh', parentName: 'Manish Saxena', parentPhone: '9810011116', parentEmail: 'manish.saxena@gmail.com',
    busRoute: 'Route 2', busStop: 'Moolchand Metro', busNumber: 'Bus 2', clubs: ['c-105'],
    housePoints: 65, houseName: 'Vayu', bloodGroup: 'A+', emergencyContact: '9810011116', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 1, attendanceRate: 94
  },
  {
    id: 's-7a-02', firstName: 'Aryan', lastName: 'Bhatt', displayName: 'Aryan Bhatt',
    grade: '7', section: 'A', rollNumber: '7A02', dateOfBirth: '2013-09-08',
    classTeacherId: 't-105', classTeacherName: 'Kavita Deshmukh', parentName: 'Hemant Bhatt', parentPhone: '9810011117', parentEmail: 'hemant.bhatt@gmail.com',
    busRoute: 'Route 3', busStop: 'Vasant Kunj', busNumber: 'Bus 3', clubs: ['c-104'],
    housePoints: 40, houseName: 'Agni', bloodGroup: 'B+', emergencyContact: '9810011117', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 0, attendanceRate: 91
  },

  // Class 6A (Class Teacher: Deepa Kulkarni t-107)
  {
    id: 's-6a-01', firstName: 'Meera', lastName: 'Nair', displayName: 'Meera Nair',
    grade: '6', section: 'A', rollNumber: '6A01', dateOfBirth: '2014-06-08',
    classTeacherId: 't-107', classTeacherName: 'Deepa Kulkarni', parentName: 'Krishnan Nair', parentPhone: '9810011118', parentEmail: 'krishnan.nair@gmail.com',
    busRoute: 'Route 3', busStop: 'Munirka', busNumber: 'Bus 3', clubs: ['c-101', 'c-105'],
    housePoints: 55, houseName: 'Jal', bloodGroup: 'O+', emergencyContact: '9810011118', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 2, attendanceRate: 96
  },
  {
    id: 's-6a-02', firstName: 'Arjun', lastName: 'Verma', displayName: 'Arjun Verma',
    grade: '6', section: 'A', rollNumber: '6A02', dateOfBirth: '2014-12-01',
    classTeacherId: 't-107', classTeacherName: 'Deepa Kulkarni', parentName: 'Sanjay Verma', parentPhone: '9810011119', parentEmail: 'sanjay.verma@gmail.com',
    busRoute: 'Route 4', busStop: 'Janakpuri West', busNumber: 'Bus 4', clubs: ['c-104'],
    housePoints: 50, houseName: 'Prithvi', bloodGroup: 'A+', emergencyContact: '9810011119', medicalNotes: 'None',
    feeStatus: 'Paid', feeDueAmount: 0, libraryIssuedBooksCount: 1, attendanceRate: 93
  },

  // Remaining realistic 30+ students generator helper array
  ...Array.from({ length: 30 }, (_, index) => {
    const idx = index + 15;
    const grades = ['6', '7', '8', '9', '10'];
    const sections = ['A', 'B'];
    const g = grades[idx % grades.length];
    const s = sections[idx % sections.length];
    const teacherId = g === '8' ? 't-101' : g === '9' ? 't-102' : g === '10' ? 't-103' : g === '7' ? 't-105' : 't-107';
    const teacherName = g === '8' ? 'Ananya Sharma' : g === '9' ? 'Rajesh Mehra' : g === '10' ? 'Priya Nair' : g === '7' ? 'Kavita Deshmukh' : 'Deepa Kulkarni';
    const firstNames = ['Dhruv', 'Kiara', 'Tanishq', 'Nisha', 'Ayan', 'Prisha', 'Manav', 'Avani', 'Neil', 'Sanaya', 'Reyansh', 'Shanaya', 'Shlok', 'Vihaan', 'Myra'];
    const lastNames = ['Choudhury', 'Gill', 'Dutta', 'Pandey', 'Singhal', 'Khatri', 'Thakur', 'Tripathi', 'Acharya', 'Malhotra'];
    const fname = firstNames[idx % firstNames.length];
    const lname = lastNames[idx % lastNames.length];
    const busNum = ((idx % 5) + 1);

    return {
      id: `s-gen-${idx}`,
      firstName: fname,
      lastName: lname,
      displayName: `${fname} ${lname}`,
      grade: g,
      section: s,
      rollNumber: `${g}${s}${idx < 10 ? '0' : ''}${idx}`,
      dateOfBirth: `2012-0${(idx % 8) + 1}-15`,
      classTeacherId: teacherId,
      classTeacherName: teacherName,
      parentName: `Parent of ${fname}`,
      parentPhone: `98100${11120 + idx}`,
      parentEmail: `parent.${fname.toLowerCase()}.${lname.toLowerCase()}@gmail.com`,
      busRoute: `Route ${busNum}`,
      busStop: `Stop ${idx % 12 + 1}`,
      busNumber: `Bus ${busNum}`,
      clubs: idx % 2 === 0 ? ['c-101'] : ['c-102'],
      housePoints: 30 + (idx * 3) % 70,
      houseName: (['Vayu', 'Agni', 'Jal', 'Prithvi'] as const)[idx % 4],
      bloodGroup: ['A+', 'B+', 'O+', 'AB+'][idx % 4],
      emergencyContact: `98100${11120 + idx}`,
      medicalNotes: idx % 7 === 0 ? 'Asthma sensitivity' : 'None',
      feeStatus: idx % 9 === 0 ? ('Overdue' as const) : idx % 5 === 0 ? ('Pending' as const) : ('Paid' as const),
      feeDueAmount: idx % 9 === 0 ? 15000 : idx % 5 === 0 ? 10000 : 0,
      libraryIssuedBooksCount: idx % 3,
      attendanceRate: 85 + (idx % 15),
    };
  }),
];

export function getStudentById(id: string): StudentProfile | undefined {
  return DEMO_STUDENTS.find(s => s.id === id);
}

export function getStudentByName(name: string): StudentProfile | undefined {
  const lower = name.toLowerCase();
  return DEMO_STUDENTS.find(s =>
    s.displayName.toLowerCase().includes(lower) ||
    s.firstName.toLowerCase().includes(lower) ||
    s.lastName.toLowerCase().includes(lower)
  );
}

export function getStudentsByGrade(grade: string, section?: string): StudentProfile[] {
  return DEMO_STUDENTS.filter(s =>
    s.grade === grade && (section ? s.section === section : true)
  );
}
