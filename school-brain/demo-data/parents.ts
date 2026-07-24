import type { GuardianProfile } from '../models/index';

export const DEMO_PARENTS: GuardianProfile[] = [
  {
    id: 'p-101',
    firstName: 'Vikram',
    lastName: 'Singh',
    displayName: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    phone: '9810011101',
    children: [{ id: 's-8a-01', name: 'Aarav Singh', grade: '8', section: 'A' }],
    preferredLanguage: 'English',
    feePaymentStatus: 'Paid',
    ptmAttendanceStatus: 'Confirmed',
    lastNoticeAcknowledged: true,
  },
  {
    id: 'p-102',
    firstName: 'Suresh',
    lastName: 'Patel',
    displayName: 'Suresh Patel',
    email: 'suresh.patel@gmail.com',
    phone: '9810011102',
    children: [{ id: 's-8a-02', name: 'Diya Patel', grade: '8', section: 'A' }],
    preferredLanguage: 'Gujarati',
    feePaymentStatus: 'Paid',
    ptmAttendanceStatus: 'Confirmed',
    lastNoticeAcknowledged: true,
  },
  {
    id: 'p-103',
    firstName: 'Amit',
    lastName: 'Gupta',
    displayName: 'Amit Gupta',
    email: 'amit.gupta@gmail.com',
    phone: '9810011103',
    children: [{ id: 's-8a-03', name: 'Rohan Gupta', grade: '8', section: 'A' }],
    preferredLanguage: 'Hindi',
    feePaymentStatus: 'Pending',
    ptmAttendanceStatus: 'Pending',
    lastNoticeAcknowledged: false, // Hasn't replied
  },
  {
    id: 'p-104',
    firstName: 'Sanjay',
    lastName: 'Mehta',
    displayName: 'Sanjay Mehta',
    email: 'sanjay.mehta@gmail.com',
    phone: '9810011105',
    children: [{ id: 's-8a-05', name: 'Kabir Mehta', grade: '8', section: 'A' }],
    preferredLanguage: 'Hindi',
    feePaymentStatus: 'Overdue',
    ptmAttendanceStatus: 'Declined',
    lastNoticeAcknowledged: false, // Hasn't replied
  },
  {
    id: 'p-105',
    firstName: 'Ramesh',
    lastName: 'Tiwari',
    displayName: 'Ramesh Tiwari',
    email: 'ramesh.tiwari@gmail.com',
    phone: '9810011108',
    children: [{ id: 's-8b-03', name: 'Dev Tiwari', grade: '8', section: 'B' }],
    preferredLanguage: 'Hindi',
    feePaymentStatus: 'Overdue',
    ptmAttendanceStatus: 'Pending',
    lastNoticeAcknowledged: false, // Hasn't replied
  },
  {
    id: 'p-106',
    firstName: 'Prakash',
    lastName: 'Joshi',
    displayName: 'Prakash Joshi',
    email: 'prakash.joshi@gmail.com',
    phone: '9810011113',
    children: [{ id: 's-9b-02', name: 'Aditya Joshi', grade: '9', section: 'B' }],
    preferredLanguage: 'Marathi',
    feePaymentStatus: 'Pending',
    ptmAttendanceStatus: 'Pending',
    lastNoticeAcknowledged: false, // Hasn't replied
  },
];

export function getUnrepliedParents(): GuardianProfile[] {
  return DEMO_PARENTS.filter(p => !p.lastNoticeAcknowledged || p.ptmAttendanceStatus === 'Pending');
}
