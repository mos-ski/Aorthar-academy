# NDA Inside Contracts Design

Date: 2026-07-18
Status: Approved for implementation

## Goal

Add a one-way Non-Disclosure Agreement workflow inside the existing admin Contracts module. An admin can prepare a universal Aorthar NDA for an employee, contractor, client, partner, vendor, or other project participant; email it or copy its secure link for manual WhatsApp delivery; receive a recipient-only electronic signature; and retain the completed PDF and signing evidence in the dashboard.

## Product Placement

NDA is a document type inside Contracts, not a separate sidebar module.

The Contracts module supports two document types:

- `agreement` for the current employee, contractor, and client agreements.
- `nda` for the new one-way project NDA.

The Contracts list provides All, Agreements, and NDAs filters. The existing `/admin/contracts/new` composer accepts a document-type choice and can be opened directly for NDA creation. Existing agreements continue to behave as they do today.

## Architecture

Extend the existing Contracts engine rather than introduce parallel NDA tables, signing routes, or PDF code. Add `document_type` to templates and contract records, retain the current agreement modes, add `nda` as the mode used by NDA templates and documents, and add a separate recipient relationship field for NDA categorisation.

The NDA workflow reuses:

- Contract templates and smart fields
- Draft creation and immutable rendered snapshots
- Seven-day, revocable, single-use signing tokens
- Public signing route
- Typed electronic signatures and consent evidence
- Email delivery
- PDF generation
- Contract status and token history
- Admin detail and list screens

## NDA Parties And Signature Model

The NDA is one-way:

- Aorthar is the disclosing party.
- The external recipient is the receiving party.
- Only the recipient signs in v1.
- Aorthar company details are printed in the document; no Aorthar countersignature is required.

The recipient relationship is one of:

- Employee
- Contractor
- Client
- Partner
- Vendor
- Other

## Admin Composer

The NDA composer collects:

- Document title
- Recipient legal name
- Recipient email
- Recipient phone or WhatsApp number
- Recipient relationship
- Recipient company, optional
- Project name
- Project purpose or description
- Effective date
- Confidentiality term
- Any additional project-specific notes supported by the template

Name, email, phone, relationship, project name, purpose, and effective date are required before sending. The NDA can be saved as a draft with incomplete fields.

The preview uses the existing placeholder system and renders the exact document snapshot that the recipient will sign.

## Universal NDA Template

Seed one active template named `Aorthar One-Way Project NDA`. It must be suitable for employees, contractors, clients, partners, vendors, and other people who receive access to Aorthar or client work.

The template covers:

- Definition of confidential information, including information disclosed in writing, verbally, visually, digitally, or through access to systems and project materials
- Use only for the stated project purpose
- Non-disclosure to third parties except where Aorthar gives prior written permission
- Reasonable protection of confidential information and credentials
- No unnecessary copying, downloading, or retention
- Prompt return or deletion of materials when requested or when the relationship ends
- Standard exclusions for information already public, already lawfully known, independently developed, or lawfully received from another source
- Legally compelled disclosure with prompt notice to Aorthar where legally permitted
- No licence, ownership right, or publicity right arising from access to the information
- Acknowledgement that Aorthar and/or its client retains ownership of supplied project materials
- Nigerian governing-law and dispute language, subject to review by qualified Nigerian counsel before production activation

The NDA template is editable through the existing template manager, and every sent NDA remains protected by its immutable rendered snapshot.

## Permanent No-Posting And No-Portfolio Restriction

The NDA expressly prohibits the recipient from presenting, publishing, displaying, or implying ownership or authorship of Aorthar or client work without Aorthar's prior written permission.

The restriction includes, without limitation:

- Personal or company portfolios
- Social-media posts
- Public or private code repositories shared as work samples
- Behance, Dribbble, GitHub, personal websites, and similar platforms
- Case studies, demos, screenshots, recordings, and before/after comparisons
- Pitches, proposals, award submissions, interviews, talks, and training materials
- Use of Aorthar or client names, brands, logos, testimonials, or project details for publicity

This restriction survives the end of the relationship and remains permanent unless Aorthar grants written permission. The template must distinguish this publicity restriction from the general confidentiality term so an expired confidentiality period does not accidentally permit portfolio use.

## Delivery Flow

Sending an NDA performs the following actions:

1. Validate recipient identity and all required template fields.
2. Render and store an immutable NDA snapshot.
3. Revoke any earlier active token for the same NDA.
4. Create a cryptographically random signing token that expires after seven days.
5. Mark the NDA as sent.
6. Send the signing-request email when email delivery is requested.
7. Return the signing URL to the admin UI for Copy Link and Share on WhatsApp actions.

The admin can:

- Send by email and copy the same link
- Create/copy the link for manual delivery
- Open a prepared WhatsApp message addressed to the stored phone number
- Resend by email, which revokes the old token and generates a fresh link
- Revoke an unsigned link

WhatsApp delivery is manual in v1. The system opens a prepared message but does not integrate with the WhatsApp Business API.

If link generation succeeds but email delivery fails, the NDA remains sent and the UI reports that the secure link was created while the email failed. The admin can still copy or share the link and retry email delivery.

## Recipient Signing Flow

The recipient does not need an Aorthar account.

The public page:

1. Validates that the token exists, is active, has not expired, and belongs to an unsigned, non-cancelled NDA.
2. Marks the NDA viewed on the first successful view.
3. Displays the immutable NDA snapshot before the signature controls.
4. Shows the recipient name and project context.
5. Requires the recipient to type their full legal name.
6. Requires explicit electronic-signature consent.
7. Records the signature once and makes the page read-only afterward.

The signature record stores:

- Signer name
- Recipient email
- Signed timestamp
- IP address
- User agent
- Consent text and version
- Signing-token identifier
- Final signed snapshot

## Completion And Copies

After signing:

- The NDA status becomes `signed`.
- The token becomes `used` and cannot accept another signature.
- The final snapshot and signing evidence are used to generate a completed PDF.
- The recipient receives the completed PDF by email.
- Aorthar receives the same completed copy at `site_settings.contact_email`.
- The admin detail page exposes the PDF, signature evidence, and token history.

Email failure after a successful signature must not roll back or invalidate the signature. The failure is logged, and the completed document remains downloadable from the dashboard.

## Dashboard Experience

The Contracts list gains document-type filters and displays NDA-specific context without disrupting agreement records. NDA rows show:

- NDA title and project
- Recipient name, email, and phone
- Relationship
- Draft, sent, viewed, expired, signed, or cancelled status
- Sent, viewed, and signed dates

The NDA detail screen provides:

- Copy signing link
- Share on WhatsApp
- Resend email
- Revoke link
- Duplicate NDA
- Download completed PDF
- Rendered NDA preview
- Recipient and project metadata
- Token delivery/view history
- Signature and consent evidence

Payment controls are never shown for NDA documents.

## Data Model

Extend the existing tables rather than create NDA-only tables.

### `contract_templates`

- Add `document_type text not null default 'agreement'` with allowed values `agreement` and `nda`.
- Extend the `mode` constraint with `nda`; the universal NDA template uses `mode = 'nda'`.
- Existing templates backfill to `agreement`.

### `contracts`

- Add `document_type text not null default 'agreement'` with allowed values `agreement` and `nda`.
- Extend the `mode` constraint with `nda`; NDA records use `mode = 'nda'`, while existing agreement modes remain unchanged.
- Add `recipient_phone text`.
- Add `recipient_relationship text` with allowed NDA values `employee`, `contractor`, `client`, `partner`, `vendor`, and `other`.
- Add `recipient_company text`.
- Add `project_name text`.
- Existing records backfill to `agreement` and retain their current `mode` behavior.

### `contract_template_fields`

- Extend the `mode` constraint with `nda`; fields owned by the universal NDA template use `mode = 'nda'`.

No new signature, token, payment, or field-value tables are required.

## Permissions And Security

- Preserve the existing Contracts permission rule: super admins and finance admins can manage documents.
- Public access remains server-side and token-limited; no public table policies are added.
- Tokens remain cryptographically random, expire after seven days, and are single use.
- Resending revokes older active tokens.
- The recipient email and identity printed in the document cannot be edited after signing.
- Template edits never mutate sent or signed snapshots.
- NDA endpoints must return structured validation errors without exposing unrelated contract data.

## Email

Add NDA-specific email subjects and body copy while reusing Aorthar's existing email shell:

- NDA signature request
- NDA signed notification to Aorthar
- Completed NDA copy to the recipient

The request email identifies the project, expiry date, and secure signing action. The completion emails identify the signer and signed timestamp and include the completed PDF. If the email helper cannot attach binary content, add attachment support in a backward-compatible way.

## Error Handling

- Missing required data: keep the NDA as a draft and return field-specific validation errors.
- Invalid token: show a signing-link-not-found state.
- Expired or revoked token: show a clear inactive-link state and direct the recipient to contact Aorthar.
- Already signed: show the read-only completed state rather than accepting another signature.
- Email failure: preserve the document and link/signature state, report the delivery failure, and allow retry or manual sharing.
- PDF generation failure: preserve the signature, log the error, notify the admin email without an attachment when possible, and keep PDF download available for retry.

## Verification

Add focused tests for:

- Agreement-versus-NDA document classification
- NDA required recipient and project fields
- Permanent no-portfolio clause presence in the seeded template
- Signing-link creation for email and manual-link delivery
- NDA payment exclusion
- Signature completion and one-use token behavior
- Completed-copy recipient and owner email payloads
- WhatsApp link formatting from Nigerian and international phone inputs

Run:

- `bun run test src/__tests__/unit/contracts.test.ts`
- Focused ESLint on changed files
- `bun run lint`
- `bun run build`

The production build is the primary correctness gate.

## Legal Review Requirement

The software may ship to staging with the seeded draft template, but the template must not be represented as legally approved or activated in production until qualified Nigerian counsel reviews the confidentiality duration, intellectual-property references, remedies, governing law, dispute terms, electronic-signature consent, and permanent publicity restriction.

## Out Of Scope For V1

- Mutual NDAs
- Aorthar countersigning
- Multiple recipients or signing order
- Identity-document upload or biometric verification
- SMS or WhatsApp Business API delivery
- Automated reminder schedules
- Recipient accounts
- Template version-diff UI
- Full DocuSign-style completion certificate
