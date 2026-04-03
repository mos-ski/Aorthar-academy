import fs from 'node:fs';
import path from 'node:path';

export type WeeklyPlanRow = {
  week: number;
  topic: string;
  coreConcept: string;
  resources: { title: string; url: string }[];
};

function parseMarkdownLinks(text: string) {
  return Array.from(text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)).map((m) => ({
    title: m[1].trim(),
    url: m[2].trim(),
  }));
}

function readAcademicPlan() {
  const candidatePaths = [
    path.resolve(process.cwd(), '../Aorthar-Academic-Plan.md'),
    path.resolve(process.cwd(), 'Aorthar-Academic-Plan.md'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }

  return '';
}

export function getWeeklyPlanForCourse(courseCode: string): WeeklyPlanRow[] {
  const md = readAcademicPlan();
  if (!md) return [];

  const header = `### **Course Deep Dive: ${courseCode.toUpperCase()} -`;
  const start = md.indexOf(header);
  if (start < 0) return [];

  const after = md.slice(start);
  const lines = after.split(/\r?\n/);
  const rows: WeeklyPlanRow[] = [];

  for (const line of lines) {
    const match = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/);
    if (!match) continue;
    rows.push({
      week: Number(match[1]),
      topic: match[2].trim(),
      coreConcept: match[3].trim(),
      resources: parseMarkdownLinks(match[4].trim()),
    });
  }

  return rows.sort((a, b) => a.week - b.week);
}

