/** Map course code prefix → department name. Used as a fallback when `courses.department` is NULL. */
const CODE_PREFIX_TO_DEPT: Record<string, string> = {
  PM: 'Product Management',
  COM: 'Product Management',
  MKT: 'Product Management',
  FIN: 'Product Management',
  LAW: 'Product Management',
  ANA: 'Product Management',
  CAP: 'Product Management',
  ETH: 'Product Management',
  TEAM: 'Product Management',
  DES: 'Product Design',
  DSN: 'Product Design',
  UXR: 'Product Design',
  FE: 'Frontend Engineering',
  DEV: 'Frontend Engineering',
  API: 'Frontend Engineering',
  PORT: 'Frontend Engineering',
  INT: 'Frontend Engineering',
  BE: 'Backend Engineering',
  DB: 'Backend Engineering',
  ARC: 'Backend Engineering',
  QA: 'QA Engineering',
  SO: 'Scrum & Agile Ops',
  SCR: 'Scrum & Agile Ops',
  OPS: 'Scrum & Agile Ops',
  STR: 'Scrum & Agile Ops',
  PSY: 'Scrum & Agile Ops',
  BUS: 'Scrum & Agile Ops',
  LDR: 'Scrum & Agile Ops',
  DA: 'Data & Analytics',
  GO: 'Growth & Operations',
  GM: 'Growth & Operations',
  DO: 'DevOps Engineering',
  SM: 'Social Media Management',
  VE: 'Video Editing',
  CC: 'Content Creation (UGC)',
  HR: 'Human Resources',
  PJ: 'Project Management',
  CEO: 'CEO',
};

/**
 * Derive department from course code prefix (e.g. "PM101" → "Product Management").
 * Returns null if the prefix is unknown.
 */
export function getDeptFromCode(code: string): string | null {
  const prefix = code.match(/^([A-Z]+)/)?.[1];
  if (!prefix) return null;
  return CODE_PREFIX_TO_DEPT[prefix] ?? null;
}

export const AORTHAR_DEPARTMENTS = [
  'Product Management',
  'Product Design',
  'Frontend Engineering',
  'Backend Engineering',
  'QA Engineering',
  'Scrum & Agile Ops',
  'Data & Analytics',
  'Growth & Operations',
  'Social Media Management',
  'Video Editing',
  'Content Creation (UGC)',
  'Human Resources',
  'Project Management',
  'CEO',
  'DevOps Engineering',
] as const;

export type AortharDepartment = (typeof AORTHAR_DEPARTMENTS)[number];
