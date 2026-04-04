import fs from 'node:fs';
import path from 'node:path';

/** Maps department name → markdown filename under docs/products/university/curriculum/ */
const DEPT_FILE: Record<string, string> = {
  'Product Management': 'product-management.md',
  'Product Design': 'product-design.md',
  'Frontend Engineering': 'frontend.md',
  'Backend Engineering': 'backend.md',
  'QA Engineering': 'qa.md',
  'Agile Delivery & Operations': 'scrum.md',
  'Data & Analytics': 'operations.md',
  'Growth & Operations': 'growth.md',
  'Social Media Management': 'social-media.md',
  'Video Editing': 'video-editing.md',
  'Content Creation (UGC)': 'content.md',
  'Human Resources': 'hr.md',
  'Project Management': 'project-manager.md',
  'CEO': 'ceo.md',
  'DevOps Engineering': 'devops.md',
};

/**
 * Returns the Year 100 Semester 1 course codes for a given department
 * by parsing the canonical curriculum markdown file.
 * Falls back to [] if the file is missing or unreadable.
 */
export function getSemester1CodesFromMarkdown(department: string): string[] {
  const filename = DEPT_FILE[department];
  if (!filename) return [];

  const candidates = [
    path.resolve(process.cwd(), 'docs/products/university/curriculum', filename),
    path.resolve(process.cwd(), '../docs/products/university/curriculum', filename),
  ];

  let markdown = '';
  for (const p of candidates) {
    if (fs.existsSync(p)) { markdown = fs.readFileSync(p, 'utf8'); break; }
  }
  if (!markdown) return [];

  const lines = markdown.split(/\r?\n/);
  const codes: string[] = [];
  let inYear100 = false;
  let inSem1 = false;

  for (const line of lines) {
    if (/^##\s+YEAR\s+100\b/i.test(line)) { inYear100 = true; continue; }
    if (/^##\s+YEAR\s+\d{3}\b/i.test(line) && inYear100) break; // left Year 100
    if (!inYear100) continue;

    if (/^###\s+Semester\s+1\b/i.test(line)) { inSem1 = true; continue; }
    if (/^###\s+Semester\s+2\b/i.test(line)) break; // left Sem 1

    if (!inSem1) continue;
    if (line.startsWith('*See:')) continue;

    const m = line.match(/^\*\*([A-Z]{1,6}\d+[A-Z]?)\s*[–—]/);
    if (m) codes.push(m[1].toUpperCase());
  }

  return codes;
}
