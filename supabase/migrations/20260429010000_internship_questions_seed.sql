-- ═══════════════════════════════════════════════════════════════════════════
-- INTERNSHIP EXAM QUESTIONS — Seeded from Product SOP (Nazza Product & Engineering Team)
-- 35 questions across Bug Handling, Incident Management, Change Management,
-- Release Management, Sprint Planning, Scrum & Agile, Engineering Development,
-- Roles & Responsibilities, Task Intake, Security, QA, Customer Support, Deployment, Tools
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO internship_questions (question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, is_active) VALUES

-- ── Bug Handling ──────────────────────────────────────────────────────────
(
  'What is the response time requirement for P0 bugs (System Down / Production Bugs)?',
  '15 minutes', '30 minutes', '1 hour', '2 hours',
  'b', 1, true
),
(
  'How quickly must P1 bugs (Payment/Revenue Affected) be addressed?',
  '30 minutes', '1 hour', '2 hours', '4 hours',
  'c', 2, true
),
(
  'What is the response time for P2 bugs (Minor Functional Bugs)?',
  '2 hours', '4 hours', '24 hours', 'Next release cycle',
  'c', 3, true
),
(
  'When should P3 bugs (Cosmetic/UI issues) be addressed?',
  'Within 2 hours', 'Within 24 hours', 'Within a week', 'Next release cycle',
  'd', 4, true
),

-- ── Incident Management ───────────────────────────────────────────────────
(
  'Where should bugs be logged immediately when discovered?',
  'Email to manager', 'Ticketing system (JIRA)', 'WhatsApp group', 'Verbal report only',
  'b', 5, true
),
(
  'Who performs Level 1 triage for reported issues?',
  'QA Team', 'Product Manager', 'Engineering on-call', 'Customer Support',
  'c', 6, true
),
(
  'What should be attached when logging a bug report?',
  'Screenshots only', 'Tests and severity level', 'Email thread', 'User feedback only',
  'b', 7, true
),
(
  'When should urgent incidents be escalated according to the SOP?',
  'Via email to the CTO only', 'Alert #Product team on WhatsApp and notify CTO/PM', 'Create a JIRA ticket and wait for triage', 'Call an emergency team meeting',
  'b', 8, true
),

-- ── Change Management ─────────────────────────────────────────────────────
(
  'How much advance notice is required before pushing production changes?',
  '2 hours', '12 hours', '24 hours', '48 hours',
  'c', 9, true
),
(
  'When should system downtime be scheduled?',
  'During peak hours', 'Off-peak hours only', 'Anytime', 'Business hours',
  'b', 10, true
),
(
  'Who must approve emergency production changes?',
  'Any developer', 'Team lead', 'CTO/Product Manager', 'QA lead',
  'c', 11, true
),
(
  'What is required for all production-affecting changes?',
  'Verbal approval', 'PRD or documented change log', 'Email notification', 'Team meeting',
  'b', 12, true
),

-- ── Release Management ────────────────────────────────────────────────────
(
  'Who must sign off before merging code to production?',
  'Backend engineer', 'Frontend engineer', 'QA team', 'Product manager',
  'c', 13, true
),
(
  'When is the weekly release cycle typically conducted?',
  'Friday 5PM WAT', 'Monday 4PM WAT', 'Wednesday 12PM WAT', 'Thursday 9AM WAT',
  'b', 14, true
),

-- ── Sprint Planning ───────────────────────────────────────────────────────
(
  'What must happen before any code can be marked as done?',
  'Developer self-approval', 'Code review only', 'QA, PM, or Scrum Master approval', 'Deployment to staging',
  'c', 15, true
),
(
  'What is the maximum sprint capacity to avoid overworking the team?',
  '100 points', '120 points', '140 points', '160 points',
  'c', 16, true
),
(
  'Who is the ultimate owner of a Story in a sprint?',
  'Frontend Engineer', 'Product Manager', 'Backend Engineer', 'Scrum Master',
  'c', 17, true
),
(
  'What is the maximum timeline for Design work (Web and Mobile) on a child issue?',
  '1 day', '2 days', '3 days', '1 week',
  'b', 18, true
),
(
  'What is the maximum timeline for Endpoint Development (including research)?',
  '3 days', '5 days', '1 week', '2 weeks',
  'c', 19, true
),
(
  'What is the ticket point value for a Bug/Support ticket?',
  '1 point', '2 points', '3 points', '4 points',
  'a', 20, true
),
(
  'What is the point value for a Story ticket, and when must it be completed?',
  '2 points — same day', '4 points — within that sprint', '6 points — within 2 sprints', '3 points — within the week',
  'b', 21, true
),

-- ── Scrum & Agile ─────────────────────────────────────────────────────────
(
  'How long do sprints last according to the SOP?',
  '1 week only', '2–4 weeks', '4–6 weeks', 'Exactly 2 weeks',
  'b', 22, true
),
(
  'What are the three questions answered at the Daily Stand-up?',
  'What did you build? What will you ship? What does the PM want?', 'What did you do? What will you do? What is blocking you?', 'What did you test? What will you test? What bugs did you find?', 'What is the deadline? What is the priority? Who owns it?',
  'b', 23, true
),
(
  'What is the purpose of the Sprint Retrospective meeting?',
  'To demo features to stakeholders', 'To assign tasks for the next sprint', 'To review sprint performance and identify improvements', 'To get sign-off from the Product Owner on deliverables',
  'c', 24, true
),

-- ── Engineering Development ───────────────────────────────────────────────
(
  'What type of branches should be used for new features in version control?',
  'main/master', 'develop', 'feature/xyz', 'hotfix/abc',
  'c', 25, true
),
(
  'Direct commits to the main or production branch are:',
  'Allowed with team lead approval', 'Allowed for hotfixes only', 'Strictly prohibited', 'Allowed during off-peak hours',
  'c', 26, true
),
(
  'What is required for all Pull Requests before they can be merged?',
  'Manager approval only', 'Peer review and passing CI checks', 'QA manual testing only', 'Product Manager sign-off',
  'b', 27, true
),
(
  'In the feature development workflow, what must the Design team do before engineers begin building?',
  'Deploy to staging', 'Create a Figma prototype reviewed by dev and PM', 'Write test cases in JIRA', 'Complete QA sign-off',
  'b', 28, true
),

-- ── Roles & Responsibilities ──────────────────────────────────────────────
(
  'Who is responsible for running sprint ceremonies, maintaining JIRA hygiene, and clearing blockers?',
  'Product Manager', 'Backend Engineer', 'QA Lead', 'Scrum Master',
  'd', 29, true
),
(
  'Which role is responsible for defining the roadmap, prioritising tasks, and running sprint grooming?',
  'Frontend Engineer', 'Scrum Master', 'Product Manager', 'QA Engineer',
  'c', 30, true
),

-- ── Task Intake ───────────────────────────────────────────────────────────
(
  'What must happen before a team member can accept and implement a task from an external stakeholder?',
  'Verbal approval from any senior engineer', 'PM approval and creation of a JIRA ticket', 'QA sign-off and staging deployment', 'Engineering Lead review only',
  'b', 31, true
),

-- ── Security & Compliance ─────────────────────────────────────────────────
(
  'What encryption standard is used for sensitive data at rest and in transit?',
  'MD5 / HTTP', 'SHA-256 / TLS 1.0', 'AES-256 / SSL', 'RSA-2048 / HTTPS only',
  'c', 32, true
),
(
  'How long are database backups retained according to the SOP?',
  '7 days', '14 days', '30 days', '90 days',
  'c', 33, true
),

-- ── Quality Assurance & Tools ─────────────────────────────────────────────
(
  'What tool is used for automated testing?',
  'Selenium', 'Cypress', 'Katalon', 'Jest',
  'c', 34, true
),
(
  'What is the Tier 1 customer support solution?',
  'Human agents available 24/7', 'Zendesk AI chatbot (24/7)', 'WhatsApp support group', 'Email support team',
  'b', 35, true
);
