export const AORTHAR_DEPARTMENTS = [
  'UI/UX Design',
  'Product Management',
  'Product Design',
  'Design Engineering (FE)',
  'Backend Engineering',
  'Scrum & Agile',
  'Operations',
  'Quality Assurance (QA)',
] as const;

export type AortharDepartment = (typeof AORTHAR_DEPARTMENTS)[number];

