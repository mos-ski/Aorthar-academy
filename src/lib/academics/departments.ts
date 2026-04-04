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
