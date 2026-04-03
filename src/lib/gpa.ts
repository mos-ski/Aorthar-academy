import { GRADE_SCALE, type GradePoint, type GradeScale } from '@/types';

// ─────────────────────────────────────────────
// GPA ENGINE — all calculations server-side only
// ─────────────────────────────────────────────

export function getGradeEntry(score: number): GradeScale {
  const entry = GRADE_SCALE.find(
    (g) => score >= g.min_percent && score <= g.max_percent,
  );
  return entry ?? GRADE_SCALE[GRADE_SCALE.length - 1]; // default to F
}

export function scoreToGradePoints(score: number): GradePoint {
  return getGradeEntry(score).points as GradePoint;
}

export function scoreToGradeLetter(score: number): string {
  return getGradeEntry(score).grade;
}

/**
 * Calculate final course score from quiz + exam scores.
 * Default weights: quiz 40%, exam 60%
 */
export function calculateCourseScore(
  quizScore: number,
  examScore: number,
  quizWeight = 0.4,
  examWeight = 0.6,
): number {
  return Math.round(quizScore * quizWeight + examScore * examWeight);
}

/**
 * Calculate semester GPA from an array of { grade_points, credit_units } pairs.
 * Formula: Σ(grade_points × credit_units) / Σ(credit_units)
 */
export function calculateSemesterGPA(
  courses: { grade_points: number; credit_units: number }[],
): number {
  const totalCredits = courses.reduce((sum, c) => sum + c.credit_units, 0);
  if (totalCredits === 0) return 0;
  const weightedSum = courses.reduce(
    (sum, c) => sum + c.grade_points * c.credit_units,
    0,
  );
  return Math.round((weightedSum / totalCredits) * 100) / 100;
}

/**
 * Calculate cumulative GPA across all semesters.
 */
export function calculateCumulativeGPA(
  allCourses: { grade_points: number; credit_units: number }[],
): number {
  return calculateSemesterGPA(allCourses);
}

/**
 * Determine if a student passes a semester (GPA >= 2.0).
 */
export function passedSemester(semesterGPA: number): boolean {
  return semesterGPA >= 2.0;
}

/**
 * Determine if a student can submit a capstone (cumulative GPA >= 3.5).
 */
export function meetsCapstoneGPARequirement(cumulativeGPA: number): boolean {
  return cumulativeGPA >= 3.5;
}
