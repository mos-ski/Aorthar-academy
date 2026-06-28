# Contracts Module Design

Date: 2026-06-28
Status: Approved for implementation planning

## Goal

Build a first-class admin Contracts module for creating, sending, signing, tracking, and exporting employee, contractor, and client agreements.

The module must be simple enough for daily operations, but robust enough to preserve signed records, payment state, and signing proof.

## Placement

Add `Contracts` as its own admin sidebar module, separate from Studio.

Primary admin subpages:

- `/admin/contracts` lists all contracts.
- `/admin/contracts/new` starts contract creation with Employee, Contractor, and Client mode cards.
- `/admin/contracts/templates` manages rich text templates.
- `/admin/contracts/[id]` shows contract details, status, resend actions, payment state, audit proof, and PDF download.

Public signer route:

- `/contracts/sign/[token]` renders the secure external signing page.

## Contract Modes

The module supports three modes:

- Employee: employment terms such as role, salary, start date, address, work hours, obligations, and company details.
- Contractor: project/scope terms such as deliverables, milestones, fees, deadlines, independent contractor terms, and acceptance criteria.
- Client: service agreement terms such as client details, deliverables, timelines, payment terms, receipts, part payment, Paystack payment, and manual payment tracking.

Each mode can have one or more templates, and each template owns its own field definitions.

## Template Editing

Admins manage templates in the UI with a rich text editor.

Templates contain normal rich text plus clickable placeholders. A placeholder represents a field that must be filled when creating a contract, for example:

- `Client Name`
- `Deliverables`
- `Salary`
- `Work Hours`
- `Payment Amount`
- `Start Date`

Template fields have:

- Label
- Placeholder key
- Mode
- Required flag
- Field type such as text, long text, money, date, email, phone, address, URL, or checkbox
- Optional help text

Required placeholders block sending until filled. Draft saving is allowed with missing required fields.

## Contract Creation

Creating a contract starts by choosing Employee, Contractor, or Client.

The composer loads the selected template and renders it as a live agreement. Fields that need admin input appear as clickable chips/placeholders inside the contract body. Clicking a placeholder opens a modal or side panel to enter or edit that value.

The composer shows:

- Contract title
- Contract mode
- Recipient name and email
- Template selector
- Rich contract preview
- Missing required field summary
- Save draft action
- Send action disabled until all required fields are filled

When the admin sends a contract:

- The system renders and stores an immutable contract snapshot from the current template and field values.
- The system creates a public signing token that expires in 7 days.
- The recipient receives an email with the signing link.
- The contract status becomes `sent`.

## Signing Flow

The recipient opens a public secure token link. No Aorthar login is required.

The signer page validates:

- Token exists
- Token has not expired
- Contract is not already signed
- Contract has not been revoked

The page displays the stored contract snapshot, not the current template. This protects signed contracts from future template edits.

The signer submits:

- Full name typed to sign
- Consent checkbox

The UI displays the typed full name in a signature-style font before submission.

On submit, the system stores proof:

- Signer full name
- Signer email
- Signed timestamp
- IP address
- User agent
- Consent text/version
- Token id used
- Final rendered contract snapshot

After signing:

- Contract status becomes `signed`.
- The signing link becomes read-only or no longer accepts another signature.
- The owner receives an email notification at `site_settings.contact_email`.
- If it is a client contract with payment enabled, the page shows payment options after signature.

## Expiry And Resending

Signing links expire after 7 days.

Admins can resend an unsigned or expired contract. Resending creates a fresh 7-day signing token and sends a new email.

The system keeps token history so the admin can see when links were sent, expired, revoked, or used.

## Payment Flow

Client contracts can include payment details.

After the client signs, the public page offers:

- Pay now with Paystack
- Pay later/manual payment instructions

If the client pays through Paystack, the contract records payment success through the existing payment verification/webhook style used in the app.

If the client pays manually, the admin can mark the contract as paid from the contract detail page. The manual payment record supports:

- Amount paid
- Payment method
- Bank/reference/receipt note
- Paid date

Signing and payment are independent. A client can sign first, then pay now or later.

## PDF Export

Signed contracts must be downloadable as PDFs.

The PDF is generated from the stored final contract snapshot and signature proof, not from the mutable template. This ensures a signed contract remains stable after future template edits.

PDF download must be available from the admin contract detail page. Public signer PDF download is out of scope for v1.

## Data Model

Add tables for:

- `contract_templates`
- `contract_template_fields`
- `contracts`
- `contract_field_values`
- `contract_signing_tokens`
- `contract_signatures`
- `contract_payments`

Status values:

- Template status: `draft`, `active`, `archived`
- Contract status: `draft`, `sent`, `viewed`, `expired`, `signed`, `cancelled`
- Payment status: `not_required`, `pending`, `paid`, `manual_paid`, `failed`

The database should preserve immutable signed snapshots and audit data. RLS should allow admin access for admin users and public token-limited access for signing routes through server-side validation.

## Email

Reuse the existing `sendEmail` helper and Aorthar email style.

Emails needed:

- Contract signing request to recipient
- Signed-contract notification to `site_settings.contact_email`
- Optional payment confirmation for client contracts after Paystack/manual payment

The signing email includes recipient name, contract title, expiry date, and a clear signing button.

## Permissions

Contracts are visible to super admins and finance admins in v1. Content admins do not see the Contracts module.

API routes must use existing admin auth helpers and structured status/error responses.

## UI Direction

The admin UI should match the existing admin surface: restrained, operational, dense enough for repeated use, and built with existing shadcn/ui components and lucide icons.

The public signing page should be minimal, trustworthy, and readable. It should focus on the agreement, typed signature, consent checkbox, and post-sign payment options.

## Testing And Verification

Use focused Vitest coverage for pure contract logic:

- Placeholder extraction/rendering
- Required field completeness
- Token expiry calculation
- Signature proof payload shaping
- Payment status transitions where practical

Run:

- `bun run test` for added tests
- `bun run lint`
- `bun run build`

The production build remains the primary correctness gate.

## Out Of Scope For V1

- Multi-signer contracts
- Countersigning workflow
- Full DocuSign-style legal certificate
- Reminder automation
- In-app notification center
- Invoice module as a separate subpage
- Template version diff UI

The data model must leave room for these future additions by keeping tokens, signatures, payments, and rendered snapshots in separate tables.
