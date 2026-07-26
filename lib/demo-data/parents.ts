import { ParentRecord } from './types';

export const PARENTS_DATA: ParentRecord[] = [
  {
    id: 'prn-001',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@example.com',
    phone: '+91 98765 43210',
    childrenIds: ['std-001'],
  },
  {
    id: 'prn-002',
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91 98765 43211',
    childrenIds: ['std-002'],
  },
  {
    id: 'prn-003',
    name: 'Reena Khan',
    email: 'reena.khan@example.com',
    phone: '+91 98765 43212',
    childrenIds: ['std-003'],
  },
];
