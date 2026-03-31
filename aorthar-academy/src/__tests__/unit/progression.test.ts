import { describe, it, expect } from 'vitest';
import {
  canUnlockYear,
  canUnlockSemester,
  canAccess400Level,
  canSubmitCapstone,
  canGraduate,
} from '@/lib/progression';

const COURSE_IDS = {
  y100s1: ['c1', 'c2', 'c3'],
  y100s2: ['c4', 'c5'],
  y200s1: ['c6', 'c7'],
};

describe('canUnlockYear', () => {
  it('always unlocks Year 100', () => {
    const result = canUnlockYear(100, [], {});
    expect(result.unlocked).toBe(true);
  });

  it('unlocks Year 200 when all Year 100 courses are passed', () => {
    const coursesByYear = { 100: ['c1', 'c2', 'c3'] };
    const result = canUnlockYear(200, ['c1', 'c2', 'c3'], coursesByYear);
    expect(result.unlocked).toBe(true);
  });

  it('blocks Year 200 when some Year 100 courses are not passed', () => {
    const coursesByYear = { 100: ['c1', 'c2', 'c3'] };
    const result = canUnlockYear(200, ['c1', 'c2'], coursesByYear);
    expect(result.unlocked).toBe(false);
    expect(result.reason).toContain('Year 100');
  });

  it('blocks Year 300 when Year 200 courses are incomplete', () => {
    const coursesByYear = { 200: ['c6', 'c7'] };
    const result = canUnlockYear(300, ['c6'], coursesByYear);
    expect(result.unlocked).toBe(false);
    expect(result.reason).toContain('Year 200');
  });

  it('unlocks when previous year has no courses defined', () => {
    // Empty prev year → vacuously true
    const result = canUnlockYear(200, [], {});
    expect(result.unlocked).toBe(true);
  });
});

describe('canUnlockSemester', () => {
  it('always unlocks Semester 1', () => {
    expect(canUnlockSemester(1, 100, [], ['c1', 'c2']).unlocked).toBe(true);
  });

  it('unlocks Semester 2 when all S1 courses passed', () => {
    const result = canUnlockSemester(2, 100, ['c1', 'c2', 'c3'], COURSE_IDS.y100s1);
    expect(result.unlocked).toBe(true);
  });

  it('blocks Semester 2 when some S1 courses not passed', () => {
    const result = canUnlockSemester(2, 100, ['c1', 'c2'], COURSE_IDS.y100s1);
    expect(result.unlocked).toBe(false);
    expect(result.reason).toContain('Year 100 Semester 1');
  });

  it('blocks Semester 2 when no S1 courses passed', () => {
    const result = canUnlockSemester(2, 200, [], COURSE_IDS.y200s1);
    expect(result.unlocked).toBe(false);
  });
});

describe('canAccess400Level', () => {
  it('allows access with active subscription', () => {
    const result = canAccess400Level('active');
    expect(result.allowed).toBe(true);
  });

  it('blocks access with inactive subscription', () => {
    expect(canAccess400Level('free').allowed).toBe(false);
    expect(canAccess400Level('expired').allowed).toBe(false);
    expect(canAccess400Level('cancelled').allowed).toBe(false);
    expect(canAccess400Level('').allowed).toBe(false);
  });

  it('includes a reason when blocked', () => {
    expect(canAccess400Level('free').reason).toBeTruthy();
  });
});

describe('canSubmitCapstone', () => {
  const baseParams = {
    allYear400CoursesPassed: true,
    cumulativeGPA: 3.5,
    subscriptionStatus: 'active',
  };

  it('allows capstone when all conditions are met', () => {
    expect(canSubmitCapstone(baseParams).allowed).toBe(true);
  });

  it('blocks when subscription is not active', () => {
    const result = canSubmitCapstone({ ...baseParams, subscriptionStatus: 'free' });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Premium');
  });

  it('blocks when not all Year 400 courses passed', () => {
    const result = canSubmitCapstone({ ...baseParams, allYear400CoursesPassed: false });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Year 400');
  });

  it('blocks when GPA is below 3.5', () => {
    const result = canSubmitCapstone({ ...baseParams, cumulativeGPA: 3.49 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('3.5');
  });

  it('subscription check takes priority over GPA check', () => {
    const result = canSubmitCapstone({
      allYear400CoursesPassed: true,
      cumulativeGPA: 1.0,
      subscriptionStatus: 'free',
    });
    expect(result.reason).toContain('Premium');
  });
});

describe('canGraduate', () => {
  const baseParams = {
    allCoursesPassed: true,
    capstoneApproved: true,
    cumulativeGPA: 2.5,
  };

  it('allows graduation when all conditions met', () => {
    expect(canGraduate(baseParams).eligible).toBe(true);
  });

  it('blocks when not all courses passed', () => {
    const result = canGraduate({ ...baseParams, allCoursesPassed: false });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Not all courses');
  });

  it('blocks when capstone not approved', () => {
    const result = canGraduate({ ...baseParams, capstoneApproved: false });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Capstone');
  });

  it('blocks when cumulative GPA below 2.0', () => {
    const result = canGraduate({ ...baseParams, cumulativeGPA: 1.99 });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('2.0');
  });
});
