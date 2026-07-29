import { describe, it, expect } from 'vitest';
import { getDemoProfile, getDemoProfiles, isDemoRole, getDemoCredentials } from './demoAuth';

describe('Demo Auth', () => {
  it('should get demo profile for valid role', () => {
    const profile = getDemoProfile('teacher');
    expect(profile).toBeDefined();
    expect(profile?.role).toBe('Class 8A Teacher');
    expect(profile?.email).toBe('teacher@shikshasetu.com');
  });

  it('should return null for invalid role', () => {
    const profile = getDemoProfile('invalid-role');
    expect(profile).toBeNull();
  });

  it('should get all demo profiles', () => {
    const profiles = getDemoProfiles();
    expect(profiles).toHaveLength(7);
    expect(profiles.some(p => p.id === 'teacher')).toBe(true);
    expect(profiles.some(p => p.id === 'student')).toBe(true);
  });

  it('should check if role is valid demo role', () => {
    expect(isDemoRole('teacher')).toBe(true);
    expect(isDemoRole('student')).toBe(true);
    expect(isDemoRole('invalid')).toBe(false);
  });

  it('should get demo credentials for valid role', () => {
    const credentials = getDemoCredentials('teacher');
    expect(credentials).toBeDefined();
    expect(credentials?.email).toBe('teacher@shikshasetu.com');
    expect(credentials?.password).toBe('ShikshaSetu2026!');
  });

  it('should return null credentials for invalid role', () => {
    const credentials = getDemoCredentials('invalid');
    expect(credentials).toBeNull();
  });
});
