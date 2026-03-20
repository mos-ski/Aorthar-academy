-- ═══════════════════════════════════════════════════════════════════════════
-- AORTHAR ACADEMY — SEED ALL DEPARTMENTS (YEARS 100-400)
-- Migration: 20260320000001_seed_all_departments.sql
-- Source: Department academic plan markdown files
-- Idempotent: uses deterministic IDs + ON CONFLICT DO NOTHING
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE courses
  DROP CONSTRAINT IF EXISTS courses_code_check;

ALTER TABLE courses
  ADD CONSTRAINT courses_code_check
  CHECK (code ~ '^[A-Z]{2,4}[0-9]{3}$');

DO $$
DECLARE
  y100 UUID; y200 UUID; y300 UUID; y400 UUID;
  y100s1 UUID; y100s2 UUID;
  y200s1 UUID; y200s2 UUID;
  y300s1 UUID; y300s2 UUID;
  y400s1 UUID; y400s2 UUID;
BEGIN
  SELECT id INTO y100 FROM years WHERE level = 100;
  SELECT id INTO y200 FROM years WHERE level = 200;
  SELECT id INTO y300 FROM years WHERE level = 300;
  SELECT id INTO y400 FROM years WHERE level = 400;

  SELECT id INTO y100s1 FROM semesters WHERE year_id = y100 AND number = 1;
  SELECT id INTO y100s2 FROM semesters WHERE year_id = y100 AND number = 2;
  SELECT id INTO y200s1 FROM semesters WHERE year_id = y200 AND number = 1;
  SELECT id INTO y200s2 FROM semesters WHERE year_id = y200 AND number = 2;
  SELECT id INTO y300s1 FROM semesters WHERE year_id = y300 AND number = 1;
  SELECT id INTO y300s2 FROM semesters WHERE year_id = y300 AND number = 2;
  SELECT id INTO y400s1 FROM semesters WHERE year_id = y400 AND number = 1;
  SELECT id INTO y400s2 FROM semesters WHERE year_id = y400 AND number = 2;

  CREATE TEMP TABLE tmp_seed_courses (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    year_level INTEGER NOT NULL,
    semester_number SMALLINT NOT NULL,
    sort_order SMALLINT
  ) ON COMMIT DROP;

  INSERT INTO tmp_seed_courses (code, name, year_level, semester_number)
  VALUES
    ('BUS101','Business Fundamentals for Tech',100,1),
    ('COM101','Communication & Stakeholder Management',100,1),
    ('CS101','Computer Science Fundamentals',100,1),
    ('DB101','Database Fundamentals (SQL & NoSQL)',100,1),
    ('DES101','Introduction to Visual Design',100,1),
    ('DEV101','JavaScript Fundamentals & ES6+',100,1),
    ('DEV103','Data Structures & Algorithms in JS',100,1),
    ('DEV105','Introduction to Backend Development (Node.js)',100,1),
    ('PM101','Foundations of Product Management',100,1),
    ('PM103','Introduction to Agile & Scrum',100,1),
    ('PSY101','Team Dynamics & Psychology',100,1),
    ('QA101','Introduction to Software Quality Assurance',100,1),
    ('SCR101','Agile Principles & Scrum Mastery',100,1),
    ('UXR102','Fundamentals of User Research',100,1),
    ('ANA101','Data Literacy & Reporting',100,2),
    ('ANA102','Fundamentals of Product Analytics',100,2),
    ('CS102','Operating Systems & Networking',100,2),
    ('DB102','Advanced SQL & Database Design',100,2),
    ('DES102','UI Design Fundamentals',100,2),
    ('DES104','Introduction to UX Design',100,2),
    ('DEV102','HTML & CSS for Product Managers',100,2),
    ('DEV104','Introduction to React & Component Architecture',100,2),
    ('DEV106','Browser APIs & The DOM',100,2),
    ('DEV108','Building RESTful APIs',100,2),
    ('LDR101','Introduction to Leadership',100,2),
    ('MKT102','Fundamentals of Product Marketing',100,2),
    ('OPS101','Introduction to Product Operations',100,2),
    ('PM102','Writing User Stories & Requirements',100,2),
    ('QA102','Introduction to Testing (Unit, Integration)',100,2),
    ('QA104','Introduction to Test Automation (Selenium/Cypress)',100,2),
    ('QA106','Mobile Application Testing',100,2),
    ('SCR102','Advanced Scrum & Facilitation',100,2),
    ('SEC101','Introduction to Security',100,2),
    ('ANA201','Data-Driven Decision Making',200,1),
    ('ARC201','Introduction to Microservices',200,1),
    ('DB201','ORMs (Prisma, TypeORM)',200,1),
    ('DES201','Advanced UI & Layout Systems',200,1),
    ('DEV201','Advanced React (Hooks & Context)',200,1),
    ('DEV203','State Management (Redux, Zustand)',200,1),
    ('DEV205','Component Libraries & Storybook',200,1),
    ('DEV207','Advanced Node.js (Streams, Child Processes)',200,1),
    ('FIN201','Business & Finance for PMs (Unit Economics, P&L)',200,1),
    ('OPS201','Containerization with Docker',200,1),
    ('OPS203','Product Operations Deep Dive',200,1),
    ('PM201','Product Roadmapping & Strategy',200,1),
    ('PM203','Technical Fundamentals for PMs (APIs, Databases)',200,1),
    ('QA201','Frontend Testing (Jest, React Testing Library)',200,1),
    ('SCR201','Scaling Agile Frameworks (SAFe, LeSS)',200,1),
    ('SCR203','The Kanban Method',200,1),
    ('SEC201','Authentication & Authorization (JWT, OAuth)',200,1),
    ('UXR201','Conducting User Interviews & Surveys',200,1),
    ('ANA202','Metrics for Agile Teams (Cycle Time, Lead Time)',200,2),
    ('API201','Consuming REST & GraphQL APIs',200,2),
    ('ARC202','Message Queues (RabbitMQ, Kafka)',200,2),
    ('ARC204','Software Architecture Patterns',200,2),
    ('COM201','Conflict Resolution & Negotiation',200,2),
    ('DES202','Interaction Design Principles',200,2),
    ('DEV202','TypeScript Fundamentals',200,2),
    ('DEV204','Web Performance & Optimization',200,2),
    ('DEV206','Build Tools (Webpack, Vite)',200,2),
    ('DEV208','Advanced CSS & Animations',200,2),
    ('OPS202','Caching Strategies with Redis',200,2),
    ('OPS204','Release Management & Planning',200,2),
    ('OPS206','Advanced Project Management Tools (Jira Admin)',200,2),
    ('PM202','A/B Testing & Experimentation',200,2),
    ('PM204','Growth Hacking & Product-Led Growth (PLG)',200,2),
    ('PM206','Go-to-Market (GTM) Strategy',200,2),
    ('QA202','Backend Testing Strategies',200,2),
    ('UXR202','Usability Testing: Planning & Execution',200,2),
    ('ARC301','System Design Fundamentals',300,1),
    ('DB301','Database Optimization & Scaling',300,1),
    ('DES301','Building & Maintaining Design Systems',300,1),
    ('DEV301','Frontend System Design',300,1),
    ('DEV303','Accessibility Engineering (A11y)',300,1),
    ('DEV305','GraphQL Clients (Apollo, Relay)',300,1),
    ('DEV307','Advanced TypeScript',300,1),
    ('FIN301','Agile Budgeting & FinOps',300,1),
    ('LAW301','Legal & Ethical Considerations in Product',300,1),
    ('LDR301','Organizational Change Management',300,1),
    ('OPS301','Cloud Computing (AWS/GCP Foundations)',300,1),
    ('OPS303','Orchestration with Kubernetes',300,1),
    ('PM301','Advanced Product Strategy & Portfolio Management',300,1),
    ('PM303','Platform Product Management',300,1),
    ('PM305','API Product Management',300,1),
    ('SCR301','Agile Coaching & Transformation',300,1),
    ('SEC301','Frontend Security (OWASP)',300,1),
    ('SEC302','Advanced API Security',300,1),
    ('ANA302','Advanced Analytics & Data Science for PMs',300,2),
    ('ARC302','Distributed Systems',300,2),
    ('ARC304','Advanced System Design',300,2),
    ('CI301','CI/CD for Frontend (GitHub Actions)',300,2),
    ('DEV302','Server-Side Rendering (Next.js)',300,2),
    ('DEV304','Progressive Web Apps (PWAs)',300,2),
    ('DEV306','Real-time Applications (WebSockets, WebRTC)',300,2),
    ('DEV308','Introduction to Web Assembly (WASM)',300,2),
    ('LDR302','Building & Leading High-Performing Teams',300,2),
    ('OPS302','DevOps & Operations for PMs',300,2),
    ('OPS304','Monitoring & Observability (Prometheus, Grafana)',300,2),
    ('PM302','Product Leadership & Team Building',300,2),
    ('PM304','B2B vs. B2C Product Management',300,2),
    ('PM306','Pricing & Monetization Strategies',300,2),
    ('SRE301','Site Reliability Engineering (SRE) Principles',300,2),
    ('STR301','Business Strategy for Ops Leaders',300,2),
    ('BE401','Specialization I (e.g., FinTech, Distributed DBs)',400,1),
    ('BE403','Advanced Cloud Services',400,1),
    ('DEV401','Specialization I (e.g., Web3, WebGL)',400,1),
    ('DEV403','AI/ML for Backend Developers',400,1),
    ('FRE401','Freelancing & Consulting for PMs',400,1),
    ('FRE402','Freelancing for Developers',400,1),
    ('INT402','Mastering the Frontend Interview',400,1),
    ('INT403','Mastering the Backend Interview',400,1),
    ('INT405','Mastering the Agile/Ops Interview',400,1),
    ('LDR401','Executive Communication & Influence',400,1),
    ('OPS401','Infrastructure as Code (Terraform)',400,1),
    ('OPS403','Specialization I (e.g., Agile for Hardware, Regulated Industries)',400,1),
    ('OSS401','Contributing to Open Source',400,1),
    ('PM401','Mastering the PM Interview',400,1),
    ('PM403','AI/ML Product Management',400,1),
    ('PM405','Specialization (e.g., FinTech, HealthTech, SaaS)',400,1),
    ('PORT401','Building a Product Portfolio & Case Studies',400,1),
    ('PORT402','Building Complex Frontend Applications',400,1),
    ('SCR401','Enterprise Agile Coaching',400,1),
    ('CAP402','Capstone Project: Build & Launch a Product',400,2),
    ('ETH402','Ethics & Responsibility in Technology',400,2),
    ('TEAM402','Mentorship & Public Speaking',400,2);

  UPDATE tmp_seed_courses t
  SET sort_order = x.rn
  FROM (
    SELECT code, ROW_NUMBER() OVER (PARTITION BY year_level, semester_number ORDER BY code)::smallint rn
    FROM tmp_seed_courses
  ) x
  WHERE x.code = t.code;

  INSERT INTO courses (
    id, code, name, description, year_id, semester_id,
    credit_units, pass_mark, quiz_weight, exam_weight,
    quiz_attempt_limit, exam_attempt_limit, cooldown_hours,
    exam_duration_mins, quiz_duration_mins,
    is_premium, status, sort_order
  )
  SELECT
    md5('aorthar-course-' || t.code)::uuid,
    t.code,
    t.name,
    'Department curriculum course seeded from Aorthar academic plan markdown files.',
    CASE t.year_level WHEN 100 THEN y100 WHEN 200 THEN y200 WHEN 300 THEN y300 WHEN 400 THEN y400 END,
    CASE
      WHEN t.year_level = 100 AND t.semester_number = 1 THEN y100s1
      WHEN t.year_level = 100 AND t.semester_number = 2 THEN y100s2
      WHEN t.year_level = 200 AND t.semester_number = 1 THEN y200s1
      WHEN t.year_level = 200 AND t.semester_number = 2 THEN y200s2
      WHEN t.year_level = 300 AND t.semester_number = 1 THEN y300s1
      WHEN t.year_level = 300 AND t.semester_number = 2 THEN y300s2
      WHEN t.year_level = 400 AND t.semester_number = 1 THEN y400s1
      WHEN t.year_level = 400 AND t.semester_number = 2 THEN y400s2
      ELSE NULL
    END,
    3, 60, 0.40, 0.60,
    3, 3, 24,
    90, 45,
    (t.year_level >= 400),
    'published',
    t.sort_order
  FROM tmp_seed_courses t
  ON CONFLICT DO NOTHING;

  -- Deep-dive lesson plans (8 lessons each) for key foundation courses.
  CREATE TEMP TABLE tmp_deep_lessons (
    code TEXT,
    lesson_no SMALLINT,
    lesson_title TEXT,
    youtube_url TEXT
  ) ON COMMIT DROP;

  INSERT INTO tmp_deep_lessons (code, lesson_no, lesson_title, youtube_url)
  VALUES
    ('PM101',1,'What is a Product Manager?','https://www.youtube.com/watch?v=502ILHjX9EE'),
    ('PM101',2,'The Product Lifecycle','https://www.youtube.com/watch?v=ksyA-c6d55A'),
    ('PM101',3,'Design Thinking for PMs','https://www.youtube.com/watch?v=ZfU5Y7F3Vwk'),
    ('PM101',4,'Identifying User Needs (JTBD)','https://www.youtube.com/watch?v=sfGtw2C4R_g'),
    ('PM101',5,'Market and Competitive Analysis','https://www.youtube.com/watch?v=mYF2_FBCvXw'),
    ('PM101',6,'Introduction to Product Metrics','https://www.youtube.com/watch?v=yA91VwGsoO4'),
    ('PM101',7,'Crafting Product Vision','https://www.youtube.com/watch?v=mN3E_3sLg2c'),
    ('PM101',8,'Product Strategy Fundamentals','https://www.youtube.com/watch?v=1-gTidy7n68'),
    ('DEV101',1,'Intro to JavaScript and Core Concepts','https://www.youtube.com/watch?v=hdI2bqOjy3c'),
    ('DEV101',2,'Operators and Type Coercion','https://www.youtube.com/watch?v=IsG4Xd6LlsM'),
    ('DEV101',3,'Control Flow with Conditionals','https://www.youtube.com/watch?v=24gNhTcy6pw'),
    ('DEV101',4,'Loops and Iteration Patterns','https://www.youtube.com/watch?v=s9wW2PpJsmQ'),
    ('DEV101',5,'Functions and Parameters','https://www.youtube.com/watch?v=N8ap4k_1QEQ'),
    ('DEV101',6,'Scope and Closures','https://www.youtube.com/watch?v=1JsJx1x35c0'),
    ('DEV101',7,'Arrays and Array Methods','https://www.youtube.com/watch?v=R8rmfD9Y5-c'),
    ('DEV101',8,'Objects and ES6 Basics','https://www.youtube.com/watch?v=musP4q4u0h4'),
    ('DEV105',1,'What is Backend and Intro to Node.js','https://www.youtube.com/watch?v=TlB_eWDSMt4'),
    ('DEV105',2,'Node Modules and require','https://www.youtube.com/watch?v=jHDhaSSKmB0'),
    ('DEV105',3,'File System Module (fs)','https://www.youtube.com/watch?v=5k0I6O7dGf0'),
    ('DEV105',4,'HTTP Module and Basic Servers','https://www.youtube.com/watch?v=BSO9C8Z-yG8'),
    ('DEV105',5,'Express.js Fundamentals','https://www.youtube.com/watch?v=L72fhGm1tfE'),
    ('DEV105',6,'Express Routing and Middleware','https://www.youtube.com/watch?v=SccSCuHhOw0'),
    ('DEV105',7,'Request/Response Handling','https://www.youtube.com/watch?v=pKd0Rpw7O48'),
    ('DEV105',8,'REST API Fundamentals','https://www.youtube.com/watch?v=-MTSQjw5DrM'),
    ('QA101',1,'What is Quality Assurance?','https://www.youtube.com/watch?v=u6QfIXgjwGQ'),
    ('QA101',2,'SDLC and STLC','https://www.youtube.com/watch?v=i_QyJq_i5iM'),
    ('QA101',3,'Types of Software Testing','https://www.youtube.com/watch?v=GOOshWZ_0r8'),
    ('QA101',4,'Bug Life Cycle','https://www.youtube.com/watch?v=0p7g7wB9qYc'),
    ('QA101',5,'Test Scenarios vs Test Cases','https://www.youtube.com/watch?v=gJjP-V-cT-A'),
    ('QA101',6,'Writing Effective Test Cases','https://www.youtube.com/watch?v=6dJ68kFpda4'),
    ('QA101',7,'Bug Reporting with Jira','https://www.youtube.com/watch?v=502ILHjX9EE'),
    ('QA101',8,'Severity vs Priority','https://www.youtube.com/watch?v=AvgCkHrcj90'),
    ('SCR101',1,'Waterfall vs Agile','https://www.youtube.com/watch?v=502ILHjX9EE'),
    ('SCR101',2,'The Agile Manifesto','https://www.youtube.com/watch?v=Z9QbYZh1YXY'),
    ('SCR101',3,'Scrum Framework Overview','https://www.youtube.com/watch?v=9TycLR0TqFA'),
    ('SCR101',4,'Scrum Roles: Scrum Master','https://www.youtube.com/watch?v=Yo5sK-99e8U'),
    ('SCR101',5,'Scrum Roles: PO and Developers','https://www.youtube.com/watch?v=D8v1rL5M8bI'),
    ('SCR101',6,'Scrum Artifacts: The Backlog','https://www.youtube.com/watch?v=1-gTidy7n68'),
    ('SCR101',7,'Scrum Artifacts: The Increment','https://www.youtube.com/watch?v=7rQmVq9f7v4'),
    ('SCR101',8,'Scrum Events: Sprint Planning','https://www.youtube.com/watch?v=Vb4V4n3mRUE');

  INSERT INTO lessons (id, course_id, title, content, sort_order, is_published)
  SELECT
    md5('aorthar-l-' || d.code || '-' || d.lesson_no::text)::uuid,
    c.id,
    d.lesson_title,
    'Lesson plan seeded from department deep-dive outline.',
    d.lesson_no,
    true
  FROM tmp_deep_lessons d
  JOIN courses c ON c.code = d.code
  ON CONFLICT DO NOTHING;

  INSERT INTO resources (id, lesson_id, type, title, url, sort_order)
  SELECT
    md5('aorthar-r-' || d.code || '-' || d.lesson_no::text || '-1')::uuid,
    l.id,
    'youtube',
    d.lesson_title || ' — Deep Dive',
    d.youtube_url,
    1
  FROM tmp_deep_lessons d
  JOIN courses c ON c.code = d.code
  JOIN lessons l ON l.course_id = c.id AND l.sort_order = d.lesson_no
  ON CONFLICT DO NOTHING;

  -- Generic lesson packs for all non-deep courses.
  WITH non_deep AS (
    SELECT c.id, c.code, c.name,
           regexp_replace(c.code, '[0-9]', '', 'g') AS prefix
    FROM courses c
    WHERE c.code IN (SELECT code FROM tmp_seed_courses)
      AND c.code NOT IN ('PM101', 'DEV101', 'DEV105', 'QA101', 'SCR101')
  ),
  generic_lessons AS (
    SELECT
      nd.id AS course_id,
      nd.code,
      gs AS lesson_no,
      (ARRAY[
        'Foundations and Context',
        'Core Concepts',
        'Principles and Frameworks',
        'Tools and Workflows',
        'Applied Practice',
        'Collaboration and Communication',
        'Case Studies and Analysis',
        'Project and Assessment Prep'
      ])[gs] AS lesson_suffix,
      nd.prefix
    FROM non_deep nd
    CROSS JOIN generate_series(1, 8) gs
  ),
  generic_lesson_ins AS (
    INSERT INTO lessons (id, course_id, title, content, sort_order, is_published)
    SELECT
      md5('aorthar-l-' || gl.code || '-' || gl.lesson_no::text)::uuid,
      gl.course_id,
      gl.code || ' Lesson ' || gl.lesson_no || ': ' || gl.lesson_suffix,
      'Auto-seeded core lesson for ' || gl.code || '.',
      gl.lesson_no,
      true
    FROM generic_lessons gl
    ON CONFLICT DO NOTHING
    RETURNING id
  )
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order)
  SELECT
    md5('aorthar-r-' || gl.code || '-' || gl.lesson_no::text || '-' || r.sort_order::text)::uuid,
    l.id,
    'youtube',
    gl.code || ' Lesson ' || gl.lesson_no || ' — Resource ' || r.sort_order,
    r.url,
    r.sort_order
  FROM generic_lessons gl
  JOIN lessons l ON l.course_id = gl.course_id AND l.sort_order = gl.lesson_no
  CROSS JOIN LATERAL (
    SELECT
      gs2 AS sort_order,
      (CASE
      WHEN prefix = 'PM' THEN ARRAY['https://www.youtube.com/watch?v=502ILHjX9EE', 'https://www.youtube.com/watch?v=1-gTidy7n68', 'https://www.youtube.com/watch?v=VpUW16s3a-w']::text[]
      WHEN prefix = 'DEV' THEN ARRAY['https://www.youtube.com/watch?v=hdI2bqOjy3c', 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'https://www.youtube.com/watch?v=L72fhGm1tfE']::text[]
      WHEN prefix = 'QA' THEN ARRAY['https://www.youtube.com/watch?v=u6QfIXgjwGQ', 'https://www.youtube.com/watch?v=VywxIQ2ZXw4', 'https://www.youtube.com/watch?v=6dJ68kFpda4']::text[]
      WHEN prefix = 'SCR' THEN ARRAY['https://www.youtube.com/watch?v=9TycLR0TqFA', 'https://www.youtube.com/watch?v=Z9QbYZh1YXY', 'https://www.youtube.com/watch?v=Vb4V4n3mRUE']::text[]
      WHEN prefix = 'OPS' THEN ARRAY['https://www.youtube.com/watch?v=9TycLR0TqFA', 'https://www.youtube.com/watch?v=4hJ8XyB4xKs', 'https://www.youtube.com/watch?v=2p9sIugbIwo']::text[]
      WHEN prefix = 'DB' THEN ARRAY['https://www.youtube.com/watch?v=HXV3zeQKqGY', 'https://www.youtube.com/watch?v=7S_tz1z_5bA', 'https://www.youtube.com/watch?v=ztHopE5Wnpc']::text[]
      WHEN prefix = 'DES' THEN ARRAY['https://www.youtube.com/watch?v=PAjI-VnNBL8', 'https://www.youtube.com/watch?v=c9L3s3gWp1U', 'https://www.youtube.com/watch?v=AvgCkHrcj90']::text[]
      WHEN prefix = 'UXR' THEN ARRAY['https://www.youtube.com/watch?v=8VqCZx1G6Y0', 'https://www.youtube.com/watch?v=Ovj4hFxko7c', 'https://www.youtube.com/watch?v=3K0G1Zs6J7M']::text[]
      WHEN prefix = 'CS' THEN ARRAY['https://www.youtube.com/watch?v=zOjov-2OZ0E', 'https://www.youtube.com/watch?v=O5nskjZ_GoI', 'https://www.youtube.com/watch?v=6g2nGYh5j-Q']::text[]
      WHEN prefix = 'SEC' THEN ARRAY['https://www.youtube.com/watch?v=inWWhr5tnEA', 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', 'https://www.youtube.com/watch?v=2RaJjaT3JxA']::text[]
      WHEN prefix = 'ANA' THEN ARRAY['https://www.youtube.com/watch?v=yA91VwGsoO4', 'https://www.youtube.com/watch?v=9Q7Qe5L3xW0', 'https://www.youtube.com/watch?v=Qh6xY8xJSLg']::text[]
      WHEN prefix = 'COM' THEN ARRAY['https://www.youtube.com/watch?v=Unzc731iCUY', 'https://www.youtube.com/watch?v=HAnw168huqA', 'https://www.youtube.com/watch?v=djYl9M0R2x8']::text[]
      WHEN prefix = 'BUS' THEN ARRAY['https://www.youtube.com/watch?v=QnU8L5x4VhA', 'https://www.youtube.com/watch?v=S_5u6L7tQj8', 'https://www.youtube.com/watch?v=0A6rXQh5B9o']::text[]
      WHEN prefix = 'LDR' THEN ARRAY['https://www.youtube.com/watch?v=H14bBuluwB8', 'https://www.youtube.com/watch?v=R9LqM2K3x5s', 'https://www.youtube.com/watch?v=4M8R3Q2e6k8']::text[]
      WHEN prefix = 'FIN' THEN ARRAY['https://www.youtube.com/watch?v=K0x_PzA3w0E', 'https://www.youtube.com/watch?v=8T4y8g7b4rY', 'https://www.youtube.com/watch?v=vA9R2fZ8p5A']::text[]
      WHEN prefix = 'API' THEN ARRAY['https://www.youtube.com/watch?v=GZvSYJDk-us', 'https://www.youtube.com/watch?v=zsYIw6RXjfM', 'https://www.youtube.com/watch?v=Q-BpqyOT3a8']::text[]
      WHEN prefix = 'ARC' THEN ARRAY['https://www.youtube.com/watch?v=UzLMhqg3_Wc', 'https://www.youtube.com/watch?v=F2FmTdLtb_4', 'https://www.youtube.com/watch?v=8bA_N9eG4h0']::text[]
      WHEN prefix = 'CI' THEN ARRAY['https://www.youtube.com/watch?v=R8_veQiYBjI', 'https://www.youtube.com/watch?v=scEDHsr3APg', 'https://www.youtube.com/watch?v=1i6TZx5KJk8']::text[]
      WHEN prefix = 'INT' THEN ARRAY['https://www.youtube.com/watch?v=QF5TjQ-6x8Q', 'https://www.youtube.com/watch?v=4Xy1v0k2FhY', 'https://www.youtube.com/watch?v=r_t6G-i-9a4']::text[]
      WHEN prefix = 'PORT' THEN ARRAY['https://www.youtube.com/watch?v=YBq8T5nYg7Q', 'https://www.youtube.com/watch?v=TqjAgVf4-d8', 'https://www.youtube.com/watch?v=h_OfY-q0k-k']::text[]
      WHEN prefix = 'FRE' THEN ARRAY['https://www.youtube.com/watch?v=c9Wg6Cb_YlU', 'https://www.youtube.com/watch?v=z-b5Dk-G0vA', 'https://www.youtube.com/watch?v=4Xy1v0k2FhY']::text[]
      WHEN prefix = 'ETH' THEN ARRAY['https://www.youtube.com/watch?v=85bYh7a-u6c', 'https://www.youtube.com/watch?v=H2cB4J6kXQ4', 'https://www.youtube.com/watch?v=0s3hJx9Lh8E']::text[]
      WHEN prefix = 'TEAM' THEN ARRAY['https://www.youtube.com/watch?v=YBq8T5nYg7Q', 'https://www.youtube.com/watch?v=4Xy1v0k2FhY', 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU']::text[]
      WHEN prefix = 'SRE' THEN ARRAY['https://www.youtube.com/watch?v=5p3Y5H9x8ZQ', 'https://www.youtube.com/watch?v=R9L6sP7V2Yk', 'https://www.youtube.com/watch?v=Y4Yx6mQ8aRk']::text[]
      WHEN prefix = 'STR' THEN ARRAY['https://www.youtube.com/watch?v=1-gTidy7n68', 'https://www.youtube.com/watch?v=502ILHjX9EE', 'https://www.youtube.com/watch?v=Q7yV9pYl4p8']::text[]
      WHEN prefix = 'BE' THEN ARRAY['https://www.youtube.com/watch?v=TlB_eWDSMt4', 'https://www.youtube.com/watch?v=F2FmTdLtb_4', 'https://www.youtube.com/watch?v=8bA_N9eG4h0']::text[]
      WHEN prefix = 'OSS' THEN ARRAY['https://www.youtube.com/watch?v=U5vM5x6b2ZE', 'https://www.youtube.com/watch?v=e8p8o0w4B9M', 'https://www.youtube.com/watch?v=J4x5Q7r8T6w']::text[]
      WHEN prefix = 'PSY' THEN ARRAY['https://www.youtube.com/watch?v=4sZdcB6bjI8', 'https://www.youtube.com/watch?v=2N2N2uK4x5Q', 'https://www.youtube.com/watch?v=Gx4JebwVlXo']::text[]
      WHEN prefix = 'MKT' THEN ARRAY['https://www.youtube.com/watch?v=3Kq1MIfTWCE', 'https://www.youtube.com/watch?v=9Q7Qe5L3xW0', 'https://www.youtube.com/watch?v=HAnw168huqA']::text[]
      WHEN prefix = 'LAW' THEN ARRAY['https://www.youtube.com/watch?v=85bYh7a-u6c', 'https://www.youtube.com/watch?v=2RaJjaT3JxA', 'https://www.youtube.com/watch?v=H2cB4J6kXQ4']::text[]
      ELSE ARRAY['https://www.youtube.com/watch?v=502ILHjX9EE','https://www.youtube.com/watch?v=TlB_eWDSMt4','https://www.youtube.com/watch?v=u6QfIXgjwGQ']::text[]
      END)[gs2] AS url
    FROM generate_series(1, 3) gs2
  ) r
  ON CONFLICT DO NOTHING;

  -- 20 quiz questions for each deep-dive foundation course.
  INSERT INTO questions (
    id, course_id, type, question_text, options,
    points, shuffle_options, is_exam_question, difficulty
  )
  SELECT
    md5('aorthar-q-' || c.code || '-' || LPAD(g.q_no::text, 2, '0'))::uuid,
    c.id,
    'multiple_choice',
    'In ' || c.name || ', which statement best matches concept #' || g.q_no || '?',
    '[{"id":"a","text":"It focuses only on output and ignores user outcomes","is_correct":false},{"id":"b","text":"It applies core principles to deliver measurable product outcomes","is_correct":true},{"id":"c","text":"It avoids collaboration and stakeholder alignment","is_correct":false},{"id":"d","text":"It removes the need for iteration and feedback","is_correct":false}]'::jsonb,
    1,
    true,
    (g.q_no > 10),
    CASE WHEN g.q_no <= 7 THEN 1 WHEN g.q_no <= 14 THEN 2 ELSE 3 END
  FROM courses c
  CROSS JOIN LATERAL (SELECT generate_series(1, 20) AS q_no) g
  WHERE c.code IN ('PM101', 'DEV101', 'DEV105', 'QA101', 'SCR101')
  ON CONFLICT DO NOTHING;

END $$;
