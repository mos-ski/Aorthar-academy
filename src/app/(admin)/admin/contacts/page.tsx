export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { filterContactsForExport, getContactSourceOptions } from '@/lib/admin/contacts';
import ContactsClient from './ContactsClient';
import type { ContactFilters, ContactRow } from '@/lib/admin/contacts';

export const metadata = { title: 'Contacts — Admin' };

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string }>;
}) {
  await requireRole('admin');

  const filters = await searchParams;
  const admin = createAdminClient();

  const { data } = await admin
    .from('admin_contacts')
    .select('contact_key, first_name, last_name, full_name, email, phone, sources, tags, source_count, created_at, last_seen_at')
    .order('last_seen_at', { ascending: false })
    .returns<ContactRow[]>();

  const contacts = data ?? [];
  const activeFilters: ContactFilters = {
    q: filters.q ?? '',
    source: filters.source ?? 'all',
  };
  const filteredContacts = filterContactsForExport(contacts, activeFilters);
  const sourceOptions = getContactSourceOptions(contacts);
  const sourceCounts = sourceOptions.map((source) => ({
    source,
    count: contacts.filter((contact) => contact.sources.includes(source)).length,
  }));

  return (
    <ContactsClient
      contacts={filteredContacts}
      totalCount={contacts.length}
      sourceCounts={sourceCounts}
      sourceOptions={sourceOptions}
      initialFilters={activeFilters}
    />
  );
}
