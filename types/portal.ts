export type Portal = 'teacher' | 'parent' | 'admin' | 'student' | 'gate' | 'driver' | 'vendor';

export type CommunicationRole = Extract<Portal, 'teacher' | 'parent' | 'gate' | 'driver'>;

export type StaffRole = Extract<Portal, 'teacher' | 'admin' | 'gate' | 'driver'>;
