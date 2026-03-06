import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';

type DepartmentPlan = {
  semester1: string[];
  semester2: string[];
};

const SHARED_SEMESTER1_COURSES = ['PM101', 'DES101', 'PM103'] as const;

const DEPARTMENT_SEMESTER_PLANS: Record<string, DepartmentPlan> = {
  'Product Management': {
    semester1: ['PM101', 'DES101', 'PM103', 'UXR102', 'COM101'],
    semester2: ['PM102', 'DES104', 'ANA102', 'DEV102', 'MKT102'],
  },
  'Design Engineering (FE)': {
    semester1: ['DEV101', 'DES101', 'PM103', 'DEV103', 'CS101'],
    semester2: ['DEV102', 'DES102', 'DEV104', 'DEV106', 'QA102'],
  },
  'Backend Engineering': {
    semester1: ['DEV105', 'DB101', 'PM103', 'DEV103', 'CS101'],
    semester2: ['DEV108', 'CS102', 'DB102', 'SEC101', 'QA102'],
  },
  'UI/UX Design': {
    semester1: ['PM101', 'DES101', 'PM103', 'DES103', 'DES105'],
    semester2: ['DES102', 'DES104', 'DES106', 'DEV102', 'UXR102'],
  },
  'Product Design': {
    semester1: ['PM101', 'DES101', 'PM103', 'DES103', 'DES105'],
    semester2: ['DES102', 'DES104', 'DES106', 'DEV102', 'UXR102'],
  },
  'Scrum & Agile': {
    semester1: ['PM101', 'PM103', 'COM101', 'OPS101', 'DES101'],
    semester2: ['OPS102', 'PM102', 'ANA102', 'DEV102', 'QA102'],
  },
  Operations: {
    semester1: ['PM101', 'PM103', 'OPS101', 'COM101', 'DES101'],
    semester2: ['OPS102', 'ANA102', 'DEV102', 'QA102', 'MKT102'],
  },
  'Quality Assurance (QA)': {
    semester1: ['PM101', 'PM103', 'QA101', 'DEV103', 'CS101'],
    semester2: ['QA102', 'DEV108', 'SEC101', 'DB102', 'ANA102'],
  },
};

const DEPARTMENT_ALIASES: Record<string, string> = {
  'Design Engineering (Frontend)': 'Design Engineering (FE)',
  Backend: 'Backend Engineering',
  QA: 'Quality Assurance (QA)',
  Scrum: 'Scrum & Agile',
};

export function normalizeDepartment(department: string | null | undefined): string | null {
  if (!department) return null;

  if (AORTHAR_DEPARTMENTS.includes(department as (typeof AORTHAR_DEPARTMENTS)[number])) {
    return department;
  }

  return DEPARTMENT_ALIASES[department] ?? null;
}

export function getDepartmentPlan(department: string | null | undefined): DepartmentPlan {
  const normalized = normalizeDepartment(department);
  if (normalized && DEPARTMENT_SEMESTER_PLANS[normalized]) {
    return DEPARTMENT_SEMESTER_PLANS[normalized];
  }

  return DEPARTMENT_SEMESTER_PLANS['UI/UX Design'];
}

export function getSemester1EnrollmentCodes(department: string | null | undefined) {
  const plan = getDepartmentPlan(department);
  const ordered = [...SHARED_SEMESTER1_COURSES, ...plan.semester1];
  return Array.from(new Set(ordered.map((code) => code.toUpperCase())));
}

