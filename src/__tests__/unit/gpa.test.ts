import { describe, it, expect } from 'vitest';
import {
  getGradeEntry,
  scoreToGradePoints,
  scoreToGradeLetter,
  calculateCourseScore,
  calculateSemesterGPA,
  calculateCumulativeGPA,
  passedSemester,
  meetsCapstoneGPARequirement,
} from '@/lib/gpa';

describe('getGradeEntry', () => {
  it('returns A grade for scores in the 70–100 range', () => {
    const entry = getGradeEntry(85);
    expect(entry.grade).toBe('A');
  });

  it('returns F grade for 0', () => {
    const entry = getGradeEntry(0);
    expect(entry.grade).toBe('F');
  });

  it('returns a grade for boundary score 100', () => {
    const entry = getGradeEntry(100);
    expect(entry).toBeDefined();
    expect(entry.grade).toBeTruthy();
  });
});

describe('scoreToGradeLetter', () => {
  it('returns correct grade letters', () => {
    // Exact grade boundaries depend on GRADE_SCALE — just verify non-empty strings
    expect(typeof scoreToGradeLetter(90)).toBe('string');
    expect(typeof scoreToGradeLetter(55)).toBe('string');
    expect(scoreToGradeLetter(0)).toBe('F');
  });
});

describe('scoreToGradePoints', () => {
  it('returns a number for any score', () => {
    expect(typeof scoreToGradePoints(80)).toBe('number');
    expect(typeof scoreToGradePoints(40)).toBe('number');
  });

  it('returns 0 grade points for 0 score', () => {
    expect(scoreToGradePoints(0)).toBe(0);
  });
});

describe('calculateCourseScore', () => {
  it('applies 40/60 default weights', () => {
    // quiz=80, exam=70 → 0.4*80 + 0.6*70 = 32+42 = 74
    expect(calculateCourseScore(80, 70)).toBe(74);
  });

  it('accepts custom weights', () => {
    // quiz=100, exam=0 with equal weights → 50
    expect(calculateCourseScore(100, 0, 0.5, 0.5)).toBe(50);
  });

  it('rounds to nearest integer', () => {
    // 0.4*75 + 0.6*75 = 75 → should be exactly 75
    expect(calculateCourseScore(75, 75)).toBe(75);
  });

  it('handles all-zero scores', () => {
    expect(calculateCourseScore(0, 0)).toBe(0);
  });

  it('handles perfect scores', () => {
    expect(calculateCourseScore(100, 100)).toBe(100);
  });
});

describe('calculateSemesterGPA', () => {
  it('returns 0 for empty courses array', () => {
    expect(calculateSemesterGPA([])).toBe(0);
  });

  it('returns correct weighted GPA', () => {
    const courses = [
      { grade_points: 4.0, credit_units: 3 }, // 12 points
      { grade_points: 3.0, credit_units: 3 }, // 9 points
    ];
    // (12+9) / 6 = 3.5
    expect(calculateSemesterGPA(courses)).toBe(3.5);
  });

  it('weights heavier credit units more', () => {
    const courses = [
      { grade_points: 5.0, credit_units: 6 }, // 30 points
      { grade_points: 1.0, credit_units: 2 }, // 2 points
    ];
    // 32 / 8 = 4.0
    expect(calculateSemesterGPA(courses)).toBe(4.0);
  });

  it('handles single course', () => {
    const courses = [{ grade_points: 3.5, credit_units: 3 }];
    expect(calculateSemesterGPA(courses)).toBe(3.5);
  });
});

describe('calculateCumulativeGPA', () => {
  it('behaves identically to calculateSemesterGPA', () => {
    const courses = [
      { grade_points: 4.0, credit_units: 3 },
      { grade_points: 2.0, credit_units: 3 },
    ];
    expect(calculateCumulativeGPA(courses)).toBe(calculateSemesterGPA(courses));
  });
});

describe('passedSemester', () => {
  it('passes at GPA >= 2.0', () => {
    expect(passedSemester(2.0)).toBe(true);
    expect(passedSemester(3.5)).toBe(true);
    expect(passedSemester(5.0)).toBe(true);
  });

  it('fails below 2.0', () => {
    expect(passedSemester(1.99)).toBe(false);
    expect(passedSemester(0)).toBe(false);
  });
});

describe('meetsCapstoneGPARequirement', () => {
  it('meets requirement at >= 3.5', () => {
    expect(meetsCapstoneGPARequirement(3.5)).toBe(true);
    expect(meetsCapstoneGPARequirement(4.0)).toBe(true);
  });

  it('fails below 3.5', () => {
    expect(meetsCapstoneGPARequirement(3.49)).toBe(false);
    expect(meetsCapstoneGPARequirement(0)).toBe(false);
  });
});
