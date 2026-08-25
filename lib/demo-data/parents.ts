import { ParentRecord } from './types';

export const PARENTS_DATA: ParentRecord[] = [
  {
    id: 'c1000000-0000-4000-8000-000000000001',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@email.com',
    phone: '+91 98765 10001',
    childrenIds: ['b1000000-0000-4000-8000-000000000001'],
  },
  {
    id: 'c1000000-0000-4000-8000-000000000002',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@email.com',
    phone: '+91 98765 10002',
    childrenIds: ['b1000000-0000-4000-8000-000000000002'],
  },
  {
    id: 'c1000000-0000-4000-8000-000000000003',
    name: 'Priya Singh',
    email: 'priya.singh@email.com',
    phone: '+91 98765 10003',
    childrenIds: ['b1000000-0000-4000-8000-000000000003'],
  },
];
