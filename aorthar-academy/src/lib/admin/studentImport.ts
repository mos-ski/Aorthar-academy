import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import type { Role } from '@/types';

export type StudentImportRow = {
  email: string;
  full_name: string;
  department: string | null;
  role: Role;
  grant_premium: boolean;
  standalone_course_slugs: string[];
};

export type StudentImportResult = {
  index: number;
  email: string;
  status: 'invited' | 'skipped_existing' | 'invalid' | 'failed';
  reason?: string;
};

export const STUDENT_IMPORT_COLUMNS = [
  'email',
  'full_name',
  'department',
  'role',
  'grant_premium',
  'standalone_course_slugs',
] as const;

type RowRecord = Record<string, string>;

export function parseCsvLikeInput(input: string): RowRecord[] {
  const rows = splitCsvRows(input.trim());
  if (rows.length === 0) return [];

  const header = rows[0].map((v) => v.trim());
  const keys = header.map((h) => h.toLowerCase());

  const validHeader = STUDENT_IMPORT_COLUMNS.every((k) => keys.includes(k));
  if (!validHeader) {
    throw new Error(`Invalid header. Expected columns: ${STUDENT_IMPORT_COLUMNS.join(', ')}`);
  }

  const records: RowRecord[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    if (cells.every((cell) => cell.trim() === '')) continue;

    const record: RowRecord = {};
    for (let c = 0; c < header.length; c += 1) {
      record[keys[c]] = (cells[c] ?? '').trim();
    }
    records.push(record);
  }

  return records;
}

export function normalizeImportRow(record: RowRecord): StudentImportRow {
  const email = (record.email ?? '').trim().toLowerCase();
  const fullName = (record.full_name ?? '').trim();
  const department = (record.department ?? '').trim();
  const roleInput = (record.role ?? '').trim().toLowerCase();
  const grantPremium = (record.grant_premium ?? '').trim().toLowerCase();
  const courseSlugsRaw = (record.standalone_course_slugs ?? '').trim();

  if (!email || !email.includes('@')) {
    throw new Error('Invalid email');
  }

  if (!fullName) {
    throw new Error('full_name is required');
  }

  const role = roleInput === 'admin' || roleInput === 'contributor' || roleInput === 'student'
    ? (roleInput as Role)
    : 'student';

  if (department && !AORTHAR_DEPARTMENTS.includes(department as (typeof AORTHAR_DEPARTMENTS)[number])) {
    throw new Error(`Unknown department: ${department}`);
  }

  const standaloneCourseSlugs = courseSlugsRaw
    ? courseSlugsRaw
        .split('|')
        .map((slug) => slug.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return {
    email,
    full_name: fullName,
    department: department || null,
    role,
    grant_premium: grantPremium === 'true',
    standalone_course_slugs: standaloneCourseSlugs,
  };
}

function splitCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
