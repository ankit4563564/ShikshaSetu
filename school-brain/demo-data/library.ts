import type { LibraryBook, IssuedBook } from '../models/index';

export const DEMO_LIBRARY_BOOKS: LibraryBook[] = [
  { id: 'bk-101', title: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', category: 'Physics', isbn: '978-8177091877', totalCopies: 10, availableCopies: 4, shelfLocation: 'Science Wing Shelf 3A' },
  { id: 'bk-102', title: 'The Story of My Experiments with Truth', author: 'Mahatma Gandhi', category: 'Autobiography', isbn: '978-8172290085', totalCopies: 6, availableCopies: 2, shelfLocation: 'History Wing Shelf 1B' },
  { id: 'bk-103', title: 'Wings of Fire', author: 'Dr. A.P.J. Abdul Kalam', category: 'Biography', isbn: '978-8173711466', totalCopies: 8, availableCopies: 5, shelfLocation: 'Biography Shelf 2C' },
  { id: 'bk-104', title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', category: 'Fiction', isbn: '978-0747532699', totalCopies: 12, availableCopies: 3, shelfLocation: 'Fiction Wing Shelf 4D' },
  { id: 'bk-105', title: 'NCERT Exemplar Problems Mathematics Grade 8', author: 'NCERT Board', category: 'Mathematics', isbn: '978-9352920011', totalCopies: 15, availableCopies: 8, shelfLocation: 'Math Reference Shelf 1A' },
  { id: 'bk-106', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Astronomy', isbn: '978-0553380163', totalCopies: 5, availableCopies: 1, shelfLocation: 'Science Wing Shelf 3C' },
];

export const DEMO_ISSUED_BOOKS: IssuedBook[] = [
  {
    id: 'iss-101',
    bookId: 'bk-101',
    bookTitle: 'Concepts of Physics (Vol 1)',
    studentId: 's-8a-01',
    studentName: 'Aarav Singh',
    issuedDate: '2026-07-10',
    dueDate: '2026-07-24',
    isOverdue: false,
    fineAmount: 0,
  },
  {
    id: 'iss-102',
    bookId: 'bk-104',
    bookTitle: 'Harry Potter and the Philosopher\'s Stone',
    studentId: 's-8a-01',
    studentName: 'Aarav Singh',
    issuedDate: '2026-07-12',
    dueDate: '2026-07-26',
    isOverdue: false,
    fineAmount: 0,
  },
  {
    id: 'iss-103',
    bookId: 'bk-102',
    bookTitle: 'The Story of My Experiments with Truth',
    studentId: 's-8a-03',
    studentName: 'Rohan Gupta',
    issuedDate: '2026-06-15',
    dueDate: '2026-06-29', // OVERDUE!
    isOverdue: true,
    fineAmount: 115, // Library dues!
  },
  {
    id: 'iss-104',
    bookId: 'bk-106',
    bookTitle: 'A Brief History of Time',
    studentId: 's-8a-05',
    studentName: 'Kabir Mehta',
    issuedDate: '2026-06-20',
    dueDate: '2026-07-04', // OVERDUE!
    isOverdue: true,
    fineAmount: 90, // Library dues!
  },
];

export function getBooksBorrowedByStudent(studentNameOrId: string): IssuedBook[] {
  const lower = studentNameOrId.toLowerCase();
  return DEMO_ISSUED_BOOKS.filter(i =>
    i.studentId === studentNameOrId || i.studentName.toLowerCase().includes(lower)
  );
}

export function getStudentsWithLibraryDues(): IssuedBook[] {
  return DEMO_ISSUED_BOOKS.filter(i => i.isOverdue || i.fineAmount > 0);
}
