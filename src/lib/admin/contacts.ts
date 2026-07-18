export type ContactRow = {
  contact_key: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  sources: string[];
  tags: string[];
  source_count: number;
  created_at: string | null;
  last_seen_at: string | null;
};

export type ContactFilters = {
  q?: string | null;
  source?: string | null;
};

const EXPORT_HEADERS = [
  'Full Name',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Sources',
  'Tags',
  'Created At',
  'Last Seen At',
] as const;

function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function normalizePhone(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

function phoneSearchVariants(value: string | null | undefined): string[] {
  const digits = normalizePhone(value);
  if (!digits) return [];
  if (digits.startsWith('234') && digits.length > 3) {
    return [digits, `0${digits.slice(3)}`];
  }
  return [digits];
}

function contactMatchesSearch(contact: ContactRow, query: string): boolean {
  if (!query) return true;

  const textHaystack = [
    contact.full_name,
    contact.first_name,
    contact.last_name,
    contact.email,
    contact.phone,
    ...contact.sources,
    ...contact.tags,
  ]
    .map(normalizeSearchText)
    .join(' ');

  if (textHaystack.includes(query)) return true;

  const queryPhone = normalizePhone(query);
  if (!queryPhone) return false;

  return phoneSearchVariants(contact.phone).some((phone) => phone.includes(queryPhone));
}

export function filterContactsForExport(rows: ContactRow[], filters: ContactFilters): ContactRow[] {
  const query = normalizeSearchText(filters.q);
  const source = normalizeSearchText(filters.source === 'all' ? '' : filters.source);

  return rows.filter((contact) => {
    const matchesSource = !source || contact.sources.some((item) => normalizeSearchText(item) === source);
    return matchesSource && contactMatchesSearch(contact, query);
  });
}

export function getContactSourceOptions(rows: ContactRow[]): string[] {
  return Array.from(new Set(rows.flatMap((row) => row.sources))).sort((a, b) => a.localeCompare(b));
}

function exportValue(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) return value.join('; ');
  return value ?? '';
}

function csvCell(value: string | string[] | null | undefined): string {
  const text = exportValue(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function contactToExportCells(contact: ContactRow): string[] {
  return [
    exportValue(contact.full_name),
    exportValue(contact.first_name),
    exportValue(contact.last_name),
    exportValue(contact.email),
    exportValue(contact.phone),
    exportValue(contact.sources),
    exportValue(contact.tags),
    exportValue(contact.created_at),
    exportValue(contact.last_seen_at),
  ];
}

export function contactsToCsv(rows: ContactRow[]): string {
  const lines = [
    EXPORT_HEADERS.join(','),
    ...rows.map((contact) => contactToExportCells(contact).map(csvCell).join(',')),
  ];

  return `${lines.join('\n')}\n`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function excelCell(value: string): string {
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

export function contactsToExcelXml(rows: ContactRow[]): string {
  const headerRow = `<Row>${EXPORT_HEADERS.map((header) => excelCell(header)).join('')}</Row>`;
  const bodyRows = rows
    .map((contact) => `<Row>${contactToExportCells(contact).map(excelCell).join('')}</Row>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Contacts">
    <Table>${headerRow}${bodyRows}</Table>
  </Worksheet>
</Workbook>`;
}
