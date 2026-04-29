-- ═══════════════════════════════════════════════════════════════════════════
-- INTERNSHIP EXAM QUESTIONS — Aorthar Standard: Operating Procedures for Product Teams
-- 35 questions. World-class, company-agnostic. All answers derivable from the Aorthar Standard SOP.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO internship_questions (question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, is_active) VALUES

-- ── Bug Severity & Response Times ─────────────────────────────────────────
(
  'What is the required response time for a P0 bug (System Down / Production Bug)?',
  '15 minutes', '30 minutes', '1 hour', '2 hours',
  'b', 1, true
),
(
  'A payment processing failure that directly impacts revenue is classified as which bug priority?',
  'P0', 'P1', 'P2', 'P3',
  'b', 2, true
),
(
  'A minor functional bug with a workaround available must be addressed within:',
  '2 hours', '4 hours', '24 hours', 'Next release cycle',
  'c', 3, true
),
(
  'Cosmetic or UI-only issues with no functional impact are addressed when?',
  'Within 2 hours', 'Within 24 hours', 'Within the same sprint', 'Next release cycle',
  'd', 4, true
),

-- ── Incident Management ───────────────────────────────────────────────────
(
  'When a bug is discovered, where must it be logged immediately?',
  'Via a chat message to the team', 'The ticketing system (JIRA or equivalent)', 'Verbally reported to a team lead', 'An email to the PM',
  'b', 5, true
),
(
  'What must a bug report include beyond a description?',
  'Only a screenshot', 'Recorded test steps and the severity level', 'A proposed fix from the reporter', 'A Slack notification',
  'b', 6, true
),
(
  'Who performs Level 1 triage on reported incidents?',
  'The Product Manager', 'The QA Lead', 'Engineering on-call (rotation-based)', 'The Scrum Master',
  'c', 7, true
),
(
  'When an incident is urgent, what is the correct escalation action?',
  'Send an email and wait for a response', 'Alert the Product team channel and notify CTO/PM immediately', 'Create a ticket and wait for triage', 'Hold an emergency all-hands meeting',
  'b', 8, true
),

-- ── Change Management ─────────────────────────────────────────────────────
(
  'What documentation is required before any production-affecting change can proceed?',
  'A verbal agreement from the team', 'A PRD or documented change log', 'An email to all engineers', 'A retrospective note',
  'b', 9, true
),
(
  'How far in advance must relevant teams be notified before production changes are pushed?',
  '2 hours', '12 hours', '24 hours', '48 hours',
  'c', 10, true
),
(
  'System downtime for maintenance must be scheduled during:',
  'Business hours for maximum oversight', 'Peak usage hours', 'Off-peak hours only', 'Any time, as long as it is communicated',
  'c', 11, true
),
(
  'Who must approve emergency production changes?',
  'Any senior developer', 'The Scrum Master', 'CTO or Product Manager', 'The QA Lead',
  'c', 12, true
),

-- ── Release Management ────────────────────────────────────────────────────
(
  'Who must sign off before any code is merged to the production branch?',
  'The Backend Engineer who wrote the code', 'The Frontend Engineer', 'The QA Engineer', 'The PM after UAT',
  'c', 13, true
),
(
  'What must happen after every production release?',
  'The sprint is immediately closed', 'Logs are monitored for early issue identification and QA confirms the deployed version', 'A new sprint begins without review', 'Engineers take a 48-hour break',
  'b', 14, true
),

-- ── Sprint Mechanics & Planning ───────────────────────────────────────────
(
  'What is the maximum sprint capacity a team should commit to?',
  '100 story points', '120 story points', '140 story points', '160 story points',
  'c', 15, true
),
(
  'Who is the ultimate owner of a Story in a sprint?',
  'Frontend Engineer', 'Product Manager', 'Backend Engineer', 'Scrum Master',
  'c', 16, true
),
(
  'Who is the ONLY person who can mark a task as Done?',
  'The engineer who built it', 'The team lead after a code review', 'QA, PM, or Scrum Master', 'Anyone on the sprint board',
  'c', 17, true
),
(
  'If a Story will take longer than 2 weeks to complete, what should happen?',
  'It is deferred to next quarter', 'The sprint capacity is increased', 'It must be split into phases', 'The PM writes a new PRD',
  'c', 18, true
),
(
  'How long do sprints last according to the Aorthar Standard?',
  '1 week exactly', '2–4 weeks', '4–6 weeks', 'Exactly 2 weeks',
  'b', 19, true
),
(
  'What is the point value and completion expectation for a Bug/Support ticket?',
  '2 points — within the sprint', '1 point — same day', '3 points — within 48 hours', '4 points — within the week',
  'b', 20, true
),

-- ── Sprint Ceremonies ─────────────────────────────────────────────────────
(
  'What are the three questions every team member answers at the Daily Stand-up?',
  'What is my priority? What is my estimate? What is my deadline?', 'What did I do? What will I do? What is blocking me?', 'What did I ship? What will I ship? What is the PM asking for?', 'What did I test? What failed? What needs rework?',
  'b', 21, true
),
(
  'The Daily Stand-up is run by whom, and has a maximum duration of?',
  'PM — 30 minutes', 'Engineering Lead — 20 minutes', 'Scrum Master — 15 minutes', 'Any team member — 10 minutes',
  'c', 22, true
),
(
  'What is the purpose of Backlog Refinement?',
  'To demo completed features to stakeholders', 'To close the current sprint', 'To estimate and prioritise future items mid-sprint', 'To assign bugs to engineers',
  'c', 23, true
),
(
  'Who should NOT be invited to the Sprint Retrospective?',
  'The Scrum Master', 'The QA Engineer', 'The Product Manager', 'External stakeholders',
  'd', 24, true
),

-- ── Child Issue Timelines ─────────────────────────────────────────────────
(
  'What is the maximum timeline for a Design child issue (Web and Mobile)?',
  '1 day', '2 days', '3 days', '1 week',
  'b', 25, true
),
(
  'What is the maximum timeline for Endpoint Development, including research?',
  '3 days', '5 days', '1 week', '2 weeks',
  'c', 26, true
),
(
  'How long does a Testing & Review child issue have as its maximum timeline?',
  '4 hours', '1 day', '2 days', '3 days',
  'b', 27, true
),

-- ── Engineering Standards ─────────────────────────────────────────────────
(
  'Which branch naming convention is correct for a new feature?',
  'main-new-login', 'develop/login', 'feature/user-login', 'hotfix/user-login',
  'c', 28, true
),
(
  'Direct commits to the main or production branch are:',
  'Allowed with team lead approval', 'Allowed for hotfixes only', 'Allowed during off-peak hours', 'Strictly prohibited without exception',
  'd', 29, true
),
(
  'What must a Pull Request pass before it can be merged?',
  'Only the author''s self-review', 'Peer review AND passing CI checks', 'PM sign-off only', 'A manual QA test only',
  'b', 30, true
),

-- ── Communication & Task Intake ───────────────────────────────────────────
(
  'A stakeholder from the Marketing team asks an engineer to make a "quick fix" directly. What is the correct response?',
  'Do the fix if it takes less than 30 minutes', 'Do it and notify the PM afterwards', 'Decline and direct the stakeholder to submit the request to the PM', 'Do it and create the ticket retroactively',
  'c', 31, true
),
(
  'What must every team update include?',
  'A verbal explanation in the stand-up', 'The ticket link and clear context on what was done', 'A screenshot of the code', 'An estimate for the next task',
  'b', 32, true
),

-- ── Roles & Responsibilities ──────────────────────────────────────────────
(
  'Which role is responsible for running sprint ceremonies, clearing blockers, and maintaining board hygiene?',
  'Product Manager', 'QA Engineer', 'Backend Engineer', 'Scrum Master',
  'd', 33, true
),
(
  'A Designer''s responsibility in the feature development lifecycle ends when?',
  'After wireframes are approved', 'After high-fi Figma designs are created', 'After the staging build is reviewed for accuracy against the design', 'After the feature goes live in production',
  'c', 34, true
),

-- ── Security & Compliance ─────────────────────────────────────────────────
(
  'What is the minimum encryption standard for sensitive data at rest and in transit?',
  'MD5 at rest, HTTP in transit', 'SHA-1 / TLS 1.0', 'AES-256 at rest, SSL/TLS in transit', 'RSA-512 / HTTPS only',
  'c', 35, true
);
