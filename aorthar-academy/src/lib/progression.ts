// ─────────────────────────────────────────────
// PROGRESSION ENGINE
// ─────────────────────────────────────────────

/**
 * Check if a target year is unlocked.
 * Rule: all courses in the previous year must be passed.
 */
export function canUnlockYear(
  targetYearLevel: number,
  passedCourseIds: string[],
  coursesByYear: Record<number, string[]>, // year_level → course ids
): { unlocked: boolean; reason?: string } {
  if (targetYearLevel === 100) return { unlocked: true };

  const prevYear = targetYearLevel - 100;
  const prevYearCourseIds = coursesByYear[prevYear] ?? [];

  const allPassed = prevYearCourseIds.every((id) =>
    passedCourseIds.includes(id),
  );

  if (!allPassed) {
    return {
      unlocked: false,
      reason: `Complete all Year ${prevYear} courses first.`,
    };
  }

  return { unlocked: true };
}

/**
 * Check if a semester is unlocked.
 * Rule: Semester 2 requires all Semester 1 courses in the same year to be passed.
 */
export function canUnlockSemester(
  semester: number,
  yearLevel: number,
  passedCourseIds: string[],
  semesterOneCourseIds: string[], // course ids for Semester 1 of this year
): { unlocked: boolean; reason?: string } {
  if (semester === 1) return { unlocked: true };

  const allPassed = semesterOneCourseIds.every((id) =>
    passedCourseIds.includes(id),
  );

  if (!allPassed) {
    return {
      unlocked: false,
      reason: `Pass all Year ${yearLevel} Semester 1 courses first.`,
    };
  }

  return { unlocked: true };
}

/**
 * Check if 400-level access is allowed (requires premium subscription).
 */
export function canAccess400Level(
  subscriptionStatus: string,
): { allowed: boolean; reason?: string } {
  if (subscriptionStatus !== 'active') {
    return {
      allowed: false,
      reason: 'Year 400 requires a Premium subscription.',
    };
  }
  return { allowed: true };
}

/**
 * Check if a user can submit a capstone.
 */
export function canSubmitCapstone(params: {
  allYear400CoursesPassed: boolean;
  cumulativeGPA: number;
  subscriptionStatus: string;
}): { allowed: boolean; reason?: string } {
  if (params.subscriptionStatus !== 'active') {
    return { allowed: false, reason: 'Premium subscription required.' };
  }
  if (!params.allYear400CoursesPassed) {
    return { allowed: false, reason: 'Complete all Year 400 courses first.' };
  }
  if (params.cumulativeGPA < 3.5) {
    return {
      allowed: false,
      reason: `Minimum 3.5 GPA required (yours: ${params.cumulativeGPA}).`,
    };
  }
  return { allowed: true };
}

/**
 * Check graduation conditions.
 */
export function canGraduate(params: {
  allCoursesPassed: boolean;
  capstoneApproved: boolean;
  cumulativeGPA: number;
}): { eligible: boolean; reason?: string } {
  if (!params.allCoursesPassed) {
    return { eligible: false, reason: 'Not all courses are passed.' };
  }
  if (!params.capstoneApproved) {
    return { eligible: false, reason: 'Capstone must be approved.' };
  }
  if (params.cumulativeGPA < 2.0) {
    return {
      eligible: false,
      reason: `Minimum 2.0 cumulative GPA required.`,
    };
  }
  return { eligible: true };
}
