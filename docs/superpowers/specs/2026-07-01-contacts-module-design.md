# Contacts Module Design

## Goal

Build a read-only admin Contacts module that consolidates people from Aorthar's product databases into one exportable audience directory.

## Scope

Contacts is an admin-only directory at `/admin/contacts`.

The first version includes:

- Searchable contact list
- Source and tag filters
- Summary counts
- CSV export
- Excel-compatible export
- Read-only data pulled from existing product records

The first version does not include:

- Contact import
- Manual contact editing
- Manual tagging
- Unsubscribe management
- A new broadcast composer

## Data Model

Create a read-only SQL view named `admin_contacts`.

Each output row represents one deduplicated person when an email is available. Contacts without a usable email may still appear using a source-specific key.

The view exposes:

- `contact_key`
- `first_name`
- `last_name`
- `full_name`
- `email`
- `phone`
- `sources`
- `tags`
- `source_count`
- `created_at`
- `last_seen_at`

Initial source inputs:

- `profiles` joined to `auth.users` for University/auth users
- `standalone_purchases` joined to `auth.users` for Bootcamp buyers
- `internship_applications`
- `studio_contacts`
- `webinar_registrations` joined to `webinars`
- `marketplace_purchases`

The view should normalize names, emails, and tags, then group rows by normalized email. Tags should describe useful audiences such as `University`, `Bootcamp`, `Internship`, `Studio Inquiry`, `Webinar Attendee`, and `Marketplace`.

## Admin UI

Add Contacts as a primary admin module in the sidebar.

The page should show:

- Total contact count
- Counts by source
- Search input for name, email, and phone
- Source filter
- Export buttons for CSV and Excel
- Table columns for name, email, phone, sources, tags, and last seen date

The table can be server-rendered with query-string filters so exports and UI use the same filter semantics.

## Export

Add admin-only export endpoints:

- `/api/admin/contacts/export?format=csv`
- `/api/admin/contacts/export?format=xls`

Both endpoints should accept the same `q` and `source` filters as the UI.

CSV output should include headers even when no rows match.

The Excel export may use an Excel-compatible `.xls` SpreadsheetML document so no new package is required.

## Security

All page and export access must require admin role.

The Contacts UI and export API should use the existing admin Supabase client on the server. No client-side Supabase access is needed.

The view is read-only by design and should not introduce public write access.

## Verification

Run:

- `bun run test` for focused utilities if tests are added
- `bun run lint`
- `bun run build`

Manual checks:

- `/admin/contacts` renders
- Search filters contacts
- Source filter works
- CSV export downloads with matching filters
- Excel export downloads with matching filters
