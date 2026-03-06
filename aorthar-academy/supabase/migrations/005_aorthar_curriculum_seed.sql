-- ═══════════════════════════════════════════════════════════════════════════
-- AORTHAR ACADEMY — CURRICULUM SEED
-- Migration: 005_aorthar_curriculum_seed.sql
-- 40 courses × 8 lessons × 3 resources + 20 quiz questions per course
-- Idempotent: ON CONFLICT (id) DO NOTHING on every INSERT
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  y100 UUID; y200 UUID; y300 UUID; y400 UUID;
  y100s1 UUID; y100s2 UUID;
  y200s1 UUID; y200s2 UUID;
  y300s1 UUID; y300s2 UUID;
  y400s1 UUID; y400s2 UUID;
  cid UUID;
  lid UUID;
BEGIN
  -- Look up year IDs
  SELECT id INTO y100 FROM years WHERE level = 100;
  SELECT id INTO y200 FROM years WHERE level = 200;
  SELECT id INTO y300 FROM years WHERE level = 300;
  SELECT id INTO y400 FROM years WHERE level = 400;

  -- Look up semester IDs
  SELECT id INTO y100s1 FROM semesters WHERE year_id = y100 AND number = 1;
  SELECT id INTO y100s2 FROM semesters WHERE year_id = y100 AND number = 2;
  SELECT id INTO y200s1 FROM semesters WHERE year_id = y200 AND number = 1;
  SELECT id INTO y200s2 FROM semesters WHERE year_id = y200 AND number = 2;
  SELECT id INTO y300s1 FROM semesters WHERE year_id = y300 AND number = 1;
  SELECT id INTO y300s2 FROM semesters WHERE year_id = y300 AND number = 2;
  SELECT id INTO y400s1 FROM semesters WHERE year_id = y400 AND number = 1;
  SELECT id INTO y400s2 FROM semesters WHERE year_id = y400 AND number = 2;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 100 · SEMESTER 1
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── DES101 Introduction to Design Thinking ──────────────────────────
  cid := md5('aorthar-course-DES101')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'DES101', 'Introduction to Design Thinking',
     'A foundational course exploring the human-centred design thinking framework. Students learn empathy, problem framing, ideation, prototyping and testing through real-world challenges.',
     y100, y100s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-DES101-1')::uuid, cid, 'What is Design Thinking?', 1, true),
    (md5('aorthar-l-DES101-2')::uuid, cid, 'Stage 1 Empathize — Understanding Users', 2, true),
    (md5('aorthar-l-DES101-3')::uuid, cid, 'Stage 2 Define — Framing the Problem', 3, true),
    (md5('aorthar-l-DES101-4')::uuid, cid, 'Stage 3 Ideate — Creative Problem Solving', 4, true),
    (md5('aorthar-l-DES101-5')::uuid, cid, 'Stage 4 Prototype — Building to Think', 5, true),
    (md5('aorthar-l-DES101-6')::uuid, cid, 'Stage 5 Test — Learning from Users', 6, true),
    (md5('aorthar-l-DES101-7')::uuid, cid, 'Iteration and the Design Loop', 7, true),
    (md5('aorthar-l-DES101-8')::uuid, cid, 'Real-World Design Thinking Case Studies', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-1-1')::uuid, lid, 'youtube', 'IDEO — Design Thinking Explained', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 1),
    (md5('aorthar-r-DES101-1-2')::uuid, lid, 'youtube', 'Design Thinking Introduction', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 2),
    (md5('aorthar-r-DES101-1-3')::uuid, lid, 'youtube', 'Design Sprint Overview', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-2-1')::uuid, lid, 'youtube', 'Empathy Mapping for UX', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 1),
    (md5('aorthar-r-DES101-2-2')::uuid, lid, 'youtube', 'UX Research Methods Overview', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-DES101-2-3')::uuid, lid, 'youtube', 'Understanding User Needs', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-3-1')::uuid, lid, 'youtube', 'How to Write a Problem Statement', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 1),
    (md5('aorthar-r-DES101-3-2')::uuid, lid, 'youtube', 'Design Thinking — Define Stage', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 2),
    (md5('aorthar-r-DES101-3-3')::uuid, lid, 'youtube', 'Point of View Statement Guide', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-4-1')::uuid, lid, 'youtube', 'Brainstorming Techniques', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 1),
    (md5('aorthar-r-DES101-4-2')::uuid, lid, 'youtube', 'Creative Problem Solving Methods', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 2),
    (md5('aorthar-r-DES101-4-3')::uuid, lid, 'youtube', 'SCAMPER Ideation Technique', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-5-1')::uuid, lid, 'youtube', 'Rapid Prototyping Explained', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 1),
    (md5('aorthar-r-DES101-5-2')::uuid, lid, 'youtube', 'Low-Fidelity vs High-Fidelity Prototypes', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-DES101-5-3')::uuid, lid, 'youtube', 'Figma Prototyping Basics', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-6-1')::uuid, lid, 'youtube', 'Usability Testing Guide', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-DES101-6-2')::uuid, lid, 'youtube', 'User Testing Methods', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-DES101-6-3')::uuid, lid, 'youtube', 'How to Run a User Test', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-7-1')::uuid, lid, 'youtube', 'Iterative Design Process', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 1),
    (md5('aorthar-r-DES101-7-2')::uuid, lid, 'youtube', 'Design Feedback and Iteration', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 2),
    (md5('aorthar-r-DES101-7-3')::uuid, lid, 'youtube', 'Agile Design Workflow', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES101-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES101-8-1')::uuid, lid, 'youtube', 'IDEO Shopping Cart Design Thinking', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 1),
    (md5('aorthar-r-DES101-8-2')::uuid, lid, 'youtube', 'Design Thinking in Business', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 2),
    (md5('aorthar-r-DES101-8-3')::uuid, lid, 'youtube', 'Stanford d.school Design Sprint', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-DES101-01')::uuid, cid, 'multiple_choice', 'Which stage of Design Thinking focuses on deeply understanding the user''s needs and experiences?',
     '[{"id":"a","text":"Define","is_correct":false},{"id":"b","text":"Empathize","is_correct":true},{"id":"c","text":"Ideate","is_correct":false},{"id":"d","text":"Prototype","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES101-02')::uuid, cid, 'multiple_choice', 'What is the primary output of the Define stage in Design Thinking?',
     '[{"id":"a","text":"A working prototype","is_correct":false},{"id":"b","text":"A list of ideas","is_correct":false},{"id":"c","text":"A clear problem statement (Point of View)","is_correct":true},{"id":"d","text":"A usability test report","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES101-03')::uuid, cid, 'multiple_choice', 'Which of the following best describes Design Thinking?',
     '[{"id":"a","text":"A linear process with fixed steps","is_correct":false},{"id":"b","text":"A human-centred, iterative approach to problem solving","is_correct":true},{"id":"c","text":"A purely visual design methodology","is_correct":false},{"id":"d","text":"A software development framework","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES101-04')::uuid, cid, 'multiple_choice', 'During the Ideate stage, which technique is most commonly used to generate a large quantity of ideas?',
     '[{"id":"a","text":"Usability testing","is_correct":false},{"id":"b","text":"Wireframing","is_correct":false},{"id":"c","text":"Brainstorming","is_correct":true},{"id":"d","text":"Affinity mapping only","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES101-05')::uuid, cid, 'multiple_choice', 'What is the purpose of building a prototype in Design Thinking?',
     '[{"id":"a","text":"To create the final product","is_correct":false},{"id":"b","text":"To think through and test ideas quickly and cheaply","is_correct":true},{"id":"c","text":"To present to investors","is_correct":false},{"id":"d","text":"To document the design process","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-06')::uuid, cid, 'multiple_choice', 'Which organisation is most widely credited with popularising Design Thinking?',
     '[{"id":"a","text":"Google","is_correct":false},{"id":"b","text":"Apple","is_correct":false},{"id":"c","text":"IDEO","is_correct":true},{"id":"d","text":"Microsoft","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES101-07')::uuid, cid, 'multiple_choice', 'What does an empathy map typically capture?',
     '[{"id":"a","text":"Server architecture","is_correct":false},{"id":"b","text":"What users say, think, do, and feel","is_correct":true},{"id":"c","text":"Colour palette decisions","is_correct":false},{"id":"d","text":"Business revenue metrics","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-08')::uuid, cid, 'multiple_choice', 'In Design Thinking, "failing fast" is encouraged because:',
     '[{"id":"a","text":"It reduces cost of the final product","is_correct":false},{"id":"b","text":"It allows teams to learn quickly and iterate toward better solutions","is_correct":true},{"id":"c","text":"It impresses stakeholders","is_correct":false},{"id":"d","text":"It shortens the project timeline","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-09')::uuid, cid, 'multiple_choice', 'Which of the following is NOT a stage in the Stanford d.school Design Thinking model?',
     '[{"id":"a","text":"Empathize","is_correct":false},{"id":"b","text":"Analyse","is_correct":true},{"id":"c","text":"Prototype","is_correct":false},{"id":"d","text":"Test","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-10')::uuid, cid, 'multiple_choice', 'What is a "How Might We" question used for in Design Thinking?',
     '[{"id":"a","text":"To evaluate finished designs","is_correct":false},{"id":"b","text":"To reframe problems as opportunities for ideation","is_correct":true},{"id":"c","text":"To document user interviews","is_correct":false},{"id":"d","text":"To define success metrics","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-11')::uuid, cid, 'multiple_choice', 'Which research method is most appropriate during the Empathize stage?',
     '[{"id":"a","text":"A/B testing","is_correct":false},{"id":"b","text":"Observational field research and user interviews","is_correct":true},{"id":"c","text":"Conversion rate analysis","is_correct":false},{"id":"d","text":"Heatmap analysis","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-12')::uuid, cid, 'multiple_choice', 'Low-fidelity prototypes are preferred early in the process because:',
     '[{"id":"a","text":"They look more professional","is_correct":false},{"id":"b","text":"They are quick to make and easy to discard when ideas fail","is_correct":true},{"id":"c","text":"Users prefer simple designs","is_correct":false},{"id":"d","text":"They require no design skills","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-13')::uuid, cid, 'multiple_choice', 'The Design Thinking process is best described as:',
     '[{"id":"a","text":"Sequential and rigid","is_correct":false},{"id":"b","text":"Non-linear and iterative","is_correct":true},{"id":"c","text":"Purely analytical","is_correct":false},{"id":"d","text":"Waterfall-based","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES101-14')::uuid, cid, 'multiple_choice', 'What is the main difference between sympathy and empathy in design?',
     '[{"id":"a","text":"Sympathy involves understanding; empathy involves feeling sorry","is_correct":false},{"id":"b","text":"Empathy involves deeply understanding the user''s perspective; sympathy is a superficial emotional reaction","is_correct":true},{"id":"c","text":"There is no difference in design contexts","is_correct":false},{"id":"d","text":"Empathy is about aesthetics; sympathy is about function","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DES101-15')::uuid, cid, 'multiple_choice', 'Which tool is used to organise and cluster research insights during the Define stage?',
     '[{"id":"a","text":"Wireframe","is_correct":false},{"id":"b","text":"Affinity diagram","is_correct":true},{"id":"c","text":"Style guide","is_correct":false},{"id":"d","text":"Gantt chart","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-16')::uuid, cid, 'multiple_choice', 'In the Test stage, what should a designer do when users struggle with the prototype?',
     '[{"id":"a","text":"Defend the design decisions","is_correct":false},{"id":"b","text":"Observe, note the issues, and use findings to iterate","is_correct":true},{"id":"c","text":"Simplify the test tasks","is_correct":false},{"id":"d","text":"Move on to the next project","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES101-17')::uuid, cid, 'multiple_choice', 'Which statement about Design Thinking is most accurate?',
     '[{"id":"a","text":"It is only for graphic designers","is_correct":false},{"id":"b","text":"It can be applied by anyone to solve complex, human-centred problems","is_correct":true},{"id":"c","text":"It only works for technology products","is_correct":false},{"id":"d","text":"It replaces traditional project management","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES101-18')::uuid, cid, 'multiple_choice', 'The concept of "beginner''s mind" in Design Thinking encourages designers to:',
     '[{"id":"a","text":"Avoid learning about the problem domain","is_correct":false},{"id":"b","text":"Approach problems without assumptions to see them fresh","is_correct":true},{"id":"c","text":"Only hire junior designers","is_correct":false},{"id":"d","text":"Skip the research phase","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DES101-19')::uuid, cid, 'multiple_choice', 'A Design Sprint is most closely related to which aspect of Design Thinking?',
     '[{"id":"a","text":"Condensing all five stages into an intensive time-boxed week","is_correct":true},{"id":"b","text":"A month-long research project","is_correct":false},{"id":"c","text":"A solo design exercise","is_correct":false},{"id":"d","text":"A final portfolio presentation","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DES101-20')::uuid, cid, 'multiple_choice', 'User personas created during research are primarily used to:',
     '[{"id":"a","text":"Impress clients with colourful documents","is_correct":false},{"id":"b","text":"Guide design decisions by representing target user archetypes","is_correct":true},{"id":"c","text":"Replace the need for user testing","is_correct":false},{"id":"d","text":"Define technical specifications","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── VIS102 Visual Design Fundamentals ──────────────────────────────
  cid := md5('aorthar-course-VIS102')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'VIS102', 'Visual Design Fundamentals',
     'Core principles of visual design including layout, hierarchy, balance, contrast and Gestalt theory. Students develop an eye for effective composition used across digital and print media.',
     y100, y100s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-VIS102-1')::uuid, cid, 'Elements of Visual Design', 1, true),
    (md5('aorthar-l-VIS102-2')::uuid, cid, 'Principles of Design — Balance and Alignment', 2, true),
    (md5('aorthar-l-VIS102-3')::uuid, cid, 'Hierarchy and Visual Flow', 3, true),
    (md5('aorthar-l-VIS102-4')::uuid, cid, 'Contrast and Emphasis', 4, true),
    (md5('aorthar-l-VIS102-5')::uuid, cid, 'Gestalt Principles in Design', 5, true),
    (md5('aorthar-l-VIS102-6')::uuid, cid, 'Grid Systems and Layout', 6, true),
    (md5('aorthar-l-VIS102-7')::uuid, cid, 'White Space and Negative Space', 7, true),
    (md5('aorthar-l-VIS102-8')::uuid, cid, 'Applying Visual Design to Digital Interfaces', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-1-1')::uuid, lid, 'youtube', 'Elements of Design Explained', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-VIS102-1-2')::uuid, lid, 'youtube', 'Visual Design Fundamentals', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-VIS102-1-3')::uuid, lid, 'youtube', 'Gestalt Principles Overview', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-2-1')::uuid, lid, 'youtube', 'Balance in Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-VIS102-2-2')::uuid, lid, 'youtube', 'Alignment Principles', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-VIS102-2-3')::uuid, lid, 'youtube', 'Typography and Layout Balance', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-3-1')::uuid, lid, 'youtube', 'Visual Hierarchy in UI Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-VIS102-3-2')::uuid, lid, 'youtube', 'Creating Visual Flow', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-VIS102-3-3')::uuid, lid, 'youtube', 'F-Pattern and Z-Pattern Reading', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-4-1')::uuid, lid, 'youtube', 'Contrast in Visual Design', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-VIS102-4-2')::uuid, lid, 'youtube', 'Using Emphasis Effectively', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-VIS102-4-3')::uuid, lid, 'youtube', 'Colour Contrast for Readability', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-5-1')::uuid, lid, 'youtube', 'Gestalt Principles for Designers', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-VIS102-5-2')::uuid, lid, 'youtube', 'Proximity, Similarity and Closure', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-VIS102-5-3')::uuid, lid, 'youtube', 'Applying Gestalt to UI', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-6-1')::uuid, lid, 'youtube', 'Grid Systems in Design', 'https://www.youtube.com/watch?v=EFafSYg-PkI', 1),
    (md5('aorthar-r-VIS102-6-2')::uuid, lid, 'youtube', 'CSS Grid Layout Tutorial', 'https://www.youtube.com/watch?v=EFafSYg-PkI', 2),
    (md5('aorthar-r-VIS102-6-3')::uuid, lid, 'youtube', '12-Column Grid Explained', 'https://www.youtube.com/watch?v=u044iM9xsWU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-7-1')::uuid, lid, 'youtube', 'The Power of White Space', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-VIS102-7-2')::uuid, lid, 'youtube', 'Negative Space in UI Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-VIS102-7-3')::uuid, lid, 'youtube', 'Breathing Room in Layouts', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-VIS102-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-VIS102-8-1')::uuid, lid, 'youtube', 'Applying Visual Design to Apps', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-VIS102-8-2')::uuid, lid, 'youtube', 'UI Design Principles in Practice', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-VIS102-8-3')::uuid, lid, 'youtube', 'Figma Visual Design Workflow', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-VIS102-01')::uuid, cid, 'multiple_choice', 'Which Gestalt principle explains why objects close to each other are perceived as a group?',
     '[{"id":"a","text":"Similarity","is_correct":false},{"id":"b","text":"Proximity","is_correct":true},{"id":"c","text":"Continuity","is_correct":false},{"id":"d","text":"Closure","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-VIS102-02')::uuid, cid, 'multiple_choice', 'Visual hierarchy is primarily achieved through:',
     '[{"id":"a","text":"Using only one font","is_correct":false},{"id":"b","text":"Varying size, weight, colour and placement to signal importance","is_correct":true},{"id":"c","text":"Adding borders to all elements","is_correct":false},{"id":"d","text":"Centring all text","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-VIS102-03')::uuid, cid, 'multiple_choice', 'Which type of balance places different visual elements of equal weight on both sides of a composition?',
     '[{"id":"a","text":"Symmetrical balance","is_correct":false},{"id":"b","text":"Asymmetrical balance","is_correct":true},{"id":"c","text":"Radial balance","is_correct":false},{"id":"d","text":"Mosaic balance","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-04')::uuid, cid, 'multiple_choice', 'What is the purpose of a grid system in layout design?',
     '[{"id":"a","text":"To restrict creativity","is_correct":false},{"id":"b","text":"To create consistent alignment and structure across a design","is_correct":true},{"id":"c","text":"To add decorative lines","is_correct":false},{"id":"d","text":"To define colour palettes","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-VIS102-05')::uuid, cid, 'multiple_choice', 'The Gestalt principle of "closure" refers to:',
     '[{"id":"a","text":"Closing a design project","is_correct":false},{"id":"b","text":"The mind completing incomplete shapes or patterns","is_correct":true},{"id":"c","text":"Grouping similar colours","is_correct":false},{"id":"d","text":"Ending a visual flow","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-06')::uuid, cid, 'multiple_choice', 'White space in design is best described as:',
     '[{"id":"a","text":"Wasted space that should be filled","is_correct":false},{"id":"b","text":"Empty areas that improve readability and focus","is_correct":true},{"id":"c","text":"Space reserved for white text","is_correct":false},{"id":"d","text":"The background colour of a page","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-VIS102-07')::uuid, cid, 'multiple_choice', 'Contrast in visual design is used to:',
     '[{"id":"a","text":"Make everything look the same","is_correct":false},{"id":"b","text":"Create visual interest and draw attention to key elements","is_correct":true},{"id":"c","text":"Reduce the number of colours","is_correct":false},{"id":"d","text":"Align elements to a grid","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-VIS102-08')::uuid, cid, 'multiple_choice', 'The "figure-ground" Gestalt principle describes:',
     '[{"id":"a","text":"The relationship between foreground subjects and background","is_correct":true},{"id":"b","text":"How to draw figures","is_correct":false},{"id":"c","text":"The use of photography","is_correct":false},{"id":"d","text":"The grid baseline system","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-09')::uuid, cid, 'multiple_choice', 'Which layout pattern describes users scanning a page in an F-shape?',
     '[{"id":"a","text":"Users read every word on the page","is_correct":false},{"id":"b","text":"Users read horizontal lines at top then scan down the left side","is_correct":true},{"id":"c","text":"Users start at the bottom of the page","is_correct":false},{"id":"d","text":"Users only look at images","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-10')::uuid, cid, 'multiple_choice', 'Which element is considered the primary building block of all visual design?',
     '[{"id":"a","text":"Image","is_correct":false},{"id":"b","text":"Point (dot)","is_correct":true},{"id":"c","text":"Colour","is_correct":false},{"id":"d","text":"Grid","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-11')::uuid, cid, 'multiple_choice', 'What does "visual rhythm" in design refer to?',
     '[{"id":"a","text":"The speed of loading a webpage","is_correct":false},{"id":"b","text":"Repeating visual elements to create a sense of movement and pattern","is_correct":true},{"id":"c","text":"Music used in video content","is_correct":false},{"id":"d","text":"Animation timing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-12')::uuid, cid, 'multiple_choice', 'The principle of "similarity" in Gestalt theory means:',
     '[{"id":"a","text":"All elements should be identical","is_correct":false},{"id":"b","text":"Elements that share visual characteristics are perceived as related","is_correct":true},{"id":"c","text":"Similar colours must be avoided","is_correct":false},{"id":"d","text":"All buttons must look the same","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-13')::uuid, cid, 'multiple_choice', 'A 12-column grid is most commonly used in web design because:',
     '[{"id":"a","text":"It is the only grid system available","is_correct":false},{"id":"b","text":"12 is divisible by 2, 3, 4, and 6, making it flexible for various layouts","is_correct":true},{"id":"c","text":"It matches screen pixel width","is_correct":false},{"id":"d","text":"It was invented by Apple","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-VIS102-14')::uuid, cid, 'multiple_choice', 'Emphasis in visual design is best achieved by:',
     '[{"id":"a","text":"Making all text bold","is_correct":false},{"id":"b","text":"Creating a focal point through size, colour or placement contrast","is_correct":true},{"id":"c","text":"Using only black and white","is_correct":false},{"id":"d","text":"Adding drop shadows to everything","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-15')::uuid, cid, 'multiple_choice', 'Which Gestalt principle explains why we perceive a dashed line as a continuous line?',
     '[{"id":"a","text":"Proximity","is_correct":false},{"id":"b","text":"Continuity","is_correct":true},{"id":"c","text":"Closure","is_correct":false},{"id":"d","text":"Similarity","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-VIS102-16')::uuid, cid, 'multiple_choice', 'The term "typographic hierarchy" refers to:',
     '[{"id":"a","text":"The order in which fonts were invented","is_correct":false},{"id":"b","text":"Using different type sizes, weights and styles to guide reading order","is_correct":true},{"id":"c","text":"The number of fonts in a design","is_correct":false},{"id":"d","text":"Alphabetical ordering of content","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-17')::uuid, cid, 'multiple_choice', 'Radial balance in a composition means:',
     '[{"id":"a","text":"Elements are arranged in a line","is_correct":false},{"id":"b","text":"Elements radiate outward from a central point","is_correct":true},{"id":"c","text":"Elements are randomly placed","is_correct":false},{"id":"d","text":"Balance is achieved through colour only","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-VIS102-18')::uuid, cid, 'multiple_choice', 'Scale in design primarily communicates:',
     '[{"id":"a","text":"The physical size of a printed document","is_correct":false},{"id":"b","text":"Relative importance and hierarchy between elements","is_correct":true},{"id":"c","text":"How many pages a document has","is_correct":false},{"id":"d","text":"The resolution of images","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-19')::uuid, cid, 'multiple_choice', 'Which principle helps unify a design by ensuring visual elements feel like they belong together?',
     '[{"id":"a","text":"Contrast","is_correct":false},{"id":"b","text":"Unity","is_correct":true},{"id":"c","text":"Emphasis","is_correct":false},{"id":"d","text":"Variety","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-VIS102-20')::uuid, cid, 'multiple_choice', 'When designing for digital interfaces, which Gestalt principle helps group navigation items visually without using borders?',
     '[{"id":"a","text":"Closure","is_correct":false},{"id":"b","text":"Proximity","is_correct":true},{"id":"c","text":"Figure-ground","is_correct":false},{"id":"d","text":"Continuity","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── TYP103 Typography Essentials ────────────────────────────────────
  cid := md5('aorthar-course-TYP103')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'TYP103', 'Typography Essentials',
     'An in-depth study of typefaces, type anatomy, pairing, hierarchy, and readability. Students learn to choose and use type effectively for both screen and print contexts.',
     y100, y100s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-TYP103-1')::uuid, cid, 'History and Anatomy of Type', 1, true),
    (md5('aorthar-l-TYP103-2')::uuid, cid, 'Type Classifications — Serif, Sans-Serif and Beyond', 2, true),
    (md5('aorthar-l-TYP103-3')::uuid, cid, 'Choosing and Pairing Typefaces', 3, true),
    (md5('aorthar-l-TYP103-4')::uuid, cid, 'Typographic Hierarchy and Rhythm', 4, true),
    (md5('aorthar-l-TYP103-5')::uuid, cid, 'Spacing — Kerning, Tracking and Leading', 5, true),
    (md5('aorthar-l-TYP103-6')::uuid, cid, 'Readability and Legibility', 6, true),
    (md5('aorthar-l-TYP103-7')::uuid, cid, 'Responsive Typography for the Web', 7, true),
    (md5('aorthar-l-TYP103-8')::uuid, cid, 'Typography in Brand Identity', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-1-1')::uuid, lid, 'youtube', 'History of Typography', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 1),
    (md5('aorthar-r-TYP103-1-2')::uuid, lid, 'youtube', 'Type Anatomy Explained', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 2),
    (md5('aorthar-r-TYP103-1-3')::uuid, lid, 'youtube', 'The Evolution of Fonts', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-2-1')::uuid, lid, 'youtube', 'Serif vs Sans-Serif Fonts', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 1),
    (md5('aorthar-r-TYP103-2-2')::uuid, lid, 'youtube', 'Type Classification Guide', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 2),
    (md5('aorthar-r-TYP103-2-3')::uuid, lid, 'youtube', 'Display vs Body Typefaces', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-3-1')::uuid, lid, 'youtube', 'How to Pair Fonts', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 1),
    (md5('aorthar-r-TYP103-3-2')::uuid, lid, 'youtube', 'Font Pairing Rules', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-TYP103-3-3')::uuid, lid, 'youtube', 'Google Fonts Tutorial', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-4-1')::uuid, lid, 'youtube', 'Typographic Hierarchy Tutorial', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 1),
    (md5('aorthar-r-TYP103-4-2')::uuid, lid, 'youtube', 'Visual Rhythm with Type', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-TYP103-4-3')::uuid, lid, 'youtube', 'Headings and Body Text Balance', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-5-1')::uuid, lid, 'youtube', 'Kerning, Tracking and Leading', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 1),
    (md5('aorthar-r-TYP103-5-2')::uuid, lid, 'youtube', 'Typography Spacing Deep Dive', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-TYP103-5-3')::uuid, lid, 'youtube', 'Letter Spacing in CSS', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-6-1')::uuid, lid, 'youtube', 'Readability vs Legibility', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 1),
    (md5('aorthar-r-TYP103-6-2')::uuid, lid, 'youtube', 'Optimal Line Length for Reading', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-TYP103-6-3')::uuid, lid, 'youtube', 'Accessibility in Typography', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-7-1')::uuid, lid, 'youtube', 'Responsive Typography', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1),
    (md5('aorthar-r-TYP103-7-2')::uuid, lid, 'youtube', 'Fluid Type Scales in CSS', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-TYP103-7-3')::uuid, lid, 'youtube', 'Variable Fonts Explained', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-TYP103-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-TYP103-8-1')::uuid, lid, 'youtube', 'Typography in Brand Design', 'https://www.youtube.com/watch?v=P0QDrj4KLAM', 1),
    (md5('aorthar-r-TYP103-8-2')::uuid, lid, 'youtube', 'Famous Brand Typefaces', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 2),
    (md5('aorthar-r-TYP103-8-3')::uuid, lid, 'youtube', 'Creating a Type System', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-TYP103-01')::uuid, cid, 'multiple_choice', 'What is "kerning" in typography?',
     '[{"id":"a","text":"The height of capital letters","is_correct":false},{"id":"b","text":"Adjusting space between specific pairs of letters","is_correct":true},{"id":"c","text":"The thickness of a stroke","is_correct":false},{"id":"d","text":"The spacing between lines of text","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-TYP103-02')::uuid, cid, 'multiple_choice', 'Leading refers to:',
     '[{"id":"a","text":"The weight of a typeface","is_correct":false},{"id":"b","text":"The space between lines of text","is_correct":true},{"id":"c","text":"The indent of the first line","is_correct":false},{"id":"d","text":"The typeface style","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-TYP103-03')::uuid, cid, 'multiple_choice', 'Which typeface classification has small decorative strokes at the ends of letterforms?',
     '[{"id":"a","text":"Sans-serif","is_correct":false},{"id":"b","text":"Serif","is_correct":true},{"id":"c","text":"Monospace","is_correct":false},{"id":"d","text":"Display","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-TYP103-04')::uuid, cid, 'multiple_choice', 'The x-height of a typeface refers to:',
     '[{"id":"a","text":"The height of the letter X in pixels","is_correct":false},{"id":"b","text":"The height of lowercase letters, excluding ascenders and descenders","is_correct":true},{"id":"c","text":"The size of the font in points","is_correct":false},{"id":"d","text":"The width of the letter X","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-05')::uuid, cid, 'multiple_choice', 'Tracking in typography refers to:',
     '[{"id":"a","text":"Following a user''s reading behaviour","is_correct":false},{"id":"b","text":"Uniform spacing adjustment across a range of letters","is_correct":true},{"id":"c","text":"The weight of individual strokes","is_correct":false},{"id":"d","text":"The font size in responsive layouts","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-06')::uuid, cid, 'multiple_choice', 'Which font pairing principle suggests combining a serif and a sans-serif typeface?',
     '[{"id":"a","text":"Monotype pairing","is_correct":false},{"id":"b","text":"Contrast pairing","is_correct":true},{"id":"c","text":"Weight pairing","is_correct":false},{"id":"d","text":"Scale pairing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-07')::uuid, cid, 'multiple_choice', 'What is an "ascender" in type anatomy?',
     '[{"id":"a","text":"The part of a lowercase letter that rises above the x-height","is_correct":true},{"id":"b","text":"The part below the baseline","is_correct":false},{"id":"c","text":"A type size larger than 72pt","is_correct":false},{"id":"d","text":"A bold typeface variant","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-08')::uuid, cid, 'multiple_choice', 'For body text on screen, which line length is generally considered optimal for readability?',
     '[{"id":"a","text":"20–30 characters per line","is_correct":false},{"id":"b","text":"45–75 characters per line","is_correct":true},{"id":"c","text":"100–120 characters per line","is_correct":false},{"id":"d","text":"Any length is acceptable","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-TYP103-09')::uuid, cid, 'multiple_choice', 'What is a variable font?',
     '[{"id":"a","text":"A font that changes colour","is_correct":false},{"id":"b","text":"A single font file that contains multiple weights and styles","is_correct":true},{"id":"c","text":"A font used only in variable layouts","is_correct":false},{"id":"d","text":"A font without a fixed size","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-TYP103-10')::uuid, cid, 'multiple_choice', 'Which property in CSS controls the spacing between characters?',
     '[{"id":"a","text":"line-height","is_correct":false},{"id":"b","text":"letter-spacing","is_correct":true},{"id":"c","text":"word-spacing","is_correct":false},{"id":"d","text":"font-spacing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-11')::uuid, cid, 'multiple_choice', 'Legibility in typography specifically refers to:',
     '[{"id":"a","text":"How attractive a typeface looks","is_correct":false},{"id":"b","text":"How easily individual characters can be distinguished from one another","is_correct":true},{"id":"c","text":"The reading speed of users","is_correct":false},{"id":"d","text":"The number of fonts in a system","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-12')::uuid, cid, 'multiple_choice', 'A "display" typeface is best suited for:',
     '[{"id":"a","text":"Long body text passages","is_correct":false},{"id":"b","text":"Headlines and large text at high sizes","is_correct":true},{"id":"c","text":"Code editors","is_correct":false},{"id":"d","text":"Form labels","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-TYP103-13')::uuid, cid, 'multiple_choice', 'The baseline in typography is:',
     '[{"id":"a","text":"The top of capital letters","is_correct":false},{"id":"b","text":"The invisible line on which letters sit","is_correct":true},{"id":"c","text":"The minimum font size","is_correct":false},{"id":"d","text":"The bottom of descenders","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-TYP103-14')::uuid, cid, 'multiple_choice', 'Negative kerning (tightening letter spacing) is generally best applied to:',
     '[{"id":"a","text":"Small body text for readability","is_correct":false},{"id":"b","text":"Large display headlines to improve visual cohesion","is_correct":true},{"id":"c","text":"All caps code blocks","is_correct":false},{"id":"d","text":"Footer legal text","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-TYP103-15')::uuid, cid, 'multiple_choice', 'Which term describes the imaginary line above which ascenders extend?',
     '[{"id":"a","text":"Cap height","is_correct":false},{"id":"b","text":"Ascender line","is_correct":true},{"id":"c","text":"Mean line","is_correct":false},{"id":"d","text":"Descender line","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-TYP103-16')::uuid, cid, 'multiple_choice', 'A monospace typeface is most commonly used for:',
     '[{"id":"a","text":"Brand logos","is_correct":false},{"id":"b","text":"Code editors and technical documentation","is_correct":true},{"id":"c","text":"Children''s books","is_correct":false},{"id":"d","text":"Magazine headlines","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-TYP103-17')::uuid, cid, 'multiple_choice', 'What is the "cap height" of a typeface?',
     '[{"id":"a","text":"The height of the font file","is_correct":false},{"id":"b","text":"The height of uppercase letters measured from the baseline","is_correct":true},{"id":"c","text":"The maximum font size allowed","is_correct":false},{"id":"d","text":"The height of lowercase letters","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-18')::uuid, cid, 'multiple_choice', 'When using type for UI buttons, which consideration is most important?',
     '[{"id":"a","text":"Using decorative script fonts for elegance","is_correct":false},{"id":"b","text":"Ensuring the text is legible at the intended size with sufficient contrast","is_correct":true},{"id":"c","text":"Using the largest available font size","is_correct":false},{"id":"d","text":"Matching the font to the user''s system font","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-TYP103-19')::uuid, cid, 'multiple_choice', 'Which Google Fonts pairing is a classic example of contrast pairing?',
     '[{"id":"a","text":"Roboto + Roboto Mono","is_correct":false},{"id":"b","text":"Playfair Display + Source Sans Pro","is_correct":true},{"id":"c","text":"Open Sans + Lato","is_correct":false},{"id":"d","text":"Montserrat + Raleway","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-TYP103-20')::uuid, cid, 'multiple_choice', 'The concept of a type scale refers to:',
     '[{"id":"a","text":"The weight of a font file in kilobytes","is_correct":false},{"id":"b","text":"A set of harmonious font sizes based on a ratio","is_correct":true},{"id":"c","text":"The number of typefaces in a brand guide","is_correct":false},{"id":"d","text":"The maximum character count per line","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── COL104 Color Theory and Application ─────────────────────────────
  cid := md5('aorthar-course-COL104')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'COL104', 'Color Theory and Application',
     'A comprehensive study of colour theory covering the colour wheel, colour harmonies, psychology of colour, and practical application in digital design and brand identity.',
     y100, y100s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-COL104-1')::uuid, cid, 'The Colour Wheel and Colour Relationships', 1, true),
    (md5('aorthar-l-COL104-2')::uuid, cid, 'Colour Properties — Hue, Saturation and Value', 2, true),
    (md5('aorthar-l-COL104-3')::uuid, cid, 'Colour Harmonies and Schemes', 3, true),
    (md5('aorthar-l-COL104-4')::uuid, cid, 'Psychology of Colour', 4, true),
    (md5('aorthar-l-COL104-5')::uuid, cid, 'Colour in Digital Design — RGB and HEX', 5, true),
    (md5('aorthar-l-COL104-6')::uuid, cid, 'Colour Contrast and Accessibility', 6, true),
    (md5('aorthar-l-COL104-7')::uuid, cid, 'Building a Colour Palette', 7, true),
    (md5('aorthar-l-COL104-8')::uuid, cid, 'Colour in Brand Identity and UI Design', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-1-1')::uuid, lid, 'youtube', 'Color Theory Basics', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-COL104-1-2')::uuid, lid, 'youtube', 'The Color Wheel Explained', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-COL104-1-3')::uuid, lid, 'youtube', 'Primary Secondary Tertiary Colors', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-2-1')::uuid, lid, 'youtube', 'Hue Saturation and Value', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-COL104-2-2')::uuid, lid, 'youtube', 'HSB Color Model in Design', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-COL104-2-3')::uuid, lid, 'youtube', 'Tints Tones and Shades', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-3-1')::uuid, lid, 'youtube', 'Complementary and Analogous Colors', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-COL104-3-2')::uuid, lid, 'youtube', 'Color Harmonies Guide', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-COL104-3-3')::uuid, lid, 'youtube', 'Triadic Color Schemes', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-4-1')::uuid, lid, 'youtube', 'Psychology of Color in Marketing', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-COL104-4-2')::uuid, lid, 'youtube', 'How Color Affects Emotions', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-COL104-4-3')::uuid, lid, 'youtube', 'Color and Human Perception', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-5-1')::uuid, lid, 'youtube', 'RGB vs CMYK Explained', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-COL104-5-2')::uuid, lid, 'youtube', 'HEX Codes for Web Designers', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-COL104-5-3')::uuid, lid, 'youtube', 'CSS Color Values Tutorial', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-6-1')::uuid, lid, 'youtube', 'Color Contrast Accessibility', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-COL104-6-2')::uuid, lid, 'youtube', 'WCAG Contrast Ratios Explained', 'https://www.youtube.com/watch?v=3f31oufqFSM', 2),
    (md5('aorthar-r-COL104-6-3')::uuid, lid, 'youtube', 'Designing for Color Blindness', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-7-1')::uuid, lid, 'youtube', 'How to Build a Color Palette', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-COL104-7-2')::uuid, lid, 'youtube', 'Figma Color Styles Tutorial', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-COL104-7-3')::uuid, lid, 'youtube', 'Creating a Brand Color System', 'https://www.youtube.com/watch?v=P0QDrj4KLAM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL104-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL104-8-1')::uuid, lid, 'youtube', 'Color in Brand Identity', 'https://www.youtube.com/watch?v=P0QDrj4KLAM', 1),
    (md5('aorthar-r-COL104-8-2')::uuid, lid, 'youtube', 'UI Color Systems Explained', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 2),
    (md5('aorthar-r-COL104-8-3')::uuid, lid, 'youtube', 'Dark Mode Color Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-COL104-01')::uuid, cid, 'multiple_choice', 'Complementary colours are colours that are:',
     '[{"id":"a","text":"Adjacent on the colour wheel","is_correct":false},{"id":"b","text":"Directly opposite each other on the colour wheel","is_correct":true},{"id":"c","text":"All within the same hue family","is_correct":false},{"id":"d","text":"Equal in saturation","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-02')::uuid, cid, 'multiple_choice', 'What is "hue" in colour theory?',
     '[{"id":"a","text":"The brightness of a colour","is_correct":false},{"id":"b","text":"The pure colour itself, as positioned on the colour wheel","is_correct":true},{"id":"c","text":"The amount of grey in a colour","is_correct":false},{"id":"d","text":"The opacity of a colour","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-03')::uuid, cid, 'multiple_choice', 'In digital design, the RGB colour model uses which combination of primary colours?',
     '[{"id":"a","text":"Red, Green, Blue","is_correct":true},{"id":"b","text":"Red, Grey, Black","is_correct":false},{"id":"c","text":"Red, Green, Black","is_correct":false},{"id":"d","text":"Rose, Green, Blue","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-04')::uuid, cid, 'multiple_choice', 'An analogous colour scheme uses colours that are:',
     '[{"id":"a","text":"Opposite on the colour wheel","is_correct":false},{"id":"b","text":"Adjacent to each other on the colour wheel","is_correct":true},{"id":"c","text":"Evenly spaced at 120° apart","is_correct":false},{"id":"d","text":"All neutral tones","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-05')::uuid, cid, 'multiple_choice', 'WCAG 2.1 requires a minimum contrast ratio of how much for normal body text?',
     '[{"id":"a","text":"2:1","is_correct":false},{"id":"b","text":"3:1","is_correct":false},{"id":"c","text":"4.5:1","is_correct":true},{"id":"d","text":"7:1","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-06')::uuid, cid, 'multiple_choice', 'Saturation in colour theory describes:',
     '[{"id":"a","text":"How light or dark a colour is","is_correct":false},{"id":"b","text":"The intensity or purity of a colour","is_correct":true},{"id":"c","text":"The type of colour model used","is_correct":false},{"id":"d","text":"The number of colours in a palette","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-07')::uuid, cid, 'multiple_choice', 'A "tint" is created by:',
     '[{"id":"a","text":"Adding black to a colour","is_correct":false},{"id":"b","text":"Adding white to a colour","is_correct":true},{"id":"c","text":"Adding grey to a colour","is_correct":false},{"id":"d","text":"Reducing the saturation of a colour","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-08')::uuid, cid, 'multiple_choice', 'Which colour is most commonly associated with trust and reliability in brand design?',
     '[{"id":"a","text":"Red","is_correct":false},{"id":"b","text":"Yellow","is_correct":false},{"id":"c","text":"Blue","is_correct":true},{"id":"d","text":"Green","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-09')::uuid, cid, 'multiple_choice', 'A triadic colour scheme consists of:',
     '[{"id":"a","text":"Two complementary colours","is_correct":false},{"id":"b","text":"Three colours evenly spaced at 120° on the colour wheel","is_correct":true},{"id":"c","text":"Three adjacent colours","is_correct":false},{"id":"d","text":"One primary and two secondary colours","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-10')::uuid, cid, 'multiple_choice', 'In digital design, what does a HEX code represent?',
     '[{"id":"a","text":"A hexagonal colour shape","is_correct":false},{"id":"b","text":"A six-digit base-16 code representing RGB values","is_correct":true},{"id":"c","text":"A colour standard by Adobe","is_correct":false},{"id":"d","text":"A watermark system for images","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-11')::uuid, cid, 'multiple_choice', 'Warm colours (reds, oranges, yellows) typically convey:',
     '[{"id":"a","text":"Calm and serenity","is_correct":false},{"id":"b","text":"Energy, warmth and urgency","is_correct":true},{"id":"c","text":"Trust and professionalism","is_correct":false},{"id":"d","text":"Nature and health","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-12')::uuid, cid, 'multiple_choice', 'What is a "shade" in colour theory?',
     '[{"id":"a","text":"A colour with white added","is_correct":false},{"id":"b","text":"A colour with black added","is_correct":true},{"id":"c","text":"A neutral grey colour","is_correct":false},{"id":"d","text":"A semi-transparent colour","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-13')::uuid, cid, 'multiple_choice', 'Colour blindness affects approximately what percentage of males?',
     '[{"id":"a","text":"1%","is_correct":false},{"id":"b","text":"8%","is_correct":true},{"id":"c","text":"15%","is_correct":false},{"id":"d","text":"25%","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-COL104-14')::uuid, cid, 'multiple_choice', 'A split-complementary colour scheme uses:',
     '[{"id":"a","text":"A base colour and both its complementary colours","is_correct":false},{"id":"b","text":"A base colour and the two colours adjacent to its complement","is_correct":true},{"id":"c","text":"Three equally spaced colours","is_correct":false},{"id":"d","text":"Two analogous pairs","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-COL104-15')::uuid, cid, 'multiple_choice', 'In a UI design system, the "primary" colour is typically used for:',
     '[{"id":"a","text":"Background colours only","is_correct":false},{"id":"b","text":"The main interactive elements like buttons and links","is_correct":true},{"id":"c","text":"Error states only","is_correct":false},{"id":"d","text":"Text colour throughout the interface","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-16')::uuid, cid, 'multiple_choice', 'Value in the HSV (Hue, Saturation, Value) model refers to:',
     '[{"id":"a","text":"The price of the colour swatch","is_correct":false},{"id":"b","text":"The brightness or lightness of the colour","is_correct":true},{"id":"c","text":"The hue angle on the colour wheel","is_correct":false},{"id":"d","text":"The transparency level","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-17')::uuid, cid, 'multiple_choice', 'Which statement is true about monochromatic colour schemes?',
     '[{"id":"a","text":"They use many different hues","is_correct":false},{"id":"b","text":"They use variations of a single hue using tints, tones and shades","is_correct":true},{"id":"c","text":"They require complementary colours","is_correct":false},{"id":"d","text":"They only use black and white","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL104-18')::uuid, cid, 'multiple_choice', 'The colour green is most commonly associated with which of the following in design?',
     '[{"id":"a","text":"Danger and urgency","is_correct":false},{"id":"b","text":"Nature, health, growth and success","is_correct":true},{"id":"c","text":"Sadness and melancholy","is_correct":false},{"id":"d","text":"Luxury and exclusivity","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-19')::uuid, cid, 'multiple_choice', 'When creating a colour palette for a design system, which type of colour is typically used for destructive actions like "Delete"?',
     '[{"id":"a","text":"Blue","is_correct":false},{"id":"b","text":"Green","is_correct":false},{"id":"c","text":"Red","is_correct":true},{"id":"d","text":"Purple","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL104-20')::uuid, cid, 'multiple_choice', 'Optical mixing, as used in Impressionist painting and modern screens, refers to:',
     '[{"id":"a","text":"Mixing paint physically on canvas","is_correct":false},{"id":"b","text":"Placing small dots of pure colour that the eye blends into new colours","is_correct":true},{"id":"c","text":"Using digital filters to blend colours","is_correct":false},{"id":"d","text":"Creating gradients between two colours","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── WEB105 HTML and CSS Foundations ─────────────────────────────────
  cid := md5('aorthar-course-WEB105')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'WEB105', 'HTML and CSS Foundations',
     'Practical introduction to building web pages using HTML5 and CSS3. Students learn semantic markup, styling, the box model, Flexbox, Grid and responsive design fundamentals.',
     y100, y100s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-WEB105-1')::uuid, cid, 'Introduction to HTML — Structure and Semantics', 1, true),
    (md5('aorthar-l-WEB105-2')::uuid, cid, 'HTML Elements — Text, Links and Media', 2, true),
    (md5('aorthar-l-WEB105-3')::uuid, cid, 'Introduction to CSS — Selectors and Properties', 3, true),
    (md5('aorthar-l-WEB105-4')::uuid, cid, 'The Box Model — Margin, Border, Padding', 4, true),
    (md5('aorthar-l-WEB105-5')::uuid, cid, 'CSS Flexbox Layout', 5, true),
    (md5('aorthar-l-WEB105-6')::uuid, cid, 'CSS Grid Layout', 6, true),
    (md5('aorthar-l-WEB105-7')::uuid, cid, 'Responsive Design and Media Queries', 7, true),
    (md5('aorthar-l-WEB105-8')::uuid, cid, 'Building Your First Web Page', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-1-1')::uuid, lid, 'youtube', 'HTML Crash Course for Beginners', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 1),
    (md5('aorthar-r-WEB105-1-2')::uuid, lid, 'youtube', 'HTML5 Semantic Elements', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 2),
    (md5('aorthar-r-WEB105-1-3')::uuid, lid, 'youtube', 'Document Structure in HTML', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-2-1')::uuid, lid, 'youtube', 'HTML Text and Links Tutorial', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 1),
    (md5('aorthar-r-WEB105-2-2')::uuid, lid, 'youtube', 'HTML Images and Media', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 2),
    (md5('aorthar-r-WEB105-2-3')::uuid, lid, 'youtube', 'HTML Forms and Inputs', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-3-1')::uuid, lid, 'youtube', 'CSS Tutorial for Beginners', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1),
    (md5('aorthar-r-WEB105-3-2')::uuid, lid, 'youtube', 'CSS Selectors Deep Dive', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-WEB105-3-3')::uuid, lid, 'youtube', 'Styling with CSS Properties', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-4-1')::uuid, lid, 'youtube', 'CSS Box Model Explained', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1),
    (md5('aorthar-r-WEB105-4-2')::uuid, lid, 'youtube', 'Margin vs Padding in CSS', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-WEB105-4-3')::uuid, lid, 'youtube', 'Border Box Sizing Tutorial', 'https://www.youtube.com/watch?v=u044iM9xsWU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-5-1')::uuid, lid, 'youtube', 'CSS Flexbox in 20 Minutes', 'https://www.youtube.com/watch?v=u044iM9xsWU', 1),
    (md5('aorthar-r-WEB105-5-2')::uuid, lid, 'youtube', 'Flexbox Froggy Tutorial', 'https://www.youtube.com/watch?v=u044iM9xsWU', 2),
    (md5('aorthar-r-WEB105-5-3')::uuid, lid, 'youtube', 'Building Layouts with Flexbox', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-6-1')::uuid, lid, 'youtube', 'CSS Grid Tutorial', 'https://www.youtube.com/watch?v=EFafSYg-PkI', 1),
    (md5('aorthar-r-WEB105-6-2')::uuid, lid, 'youtube', 'CSS Grid vs Flexbox', 'https://www.youtube.com/watch?v=EFafSYg-PkI', 2),
    (md5('aorthar-r-WEB105-6-3')::uuid, lid, 'youtube', 'Building Page Layouts with Grid', 'https://www.youtube.com/watch?v=u044iM9xsWU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-7-1')::uuid, lid, 'youtube', 'Responsive Design with Media Queries', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1),
    (md5('aorthar-r-WEB105-7-2')::uuid, lid, 'youtube', 'Mobile-First CSS Design', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-WEB105-7-3')::uuid, lid, 'youtube', 'Responsive Web Design Tutorial', 'https://www.youtube.com/watch?v=EFafSYg-PkI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-WEB105-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-WEB105-8-1')::uuid, lid, 'youtube', 'Build a Complete Web Page', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 1),
    (md5('aorthar-r-WEB105-8-2')::uuid, lid, 'youtube', 'HTML and CSS Portfolio Project', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-WEB105-8-3')::uuid, lid, 'youtube', 'Deploy a Static Website', 'https://www.youtube.com/watch?v=EFafSYg-PkI', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-WEB105-01')::uuid, cid, 'multiple_choice', 'What does HTML stand for?',
     '[{"id":"a","text":"Hyper Text Markup Language","is_correct":true},{"id":"b","text":"High Text Machine Language","is_correct":false},{"id":"c","text":"Hyper Transfer Markup Language","is_correct":false},{"id":"d","text":"Home Tool Markup Language","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-02')::uuid, cid, 'multiple_choice', 'Which HTML tag is used to define the largest heading?',
     '[{"id":"a","text":"<heading>","is_correct":false},{"id":"b","text":"<h6>","is_correct":false},{"id":"c","text":"<h1>","is_correct":true},{"id":"d","text":"<head>","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-03')::uuid, cid, 'multiple_choice', 'Which CSS property is used to change the text colour?',
     '[{"id":"a","text":"font-color","is_correct":false},{"id":"b","text":"text-color","is_correct":false},{"id":"c","text":"color","is_correct":true},{"id":"d","text":"foreground-color","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-04')::uuid, cid, 'multiple_choice', 'In the CSS box model, which property creates space outside an element''s border?',
     '[{"id":"a","text":"padding","is_correct":false},{"id":"b","text":"margin","is_correct":true},{"id":"c","text":"border","is_correct":false},{"id":"d","text":"outline","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-05')::uuid, cid, 'multiple_choice', 'Which HTML element is used to create a hyperlink?',
     '[{"id":"a","text":"<link>","is_correct":false},{"id":"b","text":"<href>","is_correct":false},{"id":"c","text":"<a>","is_correct":true},{"id":"d","text":"<url>","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-06')::uuid, cid, 'multiple_choice', 'What CSS property is used to make a Flexbox container?',
     '[{"id":"a","text":"display: block","is_correct":false},{"id":"b","text":"display: flex","is_correct":true},{"id":"c","text":"flex: 1","is_correct":false},{"id":"d","text":"position: flex","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-07')::uuid, cid, 'multiple_choice', 'Which CSS property controls the space between the content and the border of an element?',
     '[{"id":"a","text":"margin","is_correct":false},{"id":"b","text":"padding","is_correct":true},{"id":"c","text":"spacing","is_correct":false},{"id":"d","text":"gap","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-08')::uuid, cid, 'multiple_choice', 'What is the correct CSS syntax for applying a media query for screens smaller than 768px?',
     '[{"id":"a","text":"@screen (max-width: 768px)","is_correct":false},{"id":"b","text":"@responsive max-width: 768px","is_correct":false},{"id":"c","text":"@media (max-width: 768px)","is_correct":true},{"id":"d","text":"@media screen < 768px","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-09')::uuid, cid, 'multiple_choice', 'Which HTML5 element is most appropriate for the main navigation of a website?',
     '[{"id":"a","text":"<div class=nav>","is_correct":false},{"id":"b","text":"<nav>","is_correct":true},{"id":"c","text":"<menu>","is_correct":false},{"id":"d","text":"<header>","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-10')::uuid, cid, 'multiple_choice', 'In CSS Grid, what does "grid-template-columns: repeat(3, 1fr)" do?',
     '[{"id":"a","text":"Creates 3 rows of equal height","is_correct":false},{"id":"b","text":"Creates 3 equal-width columns that share available space","is_correct":true},{"id":"c","text":"Repeats the grid 3 times on the page","is_correct":false},{"id":"d","text":"Creates 3 columns each 1 pixel wide","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-11')::uuid, cid, 'multiple_choice', 'The CSS "box-sizing: border-box" property means:',
     '[{"id":"a","text":"The element has a border around it","is_correct":false},{"id":"b","text":"Width and height include padding and border, not just content","is_correct":true},{"id":"c","text":"The box cannot overflow","is_correct":false},{"id":"d","text":"The border is displayed as a box","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-12')::uuid, cid, 'multiple_choice', 'Which attribute is required in an <img> tag for accessibility?',
     '[{"id":"a","text":"title","is_correct":false},{"id":"b","text":"src","is_correct":false},{"id":"c","text":"alt","is_correct":true},{"id":"d","text":"width","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-13')::uuid, cid, 'multiple_choice', 'What is the default display value of a <div> element?',
     '[{"id":"a","text":"inline","is_correct":false},{"id":"b","text":"inline-block","is_correct":false},{"id":"c","text":"block","is_correct":true},{"id":"d","text":"flex","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-14')::uuid, cid, 'multiple_choice', 'In Flexbox, what does "justify-content: space-between" do?',
     '[{"id":"a","text":"Adds equal space between items and on the edges","is_correct":false},{"id":"b","text":"Distributes items with space between them, none on edges","is_correct":true},{"id":"c","text":"Centers all items","is_correct":false},{"id":"d","text":"Stretches items to fill the container","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-15')::uuid, cid, 'multiple_choice', 'Which HTML element wraps the visible content of a web page?',
     '[{"id":"a","text":"<html>","is_correct":false},{"id":"b","text":"<head>","is_correct":false},{"id":"c","text":"<body>","is_correct":true},{"id":"d","text":"<main>","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-WEB105-16')::uuid, cid, 'multiple_choice', 'CSS specificity determines:',
     '[{"id":"a","text":"How fast a stylesheet loads","is_correct":false},{"id":"b","text":"Which CSS rule takes precedence when multiple rules apply to the same element","is_correct":true},{"id":"c","text":"The order stylesheets are downloaded","is_correct":false},{"id":"d","text":"The size of the CSS file","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-WEB105-17')::uuid, cid, 'multiple_choice', 'Mobile-first design in CSS means:',
     '[{"id":"a","text":"Only designing for mobile devices","is_correct":false},{"id":"b","text":"Writing base styles for mobile and using min-width media queries to scale up","is_correct":true},{"id":"c","text":"Using max-width media queries to shrink desktop designs","is_correct":false},{"id":"d","text":"Designing the mobile version last","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-WEB105-18')::uuid, cid, 'multiple_choice', 'What does the CSS "position: absolute" value do?',
     '[{"id":"a","text":"Fixes the element to the viewport","is_correct":false},{"id":"b","text":"Positions the element relative to its nearest positioned ancestor","is_correct":true},{"id":"c","text":"Removes the element from the page","is_correct":false},{"id":"d","text":"Makes the element float","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-WEB105-19')::uuid, cid, 'multiple_choice', 'The <section> element in HTML5 is used for:',
     '[{"id":"a","text":"Creating a horizontal line","is_correct":false},{"id":"b","text":"Grouping thematically related content with a heading","is_correct":true},{"id":"c","text":"Embedding external content","is_correct":false},{"id":"d","text":"Defining a navigation section only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-WEB105-20')::uuid, cid, 'multiple_choice', 'The CSS "z-index" property controls:',
     '[{"id":"a","text":"The horizontal position of an element","is_correct":false},{"id":"b","text":"The stacking order of positioned elements along the z-axis","is_correct":true},{"id":"c","text":"The zoom level of the browser","is_correct":false},{"id":"d","text":"The opacity of an element","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 100 · SEMESTER 2
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── DES106 Design Process and Methodology ───────────────────────────
  cid := md5('aorthar-course-DES106')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'DES106', 'Design Process and Methodology',
     'A structured exploration of end-to-end design processes from brief to delivery. Covers double diamond, agile design, design documentation, critique and handoff practices.',
     y100, y100s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-DES106-1')::uuid, cid, 'Understanding the Design Brief', 1, true),
    (md5('aorthar-l-DES106-2')::uuid, cid, 'The Double Diamond Model', 2, true),
    (md5('aorthar-l-DES106-3')::uuid, cid, 'Research and Discovery Phase', 3, true),
    (md5('aorthar-l-DES106-4')::uuid, cid, 'Synthesis and Insight Generation', 4, true),
    (md5('aorthar-l-DES106-5')::uuid, cid, 'Concept Development and Iteration', 5, true),
    (md5('aorthar-l-DES106-6')::uuid, cid, 'Design Critique and Feedback', 6, true),
    (md5('aorthar-l-DES106-7')::uuid, cid, 'Design Documentation and Specifications', 7, true),
    (md5('aorthar-l-DES106-8')::uuid, cid, 'Project Delivery and Handoff', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-1-1')::uuid, lid, 'youtube', 'How to Read a Design Brief', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 1),
    (md5('aorthar-r-DES106-1-2')::uuid, lid, 'youtube', 'Client Briefs for Designers', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 2),
    (md5('aorthar-r-DES106-1-3')::uuid, lid, 'youtube', 'Project Scoping for Designers', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-2-1')::uuid, lid, 'youtube', 'The Double Diamond Design Process', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 1),
    (md5('aorthar-r-DES106-2-2')::uuid, lid, 'youtube', 'Design Council Double Diamond', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 2),
    (md5('aorthar-r-DES106-2-3')::uuid, lid, 'youtube', 'Diverge and Converge Thinking', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-3-1')::uuid, lid, 'youtube', 'UX Research Methods Overview', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-DES106-3-2')::uuid, lid, 'youtube', 'Discovery Phase in Design', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-DES106-3-3')::uuid, lid, 'youtube', 'Stakeholder Interviews', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-4-1')::uuid, lid, 'youtube', 'Affinity Mapping Tutorial', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 1),
    (md5('aorthar-r-DES106-4-2')::uuid, lid, 'youtube', 'Turning Research into Insights', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-DES106-4-3')::uuid, lid, 'youtube', 'Jobs To Be Done Framework', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-5-1')::uuid, lid, 'youtube', 'Concept Sketching for Designers', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 1),
    (md5('aorthar-r-DES106-5-2')::uuid, lid, 'youtube', 'Iterative Design Process', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 2),
    (md5('aorthar-r-DES106-5-3')::uuid, lid, 'youtube', 'Design Exploration Techniques', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-6-1')::uuid, lid, 'youtube', 'How to Give Design Feedback', 'https://www.youtube.com/watch?v=Bn2s58JjIjA', 1),
    (md5('aorthar-r-DES106-6-2')::uuid, lid, 'youtube', 'Design Critique Best Practices', 'https://www.youtube.com/watch?v=rgeN2SWr6Ms', 2),
    (md5('aorthar-r-DES106-6-3')::uuid, lid, 'youtube', 'Receiving Feedback as a Designer', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-7-1')::uuid, lid, 'youtube', 'Design Specs and Documentation', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-DES106-7-2')::uuid, lid, 'youtube', 'Figma Inspect for Developers', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-DES106-7-3')::uuid, lid, 'youtube', 'Writing Design Documentation', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DES106-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DES106-8-1')::uuid, lid, 'youtube', 'Designer to Developer Handoff', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-DES106-8-2')::uuid, lid, 'youtube', 'Zeplin and Figma Handoff Tools', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-DES106-8-3')::uuid, lid, 'youtube', 'Project Delivery Best Practices', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-DES106-01')::uuid, cid, 'multiple_choice', 'The Double Diamond design model was developed by which organisation?',
     '[{"id":"a","text":"IDEO","is_correct":false},{"id":"b","text":"Design Council","is_correct":true},{"id":"c","text":"Stanford d.school","is_correct":false},{"id":"d","text":"Nielsen Norman Group","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-02')::uuid, cid, 'multiple_choice', 'What are the four phases of the Double Diamond?',
     '[{"id":"a","text":"Research, Design, Test, Launch","is_correct":false},{"id":"b","text":"Discover, Define, Develop, Deliver","is_correct":true},{"id":"c","text":"Empathize, Define, Ideate, Prototype","is_correct":false},{"id":"d","text":"Plan, Build, Test, Release","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES106-03')::uuid, cid, 'multiple_choice', 'In the Double Diamond, "divergent thinking" occurs during:',
     '[{"id":"a","text":"Define and Deliver phases","is_correct":false},{"id":"b","text":"Discover and Develop phases","is_correct":true},{"id":"c","text":"Define and Develop phases","is_correct":false},{"id":"d","text":"Only the Deliver phase","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-04')::uuid, cid, 'multiple_choice', 'A design brief should primarily contain:',
     '[{"id":"a","text":"The final design solution","is_correct":false},{"id":"b","text":"Project goals, constraints, audience and success criteria","is_correct":true},{"id":"c","text":"The designer''s portfolio","is_correct":false},{"id":"d","text":"Technical specifications only","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES106-05')::uuid, cid, 'multiple_choice', 'Affinity mapping is used in the design process to:',
     '[{"id":"a","text":"Create visual colour schemes","is_correct":false},{"id":"b","text":"Organise research data into themes and patterns","is_correct":true},{"id":"c","text":"Map out navigation flows","is_correct":false},{"id":"d","text":"Assign tasks to team members","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-06')::uuid, cid, 'multiple_choice', 'A design critique session should focus on:',
     '[{"id":"a","text":"Personal preferences of the reviewer","is_correct":false},{"id":"b","text":"How well the design meets defined goals and user needs","is_correct":true},{"id":"c","text":"The aesthetic taste of the team","is_correct":false},{"id":"d","text":"Comparing the design to competitors only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-07')::uuid, cid, 'multiple_choice', 'What is the purpose of design documentation?',
     '[{"id":"a","text":"To replace design files","is_correct":false},{"id":"b","text":"To communicate design decisions, rationale and specs to the team","is_correct":true},{"id":"c","text":"To act as a marketing document","is_correct":false},{"id":"d","text":"To replace user research","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES106-08')::uuid, cid, 'multiple_choice', 'What does "designer-developer handoff" involve?',
     '[{"id":"a","text":"The designer learning to code","is_correct":false},{"id":"b","text":"Providing developers with specs, assets and interaction notes to implement the design","is_correct":true},{"id":"c","text":"The developer creating the final designs","is_correct":false},{"id":"d","text":"Moving the project to a new team","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES106-09')::uuid, cid, 'multiple_choice', 'The "discovery" phase of the design process is primarily about:',
     '[{"id":"a","text":"Creating final visuals","is_correct":false},{"id":"b","text":"Understanding the problem space through research","is_correct":true},{"id":"c","text":"Building prototypes","is_correct":false},{"id":"d","text":"Writing user stories","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES106-10')::uuid, cid, 'multiple_choice', '"Jobs To Be Done" (JTBD) is a framework that focuses on:',
     '[{"id":"a","text":"The tasks assigned to designers in a sprint","is_correct":false},{"id":"b","text":"Understanding what goal a user is trying to accomplish with a product","is_correct":true},{"id":"c","text":"The technical requirements of a product","is_correct":false},{"id":"d","text":"Scheduling team deliverables","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-11')::uuid, cid, 'multiple_choice', 'Convergent thinking in the design process means:',
     '[{"id":"a","text":"Generating as many ideas as possible","is_correct":false},{"id":"b","text":"Narrowing down options to identify the best solution","is_correct":true},{"id":"c","text":"Opening up the problem space","is_correct":false},{"id":"d","text":"Running usability tests","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-12')::uuid, cid, 'multiple_choice', 'What is a design sprint?',
     '[{"id":"a","text":"A marathon design session lasting a month","is_correct":false},{"id":"b","text":"A time-boxed process (usually 5 days) to solve a design challenge through prototyping and testing","is_correct":true},{"id":"c","text":"A sprint in agile development where designers work","is_correct":false},{"id":"d","text":"A running event for designers","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-13')::uuid, cid, 'multiple_choice', 'Stakeholder interviews during the research phase are conducted to:',
     '[{"id":"a","text":"Sell the design to clients","is_correct":false},{"id":"b","text":"Understand business goals, constraints and expectations","is_correct":true},{"id":"c","text":"Test prototypes with users","is_correct":false},{"id":"d","text":"Train developers on the design","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-14')::uuid, cid, 'multiple_choice', 'Which tool is most commonly used for designer-developer handoff in modern workflows?',
     '[{"id":"a","text":"Microsoft Word","is_correct":false},{"id":"b","text":"Figma Inspect or Zeplin","is_correct":true},{"id":"c","text":"Adobe Photoshop","is_correct":false},{"id":"d","text":"Slack only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-15')::uuid, cid, 'multiple_choice', 'A good design process is characterised by:',
     '[{"id":"a","text":"Following one rigid methodology without deviation","is_correct":false},{"id":"b","text":"Being iterative, user-centred and adaptable to project needs","is_correct":true},{"id":"c","text":"Skipping research to save time","is_correct":false},{"id":"d","text":"Working alone without team feedback","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DES106-16')::uuid, cid, 'multiple_choice', 'The "define" phase of the Double Diamond primarily produces:',
     '[{"id":"a","text":"A finished prototype","is_correct":false},{"id":"b","text":"A clear problem statement or design challenge","is_correct":true},{"id":"c","text":"A marketing plan","is_correct":false},{"id":"d","text":"A list of user stories","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-17')::uuid, cid, 'multiple_choice', 'What is the role of design principles in a project?',
     '[{"id":"a","text":"To dictate specific visual styles","is_correct":false},{"id":"b","text":"To guide decision-making and ensure design consistency","is_correct":true},{"id":"c","text":"To replace user research","is_correct":false},{"id":"d","text":"To measure development speed","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DES106-18')::uuid, cid, 'multiple_choice', 'During a design review, "I-statements" (e.g., "I think" vs "this is wrong") are encouraged to:',
     '[{"id":"a","text":"Make feedback sound more personal","is_correct":false},{"id":"b","text":"Distinguish personal opinion from objective critique, making feedback more constructive","is_correct":true},{"id":"c","text":"Assign blame to the designer","is_correct":false},{"id":"d","text":"Speed up the meeting","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DES106-19')::uuid, cid, 'multiple_choice', 'What does "design system" documentation typically include?',
     '[{"id":"a","text":"The source code of the product","is_correct":false},{"id":"b","text":"Component libraries, design tokens, usage guidelines and patterns","is_correct":true},{"id":"c","text":"Personal notes from the designer","is_correct":false},{"id":"d","text":"User research transcripts","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DES106-20')::uuid, cid, 'multiple_choice', 'The main risk of skipping the research and discovery phase is:',
     '[{"id":"a","text":"The project finishes too quickly","is_correct":false},{"id":"b","text":"Building a well-designed solution for the wrong problem","is_correct":true},{"id":"c","text":"Developers run out of work","is_correct":false},{"id":"d","text":"The design looks outdated","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── UXD107 Introduction to UX Design ────────────────────────────────
  cid := md5('aorthar-course-UXD107')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'UXD107', 'Introduction to UX Design',
     'Foundational UX design course covering user research, personas, user journeys, usability principles, and the end-to-end UX design workflow used in professional product teams.',
     y100, y100s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-UXD107-1')::uuid, cid, 'What is UX Design?', 1, true),
    (md5('aorthar-l-UXD107-2')::uuid, cid, 'User Research Fundamentals', 2, true),
    (md5('aorthar-l-UXD107-3')::uuid, cid, 'Creating User Personas', 3, true),
    (md5('aorthar-l-UXD107-4')::uuid, cid, 'User Journey Mapping', 4, true),
    (md5('aorthar-l-UXD107-5')::uuid, cid, 'Usability Heuristics', 5, true),
    (md5('aorthar-l-UXD107-6')::uuid, cid, 'Information Architecture Basics', 6, true),
    (md5('aorthar-l-UXD107-7')::uuid, cid, 'Wireframing and Low-Fi Design', 7, true),
    (md5('aorthar-l-UXD107-8')::uuid, cid, 'UX in Agile Product Teams', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-1-1')::uuid, lid, 'youtube', 'What is UX Design?', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-UXD107-1-2')::uuid, lid, 'youtube', 'UX vs UI Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-UXD107-1-3')::uuid, lid, 'youtube', 'Day in the Life of a UX Designer', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-2-1')::uuid, lid, 'youtube', 'UX Research Methods', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-UXD107-2-2')::uuid, lid, 'youtube', 'User Interviews Guide', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-UXD107-2-3')::uuid, lid, 'youtube', 'Qualitative vs Quantitative Research', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-3-1')::uuid, lid, 'youtube', 'How to Create User Personas', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 1),
    (md5('aorthar-r-UXD107-3-2')::uuid, lid, 'youtube', 'Persona Mapping Workshop', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-UXD107-3-3')::uuid, lid, 'youtube', 'UX Personas Explained', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-4-1')::uuid, lid, 'youtube', 'Customer Journey Mapping', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 1),
    (md5('aorthar-r-UXD107-4-2')::uuid, lid, 'youtube', 'User Journey vs User Flow', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-UXD107-4-3')::uuid, lid, 'youtube', 'Emotional Journey Mapping', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-5-1')::uuid, lid, 'youtube', 'Nielsen''s 10 Usability Heuristics', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-UXD107-5-2')::uuid, lid, 'youtube', 'Heuristic Evaluation Explained', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-UXD107-5-3')::uuid, lid, 'youtube', 'UX Heuristics in Practice', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-6-1')::uuid, lid, 'youtube', 'Information Architecture Basics', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-UXD107-6-2')::uuid, lid, 'youtube', 'Card Sorting for IA', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-UXD107-6-3')::uuid, lid, 'youtube', 'Site Map Creation', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-7-1')::uuid, lid, 'youtube', 'Wireframing for Beginners', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 1),
    (md5('aorthar-r-UXD107-7-2')::uuid, lid, 'youtube', 'How to Wireframe in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-UXD107-7-3')::uuid, lid, 'youtube', 'Lo-fi to Hi-fi Prototyping', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXD107-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXD107-8-1')::uuid, lid, 'youtube', 'UX in Agile Teams', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-UXD107-8-2')::uuid, lid, 'youtube', 'Lean UX Explained', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 2),
    (md5('aorthar-r-UXD107-8-3')::uuid, lid, 'youtube', 'Working with Product and Engineering', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-UXD107-01')::uuid, cid, 'multiple_choice', 'What does UX stand for in design?',
     '[{"id":"a","text":"User Experience","is_correct":true},{"id":"b","text":"User Extension","is_correct":false},{"id":"c","text":"Uniform Exchange","is_correct":false},{"id":"d","text":"Universal Experience","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-02')::uuid, cid, 'multiple_choice', 'How many usability heuristics did Jakob Nielsen define?',
     '[{"id":"a","text":"5","is_correct":false},{"id":"b","text":"8","is_correct":false},{"id":"c","text":"10","is_correct":true},{"id":"d","text":"12","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-03')::uuid, cid, 'multiple_choice', 'A user persona is:',
     '[{"id":"a","text":"A real user who tests the product","is_correct":false},{"id":"b","text":"A fictional character representing a target user segment based on research","is_correct":true},{"id":"c","text":"A list of user requirements","is_correct":false},{"id":"d","text":"A social media profile of a user","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-04')::uuid, cid, 'multiple_choice', 'A user journey map primarily shows:',
     '[{"id":"a","text":"The navigation structure of an app","is_correct":false},{"id":"b","text":"The steps, emotions and pain points a user goes through to achieve a goal","is_correct":true},{"id":"c","text":"The technical architecture of a system","is_correct":false},{"id":"d","text":"The business revenue model","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-05')::uuid, cid, 'multiple_choice', 'Which heuristic principle deals with error prevention?',
     '[{"id":"a","text":"Consistency and standards","is_correct":false},{"id":"b","text":"Error prevention","is_correct":true},{"id":"c","text":"Recognition over recall","is_correct":false},{"id":"d","text":"Aesthetic design","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-06')::uuid, cid, 'multiple_choice', 'Card sorting is a UX research method used to:',
     '[{"id":"a","text":"Test visual design preferences","is_correct":false},{"id":"b","text":"Understand how users categorise and organise information","is_correct":true},{"id":"c","text":"Evaluate colour schemes","is_correct":false},{"id":"d","text":"Run A/B tests","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-07')::uuid, cid, 'multiple_choice', 'What is the difference between UX and UI design?',
     '[{"id":"a","text":"They are the same thing","is_correct":false},{"id":"b","text":"UX focuses on the overall experience and user journey; UI focuses on visual interface elements","is_correct":true},{"id":"c","text":"UI is more important than UX","is_correct":false},{"id":"d","text":"UX is only about aesthetics","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-08')::uuid, cid, 'multiple_choice', 'Which type of research produces numerical data that can be statistically analysed?',
     '[{"id":"a","text":"Qualitative research","is_correct":false},{"id":"b","text":"Quantitative research","is_correct":true},{"id":"c","text":"Ethnographic research","is_correct":false},{"id":"d","text":"Generative research","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-09')::uuid, cid, 'multiple_choice', 'Information architecture (IA) in UX is concerned with:',
     '[{"id":"a","text":"The visual design of pages","is_correct":false},{"id":"b","text":"Organising and structuring content so users can find what they need","is_correct":true},{"id":"c","text":"The technical infrastructure of a web app","is_correct":false},{"id":"d","text":"Choosing fonts and colours","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-10')::uuid, cid, 'multiple_choice', 'Nielsen''s heuristic "recognition over recall" means:',
     '[{"id":"a","text":"Users should memorise all interface elements","is_correct":false},{"id":"b","text":"Systems should make options visible so users don''t have to remember information","is_correct":true},{"id":"c","text":"Recognition awards should be given to designers","is_correct":false},{"id":"d","text":"Users recall designs they previously liked","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-11')::uuid, cid, 'multiple_choice', 'A sitemap in UX design represents:',
     '[{"id":"a","text":"A geographic map of users","is_correct":false},{"id":"b","text":"A hierarchical diagram of a website''s or app''s content structure","is_correct":true},{"id":"c","text":"A list of design components","is_correct":false},{"id":"d","text":"A server location diagram","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-12')::uuid, cid, 'multiple_choice', 'Pain points in a user journey map represent:',
     '[{"id":"a","text":"Physical pain experienced by users","is_correct":false},{"id":"b","text":"Moments of frustration, friction or unmet needs in the user''s experience","is_correct":true},{"id":"c","text":"Errors in the codebase","is_correct":false},{"id":"d","text":"Low revenue points for the business","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-13')::uuid, cid, 'multiple_choice', 'Lean UX is an approach that emphasises:',
     '[{"id":"a","text":"Detailed documentation before any design work","is_correct":false},{"id":"b","text":"Rapid experiments, continuous feedback and minimal upfront documentation","is_correct":true},{"id":"c","text":"Slowing down to ensure perfect designs","is_correct":false},{"id":"d","text":"Working without user research","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-UXD107-14')::uuid, cid, 'multiple_choice', 'Which research method involves observing users in their natural environment?',
     '[{"id":"a","text":"Survey","is_correct":false},{"id":"b","text":"A/B testing","is_correct":false},{"id":"c","text":"Ethnographic research","is_correct":true},{"id":"d","text":"Heuristic evaluation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-15')::uuid, cid, 'multiple_choice', 'What is a wireframe?',
     '[{"id":"a","text":"A fully designed high-fidelity screen","is_correct":false},{"id":"b","text":"A low-fidelity sketch showing layout, structure and content placement without styling","is_correct":true},{"id":"c","text":"A physical model of a product","is_correct":false},{"id":"d","text":"A network diagram","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-16')::uuid, cid, 'multiple_choice', 'The heuristic "flexibility and efficiency of use" refers to:',
     '[{"id":"a","text":"Making the app run faster","is_correct":false},{"id":"b","text":"Providing shortcuts and accelerators for expert users while keeping the system accessible to novices","is_correct":true},{"id":"c","text":"The flexibility of the design tool","is_correct":false},{"id":"d","text":"Allowing users to change fonts","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-UXD107-17')::uuid, cid, 'multiple_choice', 'A user interview is most useful for:',
     '[{"id":"a","text":"Measuring how many users convert","is_correct":false},{"id":"b","text":"Understanding the "why" behind user behaviour and motivations","is_correct":true},{"id":"c","text":"Counting clicks on a page","is_correct":false},{"id":"d","text":"Testing visual preferences","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXD107-18')::uuid, cid, 'multiple_choice', 'Qualitative UX research is best described as:',
     '[{"id":"a","text":"Research that produces measurable numbers","is_correct":false},{"id":"b","text":"Research that explores user attitudes, behaviours and motivations in depth","is_correct":true},{"id":"c","text":"Research that is only done in laboratories","is_correct":false},{"id":"d","text":"Research that requires a large sample size","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-19')::uuid, cid, 'multiple_choice', 'What is a "task flow" in UX design?',
     '[{"id":"a","text":"A list of designer tasks","is_correct":false},{"id":"b","text":"The sequence of steps a user takes to complete a specific task within a product","is_correct":true},{"id":"c","text":"A Gantt chart for the project","is_correct":false},{"id":"d","text":"A flow chart of the database","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXD107-20')::uuid, cid, 'multiple_choice', 'Which of the following is an example of a usability heuristic?',
     '[{"id":"a","text":"Use the colour blue for all buttons","is_correct":false},{"id":"b","text":"Always provide a way for users to undo actions","is_correct":true},{"id":"c","text":"Use large images on every page","is_correct":false},{"id":"d","text":"Never use tooltips","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── UI108 UI Design Principles ───────────────────────────────────────
  cid := md5('aorthar-course-UI108')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'UI108', 'UI Design Principles',
     'Core principles of user interface design covering navigation patterns, component design, state management, affordance, feedback and building consistent UI systems.',
     y100, y100s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-UI108-1')::uuid, cid, 'Foundations of UI Design', 1, true),
    (md5('aorthar-l-UI108-2')::uuid, cid, 'Navigation Patterns and Flows', 2, true),
    (md5('aorthar-l-UI108-3')::uuid, cid, 'Buttons, Forms and Input Components', 3, true),
    (md5('aorthar-l-UI108-4')::uuid, cid, 'Affordance and Signifiers', 4, true),
    (md5('aorthar-l-UI108-5')::uuid, cid, 'Feedback, Error States and Empty States', 5, true),
    (md5('aorthar-l-UI108-6')::uuid, cid, 'UI Patterns and Anti-Patterns', 6, true),
    (md5('aorthar-l-UI108-7')::uuid, cid, 'Mobile UI Design Considerations', 7, true),
    (md5('aorthar-l-UI108-8')::uuid, cid, 'Building Consistent UI Systems', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-1-1')::uuid, lid, 'youtube', 'UI Design Fundamentals', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-UI108-1-2')::uuid, lid, 'youtube', 'UI Design Principles Overview', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-UI108-1-3')::uuid, lid, 'youtube', 'Introduction to Interface Design', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-2-1')::uuid, lid, 'youtube', 'Navigation Design Patterns', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-UI108-2-2')::uuid, lid, 'youtube', 'Mobile Navigation Patterns', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-UI108-2-3')::uuid, lid, 'youtube', 'User Flow Design', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-3-1')::uuid, lid, 'youtube', 'Designing Buttons and CTAs', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-UI108-3-2')::uuid, lid, 'youtube', 'Form Design Best Practices', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-UI108-3-3')::uuid, lid, 'youtube', 'Input Design Patterns', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-4-1')::uuid, lid, 'youtube', 'Affordance in Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-UI108-4-2')::uuid, lid, 'youtube', 'Signifiers and Perceived Affordance', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-UI108-4-3')::uuid, lid, 'youtube', 'Don Norman Design Principles', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-5-1')::uuid, lid, 'youtube', 'Designing Error States', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-UI108-5-2')::uuid, lid, 'youtube', 'Empty States in UI Design', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-UI108-5-3')::uuid, lid, 'youtube', 'Micro Feedback in UI', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-6-1')::uuid, lid, 'youtube', 'UI Design Patterns Library', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-UI108-6-2')::uuid, lid, 'youtube', 'UI Anti-Patterns to Avoid', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-UI108-6-3')::uuid, lid, 'youtube', 'Dark Patterns in UI Design', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-7-1')::uuid, lid, 'youtube', 'Mobile UI Design Guide', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-UI108-7-2')::uuid, lid, 'youtube', 'Touch Target Sizes', 'https://www.youtube.com/watch?v=3f31oufqFSM', 2),
    (md5('aorthar-r-UI108-7-3')::uuid, lid, 'youtube', 'iOS vs Android Design Guidelines', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UI108-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UI108-8-1')::uuid, lid, 'youtube', 'Building a Design System', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-UI108-8-2')::uuid, lid, 'youtube', 'Component-Based UI Design', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-UI108-8-3')::uuid, lid, 'youtube', 'Design Tokens Explained', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-UI108-01')::uuid, cid, 'multiple_choice', 'Affordance in UI design refers to:',
     '[{"id":"a","text":"The colour of a button","is_correct":false},{"id":"b","text":"A design property that signals to the user how an element can be interacted with","is_correct":true},{"id":"c","text":"The financial cost of a design","is_correct":false},{"id":"d","text":"The loading speed of a page","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UI108-02')::uuid, cid, 'multiple_choice', 'Which of the following is an example of a destructive action that needs extra confirmation?',
     '[{"id":"a","text":"Saving a file","is_correct":false},{"id":"b","text":"Deleting an account permanently","is_correct":true},{"id":"c","text":"Adding to a cart","is_correct":false},{"id":"d","text":"Logging in","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UI108-03')::uuid, cid, 'multiple_choice', 'A "CTA" in UI design stands for:',
     '[{"id":"a","text":"Colour, Type and Alignment","is_correct":false},{"id":"b","text":"Call to Action","is_correct":true},{"id":"c","text":"Component Type Architecture","is_correct":false},{"id":"d",text":"Click Through Analytics","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UI108-04')::uuid, cid, 'multiple_choice', 'The minimum recommended touch target size for mobile buttons according to Google Material Design is:',
     '[{"id":"a","text":"24×24 dp","is_correct":false},{"id":"b","text":"48×48 dp","is_correct":true},{"id":"c","text":"72×72 dp","is_correct":false},{"id":"d","text":"16×16 dp","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-UI108-05')::uuid, cid, 'multiple_choice', 'An "empty state" in UI design refers to:',
     '[{"id":"a","text":"A blank page with no design","is_correct":false},{"id":"b","text":"The screen state when there is no content to display, e.g. an empty inbox","is_correct":true},{"id":"c","text":"An error page","is_correct":false},{"id":"d",text":"A loading placeholder","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-06')::uuid, cid, 'multiple_choice', 'A "dark pattern" in UI design is:',
     '[{"id":"a","text":"A dark-themed colour scheme","is_correct":false},{"id":"b","text":"A design trick that manipulates users into actions they did not intend","is_correct":true},{"id":"c","text":"A contrast-heavy design","is_correct":false},{"id":"d","text":"A night mode feature","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-07')::uuid, cid, 'multiple_choice', 'Consistency in UI design is important because:',
     '[{"id":"a","text":"It makes the designer''s job easier","is_correct":false},{"id":"b","text":"It reduces the user''s cognitive load and builds predictability","is_correct":true},{"id":"c","text":"It reduces the number of screens needed","is_correct":false},{"id":"d","text":"It improves server performance","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UI108-08')::uuid, cid, 'multiple_choice', 'Which navigation pattern is most common for mobile apps with 3–5 primary sections?',
     '[{"id":"a","text":"Sidebar/drawer navigation","is_correct":false},{"id":"b","text":"Tab bar navigation","is_correct":true},{"id":"c","text":"Hamburger menu","is_correct":false},{"id":"d","text":"Full-screen menu","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-09')::uuid, cid, 'multiple_choice', 'What is the primary purpose of inline validation in form design?',
     '[{"id":"a","text":"To display the form instructions","is_correct":false},{"id":"b","text":"To provide real-time feedback on field input as the user types","is_correct":true},{"id":"c","text":"To auto-fill form fields","is_correct":false},{"id":"d",text":"To reduce the number of form fields","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-10')::uuid, cid, 'multiple_choice', 'Design tokens are:',
     '[{"id":"a","text":"Cryptocurrency used to buy design assets","is_correct":false},{"id":"b","text":"Named variables storing design values like colours, spacing and typography for use across a system","is_correct":true},{"id":"c","text":"UI components in a design system","is_correct":false},{"id":"d","text":"Authentication tokens for design tools","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-11')::uuid, cid, 'multiple_choice', 'Progressive disclosure in UI means:',
     '[{"id":"a","text":"Showing all information at once","is_correct":false},{"id":"b","text":"Revealing information gradually to avoid overwhelming the user","is_correct":true},{"id":"c","text":"A loading animation technique","is_correct":false},{"id":"d","text":"Disclosing privacy information","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-12')::uuid, cid, 'multiple_choice', 'The "Fitts''s Law" in UI design states that:',
     '[{"id":"a","text":"Buttons should always be blue","is_correct":false},{"id":"b","text":"The time to reach a target depends on the distance to and size of the target","is_correct":true},{"id":"c","text":"All elements must fit in a grid","is_correct":false},{"id":"d","text":"Navigation should have exactly 5 items","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-UI108-13')::uuid, cid, 'multiple_choice', 'What does a breadcrumb navigation component show?',
     '[{"id":"a","text":"The user''s login history","is_correct":false},{"id":"b","text":"The user''s current location within the site hierarchy","is_correct":true},{"id":"c","text":"A food ordering navigation pattern","is_correct":false},{"id":"d",text":"A history of user actions","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-14')::uuid, cid, 'multiple_choice', 'When should a designer use a modal dialog?',
     '[{"id":"a","text":"For all navigation","is_correct":false},{"id":"b","text":"For focused tasks or critical confirmations that require user attention before continuing","is_correct":true},{"id":"c","text":"To display long-form content","is_correct":false},{"id":"d","text":"To replace the main navigation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-15')::uuid, cid, 'multiple_choice', 'The "hamburger menu" icon (☰) is a:',
     '[{"id":"a","text":"Food icon used in restaurant apps","is_correct":false},{"id":"b","text":"Navigation control that hides a menu behind an icon to save screen space","is_correct":true},{"id":"c","text":"A deprecated icon no longer used","is_correct":false},{"id":"d","text":"A settings control","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UI108-16')::uuid, cid, 'multiple_choice', 'Which state of a button indicates it cannot be clicked?',
     '[{"id":"a","text":"Hover state","is_correct":false},{"id":"b","text":"Disabled state","is_correct":true},{"id":"c","text":"Focus state","is_correct":false},{"id":"d","text":"Active state","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UI108-17')::uuid, cid, 'multiple_choice', 'Skeleton screens are used in UI to:',
     '[{"id":"a","text":"Show bone anatomy diagrams","is_correct":false},{"id":"b","text":"Display placeholder content while actual content loads","is_correct":true},{"id":"c",text":"Create dark mode layouts","is_correct":false},{"id":"d","text":"Show error states","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-18')::uuid, cid, 'multiple_choice', 'Which principle suggests that fewer choices lead to faster, easier decisions?',
     '[{"id":"a","text":"Fitts''s Law","is_correct":false},{"id":"b","text":"Hick''s Law","is_correct":true},{"id":"c","text":"Miller''s Law","is_correct":false},{"id":"d","text":"Jakob''s Law","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-UI108-19')::uuid, cid, 'multiple_choice', 'What is the purpose of a "focus state" on interactive elements?',
     '[{"id":"a","text":"To indicate the element is loading","is_correct":false},{"id":"b","text":"To show keyboard users which element is currently selected","is_correct":true},{"id":"c","text":"To make the element appear selected permanently","is_correct":false},{"id":"d",text":"To apply a hover style","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UI108-20')::uuid, cid, 'multiple_choice', 'A component-based design system benefits teams because:',
     '[{"id":"a","text":"It forces teams to use only one design tool","is_correct":false},{"id":"b","text":"It ensures consistency, reduces duplication, and speeds up design and development","is_correct":true},{"id":"c","text":"It replaces the need for user research","is_correct":false},{"id":"d","text":"It is required by law","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── JSC109 JavaScript for Designers ─────────────────────────────────
  cid := md5('aorthar-course-JSC109')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'JSC109', 'JavaScript for Designers',
     'A designer-focused introduction to JavaScript. Students learn DOM manipulation, event handling, animations and basic interactivity to bridge communication with developers and prototype interactions.',
     y100, y100s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-JSC109-1')::uuid, cid, 'What is JavaScript and Why Designers Need It', 1, true),
    (md5('aorthar-l-JSC109-2')::uuid, cid, 'Variables, Data Types and Functions', 2, true),
    (md5('aorthar-l-JSC109-3')::uuid, cid, 'The DOM — Document Object Model', 3, true),
    (md5('aorthar-l-JSC109-4')::uuid, cid, 'Events and User Interactions', 4, true),
    (md5('aorthar-l-JSC109-5')::uuid, cid, 'CSS Animations with JavaScript', 5, true),
    (md5('aorthar-l-JSC109-6')::uuid, cid, 'Working with APIs and JSON', 6, true),
    (md5('aorthar-l-JSC109-7')::uuid, cid, 'Building Interactive Prototypes with JS', 7, true),
    (md5('aorthar-l-JSC109-8')::uuid, cid, 'JavaScript Frameworks Overview for Designers', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-1-1')::uuid, lid, 'youtube', 'JavaScript for Beginners', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 1),
    (md5('aorthar-r-JSC109-1-2')::uuid, lid, 'youtube', 'Why Designers Should Learn JavaScript', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 2),
    (md5('aorthar-r-JSC109-1-3')::uuid, lid, 'youtube', 'JavaScript Basics Tutorial', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-2-1')::uuid, lid, 'youtube', 'JavaScript Variables and Data Types', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 1),
    (md5('aorthar-r-JSC109-2-2')::uuid, lid, 'youtube', 'JavaScript Functions Explained', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 2),
    (md5('aorthar-r-JSC109-2-3')::uuid, lid, 'youtube', 'JS Basics Full Course', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-3-1')::uuid, lid, 'youtube', 'DOM Manipulation Tutorial', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 1),
    (md5('aorthar-r-JSC109-3-2')::uuid, lid, 'youtube', 'JavaScript DOM for Beginners', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 2),
    (md5('aorthar-r-JSC109-3-3')::uuid, lid, 'youtube', 'Selecting and Modifying DOM Elements', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-4-1')::uuid, lid, 'youtube', 'JavaScript Events Tutorial', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 1),
    (md5('aorthar-r-JSC109-4-2')::uuid, lid, 'youtube', 'Event Listeners Explained', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 2),
    (md5('aorthar-r-JSC109-4-3')::uuid, lid, 'youtube', 'Click Events and User Interaction', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-5-1')::uuid, lid, 'youtube', 'CSS Animations with JavaScript', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 1),
    (md5('aorthar-r-JSC109-5-2')::uuid, lid, 'youtube', 'JavaScript Animation Tutorial', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 2),
    (md5('aorthar-r-JSC109-5-3')::uuid, lid, 'youtube', 'Microinteractions with JS and CSS', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-6-1')::uuid, lid, 'youtube', 'Working with APIs in JavaScript', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 1),
    (md5('aorthar-r-JSC109-6-2')::uuid, lid, 'youtube', 'JSON Explained for Designers', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 2),
    (md5('aorthar-r-JSC109-6-3')::uuid, lid, 'youtube', 'Fetch API Tutorial', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-7-1')::uuid, lid, 'youtube', 'Interactive Prototypes with JavaScript', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 1),
    (md5('aorthar-r-JSC109-7-2')::uuid, lid, 'youtube', 'Building UI Interactions with JS', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 2),
    (md5('aorthar-r-JSC109-7-3')::uuid, lid, 'youtube', 'CodePen Projects for Designers', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-JSC109-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-JSC109-8-1')::uuid, lid, 'youtube', 'React for Designers Overview', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 1),
    (md5('aorthar-r-JSC109-8-2')::uuid, lid, 'youtube', 'JavaScript Frameworks Explained', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 2),
    (md5('aorthar-r-JSC109-8-3')::uuid, lid, 'youtube', 'Vue.js for Beginners', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-JSC109-01')::uuid, cid, 'multiple_choice', 'In JavaScript, which keyword declares a variable that cannot be reassigned?',
     '[{"id":"a","text":"var","is_correct":false},{"id":"b","text":"let","is_correct":false},{"id":"c","text":"const","is_correct":true},{"id":"d","text":"static","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-02')::uuid, cid, 'multiple_choice', 'What does DOM stand for?',
     '[{"id":"a","text":"Design Object Model","is_correct":false},{"id":"b","text":"Document Object Model","is_correct":true},{"id":"c","text":"Data Object Management","is_correct":false},{"id":"d","text":"Document Orientation Mapping","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-03')::uuid, cid, 'multiple_choice', 'Which method selects an HTML element by its id in JavaScript?',
     '[{"id":"a","text":"document.getElementsByName()","is_correct":false},{"id":"b","text":"document.getElementById()","is_correct":true},{"id":"c","text":"document.querySelector(''div'')","is_correct":false},{"id":"d","text":"document.selectById()","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-04')::uuid, cid, 'multiple_choice', 'What is JSON?',
     '[{"id":"a","text":"JavaScript Object Notation — a lightweight data format","is_correct":true},{"id":"b","text":"A JavaScript framework","is_correct":false},{"id":"c","text":"A CSS property","is_correct":false},{"id":"d","text":"A type of database","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-05')::uuid, cid, 'multiple_choice', 'Which event fires when a user clicks an element?',
     '[{"id":"a","text":"onhover","is_correct":false},{"id":"b","text":"onclick","is_correct":true},{"id":"c","text":"onselect","is_correct":false},{"id":"d","text":"onpress","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-06')::uuid, cid, 'multiple_choice', 'What does the "addEventListener" method do?',
     '[{"id":"a","text":"Adds a new DOM element to the page","is_correct":false},{"id":"b","text":"Attaches an event handler to a DOM element","is_correct":true},{"id":"c","text":"Removes an element from the DOM","is_correct":false},{"id":"d","text":"Fetches data from a server","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-07')::uuid, cid, 'multiple_choice', 'Which CSS property can be animated using JavaScript to create transitions?',
     '[{"id":"a","text":"font-family","is_correct":false},{"id":"b","text":"opacity and transform","is_correct":true},{"id":"c","text":"z-index only","is_correct":false},{"id":"d","text":"display","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-08')::uuid, cid, 'multiple_choice', 'The Fetch API is used in JavaScript to:',
     '[{"id":"a","text":"Download images","is_correct":false},{"id":"b","text":"Make HTTP requests to APIs","is_correct":true},{"id":"c","text":"Fetch DOM elements","is_correct":false},{"id":"d","text":"Run CSS animations","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-09')::uuid, cid, 'multiple_choice', 'In JavaScript, a function is:',
     '[{"id":"a","text":"A stored CSS style","is_correct":false},{"id":"b","text":"A reusable block of code that performs a specific task","is_correct":true},{"id":"c","text":"An HTML element","is_correct":false},{"id":"d","text":"A database record","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-10')::uuid, cid, 'multiple_choice', 'Which of the following is a valid JavaScript data type?',
     '[{"id":"a","text":"colour","is_correct":false},{"id":"b","text":"string","is_correct":true},{"id":"c","text":"element","is_correct":false},{"id":"d","text":"selector","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-11')::uuid, cid, 'multiple_choice', 'What does "classList.toggle()" do in JavaScript?',
     '[{"id":"a","text":"Changes the font class","is_correct":false},{"id":"b","text":"Adds a class if absent, removes it if present on a DOM element","is_correct":true},{"id":"c","text":"Lists all CSS classes","is_correct":false},{"id":"d","text":"Toggles the visibility of an element","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-12')::uuid, cid, 'multiple_choice', 'React is best described as:',
     '[{"id":"a","text":"A CSS framework","is_correct":false},{"id":"b","text":"A JavaScript library for building user interfaces using components","is_correct":true},{"id":"c","text":"A design tool","is_correct":false},{"id":"d","text":"A back-end database framework","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-13')::uuid, cid, 'multiple_choice', 'Understanding JavaScript helps designers because:',
     '[{"id":"a","text":"Designers must build the full product","is_correct":false},{"id":"b","text":"It improves communication with developers and enables more realistic prototyping","is_correct":true},{"id":"c","text":"It replaces the need for design tools","is_correct":false},{"id":"d","text":"JavaScript is required to use Figma","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-14')::uuid, cid, 'multiple_choice', 'What is an event listener callback?',
     '[{"id":"a","text":"A function that runs when a user calls customer support","is_correct":false},{"id":"b","text":"A function that executes in response to a specific event like a click","is_correct":true},{"id":"c","text":"A CSS class applied on hover","is_correct":false},{"id":"d","text":"A delayed animation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-15')::uuid, cid, 'multiple_choice', 'Which method adds an HTML element to the DOM?',
     '[{"id":"a","text":"document.insert()","is_correct":false},{"id":"b","text":"element.appendChild()","is_correct":true},{"id":"c","text":"document.addElement()","is_correct":false},{"id":"d","text":"element.push()","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-16')::uuid, cid, 'multiple_choice', 'A "promise" in JavaScript is:',
     '[{"id":"a","text":"A guarantee that code will not have errors","is_correct":false},{"id":"b","text":"An object representing the eventual completion or failure of an asynchronous operation","is_correct":true},{"id":"c","text":"A type of variable","is_correct":false},{"id":"d","text":"A conditional statement","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-JSC109-17')::uuid, cid, 'multiple_choice', 'The "innerHTML" property in JavaScript allows you to:',
     '[{"id":"a","text":"Get the inner HTML of a variable","is_correct":false},{"id":"b","text":"Get or set the HTML content inside a DOM element","is_correct":true},{"id":"c","text":"Create a new HTML file","is_correct":false},{"id":"d","text":"Add CSS styles","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-JSC109-18')::uuid, cid, 'multiple_choice', 'CSS transitions differ from JavaScript animations in that:',
     '[{"id":"a","text":"CSS transitions are never smooth","is_correct":false},{"id":"b","text":"CSS transitions handle simple state changes while JavaScript offers more complex, programmable control","is_correct":true},{"id":"c","text":"JavaScript animations are always better","is_correct":false},{"id":"d",text":"They are identical in functionality","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-JSC109-19')::uuid, cid, 'multiple_choice', 'An array in JavaScript is:',
     '[{"id":"a","text":"A type of CSS layout","is_correct":false},{"id":"b","text":"An ordered collection of values stored in a single variable","is_correct":true},{"id":"c","text":"A visual grid system","is_correct":false},{"id":"d","text":"A server response","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-JSC109-20')::uuid, cid, 'multiple_choice', 'Which JavaScript method can be used to cycle through items in an array?',
     '[{"id":"a","text":"array.map() or array.forEach()","is_correct":true},{"id":"b","text":"array.click()","is_correct":false},{"id":"c","text":"array.render()","is_correct":false},{"id":"d","text":"array.display()","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── PSY110 Design Psychology and Cognitive Science ───────────────────
  cid := md5('aorthar-course-PSY110')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'PSY110', 'Design Psychology and Cognitive Science',
     'Explores how human psychology and cognitive science inform great design. Covers mental models, cognitive load, persuasive design, emotional design and behavioural patterns.',
     y100, y100s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-PSY110-1')::uuid, cid, 'Human Perception and Cognitive Science Basics', 1, true),
    (md5('aorthar-l-PSY110-2')::uuid, cid, 'Mental Models in Design', 2, true),
    (md5('aorthar-l-PSY110-3')::uuid, cid, 'Cognitive Load Theory', 3, true),
    (md5('aorthar-l-PSY110-4')::uuid, cid, 'Attention, Memory and Decision Making', 4, true),
    (md5('aorthar-l-PSY110-5')::uuid, cid, 'Emotional Design and Visceral Reactions', 5, true),
    (md5('aorthar-l-PSY110-6')::uuid, cid, 'Persuasive Design and Behavioural Patterns', 6, true),
    (md5('aorthar-l-PSY110-7')::uuid, cid, 'Habit-Forming Products — The Hook Model', 7, true),
    (md5('aorthar-l-PSY110-8')::uuid, cid, 'Ethical Considerations in Persuasive Design', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-1-1')::uuid, lid, 'youtube', 'Cognitive Science for Designers', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-PSY110-1-2')::uuid, lid, 'youtube', 'How Humans Perceive Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-PSY110-1-3')::uuid, lid, 'youtube', 'Psychology of Design', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-2-1')::uuid, lid, 'youtube', 'Mental Models in UX', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-PSY110-2-2')::uuid, lid, 'youtube', 'User Mental Models Explained', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-PSY110-2-3')::uuid, lid, 'youtube', 'Designing for User Expectations', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-3-1')::uuid, lid, 'youtube', 'Cognitive Load in UX Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-PSY110-3-2')::uuid, lid, 'youtube', 'Reducing Cognitive Load', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-PSY110-3-3')::uuid, lid, 'youtube', 'Information Overload in Design', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-4-1')::uuid, lid, 'youtube', 'Attention and Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-PSY110-4-2')::uuid, lid, 'youtube', 'Memory and UX Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-PSY110-4-3')::uuid, lid, 'youtube', 'Decision Making and Choice Architecture', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-5-1')::uuid, lid, 'youtube', 'Emotional Design by Don Norman', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 1),
    (md5('aorthar-r-PSY110-5-2')::uuid, lid, 'youtube', 'The Three Levels of Emotional Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 2),
    (md5('aorthar-r-PSY110-5-3')::uuid, lid, 'youtube', 'Delight in Design', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-6-1')::uuid, lid, 'youtube', 'Persuasive Design Techniques', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-PSY110-6-2')::uuid, lid, 'youtube', 'Cialdini Principles of Influence in Design', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 2),
    (md5('aorthar-r-PSY110-6-3')::uuid, lid, 'youtube', 'Social Proof in UI Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-7-1')::uuid, lid, 'youtube', 'The Hook Model Explained', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-PSY110-7-2')::uuid, lid, 'youtube', 'Habit-Forming Product Design', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 2),
    (md5('aorthar-r-PSY110-7-3')::uuid, lid, 'youtube', 'Variable Reward in UX Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PSY110-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PSY110-8-1')::uuid, lid, 'youtube', 'Ethics in Persuasive Design', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-PSY110-8-2')::uuid, lid, 'youtube', 'Dark Patterns vs Persuasive Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-PSY110-8-3')::uuid, lid, 'youtube', 'Responsible Design Principles', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-PSY110-01')::uuid, cid, 'multiple_choice', 'Cognitive load theory was developed by:',
     '[{"id":"a","text":"Don Norman","is_correct":false},{"id":"b","text":"John Sweller","is_correct":true},{"id":"c","text":"Jakob Nielsen","is_correct":false},{"id":"d","text":"B.F. Skinner","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PSY110-02')::uuid, cid, 'multiple_choice', 'A mental model in UX refers to:',
     '[{"id":"a","text":"A 3D model of a product","is_correct":false},{"id":"b","text":"The user''s internal representation of how a system works","is_correct":true},{"id":"c","text":"A wireframe of the product","is_correct":false},{"id":"d","text":"The designer''s creative vision","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PSY110-03')::uuid, cid, 'multiple_choice', 'Intrinsic cognitive load refers to:',
     '[{"id":"a","text":"Load caused by poor design","is_correct":false},{"id":"b","text":"The inherent difficulty of the task itself","is_correct":true},{"id":"c","text":"Unnecessary complexity added by the interface","is_correct":false},{"id":"d",text":"Information stored in long-term memory","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PSY110-04')::uuid, cid, 'multiple_choice', 'Don Norman''s three levels of emotional design are:',
     '[{"id":"a","text":"Visual, Functional, Emotional","is_correct":false},{"id":"b","text":"Visceral, Behavioural, Reflective","is_correct":true},{"id":"c","text":"Simple, Complex, Abstract","is_correct":false},{"id":"d","text":"Red, Blue, Green","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-05')::uuid, cid, 'multiple_choice', 'Miller''s Law states that humans can hold approximately how many items in working memory?',
     '[{"id":"a","text":"3 ± 1","is_correct":false},{"id":"b","text":"7 ± 2","is_correct":true},{"id":"c","text":"12 ± 3","is_correct":false},{"id":"d","text":"5 ± 5","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-06')::uuid, cid, 'multiple_choice', 'The Hooked Model by Nir Eyal consists of which four phases?',
     '[{"id":"a","text":"Design, Test, Build, Launch","is_correct":false},{"id":"b","text":"Trigger, Action, Variable Reward, Investment","is_correct":true},{"id":"c","text":"Empathize, Define, Ideate, Prototype","is_correct":false},{"id":"d","text":"Discover, Define, Develop, Deliver","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-07')::uuid, cid, 'multiple_choice', 'Social proof in design leverages:',
     '[{"id":"a","text":"Users'' fear of missing out on features","is_correct":false},{"id":"b","text":"The tendency to follow the actions and decisions of others","is_correct":true},{"id":"c","text":"Colour psychology","is_correct":false},{"id":"d","text":"The use of familiar icons","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-08')::uuid, cid, 'multiple_choice', 'The "peak-end rule" in psychology suggests that users judge an experience based on:',
     '[{"id":"a","text":"The average of all moments","is_correct":false},{"id":"b","text":"The most intense moment and how it ended","is_correct":true},{"id":"c","text":"The first interaction only","is_correct":false},{"id":"d","text":"The duration of the experience","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PSY110-09')::uuid, cid, 'multiple_choice', 'Extraneous cognitive load in a UI is caused by:',
     '[{"id":"a","text":"The difficulty of the task itself","is_correct":false},{"id":"b","text":"Poor design that adds unnecessary mental effort","is_correct":true},{"id":"c","text":"The user''s experience level","is_correct":false},{"id":"d",text":"Slow internet connections","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-10')::uuid, cid, 'multiple_choice', 'Choice architecture refers to:',
     '[{"id":"a","text":"The visual layout of navigation menus","is_correct":false},{"id":"b","text":"The way choices are presented to influence user decisions","is_correct":true},{"id":"c","text":"A framework for building design systems","is_correct":false},{"id":"d","text":"The architecture of a website","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-11')::uuid, cid, 'multiple_choice', 'A "nudge" in behavioural design is:',
     '[{"id":"a","text":"An annoying push notification","is_correct":false},{"id":"b","text":"A subtle design choice that steers users toward a desired behaviour without restricting options","is_correct":true},{"id":"c","text":"A forced action in a user flow","is_correct":false},{"id":"d","text":"An animation that draws attention","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-12')::uuid, cid, 'multiple_choice', 'The "scarcity" principle in persuasive design works because:',
     '[{"id":"a","text":"Users prefer simple interfaces","is_correct":false},{"id":"b","text":"People value things more when they perceive them as rare or limited","is_correct":true},{"id":"c",text":"Users dislike paying for things","is_correct":false},{"id":"d","text":"Less colour equals higher sales","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-13')::uuid, cid, 'multiple_choice', 'Visceral design (from Don Norman''s model) refers to:',
     '[{"id":"a","text":"Internal organ-shaped product design","is_correct":false},{"id":"b","text":"Immediate aesthetic and sensory reactions to a design","is_correct":true},{"id":"c","text":"Long-term brand associations","is_correct":false},{"id":"d","text":"The usability of a product","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-14')::uuid, cid, 'multiple_choice', 'The "serial position effect" in memory means users best remember:',
     '[{"id":"a","text":"Information in the middle of a list","is_correct":false},{"id":"b","text":"The first and last items in a list","is_correct":true},{"id":"c","text":"Only images, not text","is_correct":false},{"id":"d","text":"Coloured items over plain text","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PSY110-15')::uuid, cid, 'multiple_choice', 'Reciprocity as a persuasion principle means:',
     '[{"id":"a","text":"Matching colours with complementary colours","is_correct":false},{"id":"b","text":"People feel obligated to return a favour when given something first","is_correct":true},{"id":"c","text":"Copying competitor features","is_correct":false},{"id":"d","text":"Offering refunds to unhappy users","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-16')::uuid, cid, 'multiple_choice', 'Attention blink in perception means:',
     '[{"id":"a","text":"Users blink and miss content","is_correct":false},{"id":"b","text":"After detecting one stimulus, the brain briefly cannot detect another in rapid succession","is_correct":true},{"id":"c",text":"Animations that attract eye movement","is_correct":false},{"id":"d","text":"Flashing content that violates accessibility","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PSY110-17')::uuid, cid, 'multiple_choice', 'The concept of "flow state" in design relates to:',
     '[{"id":"a","text":"The flow of a navigation diagram","is_correct":false},{"id":"b","text":"Deep engagement where users are fully immersed in an activity without frustration","is_correct":true},{"id":"c","text":"CSS flexbox layout flow","is_correct":false},{"id":"d","text":"Information flow between APIs","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PSY110-18')::uuid, cid, 'multiple_choice', 'Dark patterns differ from persuasive design because:',
     '[{"id":"a","text":"They use different colours","is_correct":false},{"id":"b","text":"Dark patterns exploit psychology to benefit the business at the user''s expense","is_correct":true},{"id":"c","text":"Persuasive design is illegal","is_correct":false},{"id":"d",text":"They are the same thing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PSY110-19')::uuid, cid, 'multiple_choice', 'Variable rewards in the Hook Model are effective because:',
     '[{"id":"a","text":"Users always know what reward they will receive","is_correct":false},{"id":"b","text":"Unpredictability activates the brain''s reward system more powerfully than fixed rewards","is_correct":true},{"id":"c","text":"They reduce the cost of the product","is_correct":false},{"id":"d","text":"They are required by app stores","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PSY110-20')::uuid, cid, 'multiple_choice', 'The primary ethical obligation of a designer using persuasive techniques is to:',
     '[{"id":"a","text":"Maximise conversion rates","is_correct":false},{"id":"b","text":"Ensure techniques align user and business goals without exploiting user psychology","is_correct":true},{"id":"c","text":"Follow competitor practices","is_correct":false},{"id":"d","text":"Only use techniques approved by the CEO","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 200 · SEMESTER 1
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── UXR201 UX Research Methods ──────────────────────────────────────
  cid := md5('aorthar-course-UXR201')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'UXR201', 'UX Research Methods',
     'Advanced UX research covering planning, recruiting, running and analysing studies. Includes usability testing, surveys, contextual inquiry, diary studies and synthesising findings into actionable insights.',
     y200, y200s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-UXR201-1')::uuid, cid, 'Research Planning and Research Questions', 1, true),
    (md5('aorthar-l-UXR201-2')::uuid, cid, 'Recruiting and Screening Participants', 2, true),
    (md5('aorthar-l-UXR201-3')::uuid, cid, 'Conducting User Interviews', 3, true),
    (md5('aorthar-l-UXR201-4')::uuid, cid, 'Usability Testing Methods', 4, true),
    (md5('aorthar-l-UXR201-5')::uuid, cid, 'Surveys and Quantitative Research', 5, true),
    (md5('aorthar-l-UXR201-6')::uuid, cid, 'Contextual Inquiry and Field Research', 6, true),
    (md5('aorthar-l-UXR201-7')::uuid, cid, 'Analysing and Synthesising Research Data', 7, true),
    (md5('aorthar-l-UXR201-8')::uuid, cid, 'Presenting Research Findings to Stakeholders', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-1-1')::uuid, lid, 'youtube', 'UX Research Planning Guide', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-UXR201-1-2')::uuid, lid, 'youtube', 'Writing Research Questions', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-UXR201-1-3')::uuid, lid, 'youtube', 'UX Research Methods Overview', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-2-1')::uuid, lid, 'youtube', 'Recruiting Research Participants', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-UXR201-2-2')::uuid, lid, 'youtube', 'Writing Screener Questions', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-UXR201-2-3')::uuid, lid, 'youtube', 'Sample Size for UX Research', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-3-1')::uuid, lid, 'youtube', 'How to Conduct User Interviews', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-UXR201-3-2')::uuid, lid, 'youtube', 'Interview Questions That Work', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-UXR201-3-3')::uuid, lid, 'youtube', 'Active Listening in Research', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-4-1')::uuid, lid, 'youtube', 'Usability Testing Guide', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-UXR201-4-2')::uuid, lid, 'youtube', 'Remote vs In-Person Testing', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-UXR201-4-3')::uuid, lid, 'youtube', 'Think Aloud Protocol', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-5-1')::uuid, lid, 'youtube', 'UX Surveys and Questionnaires', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 1),
    (md5('aorthar-r-UXR201-5-2')::uuid, lid, 'youtube', 'NPS and CSAT Metrics', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 2),
    (md5('aorthar-r-UXR201-5-3')::uuid, lid, 'youtube', 'Analysing Survey Data', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-6-1')::uuid, lid, 'youtube', 'Contextual Inquiry Methods', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-UXR201-6-2')::uuid, lid, 'youtube', 'Field Research for UX', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-UXR201-6-3')::uuid, lid, 'youtube', 'Ethnographic Research in Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-7-1')::uuid, lid, 'youtube', 'Thematic Analysis for UX Research', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-UXR201-7-2')::uuid, lid, 'youtube', 'Affinity Diagramming Workshop', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-UXR201-7-3')::uuid, lid, 'youtube', 'Turning Research into Insights', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-UXR201-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-UXR201-8-1')::uuid, lid, 'youtube', 'Presenting UX Research', 'https://www.youtube.com/watch?v=rgeN2SWr6Ms', 1),
    (md5('aorthar-r-UXR201-8-2')::uuid, lid, 'youtube', 'Research Reports for Stakeholders', 'https://www.youtube.com/watch?v=Bn2s58JjIjA', 2),
    (md5('aorthar-r-UXR201-8-3')::uuid, lid, 'youtube', 'Storytelling with Research Data', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-UXR201-01')::uuid, cid, 'multiple_choice', 'What is the primary purpose of a research screener?',
     '[{"id":"a","text":"To test the prototype","is_correct":false},{"id":"b","text":"To ensure recruited participants match the target user profile","is_correct":true},{"id":"c","text":"To screen competitor products","is_correct":false},{"id":"d","text":"To evaluate the design","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-02')::uuid, cid, 'multiple_choice', 'Nielsen''s rule of thumb suggests that how many users are needed to uncover most usability issues?',
     '[{"id":"a","text":"3","is_correct":false},{"id":"b","text":"5","is_correct":true},{"id":"c","text":"15","is_correct":false},{"id":"d","text":"30","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-03')::uuid, cid, 'multiple_choice', 'The "think aloud" protocol asks participants to:',
     '[{"id":"a","text":"Think silently while performing tasks","is_correct":false},{"id":"b","text":"Verbalise their thoughts while interacting with a product","is_correct":true},{"id":"c","text":"Think of improvements after the session","is_correct":false},{"id":"d","text":"Rate the design aloud on a scale","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXR201-04')::uuid, cid, 'multiple_choice', 'A leading question in a user interview is problematic because:',
     '[{"id":"a","text":"It takes too long to answer","is_correct":false},{"id":"b","text":"It suggests a specific answer and biases the participant''s response","is_correct":true},{"id":"c",text":"It generates too much data","is_correct":false},{"id":"d","text":"It is too open-ended","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-05')::uuid, cid, 'multiple_choice', 'Moderated usability testing involves:',
     '[{"id":"a","text":"An automated tool running the session","is_correct":false},{"id":"b","text":"A researcher guiding the session and observing in real-time","is_correct":true},{"id":"c","text":"Participants completing tasks without any guidance","is_correct":false},{"id":"d","text":"A group of participants testing simultaneously","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-06')::uuid, cid, 'multiple_choice', 'NPS (Net Promoter Score) measures:',
     '[{"id":"a","text":"The net profit of a product","is_correct":false},{"id":"b","text":"How likely users are to recommend a product to others","is_correct":true},{"id":"c","text":"Navigation performance speed","is_correct":false},{"id":"d","text":"The number of new users","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-07')::uuid, cid, 'multiple_choice', 'Contextual inquiry is a research method where:',
     '[{"id":"a","text":"Participants complete tasks in a lab environment","is_correct":false},{"id":"b","text":"Researchers observe users in their natural environment while they work","is_correct":true},{"id":"c",text":"Researchers conduct phone interviews","is_correct":false},{"id":"d","text":"Participants fill out surveys","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-08')::uuid, cid, 'multiple_choice', 'Thematic analysis in qualitative research involves:',
     '[{"id":"a","text":"Creating visual themes for the UI","is_correct":false},{"id":"b","text":"Identifying patterns and themes across research data","is_correct":true},{"id":"c","text":"Analysing data statistically","is_correct":false},{"id":"d","text":"Comparing brand themes","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-09')::uuid, cid, 'multiple_choice', 'A diary study asks participants to:',
     '[{"id":"a","text":"Write a journal about their life","is_correct":false},{"id":"b","text":"Log their interactions with a product over time in their natural context","is_correct":true},{"id":"c",text":"Complete tasks in a single session","is_correct":false},{"id":"d","text":"Review a competitor''s product","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-10')::uuid, cid, 'multiple_choice', 'What does "triangulation" mean in UX research?',
     '[{"id":"a","text":"Using geometric shapes in research visualisations","is_correct":false},{"id":"b","text":"Using multiple research methods to validate findings","is_correct":true},{"id":"c","text":"Analysing three data points","is_correct":false},{"id":"d","text":"Conducting three rounds of testing","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-UXR201-11')::uuid, cid, 'multiple_choice', 'An unmoderated remote usability test means:',
     '[{"id":"a","text":"The test is conducted in a laboratory","is_correct":false},{"id":"b","text":"Participants complete tasks independently using a testing tool without a moderator present","is_correct":true},{"id":"c",text":"The researcher is anonymous","is_correct":false},{"id":"d","text":"There are no tasks given to participants","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-12')::uuid, cid, 'multiple_choice', 'Generative research is best described as:',
     '[{"id":"a","text":"Research that tests a finished design","is_correct":false},{"id":"b","text":"Research done early to explore user needs, motivations and problems","is_correct":true},{"id":"c","text":"Research that generates revenue","is_correct":false},{"id":"d",text":"Research conducted by AI tools","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-13')::uuid, cid, 'multiple_choice', 'Evaluative research differs from generative research in that it:',
     '[{"id":"a","text":"Is done before any design work","is_correct":false},{"id":"b","text":"Assesses how well an existing design meets user needs","is_correct":true},{"id":"c","text":"Generates new product ideas","is_correct":false},{"id":"d","text":"Is always quantitative","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-14')::uuid, cid, 'multiple_choice', 'Participant consent in UX research is important because:',
     '[{"id":"a","text":"It speeds up the research process","is_correct":false},{"id":"b","text":"It protects participant rights and ensures ethical research conduct","is_correct":true},{"id":"c",text":"It replaces the NDA","is_correct":false},{"id":"d","text":"It is optional for remote sessions","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-UXR201-15')::uuid, cid, 'multiple_choice', 'The 5-second test in UX research measures:',
     '[{"id":"a","text":"How quickly the page loads","is_correct":false},{"id":"b","text":"What users recall about a design after seeing it for only 5 seconds","is_correct":true},{"id":"c",text":"Time on task","is_correct":false},{"id":"d","text":"The attention span of users","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-16')::uuid, cid, 'multiple_choice', 'An insight in UX research is:',
     '[{"id":"a","text":"A raw observation","is_correct":false},{"id":"b","text":"A meaningful interpretation of research data that reveals a user need, motivation or behaviour","is_correct":true},{"id":"c",text":"A feature idea","is_correct":false},{"id":"d","text":"A usability metric","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-17')::uuid, cid, 'multiple_choice', 'Closed-ended survey questions are best used for:',
     '[{"id":"a","text":"Exploring nuanced user experiences","is_correct":false},{"id":"b","text":"Collecting quantifiable data for statistical analysis","is_correct":true},{"id":"c",text":"Understanding the "why" behind behaviour","is_correct":false},{"id":"d","text":"Replacing qualitative interviews","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-18')::uuid, cid, 'multiple_choice', 'Recall bias in research refers to:',
     '[{"id":"a","text":"Participants remembering the research session","is_correct":false},{"id":"b","text":"Inaccurate recollection by participants when reporting past behaviours or experiences","is_correct":true},{"id":"c",text":"The researcher forgetting key questions","is_correct":false},{"id":"d","text":"Bias in quantitative data analysis","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-UXR201-19')::uuid, cid, 'multiple_choice', 'A research artefact such as a persona or journey map is used to:',
     '[{"id":"a","text":"Replace the need for user research","is_correct":false},{"id":"b","text":"Communicate and socialise research findings in a memorable, usable format","is_correct":true},{"id":"c",text":"Archive historical data","is_correct":false},{"id":"d","text":"Create the final visual design","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-UXR201-20')::uuid, cid, 'multiple_choice', 'When should UX research ideally start in a product development cycle?',
     '[{"id":"a","text":"After the product is launched","is_correct":false},{"id":"b","text":"As early as possible, before major design decisions are made","is_correct":true},{"id":"c",text":"Only during usability testing phases","is_correct":false},{"id":"d","text":"After engineering starts building","is_correct":false}]'::jsonb, 1, true, false, 1)
  ON CONFLICT (id) DO NOTHING;

  -- ── IXD202 Interaction Design Fundamentals ───────────────────────────
  cid := md5('aorthar-course-IXD202')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'IXD202', 'Interaction Design Fundamentals',
     'Principles and practice of interaction design. Covers user flows, state machines, input methods, feedback loops, microinteractions and designing for complex multi-step interactions.',
     y200, y200s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-IXD202-1')::uuid, cid, 'What is Interaction Design?', 1, true),
    (md5('aorthar-l-IXD202-2')::uuid, cid, 'User Flows and Task Analysis', 2, true),
    (md5('aorthar-l-IXD202-3')::uuid, cid, 'Designing States and Transitions', 3, true),
    (md5('aorthar-l-IXD202-4')::uuid, cid, 'Microinteractions — Detail Makes the Difference', 4, true),
    (md5('aorthar-l-IXD202-5')::uuid, cid, 'Input Methods — Touch, Voice and Gesture', 5, true),
    (md5('aorthar-l-IXD202-6')::uuid, cid, 'Feedback Loops and System Response', 6, true),
    (md5('aorthar-l-IXD202-7')::uuid, cid, 'Designing for Error and Recovery', 7, true),
    (md5('aorthar-l-IXD202-8')::uuid, cid, 'Multi-Step Flows and Onboarding', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-1-1')::uuid, lid, 'youtube', 'What is Interaction Design?', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-IXD202-1-2')::uuid, lid, 'youtube', 'IxD vs UX Design', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-IXD202-1-3')::uuid, lid, 'youtube', 'Goals of Interaction Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-2-1')::uuid, lid, 'youtube', 'User Flow Design Tutorial', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 1),
    (md5('aorthar-r-IXD202-2-2')::uuid, lid, 'youtube', 'Task Analysis in UX', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-IXD202-2-3')::uuid, lid, 'youtube', 'Creating User Flow Diagrams', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-3-1')::uuid, lid, 'youtube', 'Designing UI States', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-IXD202-3-2')::uuid, lid, 'youtube', 'State Machines in UI Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-IXD202-3-3')::uuid, lid, 'youtube', 'Transitions in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-4-1')::uuid, lid, 'youtube', 'Microinteractions Explained', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 1),
    (md5('aorthar-r-IXD202-4-2')::uuid, lid, 'youtube', 'Designing Microinteractions', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 2),
    (md5('aorthar-r-IXD202-4-3')::uuid, lid, 'youtube', 'Animation Principles for UI', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-5-1')::uuid, lid, 'youtube', 'Designing for Touch Input', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-IXD202-5-2')::uuid, lid, 'youtube', 'Voice UI Design Principles', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 2),
    (md5('aorthar-r-IXD202-5-3')::uuid, lid, 'youtube', 'Gesture-Based Navigation', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-6-1')::uuid, lid, 'youtube', 'Feedback in UI Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-IXD202-6-2')::uuid, lid, 'youtube', 'Loading States and Skeleton Screens', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-IXD202-6-3')::uuid, lid, 'youtube', 'Toast Notifications Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-7-1')::uuid, lid, 'youtube', 'Designing Error Messages', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-IXD202-7-2')::uuid, lid, 'youtube', 'Error Recovery in UX', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-IXD202-7-3')::uuid, lid, 'youtube', 'Graceful Degradation in Design', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-IXD202-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-IXD202-8-1')::uuid, lid, 'youtube', 'Onboarding UX Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-IXD202-8-2')::uuid, lid, 'youtube', 'Multi-Step Form Design', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-IXD202-8-3')::uuid, lid, 'youtube', 'Progress Indicators in UX', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-IXD202-01')::uuid, cid, 'multiple_choice', 'Interaction design primarily focuses on:',
     '[{"id":"a","text":"The visual appearance of a product","is_correct":false},{"id":"b","text":"Designing how users interact with a product over time","is_correct":true},{"id":"c","text":"Database architecture","is_correct":false},{"id":"d","text":"Marketing copy","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-IXD202-02')::uuid, cid, 'multiple_choice', 'A microinteraction is defined as:',
     '[{"id":"a","text":"A very small design file","is_correct":false},{"id":"b","text":"A contained product moment that accomplishes a single task","is_correct":true},{"id":"c",text":"An animation library","is_correct":false},{"id":"d","text":"A minimal viable product","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-IXD202-03')::uuid, cid, 'multiple_choice', 'A user flow diagram shows:',
     '[{"id":"a","text":"The visual style of a product","is_correct":false},{"id":"b","text":"The sequence of steps a user takes to complete a specific task","is_correct":true},{"id":"c",text":"The server architecture","is_correct":false},{"id":"d","text":"The team org chart","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-IXD202-04')::uuid, cid, 'multiple_choice', 'A state machine in interaction design models:',
     '[{"id":"a","text":"A physical machine''s operations","is_correct":false},{"id":"b","text":"All possible states of a UI element and the transitions between them","is_correct":true},{"id":"c",text":"The server state","is_correct":false},{"id":"d","text":"The design tool''s current status","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-05')::uuid, cid, 'multiple_choice', 'The four components of a microinteraction (per Dan Saffer) are:',
     '[{"id":"a","text":"Design, Test, Build, Ship","is_correct":false},{"id":"b","text":"Trigger, Rules, Feedback, Loops and Modes","is_correct":true},{"id":"c","text":"Input, Process, Output, Storage","is_correct":false},{"id":"d",text":"Start, Middle, End, Loop","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-06')::uuid, cid, 'multiple_choice', 'Touch targets on mobile should be large because:',
     '[{"id":"a","text":"They look better at larger sizes","is_correct":false},{"id":"b","text":"Fingers are less precise than a mouse cursor, requiring larger interactive areas","is_correct":true},{"id":"c",text":"Large targets are required by app stores","is_correct":false},{"id":"d","text":"Small targets are invisible","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-IXD202-07')::uuid, cid, 'multiple_choice', 'In interaction design, system feedback should be:',
     '[{"id":"a","text":"Always a pop-up modal","is_correct":false},{"id":"b","text":"Timely, clear and appropriate to the action taken","is_correct":true},{"id":"c",text":"Always audio-based","is_correct":false},{"id":"d","text":"Delayed to not interrupt the user","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-IXD202-08')::uuid, cid, 'multiple_choice', 'Error messages in good interaction design should:',
     '[{"id":"a","text":"Blame the user for the error","is_correct":false},{"id":"b","text":"Clearly describe what went wrong and how to fix it","is_correct":true},{"id":"c",text":"Use technical jargon for precision","is_correct":false},{"id":"d","text":"Only appear in console logs","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-IXD202-09')::uuid, cid, 'multiple_choice', 'Onboarding design refers to:',
     '[{"id":"a","text":"Hiring new team members","is_correct":false},{"id":"b","text":"Guiding new users to understand and get value from a product quickly","is_correct":true},{"id":"c",text":"The product launch strategy","is_correct":false},{"id":"d","text":"The first code commit","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-IXD202-10')::uuid, cid, 'multiple_choice', 'A progress indicator in a multi-step flow helps users by:',
     '[{"id":"a","text":"Making the form shorter","is_correct":false},{"id":"b","text":"Showing how many steps remain and where they are in the process","is_correct":true},{"id":"c",text":"Automatically completing steps","is_correct":false},{"id":"d","text":"Improving server performance","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-11')::uuid, cid, 'multiple_choice', 'In interaction design, "direct manipulation" refers to:',
     '[{"id":"a","text":"Coding directly without a UI","is_correct":false},{"id":"b","text":"Users interacting directly with visible objects rather than typing commands","is_correct":true},{"id":"c",text":"Manipulating database records","is_correct":false},{"id":"d","text":"A dark pattern technique","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-12')::uuid, cid, 'multiple_choice', 'The "Gulf of Evaluation" in Don Norman''s model describes:',
     '[{"id":"a","text":"The gap between what a user intends to do and the available actions","is_correct":false},{"id":"b","text":"The difficulty users have in determining whether their action achieved the desired result","is_correct":true},{"id":"c",text":"A usability evaluation method","is_correct":false},{"id":"d",text":"The gap between junior and senior designers","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-IXD202-13')::uuid, cid, 'multiple_choice', 'Optimistic UI in interaction design means:',
     '[{"id":"a","text":"Always showing a positive design","is_correct":false},{"id":"b","text":"Updating the UI immediately assuming success, rolling back if an error occurs","is_correct":true},{"id":"c",text":"A UI that only shows success states","is_correct":false},{"id":"d",text":"A design that avoids error states","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-IXD202-14')::uuid, cid, 'multiple_choice', 'The "Gulf of Execution" in design describes:',
     '[{"id":"a","text":"The gap between users understanding results and the intended goal","is_correct":false},{"id":"b","text":"The difficulty users have in figuring out how to achieve their goal using the interface","is_correct":true},{"id":"c",text":"Slow performance in production","is_correct":false},{"id":"d",text":"The execution of a design sprint","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-IXD202-15')::uuid, cid, 'multiple_choice', 'Skeleton screens improve perceived performance because:',
     '[{"id":"a","text":"They load content faster","is_correct":false},{"id":"b","text":"They give users visual feedback that content is loading, reducing perceived wait time","is_correct":true},{"id":"c",text":"They remove the need for loading","is_correct":false},{"id":"d","text":"They cache content for faster future loads","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-16')::uuid, cid, 'multiple_choice', 'In interaction design, "mapping" refers to:',
     '[{"id":"a","text":"Geographic mapping of users","is_correct":false},{"id":"b","text":"The relationship between controls and their effects in the world","is_correct":true},{"id":"c",text":"Creating wireframe maps","is_correct":false},{"id":"d",text":"URL routing in web apps","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-17')::uuid, cid, 'multiple_choice', 'Task analysis in IxD helps designers:',
     '[{"id":"a","text":"Analyse competitor tasks","is_correct":false},{"id":"b","text":"Break down user goals into specific actions needed to achieve them","is_correct":true},{"id":"c",text":"Assign tasks to developers","is_correct":false},{"id":"d","text":"Measure task completion time only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-18')::uuid, cid, 'multiple_choice', 'Haptic feedback in mobile design refers to:',
     '[{"id":"a","text":"Visual colour feedback","is_correct":false},{"id":"b","text":"Physical vibration or tactile response to user actions","is_correct":true},{"id":"c",text":"Audio feedback","is_correct":false},{"id":"d",text":"Screen brightness changes","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-IXD202-19')::uuid, cid, 'multiple_choice', 'Graceful degradation in interaction design means:',
     '[{"id":"a","text":"The product degrades in quality over time","is_correct":false},{"id":"b","text":"When a feature fails, the system still provides a usable experience","is_correct":true},{"id":"c",text":"Reducing features over time","is_correct":false},{"id":"d",text":"A slow design process","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-IXD202-20')::uuid, cid, 'multiple_choice', 'Which principle of interaction design states that systems should reduce users'' memory load?',
     '[{"id":"a","text":"Affordance","is_correct":false},{"id":"b","text":"Recognition over recall","is_correct":true},{"id":"c","text":"Consistency","is_correct":false},{"id":"d","text":"Visibility","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── PRO203 Prototyping and Wireframing ───────────────────────────────
  cid := md5('aorthar-course-PRO203')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'PRO203', 'Prototyping and Wireframing',
     'Comprehensive prototyping and wireframing skills using Figma. Covers lo-fi to hi-fi progression, interactive prototypes, clickable flows, design handoff and testing with prototypes.',
     y200, y200s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-PRO203-1')::uuid, cid, 'Wireframing Fundamentals — Sketching Ideas', 1, true),
    (md5('aorthar-l-PRO203-2')::uuid, cid, 'Low-Fidelity Wireframing in Figma', 2, true),
    (md5('aorthar-l-PRO203-3')::uuid, cid, 'Mid-Fidelity Wireframes and Layout', 3, true),
    (md5('aorthar-l-PRO203-4')::uuid, cid, 'High-Fidelity Prototype Design', 4, true),
    (md5('aorthar-l-PRO203-5')::uuid, cid, 'Figma Prototyping and Interactions', 5, true),
    (md5('aorthar-l-PRO203-6')::uuid, cid, 'Prototyping Flows and Navigation', 6, true),
    (md5('aorthar-l-PRO203-7')::uuid, cid, 'Testing Prototypes with Users', 7, true),
    (md5('aorthar-l-PRO203-8')::uuid, cid, 'Handoff — Preparing Prototypes for Development', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-1-1')::uuid, lid, 'youtube', 'Wireframing for Beginners', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 1),
    (md5('aorthar-r-PRO203-1-2')::uuid, lid, 'youtube', 'Sketching UI Ideas', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-PRO203-1-3')::uuid, lid, 'youtube', 'Paper Prototyping Tutorial', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-2-1')::uuid, lid, 'youtube', 'Lo-fi Wireframing in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-PRO203-2-2')::uuid, lid, 'youtube', 'Figma Wireframe Kit Tutorial', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-PRO203-2-3')::uuid, lid, 'youtube', 'Building Wireframes Fast', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-3-1')::uuid, lid, 'youtube', 'Mid-Fidelity Wireframes', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-PRO203-3-2')::uuid, lid, 'youtube', 'Layout Design in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-PRO203-3-3')::uuid, lid, 'youtube', 'Grid Layout for Wireframes', 'https://www.youtube.com/watch?v=EFafSYg-PkI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-4-1')::uuid, lid, 'youtube', 'High-Fidelity Design in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-PRO203-4-2')::uuid, lid, 'youtube', 'From Wireframe to Visual Design', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-PRO203-4-3')::uuid, lid, 'youtube', 'Hi-Fi Prototype Design Process', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-5-1')::uuid, lid, 'youtube', 'Figma Prototyping Tutorial', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-PRO203-5-2')::uuid, lid, 'youtube', 'Interactive Prototypes in Figma', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-PRO203-5-3')::uuid, lid, 'youtube', 'Figma Smart Animate', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-6-1')::uuid, lid, 'youtube', 'Prototyping Navigation Flows', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-PRO203-6-2')::uuid, lid, 'youtube', 'Linking Frames in Figma', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-PRO203-6-3')::uuid, lid, 'youtube', 'Creating User Flows in Figma', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-7-1')::uuid, lid, 'youtube', 'Testing Prototypes with Users', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-PRO203-7-2')::uuid, lid, 'youtube', 'Prototype Usability Testing', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-PRO203-7-3')::uuid, lid, 'youtube', 'Remote Testing with Figma Share', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRO203-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRO203-8-1')::uuid, lid, 'youtube', 'Design Handoff with Figma Inspect', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-PRO203-8-2')::uuid, lid, 'youtube', 'Preparing Assets for Developers', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-PRO203-8-3')::uuid, lid, 'youtube', 'Design Specs and Annotations', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-PRO203-01')::uuid, cid, 'multiple_choice', 'Lo-fi wireframes are preferred in early design stages because:',
     '[{"id":"a","text":"They look more professional","is_correct":false},{"id":"b","text":"They are quick to produce and easy to discard when exploring concepts","is_correct":true},{"id":"c",text":"They require no design tools","is_correct":false},{"id":"d","text":"They can be directly coded","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRO203-02')::uuid, cid, 'multiple_choice', 'What is the main purpose of a prototype in the design process?',
     '[{"id":"a","text":"To be the final product","is_correct":false},{"id":"b","text":"To test ideas and validate designs with users before committing to development","is_correct":true},{"id":"c",text":"To impress stakeholders visually","is_correct":false},{"id":"d","text":"To create marketing materials","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRO203-03')::uuid, cid, 'multiple_choice', 'High-fidelity prototypes differ from low-fidelity prototypes in that they:',
     '[{"id":"a","text":"Are faster to create","is_correct":false},{"id":"b","text":"Closely resemble the final product in look, feel and interaction","is_correct":true},{"id":"c",text":"Are only used for testing","is_correct":false},{"id":"d","text":"Use only grayscale colours","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRO203-04')::uuid, cid, 'multiple_choice', 'In Figma, "Smart Animate" is used to:',
     '[{"id":"a","text":"Automatically design screens","is_correct":false},{"id":"b","text":"Create smooth transitions between frames by animating matching layers","is_correct":true},{"id":"c",text":"Generate AI designs","is_correct":false},{"id":"d","text":"Animate SVGs on the web","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-05')::uuid, cid, 'multiple_choice', 'Paper prototyping is most useful for:',
     '[{"id":"a","text":"Final usability testing","is_correct":false},{"id":"b","text":"Early-stage concept testing and rapid iteration without digital tools","is_correct":true},{"id":"c",text":"Client presentations","is_correct":false},{"id":"d","text":"Developer handoff","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRO203-06')::uuid, cid, 'multiple_choice', 'What is a clickable prototype?',
     '[{"id":"a","text":"A prototype that auto-fills forms","is_correct":false},{"id":"b",text":"An interactive design where users can click through linked screens to simulate navigation","is_correct":true},{"id":"c","text":"A prototype with embedded JavaScript","is_correct":false},{"id":"d","text":"A published website","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRO203-07')::uuid, cid, 'multiple_choice', 'When testing a prototype, what is the primary role of the facilitator?',
     '[{"id":"a","text":"To guide users through the correct path","is_correct":false},{"id":"b","text":"To observe and note user behaviour without directing","is_correct":true},{"id":"c",text":"To explain how the interface works","is_correct":false},{"id":"d","text":"To take notes for the developer","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-08')::uuid, cid, 'multiple_choice', 'Design annotations in a handoff file are used to:',
     '[{"id":"a","text":"Describe the designer''s visual taste","is_correct":false},{"id":"b","text":"Explain interaction behaviours, states and design decisions to developers","is_correct":true},{"id":"c",text":"Replace design files","is_correct":false},{"id":"d","text":"Add comments to source code","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-09')::uuid, cid, 'multiple_choice', 'Which fidelity of wireframe is most appropriate for sharing with stakeholders for approval before visual design?',
     '[{"id":"a","text":"Lo-fi sketch","is_correct":false},{"id":"b","text":"Mid-fidelity wireframe with content and structure but minimal styling","is_correct":true},{"id":"c",text":"A fully animated prototype","is_correct":false},{"id":"d","text":"Source code mockup","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-10')::uuid, cid, 'multiple_choice', 'The primary benefit of prototyping over a static design is:',
     '[{"id":"a","text":"Prototypes are easier to share","is_correct":false},{"id":"b","text":"Prototypes simulate the real experience, revealing usability issues that static images cannot","is_correct":true},{"id":"c",text":"Prototypes are automatically coded","is_correct":false},{"id":"d","text":"Prototypes replace user research","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-11')::uuid, cid, 'multiple_choice', 'In Figma, an overlay interaction is used to:',
     '[{"id":"a","text":"Add a colour overlay to images","is_correct":false},{"id":"b","text":"Display a frame (e.g. modal or dropdown) on top of the current screen without navigating away","is_correct":true},{"id":"c",text":"Hide layers","is_correct":false},{"id":"d",text":"Create a new page","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-12')::uuid, cid, 'multiple_choice', 'What does "design fidelity" refer to?',
     '[{"id":"a","text":"How accurate the design is to the original idea","is_correct":false},{"id":"b","text":"The level of detail and realism in a design or prototype","is_correct":true},{"id":"c",text":"The audio quality of a voice UI","is_correct":false},{"id":"d",text":"The resolution of exported assets","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRO203-13')::uuid, cid, 'multiple_choice', 'The "wizard of oz" prototyping technique involves:',
     '[{"id":"a","text":"Using magic to design interfaces","is_correct":false},{"id":"b","text":"A human simulating system responses behind the scenes while users believe they are interacting with a real system","is_correct":true},{"id":"c",text":"Building a fully functional prototype","is_correct":false},{"id":"d",text":"Using AI to generate prototypes","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PRO203-14')::uuid, cid, 'multiple_choice', 'Figma Auto Layout is useful for prototyping because:',
     '[{"id":"a","text":"It automatically generates colours","is_correct":false},{"id":"b","text":"It creates responsive components that adapt to content, saving manual adjustment","is_correct":true},{"id":"c",text":"It writes CSS automatically","is_correct":false},{"id":"d",text":"It is required for all Figma files","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-15')::uuid, cid, 'multiple_choice', 'Which of the following is a disadvantage of high-fidelity prototypes?',
     '[{"id":"a","text":"They are too realistic","is_correct":false},{"id":"b","text":"They take longer to build and stakeholders may focus on visual details rather than UX","is_correct":true},{"id":"c",text":"They cannot be shared","is_correct":false},{"id":"d",text":"They require coding knowledge","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-16')::uuid, cid, 'multiple_choice', 'A wireframe differs from a mockup in that:',
     '[{"id":"a","text":"Wireframes are colourful","is_correct":false},{"id":"b","text":"Wireframes focus on structure and layout without colour/style; mockups include visual design","is_correct":true},{"id":"c",text":"Mockups are simpler","is_correct":false},{"id":"d",text":"There is no difference","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-17')::uuid, cid, 'multiple_choice', 'Device frames in Figma prototyping are useful because:',
     '[{"id":"a","text":"They replace real device testing","is_correct":false},{"id":"b","text":"They help stakeholders visualise how the design will look on an actual device","is_correct":true},{"id":"c",text":"They automatically resize components","is_correct":false},{"id":"d",text":"They are required for export","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-18')::uuid, cid, 'multiple_choice', 'In Figma, "components" help prototyping efficiency by:',
     '[{"id":"a","text":"Making the file load faster","is_correct":false},{"id":"b","text":"Allowing reusable, consistent elements that update everywhere when the master is edited","is_correct":true},{"id":"c",text":"Adding animation to all elements","is_correct":false},{"id":"d",text":"Generating CSS code","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRO203-19')::uuid, cid, 'multiple_choice', 'Which tool is most commonly used for sharing interactive prototypes with clients and developers in 2024?',
     '[{"id":"a","text":"Adobe Photoshop","is_correct":false},{"id":"b","text":"Figma","is_correct":true},{"id":"c","text":"Microsoft PowerPoint","is_correct":false},{"id":"d","text":"Sketch (Mac only)","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRO203-20')::uuid, cid, 'multiple_choice', 'What is the best time to iterate on a prototype based on user testing findings?',
     '[{"id":"a","text":"After the product launches","is_correct":false},{"id":"b","text":"Immediately after each round of testing, before proceeding to development","is_correct":true},{"id":"c",text":"Only during annual reviews","is_correct":false},{"id":"d",text":"After the design is handed off","is_correct":false}]'::jsonb, 1, true, false, 1)
  ON CONFLICT (id) DO NOTHING;

  -- ── REA204 React for Designers ───────────────────────────────────────
  cid := md5('aorthar-course-REA204')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'REA204', 'React for Designers',
     'A designer-oriented introduction to React. Students build interactive UI components, understand component-based architecture, props, state and how to collaborate effectively with React engineering teams.',
     y200, y200s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-REA204-1')::uuid, cid, 'Why React? Component-Based Thinking', 1, true),
    (md5('aorthar-l-REA204-2')::uuid, cid, 'JSX — Writing HTML in JavaScript', 2, true),
    (md5('aorthar-l-REA204-3')::uuid, cid, 'Components, Props and Reusability', 3, true),
    (md5('aorthar-l-REA204-4')::uuid, cid, 'State and useState Hook', 4, true),
    (md5('aorthar-l-REA204-5')::uuid, cid, 'Handling Events and User Input', 5, true),
    (md5('aorthar-l-REA204-6')::uuid, cid, 'Lists, Conditional Rendering and Keys', 6, true),
    (md5('aorthar-l-REA204-7')::uuid, cid, 'Styling React Components', 7, true),
    (md5('aorthar-l-REA204-8')::uuid, cid, 'Working with React Component Libraries', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-1-1')::uuid, lid, 'youtube', 'React for Beginners', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 1),
    (md5('aorthar-r-REA204-1-2')::uuid, lid, 'youtube', 'Why Use React?', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 2),
    (md5('aorthar-r-REA204-1-3')::uuid, lid, 'youtube', 'Component-Based Design', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-2-1')::uuid, lid, 'youtube', 'JSX in React Explained', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 1),
    (md5('aorthar-r-REA204-2-2')::uuid, lid, 'youtube', 'HTML in JavaScript with JSX', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 2),
    (md5('aorthar-r-REA204-2-3')::uuid, lid, 'youtube', 'React Crash Course', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-3-1')::uuid, lid, 'youtube', 'React Components and Props', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 1),
    (md5('aorthar-r-REA204-3-2')::uuid, lid, 'youtube', 'Reusable Components in React', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 2),
    (md5('aorthar-r-REA204-3-3')::uuid, lid, 'youtube', 'Props Deep Dive', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-4-1')::uuid, lid, 'youtube', 'React useState Hook', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 1),
    (md5('aorthar-r-REA204-4-2')::uuid, lid, 'youtube', 'Managing State in React', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 2),
    (md5('aorthar-r-REA204-4-3')::uuid, lid, 'youtube', 'State vs Props in React', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-5-1')::uuid, lid, 'youtube', 'React Event Handlers', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 1),
    (md5('aorthar-r-REA204-5-2')::uuid, lid, 'youtube', 'Form Handling in React', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 2),
    (md5('aorthar-r-REA204-5-3')::uuid, lid, 'youtube', 'Controlled Inputs in React', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-6-1')::uuid, lid, 'youtube', 'Rendering Lists in React', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 1),
    (md5('aorthar-r-REA204-6-2')::uuid, lid, 'youtube', 'Conditional Rendering', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 2),
    (md5('aorthar-r-REA204-6-3')::uuid, lid, 'youtube', 'React Keys Explained', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-7-1')::uuid, lid, 'youtube', 'CSS Modules in React', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1),
    (md5('aorthar-r-REA204-7-2')::uuid, lid, 'youtube', 'Tailwind CSS with React', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 2),
    (md5('aorthar-r-REA204-7-3')::uuid, lid, 'youtube', 'Styled Components Tutorial', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-REA204-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-REA204-8-1')::uuid, lid, 'youtube', 'Radix UI Components', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-REA204-8-2')::uuid, lid, 'youtube', 'shadcn/ui Component Library', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 2),
    (md5('aorthar-r-REA204-8-3')::uuid, lid, 'youtube', 'Material UI for React', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-REA204-01')::uuid, cid, 'multiple_choice', 'React is primarily used for:',
     '[{"id":"a","text":"Database management","is_correct":false},{"id":"b","text":"Building user interfaces with reusable components","is_correct":true},{"id":"c",text":"Server-side scripting","is_correct":false},{"id":"d","text":"Styling web pages","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-REA204-02')::uuid, cid, 'multiple_choice', 'JSX in React is:',
     '[{"id":"a","text":"A JavaScript module system","is_correct":false},{"id":"b","text":"A syntax extension allowing HTML-like code to be written in JavaScript","is_correct":true},{"id":"c",text":"A CSS-in-JS library","is_correct":false},{"id":"d","text":"A testing framework","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-REA204-03')::uuid, cid, 'multiple_choice', 'Props in React are used to:',
     '[{"id":"a","text":"Store component-level data that changes","is_correct":false},{"id":"b",text":"Pass data from a parent component to a child component","is_correct":true},{"id":"c","text":"Define CSS styles","is_correct":false},{"id":"d","text":"Fetch data from APIs","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-REA204-04')::uuid, cid, 'multiple_choice', 'The useState hook in React returns:',
     '[{"id":"a","text":"A function only","is_correct":false},{"id":"b","text":"An array with the current state value and a setter function","is_correct":true},{"id":"c",text":"A component","is_correct":false},{"id":"d","text":"An object with all app state","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-05')::uuid, cid, 'multiple_choice', 'In React, why are "keys" required when rendering lists?',
     '[{"id":"a","text":"To style list items","is_correct":false},{"id":"b","text":"To help React identify which items have changed, added or removed for efficient re-rendering","is_correct":true},{"id":"c",text":"To pass props to each item","is_correct":false},{"id":"d","text":"To add click events to list items","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-06')::uuid, cid, 'multiple_choice', 'A React component can be defined as:',
     '[{"id":"a","text":"A CSS class","is_correct":false},{"id":"b","text":"A JavaScript function that returns JSX","is_correct":true},{"id":"c",text":"An HTML file","is_correct":false},{"id":"d","text":"A database model","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-REA204-07')::uuid, cid, 'multiple_choice', 'State in React differs from props in that state:',
     '[{"id":"a","text":"Is passed from a parent component","is_correct":false},{"id":"b","text":"Is managed within the component and can change over time","is_correct":true},{"id":"c",text":"Is always a string","is_correct":false},{"id":"d","text":"Cannot be updated","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-08')::uuid, cid, 'multiple_choice', 'In React, the virtual DOM is:',
     '[{"id":"a","text":"The HTML DOM","is_correct":false},{"id":"b","text":"A lightweight copy of the real DOM used by React to efficiently update the UI","is_correct":true},{"id":"c",text":"A virtual reality interface","is_correct":false},{"id":"d",text":"A testing environment","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-09')::uuid, cid, 'multiple_choice', 'Conditional rendering in React is best achieved using:',
     '[{"id":"a","text":"HTML if-else tags","is_correct":false},{"id":"b","text":"Ternary operators or logical && in JSX","is_correct":true},{"id":"c",text":"CSS display:none only","is_correct":false},{"id":"d",text":"A switch statement only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-10')::uuid, cid, 'multiple_choice', 'Tailwind CSS is often preferred in React projects because:',
     '[{"id":"a","text":"It replaces React entirely","is_correct":false},{"id":"b","text":"It provides utility classes that enable rapid styling directly in JSX","is_correct":true},{"id":"c",text":"It generates React components automatically","is_correct":false},{"id":"d","text":"It is the only CSS option for React","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-11')::uuid, cid, 'multiple_choice', 'A "controlled component" in React means:',
     '[{"id":"a","text":"A component that controls the page routing","is_correct":false},{"id":"b","text":"A form element whose value is controlled by React state","is_correct":true},{"id":"c",text":"A component with admin access","is_correct":false},{"id":"d",text":"A read-only component","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-12')::uuid, cid, 'multiple_choice', 'Component libraries like shadcn/ui benefit designers because:',
     '[{"id":"a","text":"They remove the need for any design work","is_correct":false},{"id":"b","text":"They provide pre-built, accessible components that match design system conventions","is_correct":true},{"id":"c",text":"They are free of charge only","is_correct":false},{"id":"d",text":"They auto-generate Figma files","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-13')::uuid, cid, 'multiple_choice', 'The event handler for a button click in React is written as:',
     '[{"id":"a","text":"<button onclick={handleClick}>","is_correct":false},{"id":"b","text":"<button onClick={handleClick}>","is_correct":true},{"id":"c",text":"<button click=\"handleClick\">","is_correct":false},{"id":"d","text":"<button onPress={handleClick}>","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-14')::uuid, cid, 'multiple_choice', 'CSS Modules in React prevent:',
     '[{"id":"a","text":"CSS from loading","is_correct":false},{"id":"b","text":"Class name conflicts by locally scoping styles to the component","is_correct":true},{"id":"c",text":"All styling of components","is_correct":false},{"id":"d","text":"React from rendering","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-REA204-15')::uuid, cid, 'multiple_choice', 'What does "single source of truth" mean in React applications?',
     '[{"id":"a","text":"Only one developer works on the code","is_correct":false},{"id":"b","text":"State is managed in one location and shared to children via props","is_correct":true},{"id":"c",text":"Only one component renders at a time","is_correct":false},{"id":"d",text":"The app uses only one API","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-REA204-16')::uuid, cid, 'multiple_choice', 'The .map() method is commonly used in React to:',
     '[{"id":"a","text":"Navigate between pages","is_correct":false},{"id":"b","text":"Transform an array of data into an array of JSX elements","is_correct":true},{"id":"c",text":"Map CSS classes to elements","is_correct":false},{"id":"d",text":"Fetch data from an API","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-17')::uuid, cid, 'multiple_choice', 'React''s one-way data flow means:',
     '[{"id":"a","text":"Data only flows from child to parent","is_correct":false},{"id":"b","text":"Data flows from parent to child through props, not in reverse","is_correct":true},{"id":"c",text":"Data cannot be updated","is_correct":false},{"id":"d",text":"Only one type of data is allowed","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-18')::uuid, cid, 'multiple_choice', 'A design system implemented in React typically exposes:',
     '[{"id":"a","text":"HTML templates only","is_correct":false},{"id":"b","text":"Reusable React components with consistent props APIs and styling","is_correct":true},{"id":"c",text":"Only colour variables","is_correct":false},{"id":"d",text":"CSS files only","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-REA204-19')::uuid, cid, 'multiple_choice', 'Next.js builds on top of React by adding:',
     '[{"id":"a","text":"A different component model","is_correct":false},{"id":"b","text":"Server-side rendering, file-based routing and optimisations for production","is_correct":true},{"id":"c",text":"Replacing CSS with its own styling","is_correct":false},{"id":"d",text":"A built-in database","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-REA204-20')::uuid, cid, 'multiple_choice', 'Understanding React helps designers because:',
     '[{"id":"a","text":"Designers must build all React components themselves","is_correct":false},{"id":"b","text":"It enables more informed design decisions, better developer collaboration and realistic prototyping","is_correct":true},{"id":"c",text":"Figma requires React knowledge","is_correct":false},{"id":"d",text":"All jobs require React","is_correct":false}]'::jsonb, 1, true, false, 1)
  ON CONFLICT (id) DO NOTHING;

  -- ── INF205 Information Architecture ─────────────────────────────────
  cid := md5('aorthar-course-INF205')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'INF205', 'Information Architecture',
     'Comprehensive study of information architecture for digital products. Covers content strategy, taxonomy, navigation design, search, labelling systems, sitemaps and card sorting.',
     y200, y200s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-INF205-1')::uuid, cid, 'Introduction to Information Architecture', 1, true),
    (md5('aorthar-l-INF205-2')::uuid, cid, 'Content Inventory and Audit', 2, true),
    (md5('aorthar-l-INF205-3')::uuid, cid, 'Card Sorting and User-Centred IA', 3, true),
    (md5('aorthar-l-INF205-4')::uuid, cid, 'Navigation Systems Design', 4, true),
    (md5('aorthar-l-INF205-5')::uuid, cid, 'Labelling Systems and Taxonomy', 5, true),
    (md5('aorthar-l-INF205-6')::uuid, cid, 'Search Design and Findability', 6, true),
    (md5('aorthar-l-INF205-7')::uuid, cid, 'Sitemaps and Content Models', 7, true),
    (md5('aorthar-l-INF205-8')::uuid, cid, 'Tree Testing and Validating IA', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-1-1')::uuid, lid, 'youtube', 'Information Architecture Explained', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-INF205-1-2')::uuid, lid, 'youtube', 'IA for UX Designers', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-INF205-1-3')::uuid, lid, 'youtube', 'Structure vs Navigation Design', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-2-1')::uuid, lid, 'youtube', 'Content Audit Tutorial', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-INF205-2-2')::uuid, lid, 'youtube', 'Content Inventory for UX', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-INF205-2-3')::uuid, lid, 'youtube', 'Content Strategy Basics', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-3-1')::uuid, lid, 'youtube', 'Card Sorting for IA', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-INF205-3-2')::uuid, lid, 'youtube', 'Open vs Closed Card Sorting', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-INF205-3-3')::uuid, lid, 'youtube', 'Digital Card Sorting Tools', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-4-1')::uuid, lid, 'youtube', 'Navigation Design Patterns', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-INF205-4-2')::uuid, lid, 'youtube', 'Global Navigation Design', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-INF205-4-3')::uuid, lid, 'youtube', 'Breadcrumbs and Wayfinding', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-5-1')::uuid, lid, 'youtube', 'Labelling Systems in UX', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-INF205-5-2')::uuid, lid, 'youtube', 'Taxonomy and Content Organisation', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-INF205-5-3')::uuid, lid, 'youtube', 'Writing Clear Navigation Labels', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-6-1')::uuid, lid, 'youtube', 'Search UX Design', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-INF205-6-2')::uuid, lid, 'youtube', 'Designing Search for Web and App', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-INF205-6-3')::uuid, lid, 'youtube', 'Autocomplete and Search Suggestions', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-7-1')::uuid, lid, 'youtube', 'Creating Sitemaps in UX', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 1),
    (md5('aorthar-r-INF205-7-2')::uuid, lid, 'youtube', 'Content Models for Apps', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-INF205-7-3')::uuid, lid, 'youtube', 'IA Deliverables Overview', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-INF205-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-INF205-8-1')::uuid, lid, 'youtube', 'Tree Testing Explained', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-INF205-8-2')::uuid, lid, 'youtube', 'Validating IA with Users', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-INF205-8-3')::uuid, lid, 'youtube', 'First Click Testing', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-INF205-01')::uuid, cid, 'multiple_choice', 'Information Architecture is primarily concerned with:',
     '[{"id":"a","text":"Visual design of interfaces","is_correct":false},{"id":"b","text":"Organising, structuring and labelling content to help users find information","is_correct":true},{"id":"c",text":"Server infrastructure design","is_correct":false},{"id":"d","text":"Writing copy for websites","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-INF205-02')::uuid, cid, 'multiple_choice', 'Open card sorting allows participants to:',
     '[{"id":"a","text":"Sort cards into predefined categories","is_correct":false},{"id":"b","text":"Create their own categories while sorting content cards","is_correct":true},{"id":"c",text":"Test navigation trees","is_correct":false},{"id":"d",text":"Sort by colour","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-03')::uuid, cid, 'multiple_choice', 'Tree testing is used to evaluate:',
     '[{"id":"a","text":"The visual design of a sitemap","is_correct":false},{"id":"b","text":"How easily users can find content within a navigation structure","is_correct":true},{"id":"c",text":"The performance of a search feature","is_correct":false},{"id":"d",text":"The colour scheme of the app","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-04')::uuid, cid, 'multiple_choice', 'A sitemap in IA represents:',
     '[{"id":"a","text":"A Google Maps integration","is_correct":false},{"id":"b","text":"A hierarchical diagram showing all pages and their relationship to each other","is_correct":true},{"id":"c",text":"A performance optimisation tool","is_correct":false},{"id":"d",text":"An SEO document","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-INF205-05')::uuid, cid, 'multiple_choice', 'The principle of "seven plus or minus two" in IA refers to:',
     '[{"id":"a","text":"Seven pages per section maximum","is_correct":false},{"id":"b","text":"Cognitive working memory capacity and its implication for navigation grouping","is_correct":true},{"id":"c",text":"Seven colour palette options","is_correct":false},{"id":"d",text":"Seven usability heuristics","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-INF205-06')::uuid, cid, 'multiple_choice', 'A taxonomy in IA is:',
     '[{"id":"a","text":"A type of user persona","is_correct":false},{"id":"b","text":"A classification system for organising content into categories","is_correct":true},{"id":"c",text":"A navigation pattern","is_correct":false},{"id":"d","text":"A colour naming system","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-07')::uuid, cid, 'multiple_choice', 'Good navigation labelling should:',
     '[{"id":"a","text":"Use creative, unusual words to stand out","is_correct":false},{"id":"b","text":"Use clear, familiar language that matches the user''s mental model","is_correct":true},{"id":"c",text":"Be as brief as possible, even if unclear","is_correct":false},{"id":"d","text":"Always use icons instead of words","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-INF205-08')::uuid, cid, 'multiple_choice', 'Closed card sorting differs from open card sorting in that:',
     '[{"id":"a","text":"Participants sort physical cards","is_correct":false},{"id":"b","text":"Participants sort content into predefined categories created by the researcher","is_correct":true},{"id":"c",text":"Results are not analysed","is_correct":false},{"id":"d",text":"Only designers can participate","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-09')::uuid, cid, 'multiple_choice', 'A breadcrumb navigation helps users by:',
     '[{"id":"a","text":"Making the page load faster","is_correct":false},{"id":"b","text":"Showing their current location within the site hierarchy and enabling easy backtracking","is_correct":true},{"id":"c",text":"Providing search functionality","is_correct":false},{"id":"d",text":"Adding extra navigation items","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-INF205-10')::uuid, cid, 'multiple_choice', 'The "three-click rule" in IA suggests:',
     '[{"id":"a","text":"All content must be found in three clicks","is_correct":false},{"id":"b","text":"Users should be able to find any content within approximately three clicks, though this is now debated","is_correct":true},{"id":"c",text":"Navigation should have exactly three levels","is_correct":false},{"id":"d",text":"Pages should have three sections","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-11')::uuid, cid, 'multiple_choice', 'A content audit involves:',
     '[{"id":"a","text":"Auditing the design of content blocks","is_correct":false},{"id":"b","text":"Systematically reviewing all existing content for quality, relevance and structure","is_correct":true},{"id":"c",text":"Counting words on a page","is_correct":false},{"id":"d",text":"Reviewing competitor content only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-12')::uuid, cid, 'multiple_choice', 'The four components of IA identified by Morville and Rosenfeld are:',
     '[{"id":"a","text":"Design, Code, Test, Deploy","is_correct":false},{"id":"b","text":"Organisation, Labelling, Navigation and Search systems","is_correct":true},{"id":"c",text":"Colour, Typography, Grid, Layout","is_correct":false},{"id":"d",text":"Users, Content, Context, Technology","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-INF205-13')::uuid, cid, 'multiple_choice', 'Progressive disclosure in navigation means:',
     '[{"id":"a","text":"Displaying all navigation items at once","is_correct":false},{"id":"b","text":"Revealing sub-navigation only when the user accesses a top-level section","is_correct":true},{"id":"c",text":"A slow-loading navigation","is_correct":false},{"id":"d","text":"Navigation that changes colour progressively","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-14')::uuid, cid, 'multiple_choice', 'First click testing evaluates:',
     '[{"id":"a","text":"Which link users click first on a homepage aesthetically","is_correct":false},{"id":"b",text":"Where users click first when trying to complete a task, validating navigation effectiveness","is_correct":true},{"id":"c",text":"The first-click performance of a search bar","is_correct":false},{"id":"d",text":"The speed of the first page load","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-INF205-15')::uuid, cid, 'multiple_choice', 'A faceted navigation system allows users to:',
     '[{"id":"a","text":"Navigate using facial recognition","is_correct":false},{"id":"b","text":"Filter content by multiple attributes simultaneously","is_correct":true},{"id":"c",text":"Sort alphabetically only","is_correct":false},{"id":"d",text":"Navigate between faces of a product","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-INF205-16')::uuid, cid, 'multiple_choice', 'A "hub and spoke" IA pattern means:',
     '[{"id":"a","text":"A navigation pattern with one main hub and branching sub-pages that don''t link to each other","is_correct":true},{"id":"b","text":"A wheel-shaped navigation","is_correct":false},{"id":"c","text":"Navigation with spokes connecting pages laterally","is_correct":false},{"id":"d","text":"A type of dropdown menu","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-INF205-17')::uuid, cid, 'multiple_choice', 'In IA, "findability" refers to:',
     '[{"id":"a","text":"How easily users can identify the brand","is_correct":false},{"id":"b","text":"How easily users can locate content or features within the system","is_correct":true},{"id":"c",text":"SEO rankings of a product","is_correct":false},{"id":"d","text":"The discoverability of the product in app stores","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-18')::uuid, cid, 'multiple_choice', 'The term "wayfinding" in IA refers to:',
     '[{"id":"a","text":"Finding the way to a physical location","is_correct":false},{"id":"b","text":"Helping users understand where they are and how to get where they want to go within a product","is_correct":true},{"id":"c",text":"The navigation bar design","is_correct":false},{"id":"d","text":"URL structure planning","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-19')::uuid, cid, 'multiple_choice', 'Which research method best validates whether your IA works for users?',
     '[{"id":"a","text":"A/B testing colours","is_correct":false},{"id":"b","text":"Tree testing and first click testing","is_correct":true},{"id":"c",text":"Heuristic evaluation","is_correct":false},{"id":"d",text":"Eyetracking studies","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-INF205-20')::uuid, cid, 'multiple_choice', 'An "organisation scheme" in IA refers to:',
     '[{"id":"a","text":"The company structure","is_correct":false},{"id":"b","text":"The principle used to group and categorise content (e.g. by topic, task, audience or metaphor)","is_correct":true},{"id":"c",text":"The colour organisation in a design system","is_correct":false},{"id":"d",text":"The team hierarchy","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 200 · SEMESTER 2
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── DSY206 Design Systems and Component Libraries ────────────────────
  cid := md5('aorthar-course-DSY206')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'DSY206', 'Design Systems and Component Libraries',
     'Building and maintaining scalable design systems. Covers atomic design, design tokens, component documentation, versioning, governance and aligning Figma design systems with code.',
     y200, y200s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-DSY206-1')::uuid, cid, 'What is a Design System?', 1, true),
    (md5('aorthar-l-DSY206-2')::uuid, cid, 'Atomic Design Methodology', 2, true),
    (md5('aorthar-l-DSY206-3')::uuid, cid, 'Design Tokens — Colour, Typography, Spacing', 3, true),
    (md5('aorthar-l-DSY206-4')::uuid, cid, 'Building Components in Figma', 4, true),
    (md5('aorthar-l-DSY206-5')::uuid, cid, 'Component Documentation and Usage Guidelines', 5, true),
    (md5('aorthar-l-DSY206-6')::uuid, cid, 'Aligning Design System with Code', 6, true),
    (md5('aorthar-l-DSY206-7')::uuid, cid, 'Design System Governance and Versioning', 7, true),
    (md5('aorthar-l-DSY206-8')::uuid, cid, 'Case Studies — Real-World Design Systems', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-1-1')::uuid, lid, 'youtube', 'What is a Design System?', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-DSY206-1-2')::uuid, lid, 'youtube', 'Design Systems Overview', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 2),
    (md5('aorthar-r-DSY206-1-3')::uuid, lid, 'youtube', 'Why Design Systems Matter', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-2-1')::uuid, lid, 'youtube', 'Atomic Design by Brad Frost', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-DSY206-2-2')::uuid, lid, 'youtube', 'Atoms Molecules Organisms in Design', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 2),
    (md5('aorthar-r-DSY206-2-3')::uuid, lid, 'youtube', 'Component Hierarchy in Design Systems', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-3-1')::uuid, lid, 'youtube', 'Design Tokens Explained', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-DSY206-3-2')::uuid, lid, 'youtube', 'Figma Variables and Tokens', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-DSY206-3-3')::uuid, lid, 'youtube', 'Design Tokens in CSS', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-4-1')::uuid, lid, 'youtube', 'Figma Components Tutorial', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-DSY206-4-2')::uuid, lid, 'youtube', 'Figma Variants Guide', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-DSY206-4-3')::uuid, lid, 'youtube', 'Building a UI Kit in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-5-1')::uuid, lid, 'youtube', 'Component Documentation Best Practices', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-DSY206-5-2')::uuid, lid, 'youtube', 'Writing Design Guidelines', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-DSY206-5-3')::uuid, lid, 'youtube', 'Storybook for Component Docs', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-6-1')::uuid, lid, 'youtube', 'Figma to Code Workflow', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-DSY206-6-2')::uuid, lid, 'youtube', 'Design System and React Components', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 2),
    (md5('aorthar-r-DSY206-6-3')::uuid, lid, 'youtube', 'Aligning Figma and Tailwind', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-7-1')::uuid, lid, 'youtube', 'Design System Governance', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-DSY206-7-2')::uuid, lid, 'youtube', 'Versioning a Design System', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-DSY206-7-3')::uuid, lid, 'youtube', 'Maintaining a Living Design System', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DSY206-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DSY206-8-1')::uuid, lid, 'youtube', 'Google Material Design System', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 1),
    (md5('aorthar-r-DSY206-8-2')::uuid, lid, 'youtube', 'Airbnb Design System Case Study', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-DSY206-8-3')::uuid, lid, 'youtube', 'IBM Carbon Design System', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-DSY206-01')::uuid, cid, 'multiple_choice', 'Atomic Design breaks interfaces into which five levels?',
     '[{"id":"a","text":"Page, Section, Block, Element, Detail","is_correct":false},{"id":"b","text":"Atoms, Molecules, Organisms, Templates, Pages","is_correct":true},{"id":"c",text":"Tokens, Variables, Components, Layouts, Apps","is_correct":false},{"id":"d","text":"Base, Core, Extended, Brand, Product","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-02')::uuid, cid, 'multiple_choice', 'Design tokens are primarily used to:',
     '[{"id":"a","text":"Replace design components","is_correct":false},{"id":"b","text":"Store and share design values (colours, spacing, fonts) consistently across design and code","is_correct":true},{"id":"c",text":"Authenticate API requests","is_correct":false},{"id":"d",text":"Document user stories","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DSY206-03')::uuid, cid, 'multiple_choice', 'A "component variant" in Figma allows designers to:',
     '[{"id":"a","text":"Create different files for each component","is_correct":false},{"id":"b","text":"Manage multiple states and variations of a component in a single organised component set","is_correct":true},{"id":"c",text":"Automatically generate code","is_correct":false},{"id":"d",text":"Test components in the browser","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-04')::uuid, cid, 'multiple_choice', 'The primary benefit of a shared design system for large teams is:',
     '[{"id":"a","text":"It reduces the number of designers needed","is_correct":false},{"id":"b","text":"It ensures consistency, reduces duplication and speeds up both design and development","is_correct":true},{"id":"c",text":"It replaces user research","is_correct":false},{"id":"d",text":"It is required by investors","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DSY206-05')::uuid, cid, 'multiple_choice', 'A "living style guide" differs from a static style guide because:',
     '[{"id":"a","text":"It uses animated components","is_correct":false},{"id":"b","text":"It is maintained and updated as the design system evolves, staying in sync with the product","is_correct":true},{"id":"c",text":"It only exists in Figma","is_correct":false},{"id":"d",text":"It is printed and distributed","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-06')::uuid, cid, 'multiple_choice', 'Design system governance refers to:',
     '[{"id":"a","text":"Government regulation of design tools","is_correct":false},{"id":"b","text":"The processes and ownership model for who maintains and updates the design system","is_correct":true},{"id":"c",text":"Legal review of design assets","is_correct":false},{"id":"d",text":"Versioning of source code","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-07')::uuid, cid, 'multiple_choice', 'Storybook is a tool primarily used for:',
     '[{"id":"a","text":"Writing user stories in agile","is_correct":false},{"id":"b","text":"Building and documenting UI components in isolation for development and design reference","is_correct":true},{"id":"c",text":"Managing Figma files","is_correct":false},{"id":"d",text":"Project management","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-08')::uuid, cid, 'multiple_choice', 'Google''s Material Design is an example of:',
     '[{"id":"a","text":"A user research framework","is_correct":false},{"id":"b","text":"An open-source design system providing guidelines, components and design language","is_correct":true},{"id":"c",text":"A JavaScript framework","is_correct":false},{"id":"d",text":"A typography system only","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DSY206-09')::uuid, cid, 'multiple_choice', 'Design tokens are structured in a hierarchy (global, alias, component) because:',
     '[{"id":"a","text":"It makes the token list alphabetical","is_correct":false},{"id":"b","text":"It separates raw values from semantic usage, enabling theming and brand switching","is_correct":true},{"id":"c",text":"It is required by Figma","is_correct":false},{"id":"d","text":"It reduces file size","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DSY206-10')::uuid, cid, 'multiple_choice', 'In atomic design, a "molecule" is:',
     '[{"id":"a","text":"A single basic UI element like a button","is_correct":false},{"id":"b","text":"A combination of atoms forming a simple functional component","is_correct":true},{"id":"c",text":"A full page template","is_correct":false},{"id":"d",text":"A complex organism","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-11')::uuid, cid, 'multiple_choice', 'The primary challenge of scaling a design system across a large organisation is:',
     '[{"id":"a","text":"Running out of component names","is_correct":false},{"id":"b","text":"Maintaining adoption, governance and synchronisation across multiple teams and products","is_correct":true},{"id":"c",text":"Figma file size limits","is_correct":false},{"id":"d","text":"Choosing between dark and light mode","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DSY206-12')::uuid, cid, 'multiple_choice', 'A "centralised" design system model means:',
     '[{"id":"a","text":"Each team maintains their own system","is_correct":false},{"id":"b","text":"A dedicated team owns, builds and maintains the system for all other teams","is_correct":true},{"id":"c",text":"The system is stored in one Figma file","is_correct":false},{"id":"d",text":"Only senior designers can edit the system","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-13')::uuid, cid, 'multiple_choice', 'A "federated" design system model means:',
     '[{"id":"a","text":"The system is controlled by one person","is_correct":false},{"id":"b","text":"Multiple teams contribute to a shared system with a central team coordinating","is_correct":true},{"id":"c",text":"The system is hosted on a federal server","is_correct":false},{"id":"d",text":"Each product has a completely separate system","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DSY206-14')::uuid, cid, 'multiple_choice', 'Component documentation should include:',
     '[{"id":"a","text":"The designer''s personal notes","is_correct":false},{"id":"b","text":"Usage guidelines, variants, dos and don''ts, and accessibility notes","is_correct":true},{"id":"c",text":"Only visual examples","is_correct":false},{"id":"d",text":"Financial data about the component","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-15')::uuid, cid, 'multiple_choice', 'Semantic naming of design tokens (e.g. "color-button-primary" vs "#0066FF") is preferred because:',
     '[{"id":"a","text":"It is shorter","is_correct":false},{"id":"b","text":"It describes intent rather than value, enabling easier theming and maintenance","is_correct":true},{"id":"c",text":"It is required by CSS","is_correct":false},{"id":"d",text":"It improves performance","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DSY206-16')::uuid, cid, 'multiple_choice', 'Figma variables (released in 2023) extend design tokens by:',
     '[{"id":"a","text":"Adding animation support","is_correct":false},{"id":"b","text":"Allowing token values to change based on modes (e.g. dark/light theme)","is_correct":true},{"id":"c",text":"Generating CSS automatically","is_correct":false},{"id":"d",text":"Replacing Figma styles entirely","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DSY206-17')::uuid, cid, 'multiple_choice', 'A design system "contribution model" defines:',
     '[{"id":"a","text":"How many designs are needed per sprint","is_correct":false},{"id":"b","text":"How teams propose, review and add new components to the shared system","is_correct":true},{"id":"c",text":"Who can access the Figma library","is_correct":false},{"id":"d",text":"The financial model of the design team","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-18')::uuid, cid, 'multiple_choice', 'An "organism" in atomic design is:',
     '[{"id":"a","text":"A living creature used as design inspiration","is_correct":false},{"id":"b",text":"A complex UI section made up of groups of molecules and atoms (e.g. a header)","is_correct":true},{"id":"c",text":"A single button","is_correct":false},{"id":"d","text":"A page template","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-19')::uuid, cid, 'multiple_choice', 'Which Figma feature allows a master component change to automatically update all instances?',
     '[{"id":"a","text":"Auto Layout","is_correct":false},{"id":"b","text":"Components and their instances (detach vs linked)","is_correct":true},{"id":"c",text":"Figma Variables","is_correct":false},{"id":"d",text":"Figma Plugins","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DSY206-20')::uuid, cid, 'multiple_choice', 'What does it mean when a design system is "out of sync" with the codebase?',
     '[{"id":"a","text":"The Figma file is corrupted","is_correct":false},{"id":"b","text":"The components, tokens or styles in Figma no longer match the implemented components in code","is_correct":true},{"id":"c",text":"The team is working in different time zones","is_correct":false},{"id":"d",text":"The design system has not been published","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── ACC207 Accessibility and Inclusive Design ────────────────────────
  cid := md5('aorthar-course-ACC207')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'ACC207', 'Accessibility and Inclusive Design',
     'Comprehensive accessibility design course covering WCAG guidelines, ARIA, inclusive design principles, screen readers, keyboard navigation, colour contrast and testing for accessibility.',
     y200, y200s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-ACC207-1')::uuid, cid, 'Introduction to Accessibility and Why It Matters', 1, true),
    (md5('aorthar-l-ACC207-2')::uuid, cid, 'WCAG Guidelines — Levels A, AA and AAA', 2, true),
    (md5('aorthar-l-ACC207-3')::uuid, cid, 'Colour Contrast and Visual Accessibility', 3, true),
    (md5('aorthar-l-ACC207-4')::uuid, cid, 'Keyboard Navigation and Focus Management', 4, true),
    (md5('aorthar-l-ACC207-5')::uuid, cid, 'Screen Readers and ARIA', 5, true),
    (md5('aorthar-l-ACC207-6')::uuid, cid, 'Accessible Forms and Error Handling', 6, true),
    (md5('aorthar-l-ACC207-7')::uuid, cid, 'Inclusive Design Principles', 7, true),
    (md5('aorthar-l-ACC207-8')::uuid, cid, 'Accessibility Testing and Auditing', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-1-1')::uuid, lid, 'youtube', 'Web Accessibility Introduction', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-1-2')::uuid, lid, 'youtube', 'Why Accessibility Matters', 'https://www.youtube.com/watch?v=3f31oufqFSM', 2),
    (md5('aorthar-r-ACC207-1-3')::uuid, lid, 'youtube', 'Disability and Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-2-1')::uuid, lid, 'youtube', 'WCAG Guidelines Explained', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-2-2')::uuid, lid, 'youtube', 'WCAG 2.1 Overview', 'https://www.youtube.com/watch?v=3f31oufqFSM', 2),
    (md5('aorthar-r-ACC207-2-3')::uuid, lid, 'youtube', 'POUR Accessibility Principles', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-3-1')::uuid, lid, 'youtube', 'Colour Contrast for Accessibility', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-3-2')::uuid, lid, 'youtube', 'Colour Blindness and Design', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-ACC207-3-3')::uuid, lid, 'youtube', 'WCAG Contrast Checker Tools', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-4-1')::uuid, lid, 'youtube', 'Keyboard Navigation Design', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-4-2')::uuid, lid, 'youtube', 'Focus Management in Web Apps', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-ACC207-4-3')::uuid, lid, 'youtube', 'Tab Order and Focus Styles', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-5-1')::uuid, lid, 'youtube', 'Screen Readers for Designers', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-5-2')::uuid, lid, 'youtube', 'ARIA Labels Explained', 'https://www.youtube.com/watch?v=3f31oufqFSM', 2),
    (md5('aorthar-r-ACC207-5-3')::uuid, lid, 'youtube', 'ARIA Roles and Attributes', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-6-1')::uuid, lid, 'youtube', 'Accessible Form Design', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-6-2')::uuid, lid, 'youtube', 'Error Messages Accessibility', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-ACC207-6-3')::uuid, lid, 'youtube', 'Label and Input Associations', 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-7-1')::uuid, lid, 'youtube', 'Inclusive Design Principles', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-7-2')::uuid, lid, 'youtube', 'Universal Design Explained', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-ACC207-7-3')::uuid, lid, 'youtube', 'Designing for Everyone', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ACC207-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ACC207-8-1')::uuid, lid, 'youtube', 'Accessibility Audit Guide', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-ACC207-8-2')::uuid, lid, 'youtube', 'Using Lighthouse for Accessibility', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-ACC207-8-3')::uuid, lid, 'youtube', 'Automated Accessibility Testing', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-ACC207-01')::uuid, cid, 'multiple_choice', 'What does WCAG stand for?',
     '[{"id":"a","text":"Web Content Accessibility Guidelines","is_correct":true},{"id":"b","text":"Web Colour Alignment Guide","is_correct":false},{"id":"c","text":"Website Content and Accessibility Group","is_correct":false},{"id":"d","text":"World Content Accessibility Guidelines","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-02')::uuid, cid, 'multiple_choice', 'The four principles of WCAG (POUR) stand for:',
     '[{"id":"a","text":"Practical, Usable, Reliable, Realistic","is_correct":false},{"id":"b","text":"Perceivable, Operable, Understandable, Robust","is_correct":true},{"id":"c",text":"Plain, Open, Universal, Responsive","is_correct":false},{"id":"d","text":"Proper, Organised, User-centred, Readable","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-03')::uuid, cid, 'multiple_choice', 'The minimum contrast ratio for normal text required by WCAG 2.1 Level AA is:',
     '[{"id":"a","text":"2:1","is_correct":false},{"id":"b","text":"3:1","is_correct":false},{"id":"c","text":"4.5:1","is_correct":true},{"id":"d","text":"7:1","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ACC207-04')::uuid, cid, 'multiple_choice', 'ARIA stands for:',
     '[{"id":"a","text":"Accessible Responsive Interface Architecture","is_correct":false},{"id":"b","text":"Accessible Rich Internet Applications","is_correct":true},{"id":"c",text":"Automated Responsive Interface Attributes","is_correct":false},{"id":"d","text":"Advanced Responsive Interface API","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ACC207-05')::uuid, cid, 'multiple_choice', 'The alt attribute on an <img> tag is important for accessibility because:',
     '[{"id":"a","text":"It speeds up image loading","is_correct":false},{"id":"b","text":"Screen readers read the alt text to describe the image to visually impaired users","is_correct":true},{"id":"c",text":"It is required by browsers","is_correct":false},{"id":"d",text":"It improves SEO only","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-06')::uuid, cid, 'multiple_choice', 'Keyboard navigation accessibility means:',
     '[{"id":"a","text":"The app has keyboard shortcuts","is_correct":false},{"id":"b","text":"All interactive elements can be accessed and operated using only the keyboard","is_correct":true},{"id":"c",text":"The keyboard is the primary input device","is_correct":false},{"id":"d",text":"Physical keyboard support","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-07')::uuid, cid, 'multiple_choice', 'Inclusive design differs from accessible design in that:',
     '[{"id":"a","text":"They are the same thing","is_correct":false},{"id":"b","text":"Inclusive design considers the full range of human diversity from the start, while accessibility often retrofits","is_correct":true},{"id":"c",text":"Accessible design is more important","is_correct":false},{"id":"d",text":"Inclusive design is only for disability","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ACC207-08')::uuid, cid, 'multiple_choice', 'Focus styles (e.g. visible outlines) are important because:',
     '[{"id":"a","text":"They are decorative","is_correct":false},{"id":"b","text":"They show keyboard users which element is currently focused, enabling navigation","is_correct":true},{"id":"c",text":"They improve performance","is_correct":false},{"id":"d",text":"They are required by CSS","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-09')::uuid, cid, 'multiple_choice', 'Decorative images should have an empty alt attribute (alt="") because:',
     '[{"id":"a","text":"Empty alt makes images invisible","is_correct":false},{"id":"b","text":"Screen readers skip images with empty alt, avoiding meaningless announcements","is_correct":true},{"id":"c",text":"It speeds up page load","is_correct":false},{"id":"d","text":"It is required by WCAG for all images","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ACC207-10')::uuid, cid, 'multiple_choice', 'Colour alone should not be used to convey information because:',
     '[{"id":"a","text":"Colours are expensive","is_correct":false},{"id":"b","text":"Colour-blind users may not perceive the distinction","is_correct":true},{"id":"c",text":"It violates WCAG Level AAA only","is_correct":false},{"id":"d",text":"Colour is not visible on mobile","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-11')::uuid, cid, 'multiple_choice', 'A "skip to main content" link is used for:',
     '[{"id":"a","text":"Skipping the entire page","is_correct":false},{"id":"b","text":"Allowing keyboard and screen reader users to bypass repetitive navigation","is_correct":true},{"id":"c",text":"Hiding the navigation from users","is_correct":false},{"id":"d","text":"Skipping to the footer","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ACC207-12')::uuid, cid, 'multiple_choice', 'Which disability type does time-based media captioning primarily support?',
     '[{"id":"a","text":"Visual impairments","is_correct":false},{"id":"b","text":"Deaf and hard-of-hearing users","is_correct":true},{"id":"c",text":"Cognitive disabilities","is_correct":false},{"id":"d",text":"Motor impairments","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-13')::uuid, cid, 'multiple_choice', 'The WCAG Level AA requirement for large text contrast is:',
     '[{"id":"a","text":"2:1","is_correct":false},{"id":"b","text":"3:1","is_correct":true},{"id":"c","text":"4.5:1","is_correct":false},{"id":"d","text":"7:1","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ACC207-14')::uuid, cid, 'multiple_choice', 'Form labels must be programmatically associated with inputs because:',
     '[{"id":"a","text":"It is a design trend","is_correct":false},{"id":"b","text":"Screen readers use the label to announce the input''s purpose to users","is_correct":true},{"id":"c",text":"Labels need to be bold","is_correct":false},{"id":"d",text":"It is only required for password fields","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ACC207-15')::uuid, cid, 'multiple_choice', 'Progressive enhancement as an accessibility strategy means:',
     '[{"id":"a","text":"Progressively reducing features for older browsers","is_correct":false},{"id":"b","text":"Starting with a solid accessible baseline that works for all, then adding enhancements","is_correct":true},{"id":"c",text":"Enhancing only desktop versions","is_correct":false},{"id":"d",text":"Adding features progressively over time","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ACC207-16')::uuid, cid, 'multiple_choice', 'Which tool can automatically detect some accessibility issues on a web page?',
     '[{"id":"a","text":"Adobe Photoshop","is_correct":false},{"id":"b","text":"Google Lighthouse Accessibility Audit","is_correct":true},{"id":"c",text":"Figma Accessibility Plugin","is_correct":false},{"id":"d",text":"Google Analytics","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ACC207-17')::uuid, cid, 'multiple_choice', 'Accessible error messages should:',
     '[{"id":"a","text":"Use red colour alone to indicate errors","is_correct":false},{"id":"b","text":"Clearly describe what went wrong and how to fix it, using multiple cues not just colour","is_correct":true},{"id":"c",text":"Be displayed only on submission","is_correct":false},{"id":"d",text":"Use technical codes","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ACC207-18')::uuid, cid, 'multiple_choice', 'Automated accessibility testing tools can catch approximately what percentage of all accessibility issues?',
     '[{"id":"a","text":"80-90%","is_correct":false},{"id":"b","text":"30-40%","is_correct":true},{"id":"c",text":"10%","is_correct":false},{"id":"d","text":"100%","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ACC207-19')::uuid, cid, 'multiple_choice', 'The concept of "curb cut effect" in inclusive design refers to:',
     '[{"id":"a","text":"Cutting corners in design","is_correct":false},{"id":"b","text":"Accessibility features designed for one group often benefit many others (e.g. captions benefiting noisy environments)","is_correct":true},{"id":"c",text":"Reducing the number of design steps","is_correct":false},{"id":"d","text":"Design for roads and pavements","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ACC207-20')::uuid, cid, 'multiple_choice', 'WCAG 2.1 added specific criteria for which of the following?',
     '[{"id":"a","text":"Print media accessibility","is_correct":false},{"id":"b","text":"Mobile accessibility and cognitive disabilities","is_correct":true},{"id":"c",text":"Voice user interface standards","is_correct":false},{"id":"d","text":"AR/VR accessibility","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── MOT208 Motion Design and Microinteractions ───────────────────────
  cid := md5('aorthar-course-MOT208')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'MOT208', 'Motion Design and Microinteractions',
     'Principles and practice of motion design for digital interfaces. Covers animation principles, easing, timing, Figma Smart Animate, CSS transitions, microinteraction design and motion guidelines.',
     y200, y200s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-MOT208-1')::uuid, cid, '12 Principles of Animation for UI', 1, true),
    (md5('aorthar-l-MOT208-2')::uuid, cid, 'Easing and Timing Functions', 2, true),
    (md5('aorthar-l-MOT208-3')::uuid, cid, 'Microinteractions — Structure and Design', 3, true),
    (md5('aorthar-l-MOT208-4')::uuid, cid, 'CSS Transitions and Animations', 4, true),
    (md5('aorthar-l-MOT208-5')::uuid, cid, 'Figma Smart Animate and Prototyping Motion', 5, true),
    (md5('aorthar-l-MOT208-6')::uuid, cid, 'Loading States and Progress Animations', 6, true),
    (md5('aorthar-l-MOT208-7')::uuid, cid, 'Page Transitions and Navigation Animation', 7, true),
    (md5('aorthar-l-MOT208-8')::uuid, cid, 'Accessible Animation and Motion Preferences', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-1-1')::uuid, lid, 'youtube', '12 Principles of Animation', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 1),
    (md5('aorthar-r-MOT208-1-2')::uuid, lid, 'youtube', 'Animation Principles for UI Design', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 2),
    (md5('aorthar-r-MOT208-1-3')::uuid, lid, 'youtube', 'Motion Design for Digital Products', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-2-1')::uuid, lid, 'youtube', 'CSS Easing Functions Explained', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1),
    (md5('aorthar-r-MOT208-2-2')::uuid, lid, 'youtube', 'Animation Timing and Duration', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 2),
    (md5('aorthar-r-MOT208-2-3')::uuid, lid, 'youtube', 'Bezier Curves for Motion', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-3-1')::uuid, lid, 'youtube', 'Microinteractions by Dan Saffer', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 1),
    (md5('aorthar-r-MOT208-3-2')::uuid, lid, 'youtube', 'Designing Microinteractions', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 2),
    (md5('aorthar-r-MOT208-3-3')::uuid, lid, 'youtube', 'Best Microinteraction Examples', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-4-1')::uuid, lid, 'youtube', 'CSS Transitions Tutorial', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1),
    (md5('aorthar-r-MOT208-4-2')::uuid, lid, 'youtube', 'CSS Animations Deep Dive', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-MOT208-4-3')::uuid, lid, 'youtube', 'CSS Keyframe Animations', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-5-1')::uuid, lid, 'youtube', 'Figma Smart Animate Tutorial', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-MOT208-5-2')::uuid, lid, 'youtube', 'Prototyping Motion in Figma', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-MOT208-5-3')::uuid, lid, 'youtube', 'After Delay Interactions in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-6-1')::uuid, lid, 'youtube', 'Loading Animation Design', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 1),
    (md5('aorthar-r-MOT208-6-2')::uuid, lid, 'youtube', 'Skeleton Screen Animations', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-MOT208-6-3')::uuid, lid, 'youtube', 'Progress Bar Design', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-7-1')::uuid, lid, 'youtube', 'Page Transition Animations', 'https://www.youtube.com/watch?v=AzQXH0HmU7I', 1),
    (md5('aorthar-r-MOT208-7-2')::uuid, lid, 'youtube', 'Navigation Animation Patterns', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-MOT208-7-3')::uuid, lid, 'youtube', 'Smooth Page Transitions in CSS', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MOT208-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MOT208-8-1')::uuid, lid, 'youtube', 'Accessible Animation Design', 'https://www.youtube.com/watch?v=3f31oufqFSM', 1),
    (md5('aorthar-r-MOT208-8-2')::uuid, lid, 'youtube', 'Reduce Motion CSS Media Query', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 2),
    (md5('aorthar-r-MOT208-8-3')::uuid, lid, 'youtube', 'Vestibular Disorders and Motion Design', 'https://www.youtube.com/watch?v=3f31oufqFSM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-MOT208-01')::uuid, cid, 'multiple_choice', 'The animation principle "ease in, ease out" means:',
     '[{"id":"a","text":"Animation only works at the start and end","is_correct":false},{"id":"b","text":"Motion starts slow, speeds up and then slows down to a stop, mimicking natural physics","is_correct":true},{"id":"c",text":"The animation is easy to create","is_correct":false},{"id":"d","text":"The animation is available to everyone","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MOT208-02')::uuid, cid, 'multiple_choice', 'The 12 principles of animation were originally developed by:',
     '[{"id":"a","text":"Google Material Design team","is_correct":false},{"id":"b","text":"Disney animators Ollie Johnston and Frank Thomas","is_correct":true},{"id":"c",text":"Apple Human Interface team","is_correct":false},{"id":"d",text":"Nielsen Norman Group","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-03')::uuid, cid, 'multiple_choice', 'A microinteraction trigger can be:',
     '[{"id":"a","text":"Only a button click","is_correct":false},{"id":"b","text":"A user action or a system event that initiates a microinteraction","is_correct":true},{"id":"c",text":"A loading state only","is_correct":false},{"id":"d",text":"A server response","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-04')::uuid, cid, 'multiple_choice', 'The CSS property "transition" requires which values?',
     '[{"id":"a","text":"Property, duration, easing and delay","is_correct":true},{"id":"b","text":"Keyframe, duration and colour","is_correct":false},{"id":"c",text":"Transform and animation name","is_correct":false},{"id":"d",text":"Opacity and scale","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-05')::uuid, cid, 'multiple_choice', 'The prefers-reduced-motion CSS media query is used to:',
     '[{"id":"a","text":"Reduce the file size of animations","is_correct":false},{"id":"b","text":"Respect users who have indicated they prefer less motion for accessibility reasons","is_correct":true},{"id":"c",text":"Disable all CSS animations by default","is_correct":false},{"id":"d",text":"Optimise animation performance","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-06')::uuid, cid, 'multiple_choice', 'Animation timing in UI should be:',
     '[{"id":"a","text":"As slow as possible for elegance","is_correct":false},{"id":"b","text":"Fast enough to feel responsive but slow enough for users to perceive the change (100-500ms)","is_correct":true},{"id":"c",text":"Always exactly 1 second","is_correct":false},{"id":"d","text":"Identical for all elements","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-07')::uuid, cid, 'multiple_choice', 'Squash and stretch in animation conveys:',
     '[{"id":"a","text":"Weight and flexibility of objects","is_correct":true},{"id":"b",text":"The speed of the animation","is_correct":false},{"id":"c","text":"The direction of movement","is_correct":false},{"id":"d","text":"The colour change of elements","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-08')::uuid, cid, 'multiple_choice', 'In Figma, Smart Animate works by:',
     '[{"id":"a","text":"Generating animations using AI","is_correct":false},{"id":"b","text":"Detecting matching layer names between frames and interpolating the transition","is_correct":true},{"id":"c",text":"Automatically setting timing","is_correct":false},{"id":"d","text":"Adding CSS to the prototype","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-09')::uuid, cid, 'multiple_choice', 'The CSS @keyframes rule is used to:',
     '[{"id":"a","text":"Define the color of animated elements","is_correct":false},{"id":"b","text":"Define the stages of an animation at percentage points of the animation duration","is_correct":true},{"id":"c",text":"Select elements by key name","is_correct":false},{"id":"d",text":"Set keyboard shortcuts","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-10')::uuid, cid, 'multiple_choice', 'A skeleton screen animation improves UX by:',
     '[{"id":"a","text":"Loading content faster","is_correct":false},{"id":"b","text":"Providing visual feedback that content is loading, making the wait feel shorter","is_correct":true},{"id":"c",text":"Preventing errors","is_correct":false},{"id":"d","text":"Replacing actual content","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MOT208-11')::uuid, cid, 'multiple_choice', 'The animation principle "anticipation" means:',
     '[{"id":"a","text":"The designer anticipating user needs","is_correct":false},{"id":"b","text":"A small preparatory motion before a main action to signal what is about to happen","is_correct":true},{"id":"c",text":"Preloading animations","is_correct":false},{"id":"d","text":"Predicting the next frame","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-12')::uuid, cid, 'multiple_choice', 'Motion in UI should primarily serve to:',
     '[{"id":"a","text":"Impress users with technical skill","is_correct":false},{"id":"b","text":"Communicate meaning, guide attention and provide feedback — never just for decoration","is_correct":true},{"id":"c",text":"Make the product look modern","is_correct":false},{"id":"d","text":"Slow down user interactions","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MOT208-13')::uuid, cid, 'multiple_choice', 'CSS "transform: translate()" is preferred over changing "top/left" for animations because:',
     '[{"id":"a","text":"It is easier to write","is_correct":false},{"id":"b","text":"Transform does not trigger layout reflow, resulting in smoother GPU-accelerated animations","is_correct":true},{"id":"c",text":"It changes the element''s position permanently","is_correct":false},{"id":"d","text":"It is compatible with older browsers","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MOT208-14')::uuid, cid, 'multiple_choice', 'Vestibular disorders can be triggered by:',
     '[{"id":"a","text":"Slow animations only","is_correct":false},{"id":"b","text":"Excessive motion, parallax scrolling and rapid animation that disrupts the inner ear's balance signals","is_correct":true},{"id":"c",text":"Any use of colour","is_correct":false},{"id":"d","text":"Text animations only","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MOT208-15')::uuid, cid, 'multiple_choice', 'The animation principle "follow through" refers to:',
     '[{"id":"a","text":"Following the user through their journey","is_correct":false},{"id":"b","text":"Parts of an element continuing to move briefly after the main motion has stopped","is_correct":true},{"id":"c",text":"Continuing the project after launch","is_correct":false},{"id":"d",text":"Linking animations between screens","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-16')::uuid, cid, 'multiple_choice', 'A "spring" easing function simulates:',
     '[{"id":"a","text":"Water movement","is_correct":false},{"id":"b",text":"Physics-based bounce and oscillation at the end of motion","is_correct":true},{"id":"c","text":"A smooth linear motion","is_correct":false},{"id":"d","text":"A fast snap animation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-17')::uuid, cid, 'multiple_choice', 'Which CSS property is most commonly animated for smooth UI transitions?',
     '[{"id":"a","text":"font-family","is_correct":false},{"id":"b","text":"opacity, transform and background-color","is_correct":true},{"id":"c","text":"display","is_correct":false},{"id":"d","text":"z-index","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MOT208-18')::uuid, cid, 'multiple_choice', 'The motion design concept of "choreography" refers to:',
     '[{"id":"a","text":"Dance-inspired animations","is_correct":false},{"id":"b",text":"Coordinating the timing and direction of multiple animated elements to tell a clear visual story","is_correct":true},{"id":"c","text":"Random animation of all elements","is_correct":false},{"id":"d","text":"A dance UI metaphor","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MOT208-19')::uuid, cid, 'multiple_choice', 'Lottie animations are:',
     '[{"id":"a","text":"A type of lottery system","is_correct":false},{"id":"b","text":"JSON-based vector animations exported from After Effects and played on the web with a lightweight library","is_correct":true},{"id":"c",text":"CSS-only animations","is_correct":false},{"id":"d","text":"GIF files optimised for web","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MOT208-20')::uuid, cid, 'multiple_choice', 'When should animation be reduced or disabled in a UI?',
     '[{"id":"a","text":"Never — animation always improves UX","is_correct":false},{"id":"b","text":"When the user has enabled the prefers-reduced-motion setting, indicating motion sensitivity","is_correct":true},{"id":"c",text":"On desktop only","is_correct":false},{"id":"d","text":"When loading times exceed 3 seconds","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── DAT209 Data-Driven Design ────────────────────────────────────────
  cid := md5('aorthar-course-DAT209')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'DAT209', 'Data-Driven Design',
     'Using data and analytics to inform design decisions. Covers analytics tools, A/B testing, funnels, heatmaps, session recordings, data visualisation and building a data-informed design culture.',
     y200, y200s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-DAT209-1')::uuid, cid, 'Introduction to Data-Driven Design', 1, true),
    (md5('aorthar-l-DAT209-2')::uuid, cid, 'Analytics Tools — Google Analytics and Mixpanel', 2, true),
    (md5('aorthar-l-DAT209-3')::uuid, cid, 'Heatmaps and Session Recordings', 3, true),
    (md5('aorthar-l-DAT209-4')::uuid, cid, 'Conversion Funnels and Drop-off Analysis', 4, true),
    (md5('aorthar-l-DAT209-5')::uuid, cid, 'A/B Testing and Experimentation', 5, true),
    (md5('aorthar-l-DAT209-6')::uuid, cid, 'Key Metrics — NPS, CSAT, Task Success Rate', 6, true),
    (md5('aorthar-l-DAT209-7')::uuid, cid, 'Data Visualisation for Designers', 7, true),
    (md5('aorthar-l-DAT209-8')::uuid, cid, 'Building a Data-Informed Design Culture', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-1-1')::uuid, lid, 'youtube', 'Data-Driven Design Explained', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-DAT209-1-2')::uuid, lid, 'youtube', 'Quantitative UX Research', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-DAT209-1-3')::uuid, lid, 'youtube', 'Using Data in UX Design', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-2-1')::uuid, lid, 'youtube', 'Google Analytics Tutorial', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-DAT209-2-2')::uuid, lid, 'youtube', 'Mixpanel for Product Designers', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-DAT209-2-3')::uuid, lid, 'youtube', 'Product Analytics Overview', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-3-1')::uuid, lid, 'youtube', 'Hotjar Heatmaps Tutorial', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 1),
    (md5('aorthar-r-DAT209-3-2')::uuid, lid, 'youtube', 'Session Recording Analysis', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 2),
    (md5('aorthar-r-DAT209-3-3')::uuid, lid, 'youtube', 'Using Click Maps for Design', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-4-1')::uuid, lid, 'youtube', 'Funnel Analysis Tutorial', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-DAT209-4-2')::uuid, lid, 'youtube', 'Conversion Optimisation Basics', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 2),
    (md5('aorthar-r-DAT209-4-3')::uuid, lid, 'youtube', 'Drop-off Rate Analysis', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-5-1')::uuid, lid, 'youtube', 'A/B Testing for Designers', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 1),
    (md5('aorthar-r-DAT209-5-2')::uuid, lid, 'youtube', 'How to Run an A/B Test', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 2),
    (md5('aorthar-r-DAT209-5-3')::uuid, lid, 'youtube', 'Statistical Significance Explained', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-6-1')::uuid, lid, 'youtube', 'NPS Score Explained', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-DAT209-6-2')::uuid, lid, 'youtube', 'UX Metrics and KPIs', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 2),
    (md5('aorthar-r-DAT209-6-3')::uuid, lid, 'youtube', 'HEART Framework for UX Metrics', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-7-1')::uuid, lid, 'youtube', 'Data Visualisation Design', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 1),
    (md5('aorthar-r-DAT209-7-2')::uuid, lid, 'youtube', 'Choosing the Right Chart Type', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 2),
    (md5('aorthar-r-DAT209-7-3')::uuid, lid, 'youtube', 'Dashboard Design Best Practices', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DAT209-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DAT209-8-1')::uuid, lid, 'youtube', 'Building a Data Culture in Design', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-DAT209-8-2')::uuid, lid, 'youtube', 'Data-Informed vs Data-Driven', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-DAT209-8-3')::uuid, lid, 'youtube', 'Presenting Data to Stakeholders', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-DAT209-01')::uuid, cid, 'multiple_choice', 'What does A/B testing involve?',
     '[{"id":"a","text":"Testing two different versions of a design with different user groups to determine which performs better","is_correct":true},{"id":"b","text":"Testing a design with A-level and B-level users","is_correct":false},{"id":"c",text":"Running two tests back to back","is_correct":false},{"id":"d","text":"A usability study with two participants","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DAT209-02')::uuid, cid, 'multiple_choice', 'A heatmap in web analytics shows:',
     '[{"id":"a","text":"The temperature of server hardware","is_correct":false},{"id":"b","text":"Where users click, move or scroll most on a page, using colour intensity","is_correct":true},{"id":"c",text":"The warmth of the colour palette","is_correct":false},{"id":"d",text":"The most visited pages","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DAT209-03')::uuid, cid, 'multiple_choice', 'A conversion funnel shows:',
     '[{"id":"a","text":"The funnel-shaped UI component","is_correct":false},{"id":"b","text":"The sequence of steps users take and the drop-off rates between each step","is_correct":true},{"id":"c",text":"The revenue funnel","is_correct":false},{"id":"d",text":"Marketing acquisition channels","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DAT209-04')::uuid, cid, 'multiple_choice', 'NPS (Net Promoter Score) is calculated by:',
     '[{"id":"a","text":"Adding all scores together","is_correct":false},{"id":"b","text":"Subtracting the percentage of detractors from the percentage of promoters","is_correct":true},{"id":"c",text":"Averaging all ratings","is_correct":false},{"id":"d",text":"Counting only 5-star ratings","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-05')::uuid, cid, 'multiple_choice', 'Statistical significance in A/B testing means:',
     '[{"id":"a","text":"The test is statistically correct","is_correct":false},{"id":"b","text":"The observed difference is unlikely to be due to chance and is reliable enough to act on","is_correct":true},{"id":"c",text":"A large sample size was used","is_correct":false},{"id":"d",text":"The test is significant to the stakeholders","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-06')::uuid, cid, 'multiple_choice', 'Session recording tools are most useful for:',
     '[{"id":"a","text":"Recording design team sessions","is_correct":false},{"id":"b","text":"Watching real user behaviour to identify friction and confusion points","is_correct":true},{"id":"c",text":"Video content creation","is_correct":false},{"id":"d",text":"Tracking developer sessions","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DAT209-07')::uuid, cid, 'multiple_choice', 'The HEART framework for UX metrics stands for:',
     '[{"id":"a","text":"Happiness, Engagement, Adoption, Retention, Task Success","is_correct":true},{"id":"b",text":"Health, Experience, Accuracy, Reliability, Timing","is_correct":false},{"id":"c","text":"High, Efficient, Accessible, Responsive, Tested","is_correct":false},{"id":"d","text":"Heuristics, Evaluation, Analysis, Research, Testing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-08')::uuid, cid, 'multiple_choice', 'What is "bounce rate" in web analytics?',
     '[{"id":"a","text":"The rate at which users return to the site","is_correct":false},{"id":"b","text":"The percentage of visitors who leave after viewing only one page","is_correct":true},{"id":"c",text":"How often the site crashes","is_correct":false},{"id":"d",text":"How many times users scroll a page","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-09')::uuid, cid, 'multiple_choice', 'Data-driven design is limited by:',
     '[{"id":"a","text":"The number of users on the platform","is_correct":false},{"id":"b",text":"Data can tell you what is happening but not always why — qualitative research is needed for the why","is_correct":true},{"id":"c","text":"Design tool capabilities","is_correct":false},{"id":"d","text":"Government data regulations","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-10')::uuid, cid, 'multiple_choice', 'Task success rate measures:',
     '[{"id":"a","text":"How quickly a task is completed","is_correct":false},{"id":"b","text":"The percentage of users who successfully complete a defined task","is_correct":true},{"id":"c",text":"The number of tasks on a page","is_correct":false},{"id":"d","text":"Task manager performance","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-11')::uuid, cid, 'multiple_choice', 'A multivariate test differs from an A/B test in that:',
     '[{"id":"a","text":"It is less accurate","is_correct":false},{"id":"b",text":"It tests multiple variables simultaneously to understand their combined effects","is_correct":true},{"id":"c","text":"It requires fewer users","is_correct":false},{"id":"d","text":"It only tests one element at a time","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DAT209-12')::uuid, cid, 'multiple_choice', 'A cohort analysis in product analytics involves:',
     '[{"id":"a","text":"Analysing the design cohesion","is_correct":false},{"id":"b",text":"Tracking a group of users who share a common characteristic over time","is_correct":true},{"id":"c","text":"Sorting users by age cohorts","is_correct":false},{"id":"d","text":"A group of analysts reviewing data together","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DAT209-13')::uuid, cid, 'multiple_choice', 'Retention rate in product analytics measures:',
     '[{"id":"a","text":"How many users the product retains in its database","is_correct":false},{"id":"b",text":"The percentage of users who return to use the product after their first visit","is_correct":true},{"id":"c","text":"How long users spend on a page","is_correct":false},{"id":"d","text":"Data storage retention policies","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-14')::uuid, cid, 'multiple_choice', 'Data visualisation in dashboards should prioritise:',
     '[{"id":"a","text":"Using as many charts as possible","is_correct":false},{"id":"b",text":"Clarity, hierarchy and only displaying data that drives decisions","is_correct":true},{"id":"c","text":"Complex 3D charts for impact","is_correct":false},{"id":"d","text":"Colourful designs only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-15')::uuid, cid, 'multiple_choice', 'Which chart type is best for showing trends over time?',
     '[{"id":"a","text":"Pie chart","is_correct":false},{"id":"b","text":"Line chart","is_correct":true},{"id":"c",text":"Bar chart","is_correct":false},{"id":"d","text":"Scatter plot","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DAT209-16')::uuid, cid, 'multiple_choice', '"Data-informed" design differs from "data-driven" design in that:',
     '[{"id":"a","text":"They are the same thing","is_correct":false},{"id":"b",text":"Data-informed uses data as one input alongside user research and design judgment; data-driven relies solely on metrics","is_correct":true},{"id":"c","text":"Data-informed ignores data","is_correct":false},{"id":"d","text":"Data-driven is always better","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DAT209-17')::uuid, cid, 'multiple_choice', 'CSAT (Customer Satisfaction Score) is typically measured by:',
     '[{"id":"a","text":"Counting support tickets","is_correct":false},{"id":"b",text":"Asking users to rate their satisfaction with a specific interaction on a scale","is_correct":true},{"id":"c","text":"Measuring page load speed","is_correct":false},{"id":"d","text":"Tracking time on site","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-18')::uuid, cid, 'multiple_choice', 'A scroll map shows:',
     '[{"id":"a","text":"How fast users scroll","is_correct":false},{"id":"b",text":"How far down the page users typically scroll before leaving","is_correct":true},{"id":"c","text":"Horizontal scrolling patterns","is_correct":false},{"id":"d","text":"The scroll speed settings","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-19')::uuid, cid, 'multiple_choice', 'Which metric best indicates whether users find a feature valuable?',
     '[{"id":"a","text":"Page views","is_correct":false},{"id":"b","text":"Feature adoption rate and retention after feature use","is_correct":true},{"id":"c",text":"Page load time","is_correct":false},{"id":"d","text":"Font size on the feature","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DAT209-20')::uuid, cid, 'multiple_choice', 'Segment in analytics refers to:',
     '[{"id":"a","text":"A type of UI component","is_correct":false},{"id":"b",text":"Filtering data to analyse a specific subset of users or behaviours","is_correct":true},{"id":"c","text":"A circular chart section","is_correct":false},{"id":"d","text":"A market segment definition","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── FIG210 Advanced Figma and Prototyping ────────────────────────────
  cid := md5('aorthar-course-FIG210')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'FIG210', 'Advanced Figma and Prototyping',
     'Advanced Figma skills including auto layout mastery, variables, advanced prototyping, component architecture, plugin ecosystem and optimising design workflows for production teams.',
     y200, y200s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-FIG210-1')::uuid, cid, 'Figma Auto Layout — Advanced Patterns', 1, true),
    (md5('aorthar-l-FIG210-2')::uuid, cid, 'Component Architecture and Variants', 2, true),
    (md5('aorthar-l-FIG210-3')::uuid, cid, 'Figma Variables and Theming', 3, true),
    (md5('aorthar-l-FIG210-4')::uuid, cid, 'Advanced Prototyping Interactions', 4, true),
    (md5('aorthar-l-FIG210-5')::uuid, cid, 'Figma Plugins for Productivity', 5, true),
    (md5('aorthar-l-FIG210-6')::uuid, cid, 'Organising Large Figma Projects', 6, true),
    (md5('aorthar-l-FIG210-7')::uuid, cid, 'Collaborative Design in Figma', 7, true),
    (md5('aorthar-l-FIG210-8')::uuid, cid, 'Figma for Design System Management', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-1-1')::uuid, lid, 'youtube', 'Advanced Figma Auto Layout', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-FIG210-1-2')::uuid, lid, 'youtube', 'Auto Layout Deep Dive', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-FIG210-1-3')::uuid, lid, 'youtube', 'Figma Responsive Design', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-2-1')::uuid, lid, 'youtube', 'Figma Component Variants', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-FIG210-2-2')::uuid, lid, 'youtube', 'Advanced Component Architecture', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-FIG210-2-3')::uuid, lid, 'youtube', 'Nested Components in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-3-1')::uuid, lid, 'youtube', 'Figma Variables Tutorial', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-FIG210-3-2')::uuid, lid, 'youtube', 'Dark Mode with Figma Variables', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-FIG210-3-3')::uuid, lid, 'youtube', 'Theming with Figma Variables', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-4-1')::uuid, lid, 'youtube', 'Advanced Figma Prototyping', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-FIG210-4-2')::uuid, lid, 'youtube', 'Conditional Interactions in Figma', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-FIG210-4-3')::uuid, lid, 'youtube', 'Figma Component Properties', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-5-1')::uuid, lid, 'youtube', 'Top Figma Plugins 2024', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-FIG210-5-2')::uuid, lid, 'youtube', 'Figma Plugins for Designers', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-FIG210-5-3')::uuid, lid, 'youtube', 'Automate Tasks with Figma Plugins', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-6-1')::uuid, lid, 'youtube', 'Organising Figma Files at Scale', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-FIG210-6-2')::uuid, lid, 'youtube', 'Figma File Structure Best Practices', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-FIG210-6-3')::uuid, lid, 'youtube', 'Figma Pages and Sections', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-7-1')::uuid, lid, 'youtube', 'Figma Collaboration Features', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-FIG210-7-2')::uuid, lid, 'youtube', 'Real-Time Collaboration in Figma', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-FIG210-7-3')::uuid, lid, 'youtube', 'Figma Branching for Teams', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FIG210-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FIG210-8-1')::uuid, lid, 'youtube', 'Figma Libraries for Design Systems', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-FIG210-8-2')::uuid, lid, 'youtube', 'Publishing Figma Libraries', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-FIG210-8-3')::uuid, lid, 'youtube', 'Design System in Figma Workflow', 'https://www.youtube.com/watch?v=3h7-NkpNKLY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-FIG210-01')::uuid, cid, 'multiple_choice', 'Figma Auto Layout''s "fill container" setting means:',
     '[{"id":"a","text":"The element has a fixed width","is_correct":false},{"id":"b","text":"The element stretches to fill its parent container","is_correct":true},{"id":"c",text":"The container is filled with content","is_correct":false},{"id":"d","text":"The element fills with colour","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-02')::uuid, cid, 'multiple_choice', 'Figma Variables (introduced in 2023) allow designers to:',
     '[{"id":"a","text":"Create animations automatically","is_correct":false},{"id":"b",text":"Store values that can change based on modes, enabling themes like dark/light","is_correct":true},{"id":"c","text":"Generate React code","is_correct":false},{"id":"d","text":"Connect to live databases","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-03')::uuid, cid, 'multiple_choice', 'A Figma "component property" allows you to:',
     '[{"id":"a","text":"Apply CSS properties to components","is_correct":false},{"id":"b","text":"Expose specific controls (like text, boolean, instance swap) on a component for easy editing","is_correct":true},{"id":"c",text":"Add JavaScript to components","is_correct":false},{"id":"d",text":"Lock component layers","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-04')::uuid, cid, 'multiple_choice', 'Figma branching allows teams to:',
     '[{"id":"a","text":"Create separate files","is_correct":false},{"id":"b","text":"Make changes in isolation and merge them back into the main file without disrupting others","is_correct":true},{"id":"c",text":"Branch into different projects","is_correct":false},{"id":"d",text":"Export branches to GitHub","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-05')::uuid, cid, 'multiple_choice', 'In Figma, "instance swap" allows you to:',
     '[{"id":"a","text":"Swap two layers","is_correct":false},{"id":"b","text":"Replace a component instance with another component from the library","is_correct":true},{"id":"c",text":"Swap colours","is_correct":false},{"id":"d","text":"Exchange designs with a team member","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-06')::uuid, cid, 'multiple_choice', 'Figma "sections" are used to:',
     '[{"id":"a","text":"Divide the canvas into equal parts","is_correct":false},{"id":"b",text":"Organise and label groups of frames on the canvas for better navigation","is_correct":true},{"id":"c","text":"Create responsive sections","is_correct":false},{"id":"d","text":"Build page sections automatically","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-07')::uuid, cid, 'multiple_choice', 'Which Figma prototyping feature creates realistic state-based transitions?',
     '[{"id":"a","text":"Dissolve transition","is_correct":false},{"id":"b",text":"Smart Animate with matching layer names","is_correct":true},{"id":"c","text":"Instant transition","is_correct":false},{"id":"d","text":"Push transition","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-08')::uuid, cid, 'multiple_choice', 'Publishing a Figma library allows:',
     '[{"id":"a","text":"The file to be published on the internet","is_correct":false},{"id":"b",text":"Team members to access and use components and styles from the library in their own files","is_correct":true},{"id":"c","text":"Components to be published as code","is_correct":false},{"id":"d","text":"Automatic design system updates","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-09')::uuid, cid, 'multiple_choice', 'Figma''s "detach from component" breaks the link to the master component, meaning:',
     '[{"id":"a","text":"The component becomes a group, no longer receiving updates from the master","is_correct":true},{"id":"b","text":"The component is deleted","is_correct":false},{"id":"c",text":"The component is exported","is_correct":false},{"id":"d","text":"The component becomes a style","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-10')::uuid, cid, 'multiple_choice', 'Figma''s "conditional" interactions (boolean variables) allow you to:',
     '[{"id":"a","text":"Create conditional JavaScript","is_correct":false},{"id":"b",text":"Trigger different prototype actions based on variable values, enabling complex state management","is_correct":true},{"id":"c",text":"Hide layers conditionally","is_correct":false},{"id":"d",text":"Conditionally export assets","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FIG210-11')::uuid, cid, 'multiple_choice', 'Which Figma feature enables wrapping of children when they overflow the container?',
     '[{"id":"a","text":"Clip content","is_correct":false},{"id":"b",text":"Auto Layout Wrap setting","is_correct":true},{"id":"c","text":"Overflow hidden","is_correct":false},{"id":"d","text":"Fixed height","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FIG210-12')::uuid, cid, 'multiple_choice', 'To maintain a consistent spacing system in Figma, designers should use:',
     '[{"id":"a","text":"Arbitrary pixel values for every element","is_correct":false},{"id":"b",text":"Design tokens or variables for spacing, ensuring alignment with the development team","is_correct":true},{"id":"c","text":"Grids only","is_correct":false},{"id":"d","text":"Rounded numbers only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-13')::uuid, cid, 'multiple_choice', 'Figma''s "prototype connections" can be triggered by:',
     '[{"id":"a","text":"Click only","is_correct":false},{"id":"b",text":"Click, hover, key press, drag or after delay","is_correct":true},{"id":"c","text":"Voice commands","is_correct":false},{"id":"d","text":"Only mouse events","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-14')::uuid, cid, 'multiple_choice', 'The benefit of nested components in Figma is:',
     '[{"id":"a","text":"They make files smaller","is_correct":false},{"id":"b",text":"They enable complex, flexible compositions from simple, reusable parts","is_correct":true},{"id":"c",text":"They prevent editing","is_correct":false},{"id":"d","text":"They are required for variants","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-15')::uuid, cid, 'multiple_choice', 'When working with large Figma files, what practice most improves performance?',
     '[{"id":"a","text":"Using more plugins","is_correct":false},{"id":"b",text":"Flattening complex vector shapes, reducing component depth and removing unused assets","is_correct":true},{"id":"c","text":"Adding more pages","is_correct":false},{"id":"d","text":"Increasing the canvas size","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FIG210-16')::uuid, cid, 'multiple_choice', 'Figma''s "boolean operations" (Union, Subtract, Intersect, Exclude) are used for:',
     '[{"id":"a","text":"Logic in prototyping","is_correct":false},{"id":"b",text":"Combining vector shapes in different ways to create new shapes","is_correct":true},{"id":"c",text":"Setting component properties","is_correct":false},{"id":"d","text":"Managing variables","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-17')::uuid, cid, 'multiple_choice', 'A "local component" in Figma is:',
     '[{"id":"a","text":"A component stored on your computer","is_correct":false},{"id":"b",text":"A component defined within the current file, not published to a shared library","is_correct":true},{"id":"c","text":"A component with local variables","is_correct":false},{"id":"d","text":"A government-regulated component","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-18')::uuid, cid, 'multiple_choice', 'Figma''s "interactive components" enable:',
     '[{"id":"a","text":"Components that interact with APIs","is_correct":false},{"id":"b",text":"Component variants that change state (e.g. hover, focus) within a prototype","is_correct":true},{"id":"c","text":"Real-time data in components","is_correct":false},{"id":"d","text":"Components that generate code","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FIG210-19')::uuid, cid, 'multiple_choice', 'The Figma "Inspect" panel is primarily used by:',
     '[{"id":"a","text":"Designers to review their work","is_correct":false},{"id":"b",text":"Developers to extract measurements, colours and CSS values from designs","is_correct":true},{"id":"c","text":"Project managers to track tasks","is_correct":false},{"id":"d","text":"QA testers to write bugs","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FIG210-20')::uuid, cid, 'multiple_choice', 'A "mode" in Figma Variables allows you to:',
     '[{"id":"a","text":"Switch between editing modes","is_correct":false},{"id":"b",text":"Define alternative sets of variable values (e.g. light and dark themes) applied across a design","is_correct":true},{"id":"c",text":"Preview the design on different devices","is_correct":false},{"id":"d","text":"Change the Figma interface theme","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 300 · SEMESTER 1
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── PRD301 Product Design Fundamentals ──────────────────────────────
  cid := md5('aorthar-course-PRD301')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'PRD301', 'Product Design Fundamentals',
     'Core product design practice covering the full product lifecycle, defining product vision, design strategy, feature prioritisation, stakeholder management and shipping successful digital products.',
     y300, y300s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-PRD301-1')::uuid, cid, 'What is Product Design?', 1, true),
    (md5('aorthar-l-PRD301-2')::uuid, cid, 'Product Vision and Strategy', 2, true),
    (md5('aorthar-l-PRD301-3')::uuid, cid, 'Understanding Users at Product Scale', 3, true),
    (md5('aorthar-l-PRD301-4')::uuid, cid, 'Feature Prioritisation Frameworks', 4, true),
    (md5('aorthar-l-PRD301-5')::uuid, cid, 'Design Critique at Product Level', 5, true),
    (md5('aorthar-l-PRD301-6')::uuid, cid, 'Stakeholder Management for Designers', 6, true),
    (md5('aorthar-l-PRD301-7')::uuid, cid, 'Shipping Product — From Design to Launch', 7, true),
    (md5('aorthar-l-PRD301-8')::uuid, cid, 'Post-Launch — Iteration and Growth', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-1-1')::uuid, lid, 'youtube', 'Product Design Explained', 'https://www.youtube.com/watch?v=v6n1i0qojws', 1),
    (md5('aorthar-r-PRD301-1-2')::uuid, lid, 'youtube', 'Product Designer Role Overview', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 2),
    (md5('aorthar-r-PRD301-1-3')::uuid, lid, 'youtube', 'Day in the Life of a Product Designer', 'https://www.youtube.com/watch?v=rgeN2SWr6Ms', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-2-1')::uuid, lid, 'youtube', 'Product Strategy Framework', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 1),
    (md5('aorthar-r-PRD301-2-2')::uuid, lid, 'youtube', 'Product Vision Workshop', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 2),
    (md5('aorthar-r-PRD301-2-3')::uuid, lid, 'youtube', 'OKRs for Product Teams', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-3-1')::uuid, lid, 'youtube', 'User Research at Scale', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-PRD301-3-2')::uuid, lid, 'youtube', 'Continuous Discovery Habits', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 2),
    (md5('aorthar-r-PRD301-3-3')::uuid, lid, 'youtube', 'Product Discovery Techniques', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-4-1')::uuid, lid, 'youtube', 'Feature Prioritisation Frameworks', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 1),
    (md5('aorthar-r-PRD301-4-2')::uuid, lid, 'youtube', 'RICE Scoring Method', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 2),
    (md5('aorthar-r-PRD301-4-3')::uuid, lid, 'youtube', 'MoSCoW Prioritisation', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-5-1')::uuid, lid, 'youtube', 'Product Design Review', 'https://www.youtube.com/watch?v=Bn2s58JjIjA', 1),
    (md5('aorthar-r-PRD301-5-2')::uuid, lid, 'youtube', 'Structured Design Critique', 'https://www.youtube.com/watch?v=rgeN2SWr6Ms', 2),
    (md5('aorthar-r-PRD301-5-3')::uuid, lid, 'youtube', 'Receiving Critique as a Designer', 'https://www.youtube.com/watch?v=v6n1i0qojws', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-6-1')::uuid, lid, 'youtube', 'Stakeholder Management for Designers', 'https://www.youtube.com/watch?v=Bn2s58JjIjA', 1),
    (md5('aorthar-r-PRD301-6-2')::uuid, lid, 'youtube', 'Presenting Design to Executives', 'https://www.youtube.com/watch?v=rgeN2SWr6Ms', 2),
    (md5('aorthar-r-PRD301-6-3')::uuid, lid, 'youtube', 'Influencing Without Authority', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-7-1')::uuid, lid, 'youtube', 'Design to Launch Process', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 1),
    (md5('aorthar-r-PRD301-7-2')::uuid, lid, 'youtube', 'Product Launch Checklist', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 2),
    (md5('aorthar-r-PRD301-7-3')::uuid, lid, 'youtube', 'Working with Engineering Teams', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRD301-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRD301-8-1')::uuid, lid, 'youtube', 'Post-Launch Iteration', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-PRD301-8-2')::uuid, lid, 'youtube', 'Growth Design Fundamentals', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 2),
    (md5('aorthar-r-PRD301-8-3')::uuid, lid, 'youtube', 'Measuring Product Design Success', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-PRD301-01')::uuid, cid, 'multiple_choice', 'A product designer differs from a UX designer primarily in that:',
     '[{"id":"a","text":"Product designers only work on mobile apps","is_correct":false},{"id":"b","text":"Product designers consider the entire product lifecycle including business outcomes","is_correct":true},{"id":"c",text":"Product designers do not conduct user research","is_correct":false},{"id":"d","text":"Product designers only work on visual design","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRD301-02')::uuid, cid, 'multiple_choice', 'The RICE prioritisation framework considers:',
     '[{"id":"a","text":"Revenue, Investment, Capacity, Effort","is_correct":false},{"id":"b","text":"Reach, Impact, Confidence, Effort","is_correct":true},{"id":"c",text":"Risk, Investment, Cost, Evaluation","is_correct":false},{"id":"d","text":"Return, Importance, Certainty, Experience","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-03')::uuid, cid, 'multiple_choice', 'OKRs (Objectives and Key Results) in product design help by:',
     '[{"id":"a","text":"Replacing user research","is_correct":false},{"id":"b","text":"Aligning design work with measurable business and user outcomes","is_correct":true},{"id":"c",text":"Managing team performance reviews","is_correct":false},{"id":"d","text":"Tracking design file revisions","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-04')::uuid, cid, 'multiple_choice', 'Product vision describes:',
     '[{"id":"a","text":"The current state of the product","is_correct":false},{"id":"b","text":"The future aspirational state of the product and the impact it aims to have","is_correct":true},{"id":"c",text":"A list of current bugs to fix","is_correct":false},{"id":"d",text":"The product''s annual revenue goal","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRD301-05')::uuid, cid, 'multiple_choice', 'MoSCoW in feature prioritisation stands for:',
     '[{"id":"a","text":"Minimum, Optional, Should, Could, Would","is_correct":false},{"id":"b","text":"Must Have, Should Have, Could Have, Won''t Have","is_correct":true},{"id":"c",text":"Mandatory, Optional, Suggested, Complete, Withdrawn","is_correct":false},{"id":"d","text":"Main, Other, Side, Critical, Wanted","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-06')::uuid, cid, 'multiple_choice', 'A successful product launch requires designers to:',
     '[{"id":"a","text":"Only deliver final designs","is_correct":false},{"id":"b","text":"Collaborate with engineering, QA and marketing to ensure the product ships successfully","is_correct":true},{"id":"c",text":"Hand off and disengage from the process","is_correct":false},{"id":"d","text":"Only present to stakeholders","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRD301-07')::uuid, cid, 'multiple_choice', 'Continuous discovery in product design means:',
     '[{"id":"a","text":"Conducting user research once per year","is_correct":false},{"id":"b",text":"Regularly interviewing users as an ongoing practice throughout the product lifecycle","is_correct":true},{"id":"c","text":"Discovering new design tools","is_correct":false},{"id":"d","text":"Continuously learning new frameworks","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-08')::uuid, cid, 'multiple_choice', 'The concept of "design debt" refers to:',
     '[{"id":"a","text":"The cost of design tools","is_correct":false},{"id":"b",text":"Accumulated shortcuts and inconsistencies in design that create future rework","is_correct":true},{"id":"c","text":"Unpaid designer invoices","is_correct":false},{"id":"d","text":"Overly complex design systems","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-09')::uuid, cid, 'multiple_choice', 'A product roadmap communicates:',
     '[{"id":"a","text":"The exact design of each feature","is_correct":false},{"id":"b","text":"The planned direction and priorities for the product over time","is_correct":true},{"id":"c",text":"A list of completed features","is_correct":false},{"id":"d","text":"The team''s salary structure","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRD301-10')::uuid, cid, 'multiple_choice', 'When presenting design decisions to stakeholders, designers should:',
     '[{"id":"a","text":"Only show the final design","is_correct":false},{"id":"b",text":"Explain the problem, the rationale and evidence behind decisions, not just the visual outcome","is_correct":true},{"id":"c",text":"Show all explorations equally","is_correct":false},{"id":"d",text":"Let stakeholders choose the design they like best","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-11')::uuid, cid, 'multiple_choice', 'The "opportunity solution tree" is a tool for:',
     '[{"id":"a","text":"Mapping design job opportunities","is_correct":false},{"id":"b",text":"Connecting product outcomes to user opportunities and potential solutions","is_correct":true},{"id":"c","text":"Organising a design team","is_correct":false},{"id":"d","text":"A tree diagram of website pages","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PRD301-12')::uuid, cid, 'multiple_choice', '"Scope creep" in product design refers to:',
     '[{"id":"a","text":"Increasing the scope of user research","is_correct":false},{"id":"b","text":"Uncontrolled growth of project requirements that delays delivery","is_correct":true},{"id":"c",text":"A wide-angle camera lens in product photography","is_correct":false},{"id":"d","text":"Growing a design team","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-13')::uuid, cid, 'multiple_choice', 'A product designer''s primary goal is to:',
     '[{"id":"a","text":"Create beautiful screens","is_correct":false},{"id":"b",text":"Solve user and business problems through well-designed experiences","is_correct":true},{"id":"c","text":"Build the product themselves","is_correct":false},{"id":"d","text":"Manage the engineering team","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRD301-14')::uuid, cid, 'multiple_choice', 'Feature flags in product development allow designers to:',
     '[{"id":"a","text":"Flag features they dislike","is_correct":false},{"id":"b",text":"Control the rollout of features to specific user segments without redeployment","is_correct":true},{"id":"c",text":"Create feature flags in Figma","is_correct":false},{"id":"d","text":"Flag design debt","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PRD301-15')::uuid, cid, 'multiple_choice', 'The "now, next, later" roadmap framework organises priorities by:',
     '[{"id":"a","text":"Time zones","is_correct":false},{"id":"b",text":"Timeframe: current work, upcoming work and future ideas","is_correct":true},{"id":"c",text":"Team members","is_correct":false},{"id":"d","text":"Feature importance only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-16')::uuid, cid, 'multiple_choice', 'Dogfooding in product development means:',
     '[{"id":"a","text":"A dog-themed design sprint","is_correct":false},{"id":"b","text":"Using your own product internally before releasing to customers","is_correct":true},{"id":"c",text":"Rapidly prototyping ideas","is_correct":false},{"id":"d","text":"Testing with loyal users","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PRD301-17')::uuid, cid, 'multiple_choice', 'The North Star metric in a product is:',
     '[{"id":"a","text":"A metric related to team size","is_correct":false},{"id":"b",text":"The single most important metric that best captures the value delivered to users","is_correct":true},{"id":"c","text":"The highest KPI on a dashboard","is_correct":false},{"id":"d","text":"A navigation metric","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-18')::uuid, cid, 'multiple_choice', '"Ship and iterate" as a product philosophy means:',
     '[{"id":"a","text":"Only shipping when the product is perfect","is_correct":false},{"id":"b",text":"Releasing functional versions quickly, gathering feedback and improving over time","is_correct":true},{"id":"c","text":"Shipping physical products","is_correct":false},{"id":"d","text":"Iterating designs without releasing","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRD301-19')::uuid, cid, 'multiple_choice', 'When a stakeholder asks for a specific solution rather than describing a problem, a designer should:',
     '[{"id":"a","text":"Implement the solution as requested","is_correct":false},{"id":"b",text":"Ask questions to understand the underlying problem and explore whether better solutions exist","is_correct":true},{"id":"c",text":"Refuse to proceed","is_correct":false},{"id":"d",text":"Escalate to the CEO","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRD301-20')::uuid, cid, 'multiple_choice', 'The "impact vs effort" matrix helps teams:',
     '[{"id":"a","text":"Calculate ROI","is_correct":false},{"id":"b","text":"Prioritise work by identifying high-impact, low-effort quick wins","is_correct":true},{"id":"c",text":"Measure designer performance","is_correct":false},{"id":"d","text":"Calculate sprint velocity","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── PMG302 Introduction to Product Management ───────────────────────
  cid := md5('aorthar-course-PMG302')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'PMG302', 'Introduction to Product Management',
     'Introduction to product management from a designer''s perspective. Covers PM roles, discovery, roadmapping, user stories, sprint planning and how designers and PMs collaborate effectively.',
     y300, y300s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-PMG302-1')::uuid, cid, 'What is Product Management?', 1, true),
    (md5('aorthar-l-PMG302-2')::uuid, cid, 'Product Discovery vs Product Delivery', 2, true),
    (md5('aorthar-l-PMG302-3')::uuid, cid, 'Writing User Stories and Acceptance Criteria', 3, true),
    (md5('aorthar-l-PMG302-4')::uuid, cid, 'Roadmapping and Backlog Management', 4, true),
    (md5('aorthar-l-PMG302-5')::uuid, cid, 'Product Metrics and Success Measurement', 5, true),
    (md5('aorthar-l-PMG302-6')::uuid, cid, 'Designer and PM Collaboration', 6, true),
    (md5('aorthar-l-PMG302-7')::uuid, cid, 'Stakeholder Communication and Alignment', 7, true),
    (md5('aorthar-l-PMG302-8')::uuid, cid, 'Go-to-Market and Product Launch', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-1-1')::uuid, lid, 'youtube', 'What is Product Management?', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 1),
    (md5('aorthar-r-PMG302-1-2')::uuid, lid, 'youtube', 'Product Manager Role Explained', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 2),
    (md5('aorthar-r-PMG302-1-3')::uuid, lid, 'youtube', 'PM vs Designer vs Engineer', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-2-1')::uuid, lid, 'youtube', 'Product Discovery vs Delivery', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 1),
    (md5('aorthar-r-PMG302-2-2')::uuid, lid, 'youtube', 'Dual Track Agile', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-PMG302-2-3')::uuid, lid, 'youtube', 'Continuous Discovery Habits', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-3-1')::uuid, lid, 'youtube', 'How to Write User Stories', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-PMG302-3-2')::uuid, lid, 'youtube', 'Acceptance Criteria Examples', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 2),
    (md5('aorthar-r-PMG302-3-3')::uuid, lid, 'youtube', 'User Stories vs Use Cases', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-4-1')::uuid, lid, 'youtube', 'Product Roadmap Tutorial', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 1),
    (md5('aorthar-r-PMG302-4-2')::uuid, lid, 'youtube', 'Backlog Refinement Process', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-PMG302-4-3')::uuid, lid, 'youtube', 'Managing Product Backlogs', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-5-1')::uuid, lid, 'youtube', 'Product Metrics and KPIs', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-PMG302-5-2')::uuid, lid, 'youtube', 'North Star Metric Framework', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-PMG302-5-3')::uuid, lid, 'youtube', 'Measuring Product Success', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-6-1')::uuid, lid, 'youtube', 'Designer and PM Collaboration', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 1),
    (md5('aorthar-r-PMG302-6-2')::uuid, lid, 'youtube', 'Product Trio Model', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 2),
    (md5('aorthar-r-PMG302-6-3')::uuid, lid, 'youtube', 'Working in a Product Team', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-7-1')::uuid, lid, 'youtube', 'Stakeholder Communication in PM', 'https://www.youtube.com/watch?v=Bn2s58JjIjA', 1),
    (md5('aorthar-r-PMG302-7-2')::uuid, lid, 'youtube', 'Getting Stakeholder Alignment', 'https://www.youtube.com/watch?v=rgeN2SWr6Ms', 2),
    (md5('aorthar-r-PMG302-7-3')::uuid, lid, 'youtube', 'Building Product Buy-In', 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PMG302-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PMG302-8-1')::uuid, lid, 'youtube', 'Go-to-Market Strategy', 'https://www.youtube.com/watch?v=MzEVEXPL1VU', 1),
    (md5('aorthar-r-PMG302-8-2')::uuid, lid, 'youtube', 'Product Launch Planning', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 2),
    (md5('aorthar-r-PMG302-8-3')::uuid, lid, 'youtube', 'Post-Launch Measurement', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-PMG302-01')::uuid, cid, 'multiple_choice', 'The role of a Product Manager is best described as:',
     '[{"id":"a","text":"The CEO of the product","is_correct":false},{"id":"b","text":"The person responsible for the product strategy, roadmap and ensuring the team builds the right thing","is_correct":true},{"id":"c",text":"The lead designer of the product","is_correct":false},{"id":"d","text":"The technical lead of the product","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-02')::uuid, cid, 'multiple_choice', 'A user story follows which format?',
     '[{"id":"a","text":"As a system, I need... so that...","is_correct":false},{"id":"b","text":"As a [user type], I want [goal] so that [benefit]","is_correct":true},{"id":"c",text":"The user should be able to...","is_correct":false},{"id":"d",text":"Feature: [name] | Priority: [level]","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-03')::uuid, cid, 'multiple_choice', 'Product discovery focuses on:',
     '[{"id":"a","text":"Building features the team wants","is_correct":false},{"id":"b","text":"Understanding which problems to solve and validating solutions before building","is_correct":true},{"id":"c",text":"Discovering bugs in the product","is_correct":false},{"id":"d",text":"Finding competitors","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-04')::uuid, cid, 'multiple_choice', 'A backlog in agile product development is:',
     '[{"id":"a","text":"A list of completed features","is_correct":false},{"id":"b","text":"A prioritised list of features, bugs and tasks to be worked on","is_correct":true},{"id":"c",text":"A project timeline","is_correct":false},{"id":"d","text":"A design archive","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-05')::uuid, cid, 'multiple_choice', 'The "product trio" model refers to:',
     '[{"id":"a","text":"Three products in a portfolio","is_correct":false},{"id":"b","text":"The collaborative triad of Product Manager, Designer and Engineer working together","is_correct":true},{"id":"c",text":"Three stakeholder levels","is_correct":false},{"id":"d","text":"Three-step design process","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-06')::uuid, cid, 'multiple_choice', 'Acceptance criteria define:',
     '[{"id":"a","text":"Who can accept the final design","is_correct":false},{"id":"b",text":"The specific conditions that must be met for a user story to be considered complete","is_correct":true},{"id":"c","text":"The design acceptance process","is_correct":false},{"id":"d","text":"The product manager''s sign-off checklist","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-07')::uuid, cid, 'multiple_choice', 'A go-to-market strategy defines:',
     '[{"id":"a","text":"The internal team structure","is_correct":false},{"id":"b",text":"How the product will be launched, positioned and promoted to the target market","is_correct":true},{"id":"c",text":"The technical architecture","is_correct":false},{"id":"d","text":"The design handoff process","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-08')::uuid, cid, 'multiple_choice', '"Dual-track agile" refers to running discovery and delivery:',
     '[{"id":"a","text":"On two separate teams","is_correct":false},{"id":"b",text":"Simultaneously — discovering what to build while delivering already validated work","is_correct":true},{"id":"c",text":"On two-week alternating cycles","is_correct":false},{"id":"d",text":"In two separate tools","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-09')::uuid, cid, 'multiple_choice', 'The main difference between an outcome roadmap and a feature roadmap is:',
     '[{"id":"a","text":"They are the same","is_correct":false},{"id":"b",text":"Outcome roadmaps focus on results and goals; feature roadmaps list specific features to build","is_correct":true},{"id":"c",text":"Feature roadmaps are more strategic","is_correct":false},{"id":"d",text":"Outcome roadmaps replace the backlog","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-10')::uuid, cid, 'multiple_choice', 'Designers working with PMs should primarily focus on:',
     '[{"id":"a","text":"Telling the PM what to prioritise","is_correct":false},{"id":"b",text":"Bringing user insights, advocating for user needs and translating requirements into experiences","is_correct":true},{"id":"c",text":"Completing all PM tasks","is_correct":false},{"id":"d",text":"Writing technical specifications","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-11')::uuid, cid, 'multiple_choice', 'Sprint planning in agile involves:',
     '[{"id":"a","text":"Planning a team running sprint","is_correct":false},{"id":"b",text":"Selecting user stories from the backlog to complete in the upcoming sprint","is_correct":true},{"id":"c",text":"Designing the sprint retrospective","is_correct":false},{"id":"d",text":"A one-day design session","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-12')::uuid, cid, 'multiple_choice', 'A product manager''s primary responsibility to the team is to:',
     '[{"id":"a","text":"Design all screens","is_correct":false},{"id":"b",text":"Ensure the team is working on the most valuable problems aligned to business goals","is_correct":true},{"id":"c",text":"Write all the code","is_correct":false},{"id":"d","text":"Manage developer salaries","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-13')::uuid, cid, 'multiple_choice', 'What is a minimum viable product (MVP)?',
     '[{"id":"a","text":"The cheapest product possible","is_correct":false},{"id":"b",text":"The smallest version of a product that delivers core value and enables learning","is_correct":true},{"id":"c",text":"A product with minimal visual design","is_correct":false},{"id":"d",text":"A prototype with minimal features","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PMG302-14')::uuid, cid, 'multiple_choice', 'Backlog refinement (grooming) sessions involve:',
     '[{"id":"a","text":"Removing old features from the product","is_correct":false},{"id":"b",text":"Reviewing, estimating and prioritising backlog items with the product team","is_correct":true},{"id":"c",text":"Grooming the design team","is_correct":false},{"id":"d",text":"Testing the product","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-15')::uuid, cid, 'multiple_choice', '"Value vs complexity" scoring helps teams:',
     '[{"id":"a","text":"Price their products","is_correct":false},{"id":"b",text":"Identify high-value, low-complexity features to prioritise first","is_correct":true},{"id":"c",text":"Evaluate design complexity","is_correct":false},{"id":"d","text":"Calculate engineering costs","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-16')::uuid, cid, 'multiple_choice', 'Product-market fit means:',
     '[{"id":"a","text":"The product is available in the market","is_correct":false},{"id":"b",text":"The product satisfies a strong market demand that drives growth and retention","is_correct":true},{"id":"c",text":"The product matches competitor features","is_correct":false},{"id":"d","text":"The product is priced for the market","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-17')::uuid, cid, 'multiple_choice', 'The "product strategy" document typically outlines:',
     '[{"id":"a","text":"All design specifications","is_correct":false},{"id":"b",text":"The target market, value proposition, differentiation and how the product will win","is_correct":true},{"id":"c",text":"Development sprint plans","is_correct":false},{"id":"d","text":"The company''s financial projections","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-18')::uuid, cid, 'multiple_choice', 'Story points in agile are used to:',
     '[{"id":"a","text":"Score user stories","is_correct":false},{"id":"b",text":"Estimate the relative effort required to complete a user story","is_correct":true},{"id":"c",text":"Count the number of stories completed","is_correct":false},{"id":"d","text":"Track time spent on tasks","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-19')::uuid, cid, 'multiple_choice', 'Hypothesis-driven development means:',
     '[{"id":"a","text":"Building features based on engineering preferences","is_correct":false},{"id":"b",text":"Framing work as hypotheses to be validated with data and user feedback","is_correct":true},{"id":"c",text":"Speculating about future features","is_correct":false},{"id":"d","text":"Using scientific methods only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PMG302-20')::uuid, cid, 'multiple_choice', 'A product retrospective is used for:',
     '[{"id":"a","text":"Reviewing old designs","is_correct":false},{"id":"b",text":"Reflecting on what went well, what didn''t and how to improve the team''s process","is_correct":true},{"id":"c",text":"Retrospectively adding features","is_correct":false},{"id":"d","text":"Evaluating individual performance","is_correct":false}]'::jsonb, 1, true, false, 1)
  ON CONFLICT (id) DO NOTHING;

  -- ── AGI303 Agile and Scrum for Designers ────────────────────────────
  cid := md5('aorthar-course-AGI303')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'AGI303', 'Agile and Scrum for Designers',
     'How designers work effectively in agile environments. Covers Scrum ceremonies, sprint cycles, design within sprints, agile estimation, Kanban and practical strategies for designer-developer collaboration.',
     y300, y300s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-AGI303-1')::uuid, cid, 'Agile Manifesto and Principles', 1, true),
    (md5('aorthar-l-AGI303-2')::uuid, cid, 'Scrum Framework Overview', 2, true),
    (md5('aorthar-l-AGI303-3')::uuid, cid, 'Scrum Ceremonies for Designers', 3, true),
    (md5('aorthar-l-AGI303-4')::uuid, cid, 'Design in Sprints — Staying One Step Ahead', 4, true),
    (md5('aorthar-l-AGI303-5')::uuid, cid, 'Kanban for Design Teams', 5, true),
    (md5('aorthar-l-AGI303-6')::uuid, cid, 'Estimation and Design Story Points', 6, true),
    (md5('aorthar-l-AGI303-7')::uuid, cid, 'Designer-Developer Collaboration in Agile', 7, true),
    (md5('aorthar-l-AGI303-8')::uuid, cid, 'Scaling Agile — SAFe and LeSS Overview', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-1-1')::uuid, lid, 'youtube', 'Agile Manifesto Explained', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-AGI303-1-2')::uuid, lid, 'youtube', 'Agile vs Waterfall', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-AGI303-1-3')::uuid, lid, 'youtube', 'Agile Principles for Teams', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-2-1')::uuid, lid, 'youtube', 'Scrum Framework Tutorial', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-AGI303-2-2')::uuid, lid, 'youtube', 'Scrum Roles Explained', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-AGI303-2-3')::uuid, lid, 'youtube', 'Introduction to Scrum', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-3-1')::uuid, lid, 'youtube', 'Scrum Ceremonies Guide', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-AGI303-3-2')::uuid, lid, 'youtube', 'Sprint Planning Explained', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-AGI303-3-3')::uuid, lid, 'youtube', 'Daily Standups for Designers', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-4-1')::uuid, lid, 'youtube', 'Designing in Sprints', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 1),
    (md5('aorthar-r-AGI303-4-2')::uuid, lid, 'youtube', 'Design Sprint Ahead of Dev Sprint', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-AGI303-4-3')::uuid, lid, 'youtube', 'Lean UX in Agile Teams', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-5-1')::uuid, lid, 'youtube', 'Kanban for Designers', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-AGI303-5-2')::uuid, lid, 'youtube', 'Kanban Board Tutorial', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-AGI303-5-3')::uuid, lid, 'youtube', 'Scrum vs Kanban', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-6-1')::uuid, lid, 'youtube', 'Story Point Estimation', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-AGI303-6-2')::uuid, lid, 'youtube', 'Design Effort Estimation', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 2),
    (md5('aorthar-r-AGI303-6-3')::uuid, lid, 'youtube', 'Planning Poker Explained', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-7-1')::uuid, lid, 'youtube', 'Designer Developer Collaboration', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 1),
    (md5('aorthar-r-AGI303-7-2')::uuid, lid, 'youtube', 'Cross-Functional Teams', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-AGI303-7-3')::uuid, lid, 'youtube', 'Bridging Design and Dev', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-AGI303-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-AGI303-8-1')::uuid, lid, 'youtube', 'Scaling Agile Frameworks', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-AGI303-8-2')::uuid, lid, 'youtube', 'SAFe Framework Overview', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-AGI303-8-3')::uuid, lid, 'youtube', 'Large Scale Scrum LeSS', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-AGI303-01')::uuid, cid, 'multiple_choice', 'The Agile Manifesto values individuals and interactions over:',
     '[{"id":"a","text":"User research","is_correct":false},{"id":"b","text":"Processes and tools","is_correct":true},{"id":"c",text":"Sprint planning","is_correct":false},{"id":"d","text":"Stakeholder approval","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-AGI303-02')::uuid, cid, 'multiple_choice', 'In Scrum, the Scrum Master''s primary role is to:',
     '[{"id":"a","text":"Manage the design team","is_correct":false},{"id":"b","text":"Coach the team on Scrum practices and remove impediments","is_correct":true},{"id":"c",text":"Prioritise the product backlog","is_correct":false},{"id":"d",text":"Write user stories","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-AGI303-03')::uuid, cid, 'multiple_choice', 'A sprint retrospective is held to:',
     '[{"id":"a","text":"Demo the sprint output","is_correct":false},{"id":"b",text":"Reflect on the process and identify improvements for the next sprint","is_correct":true},{"id":"c",text":"Plan the next sprint","is_correct":false},{"id":"d","text":"Review the product roadmap","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-AGI303-04')::uuid, cid, 'multiple_choice', 'Designers in agile teams often work "one sprint ahead" to:',
     '[{"id":"a","text":"Beat the developers","is_correct":false},{"id":"b",text":"Ensure designs are ready for developers before they need to start building","is_correct":true},{"id":"c",text":"Work without deadlines","is_correct":false},{"id":"d","text":"Avoid sprint planning","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-05')::uuid, cid, 'multiple_choice', 'Kanban is different from Scrum in that:',
     '[{"id":"a","text":"Kanban uses sprints","is_correct":false},{"id":"b",text":"Kanban uses a continuous flow model with no fixed-length sprints","is_correct":true},{"id":"c",text":"Scrum uses a board","is_correct":false},{"id":"d",text":"Kanban requires a Scrum Master","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-06')::uuid, cid, 'multiple_choice', 'A daily standup (daily Scrum) is:',
     '[{"id":"a","text":"A one-hour planning meeting","is_correct":false},{"id":"b","text":"A short daily meeting to sync on what was done, what''s next and any blockers","is_correct":true},{"id":"c",text":"A daily design review","is_correct":false},{"id":"d","text":"A status report to management","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-AGI303-07')::uuid, cid, 'multiple_choice', 'The Agile principle of "responding to change over following a plan" means:',
     '[{"id":"a","text":"Teams should have no plan","is_correct":false},{"id":"b","text":"Adapting to new information is valued more than rigidly following the original plan","is_correct":true},{"id":"c",text":"Plans should be changed daily","is_correct":false},{"id":"d","text":"Stakeholders drive all changes","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-08')::uuid, cid, 'multiple_choice', 'A sprint review (demo) is held to:',
     '[{"id":"a","text":"Plan the next sprint","is_correct":false},{"id":"b","text":"Showcase what was completed in the sprint to stakeholders and gather feedback","is_correct":true},{"id":"c",text":"Reflect on the team''s process","is_correct":false},{"id":"d","text":"Review the design system","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-AGI303-09')::uuid, cid, 'multiple_choice', 'Work in Progress (WIP) limits in Kanban are used to:',
     '[{"id":"a","text":"Limit the amount of work created","is_correct":false},{"id":"b","text":"Prevent bottlenecks by restricting how many tasks can be in progress at once","is_correct":true},{"id":"c",text":"Limit designer working hours","is_correct":false},{"id":"d","text":"Restrict access to the Kanban board","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-10')::uuid, cid, 'multiple_choice', 'Planning poker is used in agile to:',
     '[{"id":"a","text":"Play cards during sprint planning","is_correct":false},{"id":"b","text":"Collaboratively estimate story point effort using cards to avoid anchoring bias","is_correct":true},{"id":"c",text":"Gamify backlog management","is_correct":false},{"id":"d","text":"A planning technique for poker games","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-11')::uuid, cid, 'multiple_choice', 'The definition of "done" in Scrum is:',
     '[{"id":"a","text":"When the PM approves a feature","is_correct":false},{"id":"b",text":"A shared agreement on what must be true for a piece of work to be considered complete","is_correct":true},{"id":"c",text":"When the designer finishes the mockup","is_correct":false},{"id":"d","text":"When the code is written","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-12')::uuid, cid, 'multiple_choice', 'Lean UX in agile teams encourages:',
     '[{"id":"a","text":"Extensive documentation before starting","is_correct":false},{"id":"b",text":"Rapid hypothesis testing with minimal upfront design documentation","is_correct":true},{"id":"c",text":"Designers to work alone","is_correct":false},{"id":"d","text":"Annual design reviews","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-13')::uuid, cid, 'multiple_choice', 'Which of the following is NOT a Scrum ceremony?',
     '[{"id":"a","text":"Sprint Planning","is_correct":false},{"id":"b",text":"Design Review","is_correct":true},{"id":"c","text":"Daily Scrum","is_correct":false},{"id":"d","text":"Sprint Retrospective","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-14')::uuid, cid, 'multiple_choice', 'A sprint burndown chart shows:',
     '[{"id":"a","text":"The team''s burnout risk","is_correct":false},{"id":"b","text":"The remaining work in a sprint vs time, showing whether the team is on track","is_correct":true},{"id":"c","text":"Revenue burned in a sprint","is_correct":false},{"id":"d",text":"Design iterations over time","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-15')::uuid, cid, 'multiple_choice', 'Velocity in agile refers to:',
     '[{"id":"a","text":"How fast designers work","is_correct":false},{"id":"b",text":"The average amount of story points a team completes per sprint","is_correct":true},{"id":"c",text":"The speed of page loading","is_correct":false},{"id":"d",text":"The pace of user research","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-16')::uuid, cid, 'multiple_choice', 'The Agile principle of "sustainable development" means:',
     '[{"id":"a","text":"Only using sustainable materials","is_correct":false},{"id":"b",text":"Teams should maintain a pace they can continue indefinitely without burning out","is_correct":true},{"id":"c",text":"Sustainable growth metrics","is_correct":false},{"id":"d",text":"Environmental sustainability","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-17')::uuid, cid, 'multiple_choice', 'An impediment in Scrum is:',
     '[{"id":"a","text":"A difficult design challenge","is_correct":false},{"id":"b","text":"Any obstacle blocking the team from making progress","is_correct":true},{"id":"c",text":"A slow sprint","is_correct":false},{"id":"d",text":"A disagreement between PM and designer","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-AGI303-18')::uuid, cid, 'multiple_choice', 'SAFe (Scaled Agile Framework) is designed for:',
     '[{"id":"a","text":"Small startups","is_correct":false},{"id":"b",text":"Large enterprises needing to scale agile across multiple teams","is_correct":true},{"id":"c",text":"Individual freelancers","is_correct":false},{"id":"d",text":"Government agencies only","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-AGI303-19')::uuid, cid, 'multiple_choice', 'In an agile team, the designer''s primary contribution to sprint planning is:',
     '[{"id":"a","text":"Estimating development time","is_correct":false},{"id":"b",text":"Providing clarity on UX requirements, design complexity and identifying dependencies","is_correct":true},{"id":"c",text":"Writing all user stories","is_correct":false},{"id":"d",text":"Managing the Kanban board","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-AGI303-20')::uuid, cid, 'multiple_choice', 'An epic in agile is:',
     '[{"id":"a","text":"A very successful sprint","is_correct":false},{"id":"b",text":"A large body of work that can be broken down into smaller user stories","is_correct":true},{"id":"c",text":"A large-scale user test","is_correct":false},{"id":"d","text":"An epic design project","is_correct":false}]'::jsonb, 1, true, false, 1)
  ON CONFLICT (id) DO NOTHING;


  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 300 · SEMESTER 1
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── GRO304 Growth & Marketing Fundamentals ──────────────────────────
  cid := md5('aorthar-course-GRO304')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'GRO304', 'Growth & Marketing Fundamentals',
     'Learn growth strategies, marketing frameworks and acquisition channels for digital products. Students explore SEO, content marketing, paid acquisition and viral loops used by top-growth teams.',
     y300, y300s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-GRO304-1')::uuid, cid, 'What is Growth Marketing', 1, true),
    (md5('aorthar-l-GRO304-2')::uuid, cid, 'The AARRR Pirate Metrics Framework', 2, true),
    (md5('aorthar-l-GRO304-3')::uuid, cid, 'Acquisition Channels — Paid vs Organic', 3, true),
    (md5('aorthar-l-GRO304-4')::uuid, cid, 'Content Marketing and SEO for Products', 4, true),
    (md5('aorthar-l-GRO304-5')::uuid, cid, 'Viral Loops and Referral Mechanics', 5, true),
    (md5('aorthar-l-GRO304-6')::uuid, cid, 'Retention, Engagement and Churn Reduction', 6, true),
    (md5('aorthar-l-GRO304-7')::uuid, cid, 'Growth Experiments and A/B Testing', 7, true),
    (md5('aorthar-l-GRO304-8')::uuid, cid, 'Building a Growth Team and Culture', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-1-1')::uuid, lid, 'youtube', 'Growth Marketing vs Traditional Marketing', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 1),
    (md5('aorthar-r-GRO304-1-2')::uuid, lid, 'youtube', 'What is Growth Hacking', 'https://www.youtube.com/watch?v=AoQ9QHOUXUM', 2),
    (md5('aorthar-r-GRO304-1-3')::uuid, lid, 'youtube', 'Product-Led Growth Explained', 'https://www.youtube.com/watch?v=lTqfnS4OYGE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-2-1')::uuid, lid, 'youtube', 'AARRR Pirate Metrics Explained', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 1),
    (md5('aorthar-r-GRO304-2-2')::uuid, lid, 'youtube', 'Growth Metrics for Startups', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 2),
    (md5('aorthar-r-GRO304-2-3')::uuid, lid, 'youtube', 'Startup Metrics You Should Know', 'https://www.youtube.com/watch?v=lCIjA-bKcpA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-3-1')::uuid, lid, 'youtube', 'Paid vs Organic Marketing Channels', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 1),
    (md5('aorthar-r-GRO304-3-2')::uuid, lid, 'youtube', 'Digital Marketing Channels Overview', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 2),
    (md5('aorthar-r-GRO304-3-3')::uuid, lid, 'youtube', 'How to Choose Your Marketing Channel', 'https://www.youtube.com/watch?v=6FTZA8EqK5k', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-4-1')::uuid, lid, 'youtube', 'SEO for Beginners Full Course', 'https://www.youtube.com/watch?v=xsVTqzratPs', 1),
    (md5('aorthar-r-GRO304-4-2')::uuid, lid, 'youtube', 'Content Marketing Strategy 101', 'https://www.youtube.com/watch?v=rkg5lTFVkVE', 2),
    (md5('aorthar-r-GRO304-4-3')::uuid, lid, 'youtube', 'Keyword Research Tutorial', 'https://www.youtube.com/watch?v=OMJQPqG2Uas', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-5-1')::uuid, lid, 'youtube', 'Viral Loops and Referral Programs', 'https://www.youtube.com/watch?v=TWoQLBGqUhI', 1),
    (md5('aorthar-r-GRO304-5-2')::uuid, lid, 'youtube', 'How Dropbox Built Its Referral Engine', 'https://www.youtube.com/watch?v=AFa4OAhBSZI', 2),
    (md5('aorthar-r-GRO304-5-3')::uuid, lid, 'youtube', 'Network Effects Explained', 'https://www.youtube.com/watch?v=J2sMNMdK20w', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-6-1')::uuid, lid, 'youtube', 'User Retention Strategies', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-GRO304-6-2')::uuid, lid, 'youtube', 'Reducing Churn Rate', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-GRO304-6-3')::uuid, lid, 'youtube', 'Customer Engagement Tactics', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-7-1')::uuid, lid, 'youtube', 'A/B Testing for Growth', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 1),
    (md5('aorthar-r-GRO304-7-2')::uuid, lid, 'youtube', 'How to Run Growth Experiments', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 2),
    (md5('aorthar-r-GRO304-7-3')::uuid, lid, 'youtube', 'Statistical Significance in Marketing Tests', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-GRO304-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-GRO304-8-1')::uuid, lid, 'youtube', 'How to Build a Growth Team', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 1),
    (md5('aorthar-r-GRO304-8-2')::uuid, lid, 'youtube', 'Growth Culture at Facebook', 'https://www.youtube.com/watch?v=raIUQnPoeok', 2),
    (md5('aorthar-r-GRO304-8-3')::uuid, lid, 'youtube', 'North Star Metric Explained', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-GRO304-01')::uuid, cid, 'multiple_choice', 'What does the first "A" in the AARRR framework stand for?',
     '[{"id":"a","text":"Activation","is_correct":false},{"id":"b","text":"Acquisition","is_correct":true},{"id":"c","text":"Awareness","is_correct":false},{"id":"d","text":"Attribution","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-GRO304-02')::uuid, cid, 'multiple_choice', 'Which growth metric measures the percentage of users who continue using a product over time?',
     '[{"id":"a","text":"Acquisition rate","is_correct":false},{"id":"b","text":"Referral rate","is_correct":false},{"id":"c","text":"Retention rate","is_correct":true},{"id":"d","text":"Revenue per user","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-GRO304-03')::uuid, cid, 'multiple_choice', 'A viral loop in product growth refers to:',
     '[{"id":"a","text":"A bug that causes infinite loading","is_correct":false},{"id":"b","text":"A mechanism where existing users naturally bring in new users","is_correct":true},{"id":"c","text":"A paid advertising campaign","is_correct":false},{"id":"d","text":"A social media post going viral","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-GRO304-04')::uuid, cid, 'multiple_choice', 'Product-Led Growth (PLG) means:',
     '[{"id":"a","text":"The product team leads all marketing decisions","is_correct":false},{"id":"b","text":"The product itself is the primary driver of acquisition, conversion and retention","is_correct":true},{"id":"c","text":"Growth is led by the product manager alone","is_correct":false},{"id":"d","text":"All features are free","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-05')::uuid, cid, 'multiple_choice', 'SEO stands for:',
     '[{"id":"a","text":"Social Engagement Optimisation","is_correct":false},{"id":"b","text":"Search Engine Optimisation","is_correct":true},{"id":"c","text":"Site Enhancement Operations","is_correct":false},{"id":"d","text":"System Efficiency Output","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-GRO304-06')::uuid, cid, 'multiple_choice', 'The "Aha moment" in growth marketing refers to:',
     '[{"id":"a","text":"When a team reaches its growth target","is_correct":false},{"id":"b","text":"The moment a new user first experiences the core value of a product","is_correct":true},{"id":"c","text":"A successful A/B test result","is_correct":false},{"id":"d","text":"When a campaign goes viral","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-07')::uuid, cid, 'multiple_choice', 'A/B testing in growth experiments means:',
     '[{"id":"a","text":"Testing two different products","is_correct":false},{"id":"b","text":"Comparing two versions of a page or feature to determine which performs better","is_correct":true},{"id":"c","text":"Alternating between two marketing budgets","is_correct":false},{"id":"d","text":"Running two simultaneous ad campaigns","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-GRO304-08')::uuid, cid, 'multiple_choice', 'Churn rate measures:',
     '[{"id":"a","text":"How fast new users sign up","is_correct":false},{"id":"b","text":"The percentage of users who stop using a product in a given period","is_correct":true},{"id":"c","text":"Revenue growth rate","is_correct":false},{"id":"d","text":"The cost of acquiring a customer","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-GRO304-09')::uuid, cid, 'multiple_choice', 'Which of the following is an example of organic acquisition?',
     '[{"id":"a","text":"Facebook Ads","is_correct":false},{"id":"b","text":"SEO-driven blog content","is_correct":true},{"id":"c","text":"Google Display Network","is_correct":false},{"id":"d","text":"Sponsored Instagram posts","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-GRO304-10')::uuid, cid, 'multiple_choice', 'A North Star Metric is:',
     '[{"id":"a","text":"The total number of app downloads","is_correct":false},{"id":"b","text":"The single metric that best captures the core value a product delivers to users","is_correct":true},{"id":"c","text":"Monthly revenue","is_correct":false},{"id":"d","text":"Daily active users only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-11')::uuid, cid, 'multiple_choice', 'Dropbox''s famous referral programme gave extra storage to both referrer and referee. This is an example of:',
     '[{"id":"a","text":"Paid acquisition","is_correct":false},{"id":"b","text":"Double-sided incentive referral loop","is_correct":true},{"id":"c","text":"Content marketing","is_correct":false},{"id":"d","text":"SEO optimisation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-12')::uuid, cid, 'multiple_choice', 'Customer Acquisition Cost (CAC) is calculated as:',
     '[{"id":"a","text":"Total revenue divided by number of customers","is_correct":false},{"id":"b","text":"Total marketing and sales spend divided by number of new customers acquired","is_correct":true},{"id":"c","text":"Marketing spend divided by revenue","is_correct":false},{"id":"d","text":"Number of leads divided by conversions","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-13')::uuid, cid, 'multiple_choice', 'Network effects occur when:',
     '[{"id":"a","text":"A product has fast internet speed","is_correct":false},{"id":"b","text":"A product becomes more valuable as more people use it","is_correct":true},{"id":"c","text":"The marketing team networks at events","is_correct":false},{"id":"d","text":"Users share the product on social networks","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-14')::uuid, cid, 'multiple_choice', 'The activation stage in AARRR refers to:',
     '[{"id":"a","text":"Running advertising campaigns","is_correct":false},{"id":"b","text":"The moment a new user has their first positive experience with the product","is_correct":true},{"id":"c","text":"Users activating push notifications","is_correct":false},{"id":"d","text":"The product going live","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-15')::uuid, cid, 'multiple_choice', 'Which keyword research metric indicates how competitive it is to rank for a term?',
     '[{"id":"a","text":"Search volume","is_correct":false},{"id":"b","text":"Keyword difficulty","is_correct":true},{"id":"c","text":"Click-through rate","is_correct":false},{"id":"d","text":"Bounce rate","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-16')::uuid, cid, 'multiple_choice', 'LTV (Lifetime Value) is important in growth because:',
     '[{"id":"a","text":"It tells you the age of your users","is_correct":false},{"id":"b","text":"It determines the maximum you can spend to acquire a customer profitably","is_correct":true},{"id":"c","text":"It measures the lifetime of a product","is_correct":false},{"id":"d","text":"It is a vanity metric","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-17')::uuid, cid, 'multiple_choice', 'Cohort analysis in growth marketing helps teams understand:',
     '[{"id":"a","text":"Total website traffic","is_correct":false},{"id":"b","text":"How specific groups of users behave over time","is_correct":true},{"id":"c","text":"Average order value","is_correct":false},{"id":"d","text":"Social media follower growth","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-GRO304-18')::uuid, cid, 'multiple_choice', 'Which of the following best describes a growth experiment?',
     '[{"id":"a","text":"A random product change","is_correct":false},{"id":"b","text":"A structured test with a hypothesis, variable, and measurable outcome","is_correct":true},{"id":"c","text":"A marketing brainstorm session","is_correct":false},{"id":"d","text":"A user interview","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-GRO304-19')::uuid, cid, 'multiple_choice', 'Which metric best signals product-market fit?',
     '[{"id":"a","text":"Number of downloads","is_correct":false},{"id":"b","text":"High organic retention and word-of-mouth growth","is_correct":true},{"id":"c","text":"Large marketing budget","is_correct":false},{"id":"d","text":"Press coverage","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-GRO304-20')::uuid, cid, 'multiple_choice', 'Freemium as a growth model works because:',
     '[{"id":"a","text":"It eliminates all revenue","is_correct":false},{"id":"b","text":"Free users experience value and a portion convert to paid tiers over time","is_correct":true},{"id":"c","text":"It avoids the need for marketing","is_correct":false},{"id":"d","text":"All features are available for free","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── BRN305 Brand Strategy & Visual Identity ──────────────────────────
  cid := md5('aorthar-course-BRN305')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'BRN305', 'Brand Strategy & Visual Identity',
     'Explore the principles of brand strategy, positioning, voice and visual identity systems. Students learn to build cohesive brand experiences across touchpoints from logos to design systems.',
     y300, y300s1, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-BRN305-1')::uuid, cid, 'What is a Brand', 1, true),
    (md5('aorthar-l-BRN305-2')::uuid, cid, 'Brand Strategy and Positioning', 2, true),
    (md5('aorthar-l-BRN305-3')::uuid, cid, 'Brand Voice, Tone and Messaging', 3, true),
    (md5('aorthar-l-BRN305-4')::uuid, cid, 'Logo Design Principles', 4, true),
    (md5('aorthar-l-BRN305-5')::uuid, cid, 'Colour Systems and Brand Palettes', 5, true),
    (md5('aorthar-l-BRN305-6')::uuid, cid, 'Typography in Brand Identity', 6, true),
    (md5('aorthar-l-BRN305-7')::uuid, cid, 'Building a Visual Identity System', 7, true),
    (md5('aorthar-l-BRN305-8')::uuid, cid, 'Brand Guidelines and Design System Documentation', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-1-1')::uuid, lid, 'youtube', 'What is Branding and Why Does It Matter', 'https://www.youtube.com/watch?v=sO4te2QNsHY', 1),
    (md5('aorthar-r-BRN305-1-2')::uuid, lid, 'youtube', 'Brand vs Logo — The Difference Explained', 'https://www.youtube.com/watch?v=7q5-l6UqWW0', 2),
    (md5('aorthar-r-BRN305-1-3')::uuid, lid, 'youtube', 'How Great Brands Are Built', 'https://www.youtube.com/watch?v=6XRaKlNrFzs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-2-1')::uuid, lid, 'youtube', 'Brand Positioning Strategy', 'https://www.youtube.com/watch?v=TuoGn4QfCd8', 1),
    (md5('aorthar-r-BRN305-2-2')::uuid, lid, 'youtube', 'How to Define Your Brand Strategy', 'https://www.youtube.com/watch?v=ZPqPdyesbbc', 2),
    (md5('aorthar-r-BRN305-2-3')::uuid, lid, 'youtube', 'Simon Sinek — Start With Why', 'https://www.youtube.com/watch?v=qp0HIF3SfI4', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-3-1')::uuid, lid, 'youtube', 'Brand Voice and Tone of Voice Guide', 'https://www.youtube.com/watch?v=PXbMmGjMKPo', 1),
    (md5('aorthar-r-BRN305-3-2')::uuid, lid, 'youtube', 'Copywriting for Brands', 'https://www.youtube.com/watch?v=vtThiNR2MbQ', 2),
    (md5('aorthar-r-BRN305-3-3')::uuid, lid, 'youtube', 'How to Create a Brand Messaging Framework', 'https://www.youtube.com/watch?v=0QbLqHqUh6Y', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-4-1')::uuid, lid, 'youtube', 'Logo Design Principles and Process', 'https://www.youtube.com/watch?v=LQKDUcD8MuA', 1),
    (md5('aorthar-r-BRN305-4-2')::uuid, lid, 'youtube', 'The 7 Types of Logos', 'https://www.youtube.com/watch?v=3u9qPcAbgpk', 2),
    (md5('aorthar-r-BRN305-4-3')::uuid, lid, 'youtube', 'What Makes a Great Logo', 'https://www.youtube.com/watch?v=tpKnjmCBM5s', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-5-1')::uuid, lid, 'youtube', 'Colour Theory for Branding', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 1),
    (md5('aorthar-r-BRN305-5-2')::uuid, lid, 'youtube', 'How Colours Affect Brand Perception', 'https://www.youtube.com/watch?v=hpqFoR0oA6I', 2),
    (md5('aorthar-r-BRN305-5-3')::uuid, lid, 'youtube', 'Building a Brand Colour Palette', 'https://www.youtube.com/watch?v=c3pPa_qLoFs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-6-1')::uuid, lid, 'youtube', 'Typography for Brand Identity', 'https://www.youtube.com/watch?v=sByzHoiYFX0', 1),
    (md5('aorthar-r-BRN305-6-2')::uuid, lid, 'youtube', 'How to Pick Brand Fonts', 'https://www.youtube.com/watch?v=QrNi9FmdlxY', 2),
    (md5('aorthar-r-BRN305-6-3')::uuid, lid, 'youtube', 'Type Pairing for Designers', 'https://www.youtube.com/watch?v=EGKM0OABscc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-7-1')::uuid, lid, 'youtube', 'Building a Visual Identity System', 'https://www.youtube.com/watch?v=l-S2Y3SF3jM', 1),
    (md5('aorthar-r-BRN305-7-2')::uuid, lid, 'youtube', 'How to Create Brand Identity', 'https://www.youtube.com/watch?v=eDqfbfmv3fE', 2),
    (md5('aorthar-r-BRN305-7-3')::uuid, lid, 'youtube', 'Brand Identity Design Process', 'https://www.youtube.com/watch?v=XBDwS7SVQ6Y', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BRN305-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BRN305-8-1')::uuid, lid, 'youtube', 'How to Create Brand Guidelines', 'https://www.youtube.com/watch?v=egYDMqJ7MTA', 1),
    (md5('aorthar-r-BRN305-8-2')::uuid, lid, 'youtube', 'Design Systems and Brand Documentation', 'https://www.youtube.com/watch?v=EK-pHkc5EL4', 2),
    (md5('aorthar-r-BRN305-8-3')::uuid, lid, 'youtube', 'Brand Style Guide Walkthrough', 'https://www.youtube.com/watch?v=5PBJJTGk0Vs', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-BRN305-01')::uuid, cid, 'multiple_choice', 'A brand is best defined as:',
     '[{"id":"a","text":"A company logo","is_correct":false},{"id":"b","text":"The perception people have of a product or company","is_correct":true},{"id":"c","text":"A marketing campaign","is_correct":false},{"id":"d","text":"A colour palette","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-02')::uuid, cid, 'multiple_choice', 'Brand positioning defines:',
     '[{"id":"a","text":"Where a brand appears in search results","is_correct":false},{"id":"b","text":"How a brand is differentiated and perceived relative to competitors","is_correct":true},{"id":"c","text":"The physical location of a brand","is_correct":false},{"id":"d","text":"The price tier of a product","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-03')::uuid, cid, 'multiple_choice', 'Simon Sinek''s "Start With Why" concept argues that:',
     '[{"id":"a","text":"Customers buy what you do","is_correct":false},{"id":"b","text":"People buy why you do it, not what you do","is_correct":true},{"id":"c","text":"Price is the most important brand factor","is_correct":false},{"id":"d","text":"Design is more important than strategy","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-04')::uuid, cid, 'multiple_choice', 'Brand tone of voice refers to:',
     '[{"id":"a","text":"The pitch of a brand''s audio logo","is_correct":false},{"id":"b","text":"The personality and emotion expressed through a brand''s written communication","is_correct":true},{"id":"c","text":"The volume of brand advertisements","is_correct":false},{"id":"d","text":"The accent used in video ads","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-05')::uuid, cid, 'multiple_choice', 'A wordmark logo is:',
     '[{"id":"a","text":"A logo that uses only a symbol or icon","is_correct":false},{"id":"b","text":"A logo consisting solely of the brand name in a distinctive typeface","is_correct":true},{"id":"c","text":"A logo with both a symbol and text","is_correct":false},{"id":"d","text":"An animated logo","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-06')::uuid, cid, 'multiple_choice', 'Which colour is most commonly associated with trust and reliability in branding?',
     '[{"id":"a","text":"Red","is_correct":false},{"id":"b","text":"Blue","is_correct":true},{"id":"c","text":"Yellow","is_correct":false},{"id":"d","text":"Green","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-07')::uuid, cid, 'multiple_choice', 'A serif typeface in brand identity typically conveys:',
     '[{"id":"a","text":"Modernity and minimalism","is_correct":false},{"id":"b","text":"Tradition, authority and reliability","is_correct":true},{"id":"c","text":"Playfulness and fun","is_correct":false},{"id":"d","text":"Digital-first thinking","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-08')::uuid, cid, 'multiple_choice', 'Brand guidelines serve to:',
     '[{"id":"a","text":"Restrict creative freedom permanently","is_correct":false},{"id":"b","text":"Ensure consistent application of brand elements across all touchpoints","is_correct":true},{"id":"c","text":"Replace the need for a design team","is_correct":false},{"id":"d","text":"Define product pricing","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-09')::uuid, cid, 'multiple_choice', 'A brand''s primary colour palette typically contains:',
     '[{"id":"a","text":"10 or more colours","is_correct":false},{"id":"b","text":"1-3 core colours used consistently across all brand materials","is_correct":true},{"id":"c","text":"Only black and white","is_correct":false},{"id":"d","text":"The designer''s favourite colours","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-10')::uuid, cid, 'multiple_choice', 'Visual identity is best described as:',
     '[{"id":"a","text":"The company''s mission statement","is_correct":false},{"id":"b","text":"The set of visual elements that represent a brand including logo, colour, and typography","is_correct":true},{"id":"c","text":"A social media presence","is_correct":false},{"id":"d","text":"A product roadmap","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-11')::uuid, cid, 'multiple_choice', 'Brand equity refers to:',
     '[{"id":"a","text":"The financial value added by having a recognised and trusted brand","is_correct":true},{"id":"b","text":"The cost of creating brand assets","is_correct":false},{"id":"c","text":"The number of social media followers","is_correct":false},{"id":"d","text":"The brand''s market capitalisation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-12')::uuid, cid, 'multiple_choice', 'A monogram logo uses:',
     '[{"id":"a","text":"A photograph of the founder","is_correct":false},{"id":"b","text":"Initials or letters from the brand name as the primary mark","is_correct":true},{"id":"c","text":"A complex illustration","is_correct":false},{"id":"d","text":"A wordmark with shadow effects","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-13')::uuid, cid, 'multiple_choice', 'A brand architecture model that gives each product its own distinct brand is called:',
     '[{"id":"a","text":"Monolithic branding","is_correct":false},{"id":"b","text":"House of Brands","is_correct":true},{"id":"c","text":"Endorsed branding","is_correct":false},{"id":"d","text":"Co-branding","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-BRN305-14')::uuid, cid, 'multiple_choice', 'The primary purpose of a brand''s mood board is to:',
     '[{"id":"a","text":"Replace the logo design process","is_correct":false},{"id":"b","text":"Visually communicate the desired look, feel and direction of a brand","is_correct":true},{"id":"c","text":"Present financial projections","is_correct":false},{"id":"d","text":"Document user research","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-15')::uuid, cid, 'multiple_choice', 'Complementary colours in a brand palette are:',
     '[{"id":"a","text":"Colours that are adjacent on the colour wheel","is_correct":false},{"id":"b","text":"Colours opposite each other on the colour wheel that create high contrast","is_correct":true},{"id":"c","text":"Shades of the same colour","is_correct":false},{"id":"d","text":"Neutral tones added for balance","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-16')::uuid, cid, 'multiple_choice', 'Rebranding is typically undertaken when:',
     '[{"id":"a","text":"A designer gets bored","is_correct":false},{"id":"b","text":"A company needs to shift perception, enter new markets or recover from a crisis","is_correct":true},{"id":"c","text":"The company runs out of marketing budget","is_correct":false},{"id":"d","text":"The logo colours fade","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-17')::uuid, cid, 'multiple_choice', 'A brand tagline is most effective when it:',
     '[{"id":"a","text":"Is as long as possible","is_correct":false},{"id":"b","text":"Succinctly communicates the brand''s core promise or positioning","is_correct":true},{"id":"c","text":"Lists all product features","is_correct":false},{"id":"d","text":"Uses technical jargon","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-18')::uuid, cid, 'multiple_choice', 'Brand consistency across touchpoints is important because:',
     '[{"id":"a","text":"It limits design creativity","is_correct":false},{"id":"b","text":"It builds recognition, trust and credibility with audiences over time","is_correct":true},{"id":"c","text":"It reduces the cost of production","is_correct":false},{"id":"d","text":"It simplifies the onboarding process","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BRN305-19')::uuid, cid, 'multiple_choice', 'Coca-Cola''s use of the same red colour globally for decades is an example of:',
     '[{"id":"a","text":"Aggressive rebranding","is_correct":false},{"id":"b","text":"Consistent brand identity building long-term recognition","is_correct":true},{"id":"c","text":"Poor brand strategy","is_correct":false},{"id":"d","text":"A design system error","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BRN305-20')::uuid, cid, 'multiple_choice', 'In a brand design system, a token refers to:',
     '[{"id":"a","text":"A cryptocurrency used by the brand","is_correct":false},{"id":"b","text":"A named design value (e.g. colour, spacing) used consistently across components","is_correct":true},{"id":"c","text":"A user access credential","is_correct":false},{"id":"d","text":"A promotional discount code","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 300 · SEMESTER 2
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── CST306 Community Strategy & Social Design ───────────────────────
  cid := md5('aorthar-course-CST306')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'CST306', 'Community Strategy & Social Design',
     'Learn how to design, grow and govern digital communities. Students explore community models, social architecture, moderation frameworks and community-led product growth.',
     y300, y300s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-CST306-1')::uuid, cid, 'What is Community and Why It Matters', 1, true),
    (md5('aorthar-l-CST306-2')::uuid, cid, 'Community Models — Forums, Networks and Spaces', 2, true),
    (md5('aorthar-l-CST306-3')::uuid, cid, 'Community Strategy and Goal Setting', 3, true),
    (md5('aorthar-l-CST306-4')::uuid, cid, 'Social Architecture and Interaction Design', 4, true),
    (md5('aorthar-l-CST306-5')::uuid, cid, 'Onboarding and Activating Community Members', 5, true),
    (md5('aorthar-l-CST306-6')::uuid, cid, 'Moderation, Safety and Community Health', 6, true),
    (md5('aorthar-l-CST306-7')::uuid, cid, 'Community-Led Growth and Product Loops', 7, true),
    (md5('aorthar-l-CST306-8')::uuid, cid, 'Measuring Community Success', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-1-1')::uuid, lid, 'youtube', 'Why Community is the Future of Business', 'https://www.youtube.com/watch?v=8mJVJcCQJp4', 1),
    (md5('aorthar-r-CST306-1-2')::uuid, lid, 'youtube', 'Building Online Communities', 'https://www.youtube.com/watch?v=Ld0J0HwSXFM', 2),
    (md5('aorthar-r-CST306-1-3')::uuid, lid, 'youtube', 'Community-Led Growth Explained', 'https://www.youtube.com/watch?v=n-MQKzKM3mA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-2-1')::uuid, lid, 'youtube', 'Types of Online Communities', 'https://www.youtube.com/watch?v=QYDj4dBNuZw', 1),
    (md5('aorthar-r-CST306-2-2')::uuid, lid, 'youtube', 'Discord vs Slack vs Forum', 'https://www.youtube.com/watch?v=J7bXQWP9w8c', 2),
    (md5('aorthar-r-CST306-2-3')::uuid, lid, 'youtube', 'Community Platform Comparison', 'https://www.youtube.com/watch?v=VoA6TJqvabI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-3-1')::uuid, lid, 'youtube', 'How to Build a Community Strategy', 'https://www.youtube.com/watch?v=9SxCFBRZMNw', 1),
    (md5('aorthar-r-CST306-3-2')::uuid, lid, 'youtube', 'Setting Community Goals and OKRs', 'https://www.youtube.com/watch?v=L4N1q4RNi9I', 2),
    (md5('aorthar-r-CST306-3-3')::uuid, lid, 'youtube', 'Community Flywheel Model', 'https://www.youtube.com/watch?v=BG_4V1JjBz0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-4-1')::uuid, lid, 'youtube', 'Social Architecture in Digital Spaces', 'https://www.youtube.com/watch?v=Wr9apKRaGXQ', 1),
    (md5('aorthar-r-CST306-4-2')::uuid, lid, 'youtube', 'Designing for Social Behaviour', 'https://www.youtube.com/watch?v=7E3E6V7nZfY', 2),
    (md5('aorthar-r-CST306-4-3')::uuid, lid, 'youtube', 'UX for Social Platforms', 'https://www.youtube.com/watch?v=T2fORFnqMmQ', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-5-1')::uuid, lid, 'youtube', 'Community Onboarding Best Practices', 'https://www.youtube.com/watch?v=pKnRs7R_N8Y', 1),
    (md5('aorthar-r-CST306-5-2')::uuid, lid, 'youtube', 'Activating New Community Members', 'https://www.youtube.com/watch?v=KBjKS8KxLSY', 2),
    (md5('aorthar-r-CST306-5-3')::uuid, lid, 'youtube', 'Welcome Flows for Online Communities', 'https://www.youtube.com/watch?v=0FNKK5A3aaA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-6-1')::uuid, lid, 'youtube', 'Content Moderation at Scale', 'https://www.youtube.com/watch?v=KkBMkjGW3Dk', 1),
    (md5('aorthar-r-CST306-6-2')::uuid, lid, 'youtube', 'Community Health and Safety', 'https://www.youtube.com/watch?v=rPCyR_v7GGU', 2),
    (md5('aorthar-r-CST306-6-3')::uuid, lid, 'youtube', 'Trust and Safety Design', 'https://www.youtube.com/watch?v=TiJlYTmrfEA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-7-1')::uuid, lid, 'youtube', 'Community-Led Product Growth', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 1),
    (md5('aorthar-r-CST306-7-2')::uuid, lid, 'youtube', 'How Notion Built Its Community', 'https://www.youtube.com/watch?v=XBDwS7SVQ6Y', 2),
    (md5('aorthar-r-CST306-7-3')::uuid, lid, 'youtube', 'Figma Community Growth Story', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CST306-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CST306-8-1')::uuid, lid, 'youtube', 'Community Metrics and KPIs', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 1),
    (md5('aorthar-r-CST306-8-2')::uuid, lid, 'youtube', 'How to Measure Community Health', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-CST306-8-3')::uuid, lid, 'youtube', 'Community ROI and Business Value', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-CST306-01')::uuid, cid, 'multiple_choice', 'Which of the following best defines an online community?',
     '[{"id":"a","text":"A mailing list of customers","is_correct":false},{"id":"b","text":"A group of people who share a common interest and interact around it regularly","is_correct":true},{"id":"c","text":"A company''s social media following","is_correct":false},{"id":"d","text":"A product''s user base","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CST306-02')::uuid, cid, 'multiple_choice', 'Community-led growth means:',
     '[{"id":"a","text":"Growth driven by community managers alone","is_correct":false},{"id":"b","text":"Growth driven by members sharing, advocating and contributing to attract new users","is_correct":true},{"id":"c","text":"A community of growth hackers","is_correct":false},{"id":"d","text":"Marketing campaigns targeting community leaders","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CST306-03')::uuid, cid, 'multiple_choice', 'Social architecture in community design refers to:',
     '[{"id":"a","text":"The visual design of a social media platform","is_correct":false},{"id":"b","text":"The intentional structuring of spaces, roles and rules that shape how people interact","is_correct":true},{"id":"c","text":"The technical infrastructure of servers","is_correct":false},{"id":"d","text":"A community building methodology","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-04')::uuid, cid, 'multiple_choice', 'Which community platform is most suited to real-time chat and segmented channels?',
     '[{"id":"a","text":"A traditional forum","is_correct":false},{"id":"b","text":"Discord or Slack","is_correct":true},{"id":"c","text":"A newsletter","is_correct":false},{"id":"d","text":"A static website","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CST306-05')::uuid, cid, 'multiple_choice', 'A community flywheel works by:',
     '[{"id":"a","text":"Replacing paid advertising","is_correct":false},{"id":"b","text":"Creating a self-reinforcing loop where member value attracts more members","is_correct":true},{"id":"c","text":"Spinning the community off as a separate product","is_correct":false},{"id":"d","text":"Automating all community management tasks","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-06')::uuid, cid, 'multiple_choice', 'The onboarding stage for a new community member should primarily:',
     '[{"id":"a","text":"Sell them a premium plan immediately","is_correct":false},{"id":"b","text":"Help them understand the norms, get their first quick win and connect with others","is_correct":true},{"id":"c","text":"Ask them to recruit five other members","is_correct":false},{"id":"d","text":"Assign them a moderation role","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-07')::uuid, cid, 'multiple_choice', 'Effective community moderation requires:',
     '[{"id":"a","text":"Removing all negative content immediately","is_correct":false},{"id":"b","text":"Clear community guidelines, consistent enforcement and transparent communication","is_correct":true},{"id":"c","text":"Letting members self-regulate entirely","is_correct":false},{"id":"d","text":"Hiring an external legal team","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-08')::uuid, cid, 'multiple_choice', 'DAU/MAU ratio in a community measures:',
     '[{"id":"a","text":"The cost per active user","is_correct":false},{"id":"b","text":"How engaged or sticky the community is relative to its monthly active base","is_correct":true},{"id":"c","text":"The growth rate of new members","is_correct":false},{"id":"d","text":"The number of daily posts","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-09')::uuid, cid, 'multiple_choice', 'Power users in a community are important because:',
     '[{"id":"a","text":"They pay the highest subscription fees","is_correct":false},{"id":"b","text":"They contribute disproportionately to content quality and new member retention","is_correct":true},{"id":"c","text":"They manage the platform technically","is_correct":false},{"id":"d","text":"They are the only users who matter","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-10')::uuid, cid, 'multiple_choice', 'Which of the following is a strong leading indicator of community health?',
     '[{"id":"a","text":"Total number of registered accounts","is_correct":false},{"id":"b","text":"Percentage of members who post or engage at least once per month","is_correct":true},{"id":"c","text":"Number of community managers hired","is_correct":false},{"id":"d","text":"Website traffic from search engines","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-11')::uuid, cid, 'multiple_choice', 'Psychological safety in a community refers to:',
     '[{"id":"a","text":"Physical security of community servers","is_correct":false},{"id":"b","text":"Members feeling safe to share ideas, ask questions and be vulnerable without fear of ridicule","is_correct":true},{"id":"c","text":"Two-factor authentication for accounts","is_correct":false},{"id":"d","text":"Restricting access to new members","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-12')::uuid, cid, 'multiple_choice', 'Community-product loops occur when:',
     '[{"id":"a","text":"The product team builds community features","is_correct":false},{"id":"b","text":"Community activity generates product feedback and content that improves the product","is_correct":true},{"id":"c","text":"Community members become product managers","is_correct":false},{"id":"d","text":"A community replaces the product","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-CST306-13')::uuid, cid, 'multiple_choice', 'The Super-Consumer concept in community strategy refers to:',
     '[{"id":"a","text":"Users who consume the most content","is_correct":false},{"id":"b","text":"Highly engaged members who are deeply emotionally invested and drive outsized value","is_correct":true},{"id":"c","text":"Premium tier subscribers","is_correct":false},{"id":"d","text":"The community founder","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-CST306-14')::uuid, cid, 'multiple_choice', 'Why is a "welcome message" important for new community members?',
     '[{"id":"a","text":"It sells products immediately","is_correct":false},{"id":"b","text":"It sets expectations, establishes norms and helps members feel seen from the start","is_correct":true},{"id":"c","text":"It collects payment information","is_correct":false},{"id":"d","text":"It automatically assigns roles","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CST306-15')::uuid, cid, 'multiple_choice', 'Content seeding in a new community involves:',
     '[{"id":"a","text":"Planting seeds in a community garden","is_correct":false},{"id":"b","text":"Pre-populating the community with quality posts to reduce the cold-start problem","is_correct":true},{"id":"c","text":"Hiring content writers","is_correct":false},{"id":"d","text":"Posting advertisements","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-16')::uuid, cid, 'multiple_choice', 'Net Promoter Score (NPS) for a community measures:',
     '[{"id":"a","text":"Revenue generated by the community","is_correct":false},{"id":"b","text":"How likely members are to recommend the community to others","is_correct":true},{"id":"c","text":"The number of community promoters","is_correct":false},{"id":"d","text":"Social media reach","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CST306-17')::uuid, cid, 'multiple_choice', 'Which model best describes how Figma grew through community?',
     '[{"id":"a","text":"Aggressive paid advertising","is_correct":false},{"id":"b","text":"Enabling users to share templates and resources publicly, driving organic discovery","is_correct":true},{"id":"c","text":"Cold emailing designers","is_correct":false},{"id":"d","text":"Exclusive membership pricing","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-CST306-18')::uuid, cid, 'multiple_choice', 'Rituals in community strategy refer to:',
     '[{"id":"a","text":"Religious practices","is_correct":false},{"id":"b","text":"Regular recurring activities that create belonging and shared identity for members","is_correct":true},{"id":"c","text":"Onboarding checklists","is_correct":false},{"id":"d","text":"Payment rituals for subscriptions","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-CST306-19')::uuid, cid, 'multiple_choice', 'The "1-9-90 rule" of online communities states:',
     '[{"id":"a","text":"1% pay, 9% create, 90% view","is_correct":false},{"id":"b","text":"1% create content, 9% comment or curate, 90% lurk and consume","is_correct":true},{"id":"c","text":"1% are moderators, 9% are contributors, 90% are new members","is_correct":false},{"id":"d","text":"Engagement grows by 1-9-90 percent per month","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-CST306-20')::uuid, cid, 'multiple_choice', 'Community strategy should be aligned with business goals because:',
     '[{"id":"a","text":"Communities only exist to generate revenue","is_correct":false},{"id":"b","text":"This ensures community efforts contribute measurable value and receive sustainable investment","is_correct":true},{"id":"c","text":"Business goals are more important than member needs","is_correct":false},{"id":"d","text":"It prevents community managers from making decisions","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── FRE307 Freelancing & Creative Business ───────────────────────────
  cid := md5('aorthar-course-FRE307')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'FRE307', 'Freelancing & Creative Business',
     'A practical guide to building a freelance design practice. Students learn how to price services, find clients, write proposals, manage projects and build a sustainable creative career.',
     y300, y300s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-FRE307-1')::uuid, cid, 'Getting Started as a Freelance Designer', 1, true),
    (md5('aorthar-l-FRE307-2')::uuid, cid, 'Finding and Attracting Clients', 2, true),
    (md5('aorthar-l-FRE307-3')::uuid, cid, 'Pricing Your Design Services', 3, true),
    (md5('aorthar-l-FRE307-4')::uuid, cid, 'Writing Proposals and Statements of Work', 4, true),
    (md5('aorthar-l-FRE307-5')::uuid, cid, 'Managing Projects and Client Relationships', 5, true),
    (md5('aorthar-l-FRE307-6')::uuid, cid, 'Contracts, Invoicing and Getting Paid', 6, true),
    (md5('aorthar-l-FRE307-7')::uuid, cid, 'Building a Freelance Brand and Online Presence', 7, true),
    (md5('aorthar-l-FRE307-8')::uuid, cid, 'Scaling From Freelance to Studio', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-1-1')::uuid, lid, 'youtube', 'How to Start Freelancing as a Designer', 'https://www.youtube.com/watch?v=MJ01MEUCM8M', 1),
    (md5('aorthar-r-FRE307-1-2')::uuid, lid, 'youtube', 'Freelance Design Career Guide', 'https://www.youtube.com/watch?v=jOwTLMBDvJA', 2),
    (md5('aorthar-r-FRE307-1-3')::uuid, lid, 'youtube', 'From Full-Time to Freelance', 'https://www.youtube.com/watch?v=BcwWUHLRPao', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-2-1')::uuid, lid, 'youtube', 'How to Get Freelance Clients', 'https://www.youtube.com/watch?v=XvjJyoNzGKo', 1),
    (md5('aorthar-r-FRE307-2-2')::uuid, lid, 'youtube', 'Cold Outreach for Freelancers', 'https://www.youtube.com/watch?v=vAMvBBgM0r8', 2),
    (md5('aorthar-r-FRE307-2-3')::uuid, lid, 'youtube', 'LinkedIn for Freelance Designers', 'https://www.youtube.com/watch?v=QYDj4dBNuZw', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-3-1')::uuid, lid, 'youtube', 'How to Price Your Design Work', 'https://www.youtube.com/watch?v=AoQ9QHOUXUM', 1),
    (md5('aorthar-r-FRE307-3-2')::uuid, lid, 'youtube', 'Freelance Pricing Strategies', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 2),
    (md5('aorthar-r-FRE307-3-3')::uuid, lid, 'youtube', 'Value-Based Pricing for Creatives', 'https://www.youtube.com/watch?v=J2sMNMdK20w', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-4-1')::uuid, lid, 'youtube', 'How to Write a Design Proposal', 'https://www.youtube.com/watch?v=6FTZA8EqK5k', 1),
    (md5('aorthar-r-FRE307-4-2')::uuid, lid, 'youtube', 'Statement of Work Template for Designers', 'https://www.youtube.com/watch?v=lCIjA-bKcpA', 2),
    (md5('aorthar-r-FRE307-4-3')::uuid, lid, 'youtube', 'Winning Freelance Proposals', 'https://www.youtube.com/watch?v=TWoQLBGqUhI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-5-1')::uuid, lid, 'youtube', 'Managing Freelance Clients', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-FRE307-5-2')::uuid, lid, 'youtube', 'Project Management for Freelancers', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 2),
    (md5('aorthar-r-FRE307-5-3')::uuid, lid, 'youtube', 'Handling Difficult Design Clients', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-6-1')::uuid, lid, 'youtube', 'Freelance Design Contracts Explained', 'https://www.youtube.com/watch?v=AFa4OAhBSZI', 1),
    (md5('aorthar-r-FRE307-6-2')::uuid, lid, 'youtube', 'How to Invoice Clients as a Freelancer', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-FRE307-6-3')::uuid, lid, 'youtube', 'Getting Paid on Time Freelancing', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-7-1')::uuid, lid, 'youtube', 'Building Your Personal Brand as a Designer', 'https://www.youtube.com/watch?v=l-S2Y3SF3jM', 1),
    (md5('aorthar-r-FRE307-7-2')::uuid, lid, 'youtube', 'Freelance Portfolio Website Tips', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 2),
    (md5('aorthar-r-FRE307-7-3')::uuid, lid, 'youtube', 'Social Media for Freelance Designers', 'https://www.youtube.com/watch?v=raIUQnPoeok', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FRE307-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FRE307-8-1')::uuid, lid, 'youtube', 'Scaling a Freelance Business to Agency', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 1),
    (md5('aorthar-r-FRE307-8-2')::uuid, lid, 'youtube', 'Hiring Subcontractors as a Freelancer', 'https://www.youtube.com/watch?v=8mJVJcCQJp4', 2),
    (md5('aorthar-r-FRE307-8-3')::uuid, lid, 'youtube', 'From Solo Freelancer to Design Studio', 'https://www.youtube.com/watch?v=Ld0J0HwSXFM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-FRE307-01')::uuid, cid, 'multiple_choice', 'Which pricing model charges clients based on the value delivered rather than time spent?',
     '[{"id":"a","text":"Hourly rate","is_correct":false},{"id":"b","text":"Value-based pricing","is_correct":true},{"id":"c","text":"Day rate","is_correct":false},{"id":"d","text":"Retainer pricing","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FRE307-02')::uuid, cid, 'multiple_choice', 'A retainer agreement with a client means:',
     '[{"id":"a","text":"The client retains all intellectual property","is_correct":false},{"id":"b","text":"The client pays a recurring fee for a set amount of ongoing work each month","is_correct":true},{"id":"c","text":"The freelancer retains the final design files","is_correct":false},{"id":"d","text":"A one-off project agreement","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FRE307-03')::uuid, cid, 'multiple_choice', 'A Statement of Work (SOW) document typically includes:',
     '[{"id":"a","text":"The designer''s daily diary","is_correct":false},{"id":"b","text":"Scope, deliverables, timeline and payment terms for a project","is_correct":true},{"id":"c","text":"A list of design tools used","is_correct":false},{"id":"d","text":"The client''s annual report","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FRE307-04')::uuid, cid, 'multiple_choice', 'Scope creep in freelancing refers to:',
     '[{"id":"a","text":"Clients who are afraid of the project scope","is_correct":false},{"id":"b","text":"The gradual expansion of project requirements beyond the original agreement","is_correct":true},{"id":"c","text":"A design that becomes too complex","is_correct":false},{"id":"d","text":"The increasing cost of design tools","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FRE307-05')::uuid, cid, 'multiple_choice', 'The most reliable way to find new freelance clients is:',
     '[{"id":"a","text":"Cold emailing random businesses","is_correct":false},{"id":"b","text":"Building referrals from existing satisfied clients","is_correct":true},{"id":"c","text":"Lowering your rates dramatically","is_correct":false},{"id":"d","text":"Posting daily on social media","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-06')::uuid, cid, 'multiple_choice', 'When should a freelancer request a deposit before starting work?',
     '[{"id":"a","text":"Never — it puts clients off","is_correct":false},{"id":"b","text":"Always — typically 25-50% upfront to protect against non-payment","is_correct":true},{"id":"c","text":"Only for projects over $10,000","is_correct":false},{"id":"d","text":"Only for repeat clients","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FRE307-07')::uuid, cid, 'multiple_choice', 'Intellectual property (IP) ownership in a freelance contract determines:',
     '[{"id":"a","text":"Who owns the copyright to the created work","is_correct":true},{"id":"b","text":"The physical location of design files","is_correct":false},{"id":"c","text":"Software licensing costs","is_correct":false},{"id":"d","text":"The freelancer''s tax liability","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-08')::uuid, cid, 'multiple_choice', 'A kill fee in a freelance contract protects the designer by:',
     '[{"id":"a","text":"Eliminating the client if they misbehave","is_correct":false},{"id":"b","text":"Ensuring partial payment if the client cancels a project mid-way","is_correct":true},{"id":"c","text":"Covering design tool subscriptions","is_correct":false},{"id":"d","text":"Charging extra for revisions","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-09')::uuid, cid, 'multiple_choice', 'Which platform is most commonly used by freelance designers to find international clients?',
     '[{"id":"a","text":"TikTok","is_correct":false},{"id":"b","text":"Upwork or Contra","is_correct":true},{"id":"c","text":"Reddit","is_correct":false},{"id":"d","text":"Spotify","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FRE307-10')::uuid, cid, 'multiple_choice', 'Setting a minimum project fee helps freelancers to:',
     '[{"id":"a","text":"Scare away all clients","is_correct":false},{"id":"b","text":"Filter for clients who value the work and ensure projects cover minimum viable time","is_correct":true},{"id":"c","text":"Avoid paying taxes","is_correct":false},{"id":"d","text":"Maximise the number of projects","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-11')::uuid, cid, 'multiple_choice', 'An effective freelance proposal should begin with:',
     '[{"id":"a","text":"The freelancer''s biography","is_correct":false},{"id":"b","text":"A demonstration of understanding the client''s problem and goals","is_correct":true},{"id":"c","text":"The pricing breakdown","is_correct":false},{"id":"d","text":"A list of past clients","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-12')::uuid, cid, 'multiple_choice', 'Niche specialisation for a freelancer is advantageous because:',
     '[{"id":"a","text":"It limits income potential","is_correct":false},{"id":"b","text":"Specialists can charge premium rates and attract higher quality clients","is_correct":true},{"id":"c","text":"It reduces the need for a portfolio","is_correct":false},{"id":"d","text":"Clients prefer generalists","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-13')::uuid, cid, 'multiple_choice', 'A design retainer is most suitable for clients who:',
     '[{"id":"a","text":"Need a one-off logo design","is_correct":false},{"id":"b","text":"Have ongoing, regular design needs that require consistent availability","is_correct":true},{"id":"c","text":"Have no design budget","is_correct":false},{"id":"d","text":"Want to hire a full-time employee","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-14')::uuid, cid, 'multiple_choice', 'Setting clear revision limits in a contract protects the freelancer by:',
     '[{"id":"a","text":"Eliminating all client feedback","is_correct":false},{"id":"b","text":"Preventing unlimited unpaid rework from eroding project profitability","is_correct":true},{"id":"c","text":"Limiting the quality of work","is_correct":false},{"id":"d","text":"Speeding up the design process","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-15')::uuid, cid, 'multiple_choice', 'Which tax consideration is unique to self-employed freelancers?',
     '[{"id":"a","text":"They pay no taxes","is_correct":false},{"id":"b","text":"They must pay self-employment tax on top of income tax and track deductible expenses","is_correct":true},{"id":"c","text":"Taxes are automatically deducted from client payments","is_correct":false},{"id":"d","text":"Freelancers only pay VAT","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-16')::uuid, cid, 'multiple_choice', 'A case study in a freelance portfolio should primarily show:',
     '[{"id":"a","text":"Every design version produced","is_correct":false},{"id":"b","text":"The problem, process, solution and measurable outcome","is_correct":true},{"id":"c","text":"Only the final deliverable","is_correct":false},{"id":"d","text":"Client personal information","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-17')::uuid, cid, 'multiple_choice', 'When a client requests unlimited revisions, the best freelancer response is to:',
     '[{"id":"a","text":"Accept to avoid conflict","is_correct":false},{"id":"b","text":"Politely clarify revision limits in the SOW and offer additional revisions at a set fee","is_correct":true},{"id":"c","text":"Refuse the project","is_correct":false},{"id":"d","text":"Complete all revisions for free","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FRE307-18')::uuid, cid, 'multiple_choice', 'Transitioning from freelancer to studio owner primarily requires:',
     '[{"id":"a","text":"A larger portfolio","is_correct":false},{"id":"b","text":"Systems for project delivery, hiring contractors and managing multiple client accounts","is_correct":true},{"id":"c","text":"Moving to a bigger city","is_correct":false},{"id":"d","text":"Rebranding as an agency immediately","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FRE307-19')::uuid, cid, 'multiple_choice', 'Passive income streams relevant to freelance designers include:',
     '[{"id":"a","text":"Working more hours","is_correct":false},{"id":"b","text":"Selling templates, digital products or courses derived from existing expertise","is_correct":true},{"id":"c","text":"Taking on more clients","is_correct":false},{"id":"d","text":"Charging higher hourly rates","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FRE307-20')::uuid, cid, 'multiple_choice', 'The primary risk of pricing design services too low is:',
     '[{"id":"a","text":"Attracting too many clients","is_correct":false},{"id":"b","text":"Devaluing the work, attracting difficult clients and making the business unsustainable","is_correct":true},{"id":"c","text":"Creating too high a quality of work","is_correct":false},{"id":"d","text":"Building too large a client base","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── DST308 Design Strategy & Business Thinking ───────────────────────
  cid := md5('aorthar-course-DST308')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'DST308', 'Design Strategy & Business Thinking',
     'Bridge design and business by learning how design creates measurable business value. Students explore strategic design, value creation, competitive advantage and how to communicate design decisions to business stakeholders.',
     y300, y300s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-DST308-1')::uuid, cid, 'Design as a Business Capability', 1, true),
    (md5('aorthar-l-DST308-2')::uuid, cid, 'The Double Diamond and Strategic Design', 2, true),
    (md5('aorthar-l-DST308-3')::uuid, cid, 'Value Proposition Design', 3, true),
    (md5('aorthar-l-DST308-4')::uuid, cid, 'Business Model Thinking for Designers', 4, true),
    (md5('aorthar-l-DST308-5')::uuid, cid, 'Competitive Analysis and Design Differentiation', 5, true),
    (md5('aorthar-l-DST308-6')::uuid, cid, 'Jobs-to-Be-Done Framework', 6, true),
    (md5('aorthar-l-DST308-7')::uuid, cid, 'Presenting Design to Business Stakeholders', 7, true),
    (md5('aorthar-l-DST308-8')::uuid, cid, 'Measuring Design ROI', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-1-1')::uuid, lid, 'youtube', 'Design as a Business Strategy', 'https://www.youtube.com/watch?v=sO4te2QNsHY', 1),
    (md5('aorthar-r-DST308-1-2')::uuid, lid, 'youtube', 'The Business Value of Design', 'https://www.youtube.com/watch?v=TuoGn4QfCd8', 2),
    (md5('aorthar-r-DST308-1-3')::uuid, lid, 'youtube', 'McKinsey Design Value Report', 'https://www.youtube.com/watch?v=ZPqPdyesbbc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-2-1')::uuid, lid, 'youtube', 'Double Diamond Design Process', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 1),
    (md5('aorthar-r-DST308-2-2')::uuid, lid, 'youtube', 'Strategic Design Explained', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 2),
    (md5('aorthar-r-DST308-2-3')::uuid, lid, 'youtube', 'Design-Led Innovation', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-3-1')::uuid, lid, 'youtube', 'Value Proposition Canvas Explained', 'https://www.youtube.com/watch?v=ReM1uqmVfP0', 1),
    (md5('aorthar-r-DST308-3-2')::uuid, lid, 'youtube', 'How to Design a Value Proposition', 'https://www.youtube.com/watch?v=q8d9uuO1Cf4', 2),
    (md5('aorthar-r-DST308-3-3')::uuid, lid, 'youtube', 'Customer Jobs Pains and Gains', 'https://www.youtube.com/watch?v=0OE25uMQxgs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-4-1')::uuid, lid, 'youtube', 'Business Model Canvas for Designers', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-DST308-4-2')::uuid, lid, 'youtube', 'How to Fill In a Business Model Canvas', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-DST308-4-3')::uuid, lid, 'youtube', 'Business Models Explained Simply', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-5-1')::uuid, lid, 'youtube', 'How to Do a Competitive Analysis', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 1),
    (md5('aorthar-r-DST308-5-2')::uuid, lid, 'youtube', 'Design Differentiation Strategy', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 2),
    (md5('aorthar-r-DST308-5-3')::uuid, lid, 'youtube', 'Blue Ocean Strategy Explained', 'https://www.youtube.com/watch?v=TiJlYTmrfEA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-6-1')::uuid, lid, 'youtube', 'Jobs-to-Be-Done Theory', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-DST308-6-2')::uuid, lid, 'youtube', 'Clayton Christensen on JTBD', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-DST308-6-3')::uuid, lid, 'youtube', 'JTBD User Research Interviews', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-7-1')::uuid, lid, 'youtube', 'Presenting Design Decisions to Stakeholders', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-DST308-7-2')::uuid, lid, 'youtube', 'How to Communicate Design to Business', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-DST308-7-3')::uuid, lid, 'youtube', 'Design Storytelling for Leaders', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DST308-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DST308-8-1')::uuid, lid, 'youtube', 'Measuring UX ROI', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-DST308-8-2')::uuid, lid, 'youtube', 'How to Prove the Value of Design', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-DST308-8-3')::uuid, lid, 'youtube', 'Design Metrics and KPIs', 'https://www.youtube.com/watch?v=hpqFoR0oA6I', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-DST308-01')::uuid, cid, 'multiple_choice', 'Strategic design primarily aims to:',
     '[{"id":"a","text":"Create aesthetically pleasing visuals","is_correct":false},{"id":"b","text":"Use design to create competitive advantage and business value","is_correct":true},{"id":"c","text":"Reduce the cost of design production","is_correct":false},{"id":"d","text":"Train more designers","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DST308-02')::uuid, cid, 'multiple_choice', 'The Double Diamond model consists of two phases:',
     '[{"id":"a","text":"Research and delivery","is_correct":false},{"id":"b","text":"Discover/Define (problem space) and Develop/Deliver (solution space)","is_correct":true},{"id":"c","text":"Diverge and converge only","is_correct":false},{"id":"d","text":"Prototype and test","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DST308-03')::uuid, cid, 'multiple_choice', 'The Value Proposition Canvas helps teams align:',
     '[{"id":"a","text":"Project timelines","is_correct":false},{"id":"b","text":"Customer jobs/pains/gains with product features/pain relievers/gain creators","is_correct":true},{"id":"c","text":"Revenue targets","is_correct":false},{"id":"d","text":"Design team roles","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-04')::uuid, cid, 'multiple_choice', 'Jobs-to-Be-Done (JTBD) theory focuses on:',
     '[{"id":"a","text":"The tasks designers perform","is_correct":false},{"id":"b","text":"The underlying goal or progress a user is trying to make when using a product","is_correct":true},{"id":"c","text":"Job descriptions for product teams","is_correct":false},{"id":"d","text":"Hiring frameworks for design teams","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-05')::uuid, cid, 'multiple_choice', 'The Business Model Canvas was developed by:',
     '[{"id":"a","text":"Tim Brown at IDEO","is_correct":false},{"id":"b","text":"Alexander Osterwalder","is_correct":true},{"id":"c","text":"Don Norman","is_correct":false},{"id":"d","text":"Jeff Bezos","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-06')::uuid, cid, 'multiple_choice', 'Competitive differentiation through design means:',
     '[{"id":"a","text":"Having the cheapest product","is_correct":false},{"id":"b","text":"Creating experiences that competitors cannot easily replicate, driving preference","is_correct":true},{"id":"c","text":"Copying the leading competitor''s design","is_correct":false},{"id":"d","text":"Using more colours than competitors","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-07')::uuid, cid, 'multiple_choice', 'McKinsey''s Design Index shows that design-led companies:',
     '[{"id":"a","text":"Have lower employee satisfaction","is_correct":false},{"id":"b","text":"Outperform industry benchmarks by 200% in shareholder returns","is_correct":true},{"id":"c","text":"Spend less on design over time","is_correct":false},{"id":"d","text":"Prioritise aesthetics over usability","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-08')::uuid, cid, 'multiple_choice', 'A "gain creator" in the Value Proposition Canvas is:',
     '[{"id":"a","text":"A feature that reduces user problems","is_correct":false},{"id":"b","text":"A product feature that produces outcomes the customer desires","is_correct":true},{"id":"c","text":"A marketing campaign","is_correct":false},{"id":"d","text":"A business revenue stream","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-09')::uuid, cid, 'multiple_choice', 'Blue Ocean Strategy encourages businesses to:',
     '[{"id":"a","text":"Compete aggressively in existing markets","is_correct":false},{"id":"b","text":"Create uncontested market space by making competition irrelevant","is_correct":true},{"id":"c","text":"Follow the leader in the industry","is_correct":false},{"id":"d","text":"Reduce product features to lower cost","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DST308-10')::uuid, cid, 'multiple_choice', 'When presenting design to executives, it is most effective to lead with:',
     '[{"id":"a","text":"Technical implementation details","is_correct":false},{"id":"b","text":"Business impact, user outcome and evidence rather than design aesthetics","is_correct":true},{"id":"c","text":"The full design process documentation","is_correct":false},{"id":"d","text":"Competitor design comparisons only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-11')::uuid, cid, 'multiple_choice', 'A "pain reliever" in product design is:',
     '[{"id":"a","text":"A pain management app","is_correct":false},{"id":"b","text":"A product feature that reduces or eliminates specific customer frustrations","is_correct":true},{"id":"c","text":"A UX heuristic","is_correct":false},{"id":"d","text":"A customer support process","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-12')::uuid, cid, 'multiple_choice', 'Design ROI can be measured by tracking:',
     '[{"id":"a","text":"How many designers are on the team","is_correct":false},{"id":"b","text":"Conversion rates, task completion, support ticket reduction and revenue uplift","is_correct":true},{"id":"c","text":"The number of design files created","is_correct":false},{"id":"d","text":"Designer salaries","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-13')::uuid, cid, 'multiple_choice', 'The "convergence" phase of design thinking involves:',
     '[{"id":"a","text":"Generating as many ideas as possible","is_correct":false},{"id":"b","text":"Narrowing down options and deciding on the best direction to pursue","is_correct":true},{"id":"c","text":"Conducting user interviews","is_correct":false},{"id":"d","text":"Building the final product","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-14')::uuid, cid, 'multiple_choice', 'A product''s competitive moat from a design perspective is created by:',
     '[{"id":"a","text":"Using expensive design tools","is_correct":false},{"id":"b","text":"Deep user understanding, proprietary UX patterns and brand experience that competitors cannot easily replicate","is_correct":true},{"id":"c","text":"Having the most designers","is_correct":false},{"id":"d","text":"Copying successful competitor designs","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DST308-15')::uuid, cid, 'multiple_choice', 'The primary audience for a design strategy document is:',
     '[{"id":"a","text":"Junior designers only","is_correct":false},{"id":"b","text":"Cross-functional stakeholders including product, business and engineering leadership","is_correct":true},{"id":"c","text":"External clients only","is_correct":false},{"id":"d","text":"The marketing department","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-16')::uuid, cid, 'multiple_choice', 'JTBD research is conducted primarily through:',
     '[{"id":"a","text":"Quantitative surveys","is_correct":false},{"id":"b","text":"In-depth switching interviews that explore why users chose a product over alternatives","is_correct":true},{"id":"c","text":"A/B testing","is_correct":false},{"id":"d","text":"Analytics dashboards","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DST308-17')::uuid, cid, 'multiple_choice', 'In the Business Model Canvas, "channels" refers to:',
     '[{"id":"a","text":"Slack channels for team communication","is_correct":false},{"id":"b","text":"How a company reaches and delivers value to its customer segments","is_correct":true},{"id":"c","text":"Product distribution algorithms","is_correct":false},{"id":"d","text":"Sales quotas","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-18')::uuid, cid, 'multiple_choice', 'Design maturity in an organisation refers to:',
     '[{"id":"a","text":"The age of the design team","is_correct":false},{"id":"b","text":"How deeply design thinking is embedded into strategy, processes and culture","is_correct":true},{"id":"c","text":"The quality of design deliverables","is_correct":false},{"id":"d","text":"The number of design patents held","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DST308-19')::uuid, cid, 'multiple_choice', 'A North Star for a product design strategy should be:',
     '[{"id":"a","text":"A specific UI component","is_correct":false},{"id":"b","text":"A long-term vision of the experience you are creating and the value it delivers","is_correct":true},{"id":"c","text":"The annual design budget","is_correct":false},{"id":"d","text":"The team''s OKRs for the quarter","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DST308-20')::uuid, cid, 'multiple_choice', 'Why should designers understand unit economics?',
     '[{"id":"a","text":"To replace the finance team","is_correct":false},{"id":"b","text":"To make design decisions that are commercially viable and communicate impact in business terms","is_correct":true},{"id":"c","text":"To set team salaries","is_correct":false},{"id":"d","text":"Unit economics are irrelevant to design","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── MET309 Metrics, Analytics & Data-Driven Design ───────────────────
  cid := md5('aorthar-course-MET309')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'MET309', 'Metrics, Analytics & Data-Driven Design',
     'Learn how to use data and analytics to inform design decisions. Students explore funnel analysis, heatmaps, session recording, experiment design and how to build a culture of data-informed design.',
     y300, y300s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-MET309-1')::uuid, cid, 'Data-Driven vs Data-Informed Design', 1, true),
    (md5('aorthar-l-MET309-2')::uuid, cid, 'Funnel Analysis and Conversion Optimisation', 2, true),
    (md5('aorthar-l-MET309-3')::uuid, cid, 'Heatmaps, Scrollmaps and Session Recording', 3, true),
    (md5('aorthar-l-MET309-4')::uuid, cid, 'Setting Up Analytics for Product Teams', 4, true),
    (md5('aorthar-l-MET309-5')::uuid, cid, 'Experiment Design and Statistical Significance', 5, true),
    (md5('aorthar-l-MET309-6')::uuid, cid, 'Qualitative vs Quantitative Research', 6, true),
    (md5('aorthar-l-MET309-7')::uuid, cid, 'Dashboards and Design Metrics', 7, true),
    (md5('aorthar-l-MET309-8')::uuid, cid, 'Building a Data-Informed Design Culture', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-1-1')::uuid, lid, 'youtube', 'Data-Driven Design Explained', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-MET309-1-2')::uuid, lid, 'youtube', 'How to Use Data in UX Design', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-MET309-1-3')::uuid, lid, 'youtube', 'Quantitative UX Research Methods', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-2-1')::uuid, lid, 'youtube', 'Conversion Funnel Analysis', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 1),
    (md5('aorthar-r-MET309-2-2')::uuid, lid, 'youtube', 'How to Optimise Your Conversion Funnel', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 2),
    (md5('aorthar-r-MET309-2-3')::uuid, lid, 'youtube', 'Drop-off Analysis in Product Analytics', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-3-1')::uuid, lid, 'youtube', 'How to Use Heatmaps for UX', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-MET309-3-2')::uuid, lid, 'youtube', 'Session Recording Analysis', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-MET309-3-3')::uuid, lid, 'youtube', 'Hotjar for UX Research', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-4-1')::uuid, lid, 'youtube', 'Setting Up Google Analytics 4', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 1),
    (md5('aorthar-r-MET309-4-2')::uuid, lid, 'youtube', 'Mixpanel for Product Analytics', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-MET309-4-3')::uuid, lid, 'youtube', 'Amplitude Analytics Tutorial', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-5-1')::uuid, lid, 'youtube', 'A/B Testing Statistical Significance', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 1),
    (md5('aorthar-r-MET309-5-2')::uuid, lid, 'youtube', 'How to Design a Good Experiment', 'https://www.youtube.com/watch?v=raIUQnPoeok', 2),
    (md5('aorthar-r-MET309-5-3')::uuid, lid, 'youtube', 'Sample Size for A/B Tests', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-6-1')::uuid, lid, 'youtube', 'Qualitative vs Quantitative Research', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 1),
    (md5('aorthar-r-MET309-6-2')::uuid, lid, 'youtube', 'Triangulating Research Methods', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-MET309-6-3')::uuid, lid, 'youtube', 'Mixed Methods in UX Research', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-7-1')::uuid, lid, 'youtube', 'Building Product Dashboards', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 1),
    (md5('aorthar-r-MET309-7-2')::uuid, lid, 'youtube', 'UX Metrics and KPIs to Track', 'https://www.youtube.com/watch?v=lCIjA-bKcpA', 2),
    (md5('aorthar-r-MET309-7-3')::uuid, lid, 'youtube', 'HEART Framework for UX Metrics', 'https://www.youtube.com/watch?v=TWoQLBGqUhI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MET309-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MET309-8-1')::uuid, lid, 'youtube', 'Building a Data Culture in Design Teams', 'https://www.youtube.com/watch?v=AFa4OAhBSZI', 1),
    (md5('aorthar-r-MET309-8-2')::uuid, lid, 'youtube', 'Data Literacy for Designers', 'https://www.youtube.com/watch?v=J2sMNMdK20w', 2),
    (md5('aorthar-r-MET309-8-3')::uuid, lid, 'youtube', 'Analytics-Driven Product Decisions', 'https://www.youtube.com/watch?v=n-MQKzKM3mA', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-MET309-01')::uuid, cid, 'multiple_choice', 'Data-informed design differs from data-driven design in that:',
     '[{"id":"a","text":"Data-informed design ignores user research","is_correct":false},{"id":"b","text":"Data informs but does not solely dictate design decisions; qualitative insight and judgement are also used","is_correct":true},{"id":"c","text":"Data-driven design uses more qualitative methods","is_correct":false},{"id":"d","text":"They are identical approaches","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-02')::uuid, cid, 'multiple_choice', 'A conversion funnel in product analytics shows:',
     '[{"id":"a","text":"The speed of a website","is_correct":false},{"id":"b","text":"The steps users take toward a goal and where drop-offs occur","is_correct":true},{"id":"c","text":"The number of paying users","is_correct":false},{"id":"d","text":"Revenue by channel","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MET309-03')::uuid, cid, 'multiple_choice', 'A heatmap in UX analytics displays:',
     '[{"id":"a","text":"Temperature of user devices","is_correct":false},{"id":"b","text":"Aggregated data showing where users click, move or scroll on a page","is_correct":true},{"id":"c","text":"Real-time user locations","is_correct":false},{"id":"d","text":"Server performance data","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MET309-04')::uuid, cid, 'multiple_choice', 'Statistical significance in an A/B test means:',
     '[{"id":"a","text":"The test results are significant in size","is_correct":false},{"id":"b","text":"The observed difference is unlikely to be due to random chance","is_correct":true},{"id":"c","text":"The test ran for a significant amount of time","is_correct":false},{"id":"d","text":"The variant design is significantly better looking","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-05')::uuid, cid, 'multiple_choice', 'Google''s HEART framework measures:',
     '[{"id":"a","text":"Server health, engagement and retention","is_correct":false},{"id":"b","text":"Happiness, Engagement, Adoption, Retention and Task Success","is_correct":true},{"id":"c","text":"Heat, Energy and Activation Rate Trends","is_correct":false},{"id":"d","text":"Homepage, Exit, Acquisition, Referral and Time-on-site","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-06')::uuid, cid, 'multiple_choice', 'Session recording tools like Hotjar are used to:',
     '[{"id":"a","text":"Record team design sessions","is_correct":false},{"id":"b","text":"Watch replays of real user sessions to identify usability issues","is_correct":true},{"id":"c","text":"Record video calls with clients","is_correct":false},{"id":"d","text":"Track developer code changes","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MET309-07')::uuid, cid, 'multiple_choice', 'Bounce rate measures:',
     '[{"id":"a","text":"How often a server crashes","is_correct":false},{"id":"b","text":"The percentage of visitors who leave after viewing only one page","is_correct":true},{"id":"c","text":"How often users return to a product","is_correct":false},{"id":"d","text":"The rate at which users abandon a cart","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MET309-08')::uuid, cid, 'multiple_choice', 'An event in product analytics refers to:',
     '[{"id":"a","text":"A marketing campaign launch","is_correct":false},{"id":"b","text":"A tracked user interaction such as a button click, page view or form submission","is_correct":true},{"id":"c","text":"A product team meeting","is_correct":false},{"id":"d","text":"A planned product release","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MET309-09')::uuid, cid, 'multiple_choice', 'Which tool is purpose-built for product behavioural analytics?',
     '[{"id":"a","text":"Figma","is_correct":false},{"id":"b","text":"Mixpanel or Amplitude","is_correct":true},{"id":"c","text":"Notion","is_correct":false},{"id":"d","text":"Slack","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MET309-10')::uuid, cid, 'multiple_choice', 'Triangulation in UX research means:',
     '[{"id":"a","text":"Using three users in each test","is_correct":false},{"id":"b","text":"Combining multiple research methods to validate findings and build confidence","is_correct":true},{"id":"c","text":"A statistical formula","is_correct":false},{"id":"d","text":"Testing on three different devices","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-11')::uuid, cid, 'multiple_choice', 'Cohort analysis is valuable because it:',
     '[{"id":"a","text":"Groups users by age demographic","is_correct":false},{"id":"b","text":"Tracks how specific user groups behave over time to understand retention patterns","is_correct":true},{"id":"c","text":"Analyses competitor cohorts","is_correct":false},{"id":"d","text":"Groups design team members by skill","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-12')::uuid, cid, 'multiple_choice', 'A p-value of 0.05 in a UX experiment means:',
     '[{"id":"a","text":"There is a 5% chance the result is correct","is_correct":false},{"id":"b","text":"There is a 5% chance the observed result occurred by random chance (95% confidence)","is_correct":true},{"id":"c","text":"5% of users preferred the variant","is_correct":false},{"id":"d","text":"The experiment needs 5% more traffic","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MET309-13')::uuid, cid, 'multiple_choice', 'Which metric best indicates long-term product health?',
     '[{"id":"a","text":"Number of app downloads","is_correct":false},{"id":"b","text":"Day-30 retention rate","is_correct":true},{"id":"c","text":"Homepage traffic","is_correct":false},{"id":"d","text":"Social media likes","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-14')::uuid, cid, 'multiple_choice', 'Instrumentation in product analytics means:',
     '[{"id":"a","text":"Adding musical instruments to an app","is_correct":false},{"id":"b","text":"Adding tracking code to capture user events and behaviours in the product","is_correct":true},{"id":"c","text":"Setting up server hardware","is_correct":false},{"id":"d","text":"Installing analytics plugins on a website","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-15')::uuid, cid, 'multiple_choice', 'Why can data alone be misleading in design decisions?',
     '[{"id":"a","text":"Data is always accurate","is_correct":false},{"id":"b","text":"Data shows what users do but not why, requiring qualitative context to interpret correctly","is_correct":true},{"id":"c","text":"Designers cannot read data","is_correct":false},{"id":"d","text":"Data is too expensive to collect","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-16')::uuid, cid, 'multiple_choice', 'Task Success Rate (TSR) in UX metrics measures:',
     '[{"id":"a","text":"How quickly users complete a task","is_correct":false},{"id":"b","text":"The percentage of users who successfully complete a defined task","is_correct":true},{"id":"c","text":"How satisfied users are after a task","is_correct":false},{"id":"d","text":"The number of tasks in a usability test","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-17')::uuid, cid, 'multiple_choice', 'A/B testing requires a control group because:',
     '[{"id":"a","text":"To double the sample size","is_correct":false},{"id":"b","text":"To provide a baseline against which the variant can be compared","is_correct":true},{"id":"c","text":"To give users a choice","is_correct":false},{"id":"d","text":"It is a legal requirement","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-18')::uuid, cid, 'multiple_choice', 'Scroll depth analytics tells you:',
     '[{"id":"a","text":"How deep users scroll within their user profile","is_correct":false},{"id":"b","text":"How far down a page users typically scroll before leaving","is_correct":true},{"id":"c","text":"Page loading depth on slow connections","is_correct":false},{"id":"d","text":"The depth of a site''s navigation menu","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MET309-19')::uuid, cid, 'multiple_choice', 'Novelty effect in A/B testing refers to:',
     '[{"id":"a","text":"Testing a new product feature","is_correct":false},{"id":"b","text":"An inflated response to a variant simply because it is new, which fades over time","is_correct":true},{"id":"c","text":"A test run on a new platform","is_correct":false},{"id":"d","text":"The excitement of the test team","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MET309-20')::uuid, cid, 'multiple_choice', 'The primary risk of optimising for vanity metrics is:',
     '[{"id":"a","text":"It makes dashboards look cluttered","is_correct":false},{"id":"b","text":"Teams celebrate impressive-looking numbers that do not correlate with real business or user outcomes","is_correct":true},{"id":"c","text":"It makes the product too popular","is_correct":false},{"id":"d","text":"Data collection becomes too expensive","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── COL310 Collaboration Tools & Remote Work ─────────────────────────
  cid := md5('aorthar-course-COL310')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'COL310', 'Collaboration Tools & Remote Work',
     'Master the tools and practices used by distributed design and product teams. Students learn async communication, remote facilitation, design handoff workflows and how to build team culture across time zones.',
     y300, y300s2, 3, false, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-COL310-1')::uuid, cid, 'The Rise of Remote and Hybrid Work', 1, true),
    (md5('aorthar-l-COL310-2')::uuid, cid, 'Async Communication Best Practices', 2, true),
    (md5('aorthar-l-COL310-3')::uuid, cid, 'Figma for Collaborative Design', 3, true),
    (md5('aorthar-l-COL310-4')::uuid, cid, 'Virtual Workshops and Remote Facilitation', 4, true),
    (md5('aorthar-l-COL310-5')::uuid, cid, 'Design Handoff — From Figma to Engineering', 5, true),
    (md5('aorthar-l-COL310-6')::uuid, cid, 'Project Management Tools — Notion, Linear and Jira', 6, true),
    (md5('aorthar-l-COL310-7')::uuid, cid, 'Building Remote Team Culture', 7, true),
    (md5('aorthar-l-COL310-8')::uuid, cid, 'Documentation as a Design Practice', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-1-1')::uuid, lid, 'youtube', 'The Future of Remote Work', 'https://www.youtube.com/watch?v=nAK2WFMKE94', 1),
    (md5('aorthar-r-COL310-1-2')::uuid, lid, 'youtube', 'How Top Companies Work Remotely', 'https://www.youtube.com/watch?v=otnYC7eKxK0', 2),
    (md5('aorthar-r-COL310-1-3')::uuid, lid, 'youtube', 'Async-First Work Culture Explained', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-2-1')::uuid, lid, 'youtube', 'Async Communication for Teams', 'https://www.youtube.com/watch?v=n-MQKzKM3mA', 1),
    (md5('aorthar-r-COL310-2-2')::uuid, lid, 'youtube', 'How to Write Better Slack Messages', 'https://www.youtube.com/watch?v=KBjKS8KxLSY', 2),
    (md5('aorthar-r-COL310-2-3')::uuid, lid, 'youtube', 'Remote Team Communication Tips', 'https://www.youtube.com/watch?v=0FNKK5A3aaA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-3-1')::uuid, lid, 'youtube', 'Figma Collaboration Features', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 1),
    (md5('aorthar-r-COL310-3-2')::uuid, lid, 'youtube', 'Design Reviews in Figma', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 2),
    (md5('aorthar-r-COL310-3-3')::uuid, lid, 'youtube', 'Figma for Team Projects', 'https://www.youtube.com/watch?v=BjMbGdT3N2I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-4-1')::uuid, lid, 'youtube', 'How to Facilitate Remote Workshops', 'https://www.youtube.com/watch?v=KkBMkjGW3Dk', 1),
    (md5('aorthar-r-COL310-4-2')::uuid, lid, 'youtube', 'Virtual Design Sprint Tips', 'https://www.youtube.com/watch?v=rPCyR_v7GGU', 2),
    (md5('aorthar-r-COL310-4-3')::uuid, lid, 'youtube', 'Miro for Remote Teams', 'https://www.youtube.com/watch?v=TiJlYTmrfEA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-5-1')::uuid, lid, 'youtube', 'Design Handoff Best Practices', 'https://www.youtube.com/watch?v=EK-pHkc5EL4', 1),
    (md5('aorthar-r-COL310-5-2')::uuid, lid, 'youtube', 'Figma Dev Mode for Handoff', 'https://www.youtube.com/watch?v=5PBJJTGk0Vs', 2),
    (md5('aorthar-r-COL310-5-3')::uuid, lid, 'youtube', 'Working with Developers as a Designer', 'https://www.youtube.com/watch?v=egYDMqJ7MTA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-6-1')::uuid, lid, 'youtube', 'Notion for Product Teams', 'https://www.youtube.com/watch?v=XBDwS7SVQ6Y', 1),
    (md5('aorthar-r-COL310-6-2')::uuid, lid, 'youtube', 'Linear for Design and Engineering Teams', 'https://www.youtube.com/watch?v=eDqfbfmv3fE', 2),
    (md5('aorthar-r-COL310-6-3')::uuid, lid, 'youtube', 'Jira for Designers Guide', 'https://www.youtube.com/watch?v=vuBFzAdaHDY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-7-1')::uuid, lid, 'youtube', 'Building Remote Team Culture', 'https://www.youtube.com/watch?v=8mJVJcCQJp4', 1),
    (md5('aorthar-r-COL310-7-2')::uuid, lid, 'youtube', 'GitLab All-Remote Culture', 'https://www.youtube.com/watch?v=Ld0J0HwSXFM', 2),
    (md5('aorthar-r-COL310-7-3')::uuid, lid, 'youtube', 'Basecamp Remote Work Handbook', 'https://www.youtube.com/watch?v=lTqfnS4OYGE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-COL310-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-COL310-8-1')::uuid, lid, 'youtube', 'Documentation for Design Teams', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-COL310-8-2')::uuid, lid, 'youtube', 'Design Decision Records Explained', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-COL310-8-3')::uuid, lid, 'youtube', 'Writing Good Design Documentation', 'https://www.youtube.com/watch?v=AoQ9QHOUXUM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-COL310-01')::uuid, cid, 'multiple_choice', 'Asynchronous communication means:',
     '[{"id":"a","text":"Communication that happens at the same time for all parties","is_correct":false},{"id":"b","text":"Communication where participants respond at different times without requiring simultaneous presence","is_correct":true},{"id":"c","text":"Communication without any written records","is_correct":false},{"id":"d","text":"Real-time video calls","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL310-02')::uuid, cid, 'multiple_choice', 'Design handoff refers to:',
     '[{"id":"a","text":"Handing a project to a new designer","is_correct":false},{"id":"b","text":"The process of transferring design specifications and assets to developers for implementation","is_correct":true},{"id":"c","text":"Presenting designs to a client","is_correct":false},{"id":"d","text":"Archiving completed design files","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL310-03')::uuid, cid, 'multiple_choice', 'Which Figma feature allows developers to inspect design properties and export assets?',
     '[{"id":"a","text":"Figma Prototype mode","is_correct":false},{"id":"b","text":"Figma Dev Mode","is_correct":true},{"id":"c","text":"Figma Auto Layout","is_correct":false},{"id":"d","text":"Figma Community","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL310-04')::uuid, cid, 'multiple_choice', 'A design decision record (DDR) documents:',
     '[{"id":"a","text":"Meeting minutes","is_correct":false},{"id":"b","text":"The context, options considered and rationale behind a design decision","is_correct":true},{"id":"c","text":"A list of design deliverables","is_correct":false},{"id":"d","text":"User test results","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-05')::uuid, cid, 'multiple_choice', 'The main advantage of async-first work culture is:',
     '[{"id":"a","text":"Everyone works the same hours","is_correct":false},{"id":"b","text":"It enables deep focus work and accommodates distributed teams across time zones","is_correct":true},{"id":"c","text":"It eliminates all meetings","is_correct":false},{"id":"d","text":"It requires less documentation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-06')::uuid, cid, 'multiple_choice', 'Which tool is purpose-built for collaborative visual thinking and remote workshops?',
     '[{"id":"a","text":"Slack","is_correct":false},{"id":"b","text":"Miro or FigJam","is_correct":true},{"id":"c","text":"Linear","is_correct":false},{"id":"d","text":"Notion","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL310-07')::uuid, cid, 'multiple_choice', 'Documentation is considered a design practice because:',
     '[{"id":"a","text":"It is required by law","is_correct":false},{"id":"b","text":"Good documentation communicates design intent, preserves decisions and enables collaboration at scale","is_correct":true},{"id":"c","text":"Developers require it","is_correct":false},{"id":"d","text":"It replaces user testing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-08')::uuid, cid, 'multiple_choice', 'A remote facilitation technique for gathering input without groupthink is:',
     '[{"id":"a","text":"Open group brainstorming","is_correct":false},{"id":"b","text":"Silent brainstorming using digital sticky notes before group discussion","is_correct":true},{"id":"c","text":"Asking the most senior person first","is_correct":false},{"id":"d","text":"Using a chatbot","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-09')::uuid, cid, 'multiple_choice', 'Notion is best described as:',
     '[{"id":"a","text":"A design tool","is_correct":false},{"id":"b","text":"An all-in-one workspace for notes, docs, wikis and project tracking","is_correct":true},{"id":"c","text":"A code editor","is_correct":false},{"id":"d","text":"An analytics platform","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-COL310-10')::uuid, cid, 'multiple_choice', 'Timezone overlap in distributed teams is managed by:',
     '[{"id":"a","text":"Requiring all team members to work the same hours","is_correct":false},{"id":"b","text":"Scheduling synchronous meetings within shared overlap windows and defaulting to async otherwise","is_correct":true},{"id":"c","text":"Hiring only in one timezone","is_correct":false},{"id":"d","text":"Using only email communication","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-11')::uuid, cid, 'multiple_choice', 'A well-written async message should include:',
     '[{"id":"a","text":"As little information as possible","is_correct":false},{"id":"b","text":"Context, the request, deadlines and any decisions the recipient needs to make","is_correct":true},{"id":"c","text":"Only emojis to save time","is_correct":false},{"id":"d","text":"A meeting request to discuss further","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-12')::uuid, cid, 'multiple_choice', 'Design tokens in a handoff process help engineers by:',
     '[{"id":"a","text":"Providing login tokens for design tools","is_correct":false},{"id":"b","text":"Providing named, reusable design values that map directly to code variables","is_correct":true},{"id":"c","text":"Generating code automatically","is_correct":false},{"id":"d","text":"Replacing the need for specifications","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-13')::uuid, cid, 'multiple_choice', 'The "working out loud" practice in remote teams means:',
     '[{"id":"a","text":"Making noise while working from home","is_correct":false},{"id":"b","text":"Sharing work in progress openly so teammates can follow along, contribute and stay aligned","is_correct":true},{"id":"c","text":"Documenting only completed work","is_correct":false},{"id":"d","text":"Broadcasting all internal meetings","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-COL310-14')::uuid, cid, 'multiple_choice', 'Which practice reduces miscommunication during design handoff?',
     '[{"id":"a","text":"Sending only exported image files","is_correct":false},{"id":"b","text":"Annotating designs with notes explaining interactions, states and edge cases","is_correct":true},{"id":"c","text":"Avoiding meetings with developers","is_correct":false},{"id":"d","text":"Using only verbal communication","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-15')::uuid, cid, 'multiple_choice', 'Linear is a project management tool designed primarily for:',
     '[{"id":"a","text":"Marketing teams","is_correct":false},{"id":"b","text":"Software engineering and product teams who need fast, opinionated issue tracking","is_correct":true},{"id":"c","text":"HR teams","is_correct":false},{"id":"d","text":"Finance departments","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-16')::uuid, cid, 'multiple_choice', 'Remote team culture can be strengthened by:',
     '[{"id":"a","text":"Banning all informal communication","is_correct":false},{"id":"b","text":"Creating regular rituals, virtual social events and recognising contributions publicly","is_correct":true},{"id":"c","text":"Requiring cameras on at all times","is_correct":false},{"id":"d","text":"Using only one communication tool","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-17')::uuid, cid, 'multiple_choice', 'A "source of truth" in a design system is:',
     '[{"id":"a","text":"The design manager''s opinion","is_correct":false},{"id":"b","text":"A single, agreed location where the latest, canonical version of designs or components lives","is_correct":true},{"id":"c","text":"The first version of a design","is_correct":false},{"id":"d","text":"A printed design guideline","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-18')::uuid, cid, 'multiple_choice', 'Psychological safety in remote teams is crucial because:',
     '[{"id":"a","text":"Remote workers are more vulnerable to cybercrime","is_correct":false},{"id":"b","text":"Without in-person cues, team members need explicit reassurance that speaking up is safe and valued","is_correct":true},{"id":"c","text":"Remote teams face more legal risks","is_correct":false},{"id":"d","text":"Remote workers should not share opinions","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-COL310-19')::uuid, cid, 'multiple_choice', 'What is the primary risk of "meeting-heavy" culture in remote teams?',
     '[{"id":"a","text":"Too many decisions get made","is_correct":false},{"id":"b","text":"It fragments focus, excludes timezone-distant team members and reduces async productivity","is_correct":true},{"id":"c","text":"Meetings are too cheap to run","is_correct":false},{"id":"d","text":"Video quality degrades over time","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-COL310-20')::uuid, cid, 'multiple_choice', 'GitLab''s all-remote model is notable because:',
     '[{"id":"a","text":"They have no employees","is_correct":false},{"id":"b","text":"It is one of the largest fully-remote companies in the world with a public handbook for async culture","is_correct":true},{"id":"c","text":"They only hire in one country","is_correct":false},{"id":"d","text":"They invented remote work","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 400 · SEMESTER 1  (is_premium = true)
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── DLD401 Design Leadership & Team Management ───────────────────────
  cid := md5('aorthar-course-DLD401')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'DLD401', 'Design Leadership & Team Management',
     'Develop the skills to lead and grow design teams. Students explore leadership styles, hiring, performance management, design critique culture, cross-functional influence and building design organisations.',
     y400, y400s1, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-DLD401-1')::uuid, cid, 'The Transition from Designer to Design Leader', 1, true),
    (md5('aorthar-l-DLD401-2')::uuid, cid, 'Leadership Styles and Design Managers', 2, true),
    (md5('aorthar-l-DLD401-3')::uuid, cid, 'Hiring and Building a Design Team', 3, true),
    (md5('aorthar-l-DLD401-4')::uuid, cid, 'Running Effective Design Critiques', 4, true),
    (md5('aorthar-l-DLD401-5')::uuid, cid, 'Coaching and Developing Designers', 5, true),
    (md5('aorthar-l-DLD401-6')::uuid, cid, 'Cross-Functional Influence Without Authority', 6, true),
    (md5('aorthar-l-DLD401-7')::uuid, cid, 'Managing Up and Advocating for Design', 7, true),
    (md5('aorthar-l-DLD401-8')::uuid, cid, 'Building Design Org Structure and Culture', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-1-1')::uuid, lid, 'youtube', 'From Designer to Design Manager', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 1),
    (md5('aorthar-r-DLD401-1-2')::uuid, lid, 'youtube', 'The IC to Manager Transition', 'https://www.youtube.com/watch?v=raIUQnPoeok', 2),
    (md5('aorthar-r-DLD401-1-3')::uuid, lid, 'youtube', 'Design Leadership at Google', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-2-1')::uuid, lid, 'youtube', 'Leadership Styles Explained', 'https://www.youtube.com/watch?v=sO4te2QNsHY', 1),
    (md5('aorthar-r-DLD401-2-2')::uuid, lid, 'youtube', 'Servant Leadership for Designers', 'https://www.youtube.com/watch?v=TuoGn4QfCd8', 2),
    (md5('aorthar-r-DLD401-2-3')::uuid, lid, 'youtube', 'What Makes a Great Design Manager', 'https://www.youtube.com/watch?v=ZPqPdyesbbc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-3-1')::uuid, lid, 'youtube', 'How to Hire Great Designers', 'https://www.youtube.com/watch?v=LQKDUcD8MuA', 1),
    (md5('aorthar-r-DLD401-3-2')::uuid, lid, 'youtube', 'Design Interview Process Best Practices', 'https://www.youtube.com/watch?v=3u9qPcAbgpk', 2),
    (md5('aorthar-r-DLD401-3-3')::uuid, lid, 'youtube', 'Building a Diverse Design Team', 'https://www.youtube.com/watch?v=tpKnjmCBM5s', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-4-1')::uuid, lid, 'youtube', 'How to Run a Design Critique', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-DLD401-4-2')::uuid, lid, 'youtube', 'Design Critique vs Design Review', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-DLD401-4-3')::uuid, lid, 'youtube', 'Giving and Receiving Design Feedback', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-5-1')::uuid, lid, 'youtube', 'Coaching Designers to Grow', 'https://www.youtube.com/watch?v=KkBMkjGW3Dk', 1),
    (md5('aorthar-r-DLD401-5-2')::uuid, lid, 'youtube', 'Career Ladders for Design Teams', 'https://www.youtube.com/watch?v=rPCyR_v7GGU', 2),
    (md5('aorthar-r-DLD401-5-3')::uuid, lid, 'youtube', '1-on-1 Meetings for Managers', 'https://www.youtube.com/watch?v=TiJlYTmrfEA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-6-1')::uuid, lid, 'youtube', 'Influencing Without Authority', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-DLD401-6-2')::uuid, lid, 'youtube', 'Design Advocacy in Product Orgs', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-DLD401-6-3')::uuid, lid, 'youtube', 'Stakeholder Management for Designers', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-7-1')::uuid, lid, 'youtube', 'Managing Up as a Designer', 'https://www.youtube.com/watch?v=ReM1uqmVfP0', 1),
    (md5('aorthar-r-DLD401-7-2')::uuid, lid, 'youtube', 'How to Present Design to Executives', 'https://www.youtube.com/watch?v=q8d9uuO1Cf4', 2),
    (md5('aorthar-r-DLD401-7-3')::uuid, lid, 'youtube', 'Getting Design a Seat at the Table', 'https://www.youtube.com/watch?v=0OE25uMQxgs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-DLD401-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-DLD401-8-1')::uuid, lid, 'youtube', 'Design Org Models Explained', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-DLD401-8-2')::uuid, lid, 'youtube', 'Centralised vs Embedded Design Teams', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-DLD401-8-3')::uuid, lid, 'youtube', 'Design Culture and Values', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-DLD401-01')::uuid, cid, 'multiple_choice', 'The biggest mindset shift from designer to design manager is:',
     '[{"id":"a","text":"Doing less design work","is_correct":false},{"id":"b","text":"Your success is now defined by your team''s growth and output rather than your own work","is_correct":true},{"id":"c","text":"Attending more meetings","is_correct":false},{"id":"d","text":"Using different design tools","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DLD401-02')::uuid, cid, 'multiple_choice', 'Servant leadership in design management means:',
     '[{"id":"a","text":"Doing all the work for your team","is_correct":false},{"id":"b","text":"Prioritising your team''s needs, removing blockers and enabling their best work","is_correct":true},{"id":"c","text":"Serving clients directly","is_correct":false},{"id":"d","text":"Following every team member''s instructions","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DLD401-03')::uuid, cid, 'multiple_choice', 'A design critique is most effective when:',
     '[{"id":"a","text":"The most senior designer speaks first","is_correct":false},{"id":"b","text":"Feedback is structured around design principles and user goals rather than personal taste","is_correct":true},{"id":"c","text":"It focuses only on visual aesthetics","is_correct":false},{"id":"d","text":"It is conducted privately","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-04')::uuid, cid, 'multiple_choice', 'A design career ladder primarily helps organisations to:',
     '[{"id":"a","text":"Rank designers by talent","is_correct":false},{"id":"b","text":"Define clear expectations, growth paths and promotion criteria for design roles","is_correct":true},{"id":"c","text":"Set salaries automatically","is_correct":false},{"id":"d","text":"Replace performance reviews","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-05')::uuid, cid, 'multiple_choice', 'Cross-functional influence for a design leader requires:',
     '[{"id":"a","text":"Having formal authority over product and engineering","is_correct":false},{"id":"b","text":"Building trust, communicating in business outcomes and developing relationships across teams","is_correct":true},{"id":"c","text":"Being the loudest voice in meetings","is_correct":false},{"id":"d","text":"Ignoring other disciplines","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-06')::uuid, cid, 'multiple_choice', 'An embedded design team model means:',
     '[{"id":"a","text":"Designers work only in the design department","is_correct":false},{"id":"b","text":"Designers are placed within cross-functional product squads rather than a central pool","is_correct":true},{"id":"c","text":"Designers are hidden from stakeholders","is_correct":false},{"id":"d","text":"All designers report to engineering","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-07')::uuid, cid, 'multiple_choice', 'The purpose of regular 1-on-1 meetings between a manager and designer is to:',
     '[{"id":"a","text":"Review design deliverables","is_correct":false},{"id":"b","text":"Build trust, discuss career goals, surface concerns and provide coaching","is_correct":true},{"id":"c","text":"Assign new projects","is_correct":false},{"id":"d","text":"Conduct performance appraisals","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-DLD401-08')::uuid, cid, 'multiple_choice', '"Managing up" means:',
     '[{"id":"a","text":"Getting promoted quickly","is_correct":false},{"id":"b","text":"Proactively communicating progress, risks and needs to your manager to enable good decisions","is_correct":true},{"id":"c","text":"Bypassing your manager","is_correct":false},{"id":"d","text":"Reporting team issues to HR","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-09')::uuid, cid, 'multiple_choice', 'When hiring designers, the most important quality to assess beyond craft skills is:',
     '[{"id":"a","text":"Software proficiency","is_correct":false},{"id":"b","text":"Reasoning ability, communication and cultural contribution","is_correct":true},{"id":"c","text":"Speed of work","is_correct":false},{"id":"d","text":"Educational background","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-10')::uuid, cid, 'multiple_choice', 'Design maturity in an organisation is best advanced by:',
     '[{"id":"a","text":"Hiring more designers","is_correct":false},{"id":"b","text":"Embedding design thinking into strategy, embedding designers in product teams and measuring design outcomes","is_correct":true},{"id":"c","text":"Spending more on design tools","is_correct":false},{"id":"d","text":"Publishing more design blog posts","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-11')::uuid, cid, 'multiple_choice', 'A centralised design team model offers the advantage of:',
     '[{"id":"a","text":"Designers can work on any project faster","is_correct":false},{"id":"b","text":"Easier design consistency, shared knowledge and career development within a design community","is_correct":true},{"id":"c","text":"Lower design costs","is_correct":false},{"id":"d","text":"Direct control over product decisions","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-12')::uuid, cid, 'multiple_choice', 'Psychological safety in a design team is created by:',
     '[{"id":"a","text":"Avoiding all conflict","is_correct":false},{"id":"b","text":"Leaders consistently welcoming questions, failures and honest feedback without blame","is_correct":true},{"id":"c","text":"Keeping team sizes small","is_correct":false},{"id":"d","text":"Paying designers highly","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-13')::uuid, cid, 'multiple_choice', 'The "two pizza rule" for team size, associated with Amazon, suggests:',
     '[{"id":"a","text":"Teams should have exactly 2 designers","is_correct":false},{"id":"b","text":"Teams should be small enough that two pizzas can feed the whole group (roughly 5-8 people)","is_correct":true},{"id":"c","text":"Design sprints should be 2 days long","is_correct":false},{"id":"d","text":"Teams should meet twice per week","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DLD401-14')::uuid, cid, 'multiple_choice', 'A design principle document helps teams to:',
     '[{"id":"a","text":"Define font and colour choices","is_correct":false},{"id":"b","text":"Make consistent design decisions by providing shared values and criteria for evaluating work","is_correct":true},{"id":"c","text":"Replace the design system","is_correct":false},{"id":"d","text":"Set KPIs for the design team","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-15')::uuid, cid, 'multiple_choice', 'Giving feedback on a designer''s work using "I like, I wish, what if" is an example of:',
     '[{"id":"a","text":"A formal performance review","is_correct":false},{"id":"b","text":"A structured, constructive feedback framework that balances positives with suggestions","is_correct":true},{"id":"c","text":"A SWOT analysis","is_correct":false},{"id":"d","text":"A user testing script","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-16')::uuid, cid, 'multiple_choice', 'Advocating for design at the executive level is most effective when you:',
     '[{"id":"a","text":"Show design portfolios","is_correct":false},{"id":"b","text":"Tie design outcomes to business metrics like revenue, conversion and NPS","is_correct":true},{"id":"c","text":"Request a bigger design team","is_correct":false},{"id":"d","text":"Reference industry design awards","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DLD401-17')::uuid, cid, 'multiple_choice', 'A design system''s governance model determines:',
     '[{"id":"a","text":"The visual style of the design system","is_correct":false},{"id":"b","text":"Who owns, maintains and contributes to the design system and how changes are approved","is_correct":true},{"id":"c","text":"The cost of the design system","is_correct":false},{"id":"d","text":"Which teams are required to use it","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DLD401-18')::uuid, cid, 'multiple_choice', 'Coaching a designer differs from mentoring in that:',
     '[{"id":"a","text":"Coaching is for senior designers only","is_correct":false},{"id":"b","text":"Coaching draws out a person''s own solutions through questions; mentoring shares the mentor''s experience and advice","is_correct":true},{"id":"c","text":"Mentoring is done by peers; coaching is done by managers","is_correct":false},{"id":"d","text":"They are the same thing","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-DLD401-19')::uuid, cid, 'multiple_choice', 'A design team''s OKRs should be:',
     '[{"id":"a","text":"Set by the design manager alone","is_correct":false},{"id":"b","text":"Aligned to company and product OKRs, and co-created with the team","is_correct":true},{"id":"c","text":"Focused exclusively on design output volume","is_correct":false},{"id":"d","text":"Kept confidential from team members","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-DLD401-20')::uuid, cid, 'multiple_choice', 'The "manager as multiplier" concept means:',
     '[{"id":"a","text":"The manager does twice as much work","is_correct":false},{"id":"b","text":"A great manager amplifies the impact of their whole team, creating more value than any individual could alone","is_correct":true},{"id":"c","text":"Managers multiply team size","is_correct":false},{"id":"d","text":"Managers double their own output","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── PRF402 Advanced Portfolio & Personal Brand ───────────────────────
  cid := md5('aorthar-course-PRF402')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'PRF402', 'Advanced Portfolio & Personal Brand',
     'Build a world-class design portfolio and personal brand. Students learn advanced portfolio strategy, case study writing, audience positioning, personal brand voice and how to stand out in competitive job markets.',
     y400, y400s1, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-PRF402-1')::uuid, cid, 'Portfolio Strategy — What to Include and Why', 1, true),
    (md5('aorthar-l-PRF402-2')::uuid, cid, 'Writing Compelling Case Studies', 2, true),
    (md5('aorthar-l-PRF402-3')::uuid, cid, 'Visual Presentation and Portfolio Design', 3, true),
    (md5('aorthar-l-PRF402-4')::uuid, cid, 'Personal Brand — Voice, Niche and Positioning', 4, true),
    (md5('aorthar-l-PRF402-5')::uuid, cid, 'LinkedIn Optimisation for Designers', 5, true),
    (md5('aorthar-l-PRF402-6')::uuid, cid, 'Thought Leadership and Content Creation', 6, true),
    (md5('aorthar-l-PRF402-7')::uuid, cid, 'Networking and Community in the Design Industry', 7, true),
    (md5('aorthar-l-PRF402-8')::uuid, cid, 'Interview Preparation and Portfolio Presentation', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-1-1')::uuid, lid, 'youtube', 'UX Portfolio Strategy Guide', 'https://www.youtube.com/watch?v=XvjJyoNzGKo', 1),
    (md5('aorthar-r-PRF402-1-2')::uuid, lid, 'youtube', 'What Hiring Managers Look for in Portfolios', 'https://www.youtube.com/watch?v=vAMvBBgM0r8', 2),
    (md5('aorthar-r-PRF402-1-3')::uuid, lid, 'youtube', 'How Many Projects Should Be in Your Portfolio', 'https://www.youtube.com/watch?v=MJ01MEUCM8M', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-2-1')::uuid, lid, 'youtube', 'How to Write a UX Case Study', 'https://www.youtube.com/watch?v=jOwTLMBDvJA', 1),
    (md5('aorthar-r-PRF402-2-2')::uuid, lid, 'youtube', 'Case Study Structure for Design Portfolios', 'https://www.youtube.com/watch?v=BcwWUHLRPao', 2),
    (md5('aorthar-r-PRF402-2-3')::uuid, lid, 'youtube', 'Storytelling in Design Case Studies', 'https://www.youtube.com/watch?v=7q5-l6UqWW0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-3-1')::uuid, lid, 'youtube', 'Portfolio Website Design Tips', 'https://www.youtube.com/watch?v=6XRaKlNrFzs', 1),
    (md5('aorthar-r-PRF402-3-2')::uuid, lid, 'youtube', 'How to Design Your Portfolio Site in Figma', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', 2),
    (md5('aorthar-r-PRF402-3-3')::uuid, lid, 'youtube', 'Best UX Portfolio Websites 2024', 'https://www.youtube.com/watch?v=jk1T0CdLxwU', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-4-1')::uuid, lid, 'youtube', 'Personal Brand for Designers', 'https://www.youtube.com/watch?v=l-S2Y3SF3jM', 1),
    (md5('aorthar-r-PRF402-4-2')::uuid, lid, 'youtube', 'Finding Your Design Niche', 'https://www.youtube.com/watch?v=eDqfbfmv3fE', 2),
    (md5('aorthar-r-PRF402-4-3')::uuid, lid, 'youtube', 'Positioning Yourself as a Designer', 'https://www.youtube.com/watch?v=XBDwS7SVQ6Y', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-5-1')::uuid, lid, 'youtube', 'LinkedIn for UX Designers', 'https://www.youtube.com/watch?v=QYDj4dBNuZw', 1),
    (md5('aorthar-r-PRF402-5-2')::uuid, lid, 'youtube', 'Optimise Your LinkedIn Profile for Design Jobs', 'https://www.youtube.com/watch?v=egYDMqJ7MTA', 2),
    (md5('aorthar-r-PRF402-5-3')::uuid, lid, 'youtube', 'How to Grow on LinkedIn as a Designer', 'https://www.youtube.com/watch?v=EK-pHkc5EL4', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-6-1')::uuid, lid, 'youtube', 'Thought Leadership for Designers', 'https://www.youtube.com/watch?v=5PBJJTGk0Vs', 1),
    (md5('aorthar-r-PRF402-6-2')::uuid, lid, 'youtube', 'Writing About Design Online', 'https://www.youtube.com/watch?v=PXbMmGjMKPo', 2),
    (md5('aorthar-r-PRF402-6-3')::uuid, lid, 'youtube', 'Growing an Audience as a Designer', 'https://www.youtube.com/watch?v=vtThiNR2MbQ', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-7-1')::uuid, lid, 'youtube', 'Networking Tips for Designers', 'https://www.youtube.com/watch?v=0QbLqHqUh6Y', 1),
    (md5('aorthar-r-PRF402-7-2')::uuid, lid, 'youtube', 'Design Community and Career Growth', 'https://www.youtube.com/watch?v=n-MQKzKM3mA', 2),
    (md5('aorthar-r-PRF402-7-3')::uuid, lid, 'youtube', 'How to Build Relationships in Design', 'https://www.youtube.com/watch?v=8mJVJcCQJp4', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-PRF402-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-PRF402-8-1')::uuid, lid, 'youtube', 'Design Interview Preparation', 'https://www.youtube.com/watch?v=Ld0J0HwSXFM', 1),
    (md5('aorthar-r-PRF402-8-2')::uuid, lid, 'youtube', 'Presenting Your Portfolio in an Interview', 'https://www.youtube.com/watch?v=lTqfnS4OYGE', 2),
    (md5('aorthar-r-PRF402-8-3')::uuid, lid, 'youtube', 'Common Design Interview Questions', 'https://www.youtube.com/watch?v=AoQ9QHOUXUM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-PRF402-01')::uuid, cid, 'multiple_choice', 'A design portfolio should primarily demonstrate:',
     '[{"id":"a","text":"The number of projects completed","is_correct":false},{"id":"b","text":"Your thinking process, problem solving and the impact of your design decisions","is_correct":true},{"id":"c","text":"The tools you can use","is_correct":false},{"id":"d","text":"Your visual style only","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRF402-02')::uuid, cid, 'multiple_choice', 'The ideal number of projects in a senior design portfolio is approximately:',
     '[{"id":"a","text":"20-30 projects","is_correct":false},{"id":"b","text":"3-5 strong, well-documented case studies","is_correct":true},{"id":"c","text":"1 project only","is_correct":false},{"id":"d","text":"As many as possible","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRF402-03')::uuid, cid, 'multiple_choice', 'A case study in a design portfolio should include:',
     '[{"id":"a","text":"Only the final visual design","is_correct":false},{"id":"b","text":"Problem context, research, process, decisions, final solution and measurable outcomes","is_correct":true},{"id":"c","text":"A full-colour mood board only","is_correct":false},{"id":"d","text":"A list of tools used","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-PRF402-04')::uuid, cid, 'multiple_choice', 'Personal brand positioning for a designer involves:',
     '[{"id":"a","text":"Choosing a favourite colour palette","is_correct":false},{"id":"b","text":"Defining your unique value, niche and how you want to be known in the industry","is_correct":true},{"id":"c","text":"Having a large social media following","is_correct":false},{"id":"d","text":"Copying a successful designer''s approach","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-05')::uuid, cid, 'multiple_choice', 'The most important section in a LinkedIn profile for a designer is:',
     '[{"id":"a","text":"The connections count","is_correct":false},{"id":"b","text":"The headline and About section which communicate your value and specialisation","is_correct":true},{"id":"c","text":"Education history","is_correct":false},{"id":"d","text":"List of tools used","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-06')::uuid, cid, 'multiple_choice', 'Thought leadership content for a designer primarily builds:',
     '[{"id":"a","text":"A large following","is_correct":false},{"id":"b","text":"Authority, visibility and trust in a specific domain, attracting opportunities","is_correct":true},{"id":"c","text":"Free backlinks to your portfolio","is_correct":false},{"id":"d","text":"A high Behance score","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-07')::uuid, cid, 'multiple_choice', 'In a portfolio case study, the "outcome" section should include:',
     '[{"id":"a","text":"Your personal opinions on the design","is_correct":false},{"id":"b","text":"Measurable results such as uplift in conversion, NPS improvement or reduced support tickets","is_correct":true},{"id":"c","text":"A list of stakeholders involved","is_correct":false},{"id":"d","text":"Screenshots of the Figma file","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-08')::uuid, cid, 'multiple_choice', 'When presenting your portfolio in an interview, you should:',
     '[{"id":"a","text":"Show every design you have ever made","is_correct":false},{"id":"b","text":"Walk through your thinking process, highlight decisions and be ready to discuss trade-offs","is_correct":true},{"id":"c","text":"Avoid discussing constraints or failures","is_correct":false},{"id":"d","text":"Read directly from your written case study","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-09')::uuid, cid, 'multiple_choice', 'Specialising in a design niche helps your career because:',
     '[{"id":"a","text":"It limits your opportunities","is_correct":false},{"id":"b","text":"Specialists are in higher demand and can command premium rates for deep expertise","is_correct":true},{"id":"c","text":"Generalists are less valuable","is_correct":false},{"id":"d","text":"It requires less work","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-10')::uuid, cid, 'multiple_choice', 'A strong portfolio website for a UX designer should prioritise:',
     '[{"id":"a","text":"Complex animations and interactions","is_correct":false},{"id":"b","text":"Fast load time, clear navigation and easily accessible case studies","is_correct":true},{"id":"c","text":"A dark colour scheme","is_correct":false},{"id":"d","text":"Showing every tool in the header","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-11')::uuid, cid, 'multiple_choice', 'The narrative arc in a design case study mirrors:',
     '[{"id":"a","text":"A product roadmap","is_correct":false},{"id":"b","text":"A story structure — challenge, journey, resolution and impact — that makes the work compelling","is_correct":true},{"id":"c","text":"A technical specification document","is_correct":false},{"id":"d","text":"A design system guide","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-12')::uuid, cid, 'multiple_choice', 'When building your personal brand, consistency across platforms means:',
     '[{"id":"a","text":"Using the same password everywhere","is_correct":false},{"id":"b","text":"Maintaining the same visual identity, tone and message across your portfolio, LinkedIn and social channels","is_correct":true},{"id":"c","text":"Posting the same content on all platforms daily","is_correct":false},{"id":"d","text":"Using the same profile picture","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-13')::uuid, cid, 'multiple_choice', 'Password-protecting a portfolio to keep NDA work private is appropriate when:',
     '[{"id":"a","text":"The work is too basic to show publicly","is_correct":false},{"id":"b","text":"Work was done under confidentiality agreements but you still want to share details with interviewers","is_correct":true},{"id":"c","text":"You want to restrict access to recruiters only","is_correct":false},{"id":"d","text":"The design is unfinished","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PRF402-14')::uuid, cid, 'multiple_choice', 'A design portfolio for a leadership role should emphasise:',
     '[{"id":"a","text":"Individual craft skills and visual design","is_correct":false},{"id":"b","text":"Team leadership, strategic thinking, cross-functional collaboration and systems-level work","is_correct":true},{"id":"c","text":"The number of projects delivered","is_correct":false},{"id":"d","text":"Animation and prototyping skills","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PRF402-15')::uuid, cid, 'multiple_choice', 'Using Dribbble and Behance is most useful for:',
     '[{"id":"a","text":"Documenting full case studies","is_correct":false},{"id":"b","text":"Showcasing visual craft, building community presence and attracting creative attention","is_correct":true},{"id":"c","text":"Applying for product design roles at large tech companies","is_correct":false},{"id":"d","text":"Hosting your portfolio website","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-16')::uuid, cid, 'multiple_choice', 'The most effective way to document a case study when you cannot show the final UI is:',
     '[{"id":"a","text":"Skip the project entirely","is_correct":false},{"id":"b","text":"Focus on the process, thinking and outcomes using anonymised or abstracted visuals","is_correct":true},{"id":"c","text":"Break the NDA","is_correct":false},{"id":"d","text":"Only describe it verbally in interviews","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-PRF402-17')::uuid, cid, 'multiple_choice', 'Networking in the design industry is best approached by:',
     '[{"id":"a","text":"Collecting as many business cards as possible","is_correct":false},{"id":"b","text":"Building genuine relationships by giving value first — sharing work, feedback and knowledge","is_correct":true},{"id":"c","text":"Only networking with senior designers","is_correct":false},{"id":"d","text":"Attending events only to find job leads","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-18')::uuid, cid, 'multiple_choice', 'Writing about design publicly (blog, LinkedIn) helps your career because:',
     '[{"id":"a","text":"It replaces the need for a portfolio","is_correct":false},{"id":"b","text":"It demonstrates expertise, builds visibility and attracts inbound opportunities over time","is_correct":true},{"id":"c","text":"It is required for senior roles","is_correct":false},{"id":"d","text":"Companies pay designers to blog","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-19')::uuid, cid, 'multiple_choice', 'An elevator pitch for your personal brand should convey:',
     '[{"id":"a","text":"Your entire career history","is_correct":false},{"id":"b","text":"Who you help, what problem you solve and what makes you uniquely valuable — in 30-60 seconds","is_correct":true},{"id":"c","text":"A list of your technical skills","is_correct":false},{"id":"d","text":"How many years of experience you have","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-PRF402-20')::uuid, cid, 'multiple_choice', 'Showing failures or pivots in a portfolio case study is valuable because:',
     '[{"id":"a","text":"It makes you seem humble","is_correct":false},{"id":"b","text":"It demonstrates learning ability, intellectual honesty and resilience which are highly valued in senior roles","is_correct":true},{"id":"c","text":"It reduces expectations","is_correct":false},{"id":"d","text":"Hiring managers prefer cautious designers","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── ADV403 Advanced UX Research & Strategy ───────────────────────────
  cid := md5('aorthar-course-ADV403')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'ADV403', 'Advanced UX Research & Strategy',
     'Master advanced UX research methods and strategic research planning. Students learn generative and evaluative research, research operations, democratising research and integrating insights at an organisational level.',
     y400, y400s1, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-ADV403-1')::uuid, cid, 'Research Strategy and Research Operations', 1, true),
    (md5('aorthar-l-ADV403-2')::uuid, cid, 'Advanced Qualitative Methods — Diary Studies and Contextual Inquiry', 2, true),
    (md5('aorthar-l-ADV403-3')::uuid, cid, 'Advanced Quantitative UX Research', 3, true),
    (md5('aorthar-l-ADV403-4')::uuid, cid, 'Research Synthesis at Scale', 4, true),
    (md5('aorthar-l-ADV403-5')::uuid, cid, 'Democratising Research Across the Organisation', 5, true),
    (md5('aorthar-l-ADV403-6')::uuid, cid, 'Communicating Research to Drive Decisions', 6, true),
    (md5('aorthar-l-ADV403-7')::uuid, cid, 'Longitudinal Research and Journey Tracking', 7, true),
    (md5('aorthar-l-ADV403-8')::uuid, cid, 'Research Ethics and Inclusive Research', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-1-1')::uuid, lid, 'youtube', 'UX Research Operations Explained', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-ADV403-1-2')::uuid, lid, 'youtube', 'Building a Research Strategy', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-ADV403-1-3')::uuid, lid, 'youtube', 'Research Roadmaps for UX Teams', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-2-1')::uuid, lid, 'youtube', 'Diary Studies for UX Research', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 1),
    (md5('aorthar-r-ADV403-2-2')::uuid, lid, 'youtube', 'Contextual Inquiry Method Explained', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 2),
    (md5('aorthar-r-ADV403-2-3')::uuid, lid, 'youtube', 'Ethnographic Research in UX', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-3-1')::uuid, lid, 'youtube', 'Quantitative UX Research Methods', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-ADV403-3-2')::uuid, lid, 'youtube', 'Surveys and Statistical Analysis for UX', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-ADV403-3-3')::uuid, lid, 'youtube', 'SUS Score and Standardised UX Measures', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-4-1')::uuid, lid, 'youtube', 'Research Synthesis Techniques', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 1),
    (md5('aorthar-r-ADV403-4-2')::uuid, lid, 'youtube', 'Affinity Mapping at Scale', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-ADV403-4-3')::uuid, lid, 'youtube', 'Building a Research Repository', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-5-1')::uuid, lid, 'youtube', 'Democratising UX Research', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 1),
    (md5('aorthar-r-ADV403-5-2')::uuid, lid, 'youtube', 'How to Train Non-Researchers to Run Studies', 'https://www.youtube.com/watch?v=raIUQnPoeok', 2),
    (md5('aorthar-r-ADV403-5-3')::uuid, lid, 'youtube', 'Research Enablement in Product Teams', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-6-1')::uuid, lid, 'youtube', 'Communicating Research Findings Effectively', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-ADV403-6-2')::uuid, lid, 'youtube', 'Research Storytelling for Product Teams', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-ADV403-6-3')::uuid, lid, 'youtube', 'Turning Research into Actionable Insights', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-7-1')::uuid, lid, 'youtube', 'Longitudinal UX Research Methods', 'https://www.youtube.com/watch?v=ReM1uqmVfP0', 1),
    (md5('aorthar-r-ADV403-7-2')::uuid, lid, 'youtube', 'Customer Journey Tracking Over Time', 'https://www.youtube.com/watch?v=q8d9uuO1Cf4', 2),
    (md5('aorthar-r-ADV403-7-3')::uuid, lid, 'youtube', 'Panel Research in UX', 'https://www.youtube.com/watch?v=0OE25uMQxgs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ADV403-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ADV403-8-1')::uuid, lid, 'youtube', 'Ethics in UX Research', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-ADV403-8-2')::uuid, lid, 'youtube', 'Inclusive Research Practices', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-ADV403-8-3')::uuid, lid, 'youtube', 'Research with Marginalised Populations', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-ADV403-01')::uuid, cid, 'multiple_choice', 'Research Operations (ReOps) is primarily concerned with:',
     '[{"id":"a","text":"Conducting user interviews","is_correct":false},{"id":"b","text":"The infrastructure, processes and governance that enable a research function to scale","is_correct":true},{"id":"c","text":"Writing research reports","is_correct":false},{"id":"d","text":"Recruiting participants","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-02')::uuid, cid, 'multiple_choice', 'A diary study is best suited for:',
     '[{"id":"a","text":"Testing a specific prototype","is_correct":false},{"id":"b","text":"Capturing longitudinal behaviour and emotions over days or weeks in natural contexts","is_correct":true},{"id":"c","text":"Benchmarking usability against competitors","is_correct":false},{"id":"d","text":"Running remote moderated tests","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-03')::uuid, cid, 'multiple_choice', 'Contextual inquiry involves:',
     '[{"id":"a","text":"Sending a survey to users","is_correct":false},{"id":"b","text":"Observing and interviewing users in their natural environment while they perform real tasks","is_correct":true},{"id":"c","text":"Conducting online interviews","is_correct":false},{"id":"d","text":"Analysing analytics data","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-04')::uuid, cid, 'multiple_choice', 'A research repository serves the purpose of:',
     '[{"id":"a","text":"Storing design files","is_correct":false},{"id":"b","text":"Centralising research findings so teams can search, retrieve and build on past insights","is_correct":true},{"id":"c","text":"Replacing the need for new research","is_correct":false},{"id":"d","text":"Storing participant consent forms only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-05')::uuid, cid, 'multiple_choice', 'Democratising research means:',
     '[{"id":"a","text":"Making research free for everyone","is_correct":false},{"id":"b","text":"Enabling non-researchers (designers, PMs) to conduct lightweight research with appropriate guardrails","is_correct":true},{"id":"c","text":"Sharing research publicly","is_correct":false},{"id":"d","text":"Outsourcing all research","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-06')::uuid, cid, 'multiple_choice', 'The SUS (System Usability Scale) is:',
     '[{"id":"a","text":"A framework for service design","is_correct":false},{"id":"b","text":"A standardised 10-item questionnaire that measures perceived usability of a system","is_correct":true},{"id":"c","text":"A method for measuring accessibility","is_correct":false},{"id":"d","text":"A competitive benchmarking tool","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-07')::uuid, cid, 'multiple_choice', 'The primary risk of democratised research without guardrails is:',
     '[{"id":"a","text":"Too much research being conducted","is_correct":false},{"id":"b","text":"Poorly designed studies leading to invalid findings that mislead product decisions","is_correct":true},{"id":"c","text":"Participants getting fatigued","is_correct":false},{"id":"d","text":"Research becoming too expensive","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ADV403-08')::uuid, cid, 'multiple_choice', 'Generative research is conducted to:',
     '[{"id":"a","text":"Evaluate a finished product","is_correct":false},{"id":"b","text":"Discover and explore unknown problems, needs and opportunities before solutions are defined","is_correct":true},{"id":"c","text":"Benchmark against competitors","is_correct":false},{"id":"d","text":"Test specific design decisions","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-09')::uuid, cid, 'multiple_choice', 'Evaluative research is conducted to:',
     '[{"id":"a","text":"Discover new user needs","is_correct":false},{"id":"b","text":"Assess how well a solution meets user needs through testing and measurement","is_correct":true},{"id":"c","text":"Map the competitive landscape","is_correct":false},{"id":"d","text":"Recruit research participants","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-10')::uuid, cid, 'multiple_choice', 'Informed consent in UX research means participants:',
     '[{"id":"a","text":"Have been recruited by a research agency","is_correct":false},{"id":"b","text":"Understand the purpose, risks and their rights before agreeing to participate","is_correct":true},{"id":"c","text":"Are paid for their time","is_correct":false},{"id":"d","text":"Have prior knowledge of the product","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ADV403-11')::uuid, cid, 'multiple_choice', 'Affinity mapping at research scale is most efficiently done using:',
     '[{"id":"a","text":"Spreadsheets","is_correct":false},{"id":"b","text":"Digital collaboration tools like Miro combined with tagging in a research repository","is_correct":true},{"id":"c","text":"Physical sticky notes only","is_correct":false},{"id":"d","text":"Automated AI summarisation only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-12')::uuid, cid, 'multiple_choice', 'Longitudinal research tracks:',
     '[{"id":"a","text":"The performance of the research team","is_correct":false},{"id":"b","text":"Changes in user behaviour, attitudes or needs over an extended time period","is_correct":true},{"id":"c","text":"Long usability test sessions","is_correct":false},{"id":"d","text":"Research costs over time","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-13')::uuid, cid, 'multiple_choice', 'Inclusive research practice ensures:',
     '[{"id":"a","text":"Only certain user groups are included","is_correct":false},{"id":"b","text":"Participants reflect the diversity of real users including those with disabilities, different backgrounds and contexts","is_correct":true},{"id":"c","text":"All research is published publicly","is_correct":false},{"id":"d","text":"Research is free to access","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-14')::uuid, cid, 'multiple_choice', 'A research strategy document should address:',
     '[{"id":"a","text":"Individual study plans","is_correct":false},{"id":"b","text":"The overarching research questions, methods, cadence and alignment to product strategy","is_correct":true},{"id":"c","text":"Participant recruitment criteria only","is_correct":false},{"id":"d","text":"The design of individual studies","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ADV403-15')::uuid, cid, 'multiple_choice', 'The key challenge when presenting research to executives is:',
     '[{"id":"a","text":"Executives have no interest in research","is_correct":false},{"id":"b","text":"Translating nuanced qualitative findings into clear, decision-relevant business language","is_correct":true},{"id":"c","text":"Research data is confidential","is_correct":false},{"id":"d","text":"Executives only want quantitative data","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-16')::uuid, cid, 'multiple_choice', 'A panel study in UX research involves:',
     '[{"id":"a","text":"A panel of judges evaluating designs","is_correct":false},{"id":"b","text":"A fixed group of participants studied repeatedly over time to track changes","is_correct":true},{"id":"c","text":"A group session with multiple participants","is_correct":false},{"id":"d","text":"A multi-day workshop","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ADV403-17')::uuid, cid, 'multiple_choice', 'Confirmation bias in UX research occurs when:',
     '[{"id":"a","text":"Participants confirm they understood the task","is_correct":false},{"id":"b","text":"Researchers interpret data in ways that confirm existing beliefs and ignore contradictory evidence","is_correct":true},{"id":"c","text":"Results are confirmed by two researchers","is_correct":false},{"id":"d","text":"Participants confirm participation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ADV403-18')::uuid, cid, 'multiple_choice', 'Research impact is best measured by:',
     '[{"id":"a","text":"Number of reports published","is_correct":false},{"id":"b","text":"How often research findings influenced product decisions and led to measurable improvements","is_correct":true},{"id":"c","text":"Number of participants recruited","is_correct":false},{"id":"d","text":"Research budget spent","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ADV403-19')::uuid, cid, 'multiple_choice', 'A "research question" differs from a "survey question" in that:',
     '[{"id":"a","text":"Survey questions are always closed and research questions are always open","is_correct":false},{"id":"b","text":"A research question defines what you want to learn; a survey question is one instrument used to answer it","is_correct":true},{"id":"c","text":"They are the same thing","is_correct":false},{"id":"d","text":"Research questions are only used in academic settings","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ADV403-20')::uuid, cid, 'multiple_choice', 'Triangulation of research methods is used to:',
     '[{"id":"a","text":"Save time by running three studies simultaneously","is_correct":false},{"id":"b","text":"Increase confidence in findings by cross-validating them across multiple methods or data sources","is_correct":true},{"id":"c","text":"Reduce participant numbers needed","is_correct":false},{"id":"d","text":"Triangulate geographic data from participants","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── ENT404 Entrepreneurship for Creatives ────────────────────────────
  cid := md5('aorthar-course-ENT404')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'ENT404', 'Entrepreneurship for Creatives',
     'Learn how to build and launch creative ventures. Students explore the startup lifecycle, idea validation, pitching to investors, fundraising, legal structures and the unique challenges of founding a design-led company.',
     y400, y400s1, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-ENT404-1')::uuid, cid, 'The Creative Entrepreneur Mindset', 1, true),
    (md5('aorthar-l-ENT404-2')::uuid, cid, 'Idea Validation and Problem-Solution Fit', 2, true),
    (md5('aorthar-l-ENT404-3')::uuid, cid, 'Building an MVP — Minimum Viable Product', 3, true),
    (md5('aorthar-l-ENT404-4')::uuid, cid, 'Startup Business Models and Revenue', 4, true),
    (md5('aorthar-l-ENT404-5')::uuid, cid, 'Pitching Your Idea to Investors', 5, true),
    (md5('aorthar-l-ENT404-6')::uuid, cid, 'Fundraising — Bootstrapping vs Venture Capital', 6, true),
    (md5('aorthar-l-ENT404-7')::uuid, cid, 'Legal Structures, Equity and Co-Founder Agreements', 7, true),
    (md5('aorthar-l-ENT404-8')::uuid, cid, 'Scaling a Creative Business', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-1-1')::uuid, lid, 'youtube', 'Entrepreneurship for Designers', 'https://www.youtube.com/watch?v=AoQ9QHOUXUM', 1),
    (md5('aorthar-r-ENT404-1-2')::uuid, lid, 'youtube', 'The Creative Entrepreneur Mindset', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 2),
    (md5('aorthar-r-ENT404-1-3')::uuid, lid, 'youtube', 'Design Founders Stories', 'https://www.youtube.com/watch?v=lTqfnS4OYGE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-2-1')::uuid, lid, 'youtube', 'How to Validate a Startup Idea', 'https://www.youtube.com/watch?v=n-MQKzKM3mA', 1),
    (md5('aorthar-r-ENT404-2-2')::uuid, lid, 'youtube', 'Problem-Solution Fit Explained', 'https://www.youtube.com/watch?v=8mJVJcCQJp4', 2),
    (md5('aorthar-r-ENT404-2-3')::uuid, lid, 'youtube', 'Customer Discovery Interviews', 'https://www.youtube.com/watch?v=Ld0J0HwSXFM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-3-1')::uuid, lid, 'youtube', 'What is an MVP and How to Build One', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-ENT404-3-2')::uuid, lid, 'youtube', 'Lean Startup MVP Strategy', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-ENT404-3-3')::uuid, lid, 'youtube', 'Build Measure Learn Loop', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-4-1')::uuid, lid, 'youtube', 'Startup Business Models Explained', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 1),
    (md5('aorthar-r-ENT404-4-2')::uuid, lid, 'youtube', 'SaaS vs Marketplace vs Freemium', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 2),
    (md5('aorthar-r-ENT404-4-3')::uuid, lid, 'youtube', 'Choosing a Revenue Model for Your Startup', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-5-1')::uuid, lid, 'youtube', 'How to Pitch to Investors', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-ENT404-5-2')::uuid, lid, 'youtube', 'Best Startup Pitch Decks Breakdown', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-ENT404-5-3')::uuid, lid, 'youtube', 'What VCs Look for in a Pitch', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-6-1')::uuid, lid, 'youtube', 'Bootstrapping vs Venture Capital', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 1),
    (md5('aorthar-r-ENT404-6-2')::uuid, lid, 'youtube', 'How Seed Funding Works', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-ENT404-6-3')::uuid, lid, 'youtube', 'Angel Investors vs VC Explained', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-7-1')::uuid, lid, 'youtube', 'Legal Structures for Startups', 'https://www.youtube.com/watch?v=KkBMkjGW3Dk', 1),
    (md5('aorthar-r-ENT404-7-2')::uuid, lid, 'youtube', 'Startup Equity Explained', 'https://www.youtube.com/watch?v=rPCyR_v7GGU', 2),
    (md5('aorthar-r-ENT404-7-3')::uuid, lid, 'youtube', 'Co-Founder Agreement Essentials', 'https://www.youtube.com/watch?v=TiJlYTmrfEA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-ENT404-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-ENT404-8-1')::uuid, lid, 'youtube', 'How to Scale a Startup', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-ENT404-8-2')::uuid, lid, 'youtube', 'Scaling from Startup to Scale-up', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-ENT404-8-3')::uuid, lid, 'youtube', 'Growth Challenges at Series A', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-ENT404-01')::uuid, cid, 'multiple_choice', 'The "Lean Startup" methodology was developed by:',
     '[{"id":"a","text":"Steve Jobs","is_correct":false},{"id":"b","text":"Eric Ries","is_correct":true},{"id":"c","text":"Jeff Bezos","is_correct":false},{"id":"d","text":"Tim Brown","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ENT404-02')::uuid, cid, 'multiple_choice', 'An MVP (Minimum Viable Product) is:',
     '[{"id":"a","text":"The most impressive version of a product","is_correct":false},{"id":"b","text":"The simplest version of a product that delivers core value and allows validated learning","is_correct":true},{"id":"c","text":"A minimum viable prototype","is_correct":false},{"id":"d","text":"A product with no bugs","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ENT404-03')::uuid, cid, 'multiple_choice', 'The Build-Measure-Learn loop means:',
     '[{"id":"a","text":"Build a product, measure sales, learn marketing","is_correct":false},{"id":"b","text":"Build a small product increment, measure how users respond, learn what to build next","is_correct":true},{"id":"c","text":"Build a team, measure performance, learn from mistakes","is_correct":false},{"id":"d","text":"A coding methodology","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ENT404-04')::uuid, cid, 'multiple_choice', 'Idea validation before building a product involves:',
     '[{"id":"a","text":"Hiring a development team","is_correct":false},{"id":"b","text":"Testing core assumptions about the problem and solution with real potential customers before heavy investment","is_correct":true},{"id":"c","text":"Writing a detailed business plan","is_correct":false},{"id":"d","text":"Registering the company","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ENT404-05')::uuid, cid, 'multiple_choice', 'Bootstrapping a startup means:',
     '[{"id":"a","text":"Getting venture capital funding","is_correct":false},{"id":"b","text":"Building the business using personal savings and revenue without external investment","is_correct":true},{"id":"c","text":"Hiring a large team immediately","is_correct":false},{"id":"d","text":"Pivoting the business model","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ENT404-06')::uuid, cid, 'multiple_choice', 'A pitch deck should lead with:',
     '[{"id":"a","text":"A detailed financial model","is_correct":false},{"id":"b","text":"The problem being solved and why it is large, urgent and underserved","is_correct":true},{"id":"c","text":"The team''s CVs","is_correct":false},{"id":"d","text":"Technical architecture","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-07')::uuid, cid, 'multiple_choice', 'A SaaS (Software as a Service) business model generates revenue through:',
     '[{"id":"a","text":"Selling software licences permanently","is_correct":false},{"id":"b","text":"Recurring subscription fees for ongoing access to cloud-hosted software","is_correct":true},{"id":"c","text":"One-time project fees","is_correct":false},{"id":"d","text":"Advertising revenue only","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-ENT404-08')::uuid, cid, 'multiple_choice', 'Equity vesting in a co-founder agreement serves to:',
     '[{"id":"a","text":"Ensure all founders receive shares immediately","is_correct":false},{"id":"b","text":"Protect the company by ensuring founders earn their shares over time, preventing early departure windfalls","is_correct":true},{"id":"c","text":"Reduce legal costs","is_correct":false},{"id":"d","text":"Increase the company valuation","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-09')::uuid, cid, 'multiple_choice', 'Product-market fit is best evidenced by:',
     '[{"id":"a","text":"A successful product launch event","is_correct":false},{"id":"b","text":"Strong organic retention, word-of-mouth growth and users expressing they would be very disappointed without the product","is_correct":true},{"id":"c","text":"Press coverage","is_correct":false},{"id":"d","text":"Reaching 1000 users","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-10')::uuid, cid, 'multiple_choice', 'A pivot in startup terminology means:',
     '[{"id":"a","text":"A complete restart with a new team","is_correct":false},{"id":"b","text":"A structured course correction in strategy while retaining validated learning","is_correct":true},{"id":"c","text":"Failing and closing the company","is_correct":false},{"id":"d","text":"Changing the company name","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-11')::uuid, cid, 'multiple_choice', 'Pre-seed funding is typically used for:',
     '[{"id":"a","text":"Scaling an established product","is_correct":false},{"id":"b","text":"Validating the idea, building an MVP and finding early customers","is_correct":true},{"id":"c","text":"International expansion","is_correct":false},{"id":"d","text":"Hiring a full sales team","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-12')::uuid, cid, 'multiple_choice', 'A Term Sheet in startup funding is:',
     '[{"id":"a","text":"A legal contract binding investors","is_correct":false},{"id":"b","text":"A non-binding document outlining the key terms of a proposed investment","is_correct":true},{"id":"c","text":"A product specification document","is_correct":false},{"id":"d","text":"A co-founder equity agreement","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ENT404-13')::uuid, cid, 'multiple_choice', 'The "Mom Test" by Rob Fitzpatrick teaches founders to:',
     '[{"id":"a","text":"Interview their mothers to validate ideas","is_correct":false},{"id":"b","text":"Ask questions that reveal honest behaviour rather than polite validation from potential customers","is_correct":true},{"id":"c","text":"Get parental approval before launching","is_correct":false},{"id":"d","text":"Use simple language in customer interviews","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ENT404-14')::uuid, cid, 'multiple_choice', 'A marketplace business model creates value by:',
     '[{"id":"a","text":"Selling its own products","is_correct":false},{"id":"b","text":"Connecting buyers and sellers and taking a transaction fee or commission","is_correct":true},{"id":"c","text":"Offering a subscription service","is_correct":false},{"id":"d","text":"Running paid advertising","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-15')::uuid, cid, 'multiple_choice', 'Design-led founders have an advantage because:',
     '[{"id":"a","text":"They can avoid hiring developers","is_correct":false},{"id":"b","text":"Deep user empathy and product craft enable them to build differentiated experiences from the start","is_correct":true},{"id":"c","text":"Design is the only skill needed to build a startup","is_correct":false},{"id":"d","text":"Investors prefer designers to engineers","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-16')::uuid, cid, 'multiple_choice', 'Runway in startup finance refers to:',
     '[{"id":"a","text":"A product launch sequence","is_correct":false},{"id":"b","text":"How long the company can operate before running out of money at its current burn rate","is_correct":true},{"id":"c","text":"The length of the sales cycle","is_correct":false},{"id":"d","text":"The growth trajectory of the company","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-17')::uuid, cid, 'multiple_choice', 'Dilution in startup equity means:',
     '[{"id":"a","text":"The company loses value","is_correct":false},{"id":"b","text":"Founder ownership percentage decreases as new shares are issued to investors or employees","is_correct":true},{"id":"c","text":"Reducing the product feature set","is_correct":false},{"id":"d","text":"Cutting team salaries","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ENT404-18')::uuid, cid, 'multiple_choice', 'Burning Man vs Burning Money — a sustainable startup growth model prioritises:',
     '[{"id":"a","text":"Growing headcount as fast as possible","is_correct":false},{"id":"b","text":"Building a path to profitability or strong unit economics rather than growth at all costs","is_correct":true},{"id":"c","text":"Maximum marketing spend","is_correct":false},{"id":"d","text":"Hiring senior executives early","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-ENT404-19')::uuid, cid, 'multiple_choice', 'Y Combinator''s most famous advice to startups is:',
     '[{"id":"a","text":"Launch with a perfect product","is_correct":false},{"id":"b","text":"Make something people want","is_correct":true},{"id":"c","text":"Raise as much money as possible first","is_correct":false},{"id":"d","text":"Hire fast and fire fast","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-ENT404-20')::uuid, cid, 'multiple_choice', 'The "unfair advantage" section of a pitch deck communicates:',
     '[{"id":"a","text":"Why the team works harder than competitors","is_correct":false},{"id":"b","text":"What the company has that cannot be easily copied — proprietary tech, network effects, unique insight or team","is_correct":true},{"id":"c","text":"Lower pricing than competitors","is_correct":false},{"id":"d","text":"Patent filings","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ── STR405 Strategic Product Design ─────────────────────────────────
  cid := md5('aorthar-course-STR405')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'STR405', 'Strategic Product Design',
     'Learn to design products at the strategic level. Students explore product vision, roadmap strategy, prioritisation frameworks, go-to-market strategy, platform thinking and how design shapes long-term product direction.',
     y400, y400s1, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-STR405-1')::uuid, cid, 'Product Vision and Strategic Direction', 1, true),
    (md5('aorthar-l-STR405-2')::uuid, cid, 'Product Roadmaps — Outcome vs Output', 2, true),
    (md5('aorthar-l-STR405-3')::uuid, cid, 'Prioritisation Frameworks — RICE, ICE and MoSCoW', 3, true),
    (md5('aorthar-l-STR405-4')::uuid, cid, 'Platform Thinking and Ecosystem Design', 4, true),
    (md5('aorthar-l-STR405-5')::uuid, cid, 'Go-to-Market Strategy for Product Designers', 5, true),
    (md5('aorthar-l-STR405-6')::uuid, cid, 'Design System Strategy and Governance', 6, true),
    (md5('aorthar-l-STR405-7')::uuid, cid, 'Competitive Landscape and Product Differentiation', 7, true),
    (md5('aorthar-l-STR405-8')::uuid, cid, 'Long-Term Design Vision and Future-Proofing', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-1-1')::uuid, lid, 'youtube', 'How to Create a Product Vision', 'https://www.youtube.com/watch?v=ReM1uqmVfP0', 1),
    (md5('aorthar-r-STR405-1-2')::uuid, lid, 'youtube', 'Product Strategy Explained', 'https://www.youtube.com/watch?v=q8d9uuO1Cf4', 2),
    (md5('aorthar-r-STR405-1-3')::uuid, lid, 'youtube', 'Strategic Design for Product Leaders', 'https://www.youtube.com/watch?v=0OE25uMQxgs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-2-1')::uuid, lid, 'youtube', 'Outcome-Based Roadmaps', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-STR405-2-2')::uuid, lid, 'youtube', 'Product Roadmap Strategy', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-STR405-2-3')::uuid, lid, 'youtube', 'Now-Next-Later Roadmap Framework', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-3-1')::uuid, lid, 'youtube', 'RICE Prioritisation Framework', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 1),
    (md5('aorthar-r-STR405-3-2')::uuid, lid, 'youtube', 'MoSCoW Method for Product Teams', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 2),
    (md5('aorthar-r-STR405-3-3')::uuid, lid, 'youtube', 'How to Prioritise Your Product Backlog', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-4-1')::uuid, lid, 'youtube', 'Platform Thinking for Product Designers', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 1),
    (md5('aorthar-r-STR405-4-2')::uuid, lid, 'youtube', 'How Platforms Create Value', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 2),
    (md5('aorthar-r-STR405-4-3')::uuid, lid, 'youtube', 'Ecosystem Design Strategy', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-5-1')::uuid, lid, 'youtube', 'Go-to-Market Strategy for Startups', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 1),
    (md5('aorthar-r-STR405-5-2')::uuid, lid, 'youtube', 'GTM Strategy for Product Launches', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 2),
    (md5('aorthar-r-STR405-5-3')::uuid, lid, 'youtube', 'Product Launch Strategy', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-6-1')::uuid, lid, 'youtube', 'Design System Governance Models', 'https://www.youtube.com/watch?v=EK-pHkc5EL4', 1),
    (md5('aorthar-r-STR405-6-2')::uuid, lid, 'youtube', 'Design System Strategy at Scale', 'https://www.youtube.com/watch?v=5PBJJTGk0Vs', 2),
    (md5('aorthar-r-STR405-6-3')::uuid, lid, 'youtube', 'Building a Design System Roadmap', 'https://www.youtube.com/watch?v=egYDMqJ7MTA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-7-1')::uuid, lid, 'youtube', 'Competitive Analysis for Product Teams', 'https://www.youtube.com/watch?v=TuoGn4QfCd8', 1),
    (md5('aorthar-r-STR405-7-2')::uuid, lid, 'youtube', 'Product Differentiation Strategies', 'https://www.youtube.com/watch?v=ZPqPdyesbbc', 2),
    (md5('aorthar-r-STR405-7-3')::uuid, lid, 'youtube', 'How to Identify Your Competitive Advantage', 'https://www.youtube.com/watch?v=sO4te2QNsHY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-STR405-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-STR405-8-1')::uuid, lid, 'youtube', 'Future-Proofing Your Product Design', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-STR405-8-2')::uuid, lid, 'youtube', 'Long-Term Product Vision Setting', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-STR405-8-3')::uuid, lid, 'youtube', 'Designing for 10X Scenarios', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-STR405-01')::uuid, cid, 'multiple_choice', 'An outcome-based product roadmap focuses on:',
     '[{"id":"a","text":"A list of features to build in each quarter","is_correct":false},{"id":"b","text":"The business and user outcomes the team is working toward rather than specific deliverables","is_correct":true},{"id":"c","text":"Sprint deliverables","is_correct":false},{"id":"d","text":"Engineering milestones","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-02')::uuid, cid, 'multiple_choice', 'The RICE prioritisation score is calculated from:',
     '[{"id":"a","text":"Revenue, Impact, Cost and Efficiency","is_correct":false},{"id":"b","text":"Reach, Impact, Confidence and Effort","is_correct":true},{"id":"c","text":"Risk, Innovation, Complexity and Execution","is_correct":false},{"id":"d","text":"Research, Insight, Clarity and Experience","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-03')::uuid, cid, 'multiple_choice', 'Platform thinking in product design considers:',
     '[{"id":"a","text":"Only the core user journey","is_correct":false},{"id":"b","text":"How to design for multiple user types and third-party contributions that create ecosystem value","is_correct":true},{"id":"c","text":"Server infrastructure","is_correct":false},{"id":"d","text":"Cross-platform compatibility only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-04')::uuid, cid, 'multiple_choice', 'A product vision statement should:',
     '[{"id":"a","text":"List every feature to be built","is_correct":false},{"id":"b","text":"Paint an inspiring, ambitious future state that guides decisions over a 3-5 year horizon","is_correct":true},{"id":"c","text":"Define quarterly targets","is_correct":false},{"id":"d","text":"Outline the technology stack","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-STR405-05')::uuid, cid, 'multiple_choice', 'MoSCoW prioritisation categories are:',
     '[{"id":"a","text":"Must, Often, Should, Cannot","is_correct":false},{"id":"b","text":"Must have, Should have, Could have, Won''t have (now)","is_correct":true},{"id":"c","text":"Major, Optional, Secondary, Cancelled","is_correct":false},{"id":"d","text":"Mandatory, Obvious, Simple, Complex","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-STR405-06')::uuid, cid, 'multiple_choice', 'A go-to-market strategy defines:',
     '[{"id":"a","text":"The internal development process","is_correct":false},{"id":"b","text":"How a product will reach target customers, generate awareness and drive adoption","is_correct":true},{"id":"c","text":"The product''s pricing only","is_correct":false},{"id":"d","text":"The design system guidelines","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-07')::uuid, cid, 'multiple_choice', 'Design system governance determines:',
     '[{"id":"a","text":"The visual style of every product","is_correct":false},{"id":"b","text":"Who owns, maintains and has authority over the design system and its evolution","is_correct":true},{"id":"c","text":"The cost of design tools","is_correct":false},{"id":"d","text":"Which teams must use the design system","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-08')::uuid, cid, 'multiple_choice', 'The "Now-Next-Later" roadmap framework helps teams to:',
     '[{"id":"a","text":"Schedule all work by date","is_correct":false},{"id":"b","text":"Communicate priorities at three time horizons with decreasing certainty as work moves further away","is_correct":true},{"id":"c","text":"Replace sprint planning","is_correct":false},{"id":"d","text":"Define what will never be built","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-09')::uuid, cid, 'multiple_choice', 'A product moat from a design perspective is built through:',
     '[{"id":"a","text":"Having more designers than competitors","is_correct":false},{"id":"b","text":"Deep user understanding, proprietary patterns and brand experience that are difficult to replicate","is_correct":true},{"id":"c","text":"Copying the market leader''s design","is_correct":false},{"id":"d","text":"Using the latest design trends","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-STR405-10')::uuid, cid, 'multiple_choice', 'Opportunity sizing in product strategy helps prioritise by:',
     '[{"id":"a","text":"Estimating development time","is_correct":false},{"id":"b","text":"Estimating the revenue, user or impact potential of addressing a specific problem","is_correct":true},{"id":"c","text":"Counting feature requests","is_correct":false},{"id":"d","text":"Measuring team capacity","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-11')::uuid, cid, 'multiple_choice', 'The "two-sided market" problem in platform design refers to:',
     '[{"id":"a","text":"Designing for both mobile and desktop","is_correct":false},{"id":"b","text":"The challenge of attracting both supply and demand sides of a marketplace simultaneously","is_correct":true},{"id":"c","text":"Supporting two different languages","is_correct":false},{"id":"d","text":"Managing two design teams","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-STR405-12')::uuid, cid, 'multiple_choice', 'Strategic design is different from execution design because it:',
     '[{"id":"a","text":"Takes longer to produce","is_correct":false},{"id":"b","text":"Focuses on what and why to design rather than how to design it","is_correct":true},{"id":"c","text":"Does not involve visual design","is_correct":false},{"id":"d","text":"Is done by senior designers only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-13')::uuid, cid, 'multiple_choice', 'ICE scoring stands for:',
     '[{"id":"a","text":"Impact, Clarity, Experience","is_correct":false},{"id":"b","text":"Impact, Confidence, Ease","is_correct":true},{"id":"c","text":"Innovation, Cost, Efficiency","is_correct":false},{"id":"d","text":"Insight, Contribution, Execution","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-14')::uuid, cid, 'multiple_choice', 'A design system roadmap should be prioritised based on:',
     '[{"id":"a","text":"What designers find most interesting to build","is_correct":false},{"id":"b","text":"The components that will deliver the greatest adoption, consistency and team velocity gains","is_correct":true},{"id":"c","text":"The most complex components first","is_correct":false},{"id":"d","text":"Alphabetical order","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-15')::uuid, cid, 'multiple_choice', 'Future-proofing in product design means:',
     '[{"id":"a","text":"Designing for technology that does not exist yet","is_correct":false},{"id":"b","text":"Making architectural and interaction decisions that remain flexible and scalable as the product grows","is_correct":true},{"id":"c","text":"Adding every potential feature now","is_correct":false},{"id":"d","text":"Never changing the design system","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-16')::uuid, cid, 'multiple_choice', 'The primary role of a product designer in strategy is to:',
     '[{"id":"a","text":"Execute visual mockups as directed","is_correct":false},{"id":"b","text":"Represent the user perspective and translate research into strategic product decisions","is_correct":true},{"id":"c","text":"Manage the product backlog","is_correct":false},{"id":"d","text":"Write the product requirements","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-17')::uuid, cid, 'multiple_choice', 'A competitive analysis matrix in product strategy compares competitors across:',
     '[{"id":"a","text":"Their office locations","is_correct":false},{"id":"b","text":"Key product capabilities, user experience quality, pricing and strategic positioning","is_correct":true},{"id":"c","text":"The number of designers on staff","is_correct":false},{"id":"d","text":"Only pricing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-18')::uuid, cid, 'multiple_choice', 'When should a product team say "no" to a feature request?',
     '[{"id":"a","text":"Never — all user requests should be built","is_correct":false},{"id":"b","text":"When the feature does not align with the product vision, strategy or user needs even if loudly requested","is_correct":true},{"id":"c","text":"When development is busy","is_correct":false},{"id":"d","text":"When the designer does not like the idea","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-STR405-19')::uuid, cid, 'multiple_choice', 'Platform network effects create value because:',
     '[{"id":"a","text":"Platforms have more features than regular products","is_correct":false},{"id":"b","text":"Each additional user or contributor makes the platform more valuable for all existing participants","is_correct":true},{"id":"c","text":"Platforms cost less to build","is_correct":false},{"id":"d","text":"They operate across multiple networks","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-STR405-20')::uuid, cid, 'multiple_choice', 'The most dangerous design anti-pattern in product strategy is:',
     '[{"id":"a","text":"Using too many design patterns","is_correct":false},{"id":"b","text":"Building features nobody asked for at the expense of validated user needs","is_correct":true},{"id":"c","text":"Over-designing for accessibility","is_correct":false},{"id":"d","text":"Spending too long on research","is_correct":false}]'::jsonb, 1, true, false, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════
  -- YEAR 400 · SEMESTER 2  (is_premium = true)
  -- ═══════════════════════════════════════════════════════════════════════

  -- ── CAP406 Capstone Project Preparation ─────────────────────────────
  cid := md5('aorthar-course-CAP406')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'CAP406', 'Capstone Project Preparation',
     'Prepare for the final capstone project by synthesising all skills from the programme. Students define a real-world design problem, develop a research plan, create a strategic brief and present a project proposal to a panel.',
     y400, y400s2, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-CAP406-1')::uuid, cid, 'What is the Capstone Project', 1, true),
    (md5('aorthar-l-CAP406-2')::uuid, cid, 'Selecting a Problem Space and Brief', 2, true),
    (md5('aorthar-l-CAP406-3')::uuid, cid, 'Writing a Strategic Design Brief', 3, true),
    (md5('aorthar-l-CAP406-4')::uuid, cid, 'Research Plan and Stakeholder Mapping', 4, true),
    (md5('aorthar-l-CAP406-5')::uuid, cid, 'Synthesis and Insight Development', 5, true),
    (md5('aorthar-l-CAP406-6')::uuid, cid, 'Concept Generation and Early Direction', 6, true),
    (md5('aorthar-l-CAP406-7')::uuid, cid, 'Project Proposal Presentation', 7, true),
    (md5('aorthar-l-CAP406-8')::uuid, cid, 'Capstone Evaluation Criteria and Success Metrics', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-1-1')::uuid, lid, 'youtube', 'Design Capstone Project Guide', 'https://www.youtube.com/watch?v=_r0VX-aU_T8', 1),
    (md5('aorthar-r-CAP406-1-2')::uuid, lid, 'youtube', 'Final Portfolio Project Strategy', 'https://www.youtube.com/watch?v=Tvu34s8iMZw', 2),
    (md5('aorthar-r-CAP406-1-3')::uuid, lid, 'youtube', 'How to Structure a Capstone Project', 'https://www.youtube.com/watch?v=K2vSQPh6MCE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-2-1')::uuid, lid, 'youtube', 'How to Choose a Design Project Topic', 'https://www.youtube.com/watch?v=7_sFVYfatXY', 1),
    (md5('aorthar-r-CAP406-2-2')::uuid, lid, 'youtube', 'Defining a Problem Space', 'https://www.youtube.com/watch?v=v6n1i0qojws', 2),
    (md5('aorthar-r-CAP406-2-3')::uuid, lid, 'youtube', 'Scoping a UX Research Problem', 'https://www.youtube.com/watch?v=XZZP7u4bOa0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-3-1')::uuid, lid, 'youtube', 'How to Write a Design Brief', 'https://www.youtube.com/watch?v=mk1JL3Whlg8', 1),
    (md5('aorthar-r-CAP406-3-2')::uuid, lid, 'youtube', 'Strategic Brief Template for Designers', 'https://www.youtube.com/watch?v=YeI6Wqn4I78', 2),
    (md5('aorthar-r-CAP406-3-3')::uuid, lid, 'youtube', 'Design Brief Examples', 'https://www.youtube.com/watch?v=hpqFoR0oA6I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-4-1')::uuid, lid, 'youtube', 'Creating a UX Research Plan', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 1),
    (md5('aorthar-r-CAP406-4-2')::uuid, lid, 'youtube', 'Stakeholder Mapping for Designers', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 2),
    (md5('aorthar-r-CAP406-4-3')::uuid, lid, 'youtube', 'Research Planning Toolkit', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-5-1')::uuid, lid, 'youtube', 'Research Synthesis and Insight Generation', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-CAP406-5-2')::uuid, lid, 'youtube', 'Turning Research into Design Opportunities', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-CAP406-5-3')::uuid, lid, 'youtube', 'Affinity Mapping for Insights', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-6-1')::uuid, lid, 'youtube', 'Concept Generation in Design', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 1),
    (md5('aorthar-r-CAP406-6-2')::uuid, lid, 'youtube', 'Design Directions and Concept Frames', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-CAP406-6-3')::uuid, lid, 'youtube', 'Sketching Ideas for UX', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-7-1')::uuid, lid, 'youtube', 'How to Present a Design Proposal', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 1),
    (md5('aorthar-r-CAP406-7-2')::uuid, lid, 'youtube', 'Presenting to a Design Panel', 'https://www.youtube.com/watch?v=raIUQnPoeok', 2),
    (md5('aorthar-r-CAP406-7-3')::uuid, lid, 'youtube', 'Design Presentation Skills', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CAP406-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CAP406-8-1')::uuid, lid, 'youtube', 'Design Project Evaluation Criteria', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-CAP406-8-2')::uuid, lid, 'youtube', 'Measuring Success in Design Projects', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-CAP406-8-3')::uuid, lid, 'youtube', 'Design Critique and Feedback Frameworks', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-CAP406-01')::uuid, cid, 'multiple_choice', 'A capstone project primarily demonstrates:',
     '[{"id":"a","text":"Mastery of a single design tool","is_correct":false},{"id":"b","text":"The integration and application of all skills learned across the programme to a real-world problem","is_correct":true},{"id":"c","text":"The most complex visual design possible","is_correct":false},{"id":"d","text":"Academic writing ability","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CAP406-02')::uuid, cid, 'multiple_choice', 'A strong capstone problem space should be:',
     '[{"id":"a","text":"Easy to solve in one week","is_correct":false},{"id":"b","text":"Real, meaningful, underexplored and large enough to allow deep investigation","is_correct":true},{"id":"c","text":"Chosen by the instructor","is_correct":false},{"id":"d","text":"Focused on visual design only","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CAP406-03')::uuid, cid, 'multiple_choice', 'A strategic design brief should include:',
     '[{"id":"a","text":"Only the colour palette and typography choices","is_correct":false},{"id":"b","text":"The problem context, target users, design goals, constraints and success criteria","is_correct":true},{"id":"c","text":"A list of features to build","is_correct":false},{"id":"d","text":"A project budget breakdown","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CAP406-04')::uuid, cid, 'multiple_choice', 'Stakeholder mapping in a capstone project helps to:',
     '[{"id":"a","text":"Identify who will review the project grade","is_correct":false},{"id":"b","text":"Identify all people affected by or invested in the problem, to inform research and design decisions","is_correct":true},{"id":"c","text":"List potential investors","is_correct":false},{"id":"d","text":"Map the competitive landscape","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-05')::uuid, cid, 'multiple_choice', 'The insight stage of a design project produces:',
     '[{"id":"a","text":"Final wireframes","is_correct":false},{"id":"b","text":"Synthesised, actionable findings that reveal underlying user needs and opportunities","is_correct":true},{"id":"c","text":"A competitive analysis report","is_correct":false},{"id":"d","text":"A list of features","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-06')::uuid, cid, 'multiple_choice', 'The purpose of a capstone proposal presentation is to:',
     '[{"id":"a","text":"Present the final solution","is_correct":false},{"id":"b","text":"Communicate the problem, research plan and early direction to get feedback before full execution","is_correct":true},{"id":"c","text":"Replace the final project submission","is_correct":false},{"id":"d","text":"Impress the panel with visual design","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-07')::uuid, cid, 'multiple_choice', 'Design research for a capstone should be scoped to:',
     '[{"id":"a","text":"Interview at least 100 users","is_correct":false},{"id":"b","text":"Generate enough insight to confidently identify and validate the core problem before designing","is_correct":true},{"id":"c","text":"Produce a 50-page research report","is_correct":false},{"id":"d","text":"Complete in one day","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-08')::uuid, cid, 'multiple_choice', 'Concept framing in early capstone work helps to:',
     '[{"id":"a","text":"Jump directly to high-fidelity mockups","is_correct":false},{"id":"b","text":"Explore multiple strategic directions before committing to one solution","is_correct":true},{"id":"c","text":"Avoid user research","is_correct":false},{"id":"d","text":"Get stakeholder approval immediately","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-09')::uuid, cid, 'multiple_choice', 'Success criteria in a design brief should be:',
     '[{"id":"a","text":"Vague to allow flexibility","is_correct":false},{"id":"b","text":"Specific, measurable and agreed upon before the project begins","is_correct":true},{"id":"c","text":"Defined only at the end of the project","is_correct":false},{"id":"d","text":"Set by the design team alone","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-10')::uuid, cid, 'multiple_choice', 'The evaluation of a capstone project typically assesses:',
     '[{"id":"a","text":"Visual aesthetics only","is_correct":false},{"id":"b","text":"Research rigour, problem framing, design quality, iteration and evidence of impact","is_correct":true},{"id":"c","text":"Number of screens designed","is_correct":false},{"id":"d","text":"Use of the latest design tools","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-11')::uuid, cid, 'multiple_choice', 'Why is iteration critical in a capstone project?',
     '[{"id":"a","text":"It increases the number of deliverables","is_correct":false},{"id":"b","text":"It allows the designer to test assumptions, learn from feedback and progressively refine the solution","is_correct":true},{"id":"c","text":"It makes the project longer","is_correct":false},{"id":"d","text":"Evaluators require a minimum number of iterations","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CAP406-12')::uuid, cid, 'multiple_choice', 'A design research plan should specify:',
     '[{"id":"a","text":"The final design solution","is_correct":false},{"id":"b","text":"Research questions, methods, participant criteria, timeline and analysis approach","is_correct":true},{"id":"c","text":"The project budget","is_correct":false},{"id":"d","text":"The final presentation format","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-13')::uuid, cid, 'multiple_choice', 'Selecting a problem that is too broad for a capstone risks:',
     '[{"id":"a","text":"Getting a better grade","is_correct":false},{"id":"b","text":"Superficial research and design that lacks depth and specificity","is_correct":true},{"id":"c","text":"Impressing the panel","is_correct":false},{"id":"d","text":"Spending too much time on research","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-14')::uuid, cid, 'multiple_choice', 'Primary research in a capstone project means:',
     '[{"id":"a","text":"The most important research","is_correct":false},{"id":"b","text":"Original research you conduct yourself — interviews, observations, surveys — as opposed to secondary desk research","is_correct":true},{"id":"c","text":"Research from primary sources on the internet","is_correct":false},{"id":"d","text":"Research conducted first in the project","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-15')::uuid, cid, 'multiple_choice', 'When presenting a capstone proposal, the most important thing to convey is:',
     '[{"id":"a","text":"That you have already completed the solution","is_correct":false},{"id":"b","text":"Why the problem matters, what you know so far and how you plan to investigate it","is_correct":true},{"id":"c","text":"Your personal interest in the topic","is_correct":false},{"id":"d","text":"The full design system","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-16')::uuid, cid, 'multiple_choice', 'The HMW (How Might We) statement in capstone framing is used to:',
     '[{"id":"a","text":"Define the solution","is_correct":false},{"id":"b","text":"Reframe research insights as open design opportunities to inspire ideation","is_correct":true},{"id":"c","text":"Set project deadlines","is_correct":false},{"id":"d","text":"Write the evaluation criteria","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-17')::uuid, cid, 'multiple_choice', 'A capstone project is most valuable as a portfolio piece because:',
     '[{"id":"a","text":"It was graded","is_correct":false},{"id":"b","text":"It is a self-defined, end-to-end project that demonstrates independent strategic and design thinking","is_correct":true},{"id":"c","text":"It uses the most design tools","is_correct":false},{"id":"d","text":"It is the longest project","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-18')::uuid, cid, 'multiple_choice', 'Design constraints in a capstone brief are:',
     '[{"id":"a","text":"Obstacles to avoid","is_correct":false},{"id":"b","text":"Real-world boundaries (time, technology, budget, access) that shape and focus the design problem","is_correct":true},{"id":"c","text":"Set only by the instructor","is_correct":false},{"id":"d","text":"Only relevant for commercial projects","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CAP406-19')::uuid, cid, 'multiple_choice', 'Triangulating insights in a capstone means:',
     '[{"id":"a","text":"Using exactly three research methods","is_correct":false},{"id":"b","text":"Cross-referencing findings from multiple sources to build confidence and identify patterns","is_correct":true},{"id":"c","text":"Running three rounds of user testing","is_correct":false},{"id":"d","text":"Interviewing three stakeholders","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-CAP406-20')::uuid, cid, 'multiple_choice', 'The capstone project evaluation panel is looking for evidence of:',
     '[{"id":"a","text":"Technical programming skills","is_correct":false},{"id":"b","text":"Rigorous process, strategic thinking, user empathy and the ability to communicate design decisions clearly","is_correct":true},{"id":"c","text":"The number of user interviews conducted","is_correct":false},{"id":"d","text":"Proficiency in a specific design tool","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── MEN407 Mentorship & Community Leadership ─────────────────────────
  cid := md5('aorthar-course-MEN407')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'MEN407', 'Mentorship & Community Leadership',
     'Learn how to be a mentor, community leader and positive force in the design ecosystem. Students explore mentoring frameworks, active listening, giving guidance, building inclusive communities and leaving a design legacy.',
     y400, y400s2, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-MEN407-1')::uuid, cid, 'The Role of a Mentor in Design', 1, true),
    (md5('aorthar-l-MEN407-2')::uuid, cid, 'Active Listening and Coaching Conversations', 2, true),
    (md5('aorthar-l-MEN407-3')::uuid, cid, 'Structuring a Mentoring Relationship', 3, true),
    (md5('aorthar-l-MEN407-4')::uuid, cid, 'Community Leadership Principles', 4, true),
    (md5('aorthar-l-MEN407-5')::uuid, cid, 'Inclusive Leadership and Representation', 5, true),
    (md5('aorthar-l-MEN407-6')::uuid, cid, 'Giving Back — Speaking, Writing and Teaching', 6, true),
    (md5('aorthar-l-MEN407-7')::uuid, cid, 'Building a Mentorship Programme', 7, true),
    (md5('aorthar-l-MEN407-8')::uuid, cid, 'Design Legacy and Long-Term Industry Impact', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-1-1')::uuid, lid, 'youtube', 'How to Be a Great Design Mentor', 'https://www.youtube.com/watch?v=ReM1uqmVfP0', 1),
    (md5('aorthar-r-MEN407-1-2')::uuid, lid, 'youtube', 'The Power of Mentorship', 'https://www.youtube.com/watch?v=q8d9uuO1Cf4', 2),
    (md5('aorthar-r-MEN407-1-3')::uuid, lid, 'youtube', 'Mentor vs Coach — What is the Difference', 'https://www.youtube.com/watch?v=0OE25uMQxgs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-2-1')::uuid, lid, 'youtube', 'Active Listening Skills', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-MEN407-2-2')::uuid, lid, 'youtube', 'Coaching Conversations Framework', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-MEN407-2-3')::uuid, lid, 'youtube', 'How to Ask Better Questions as a Leader', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-3-1')::uuid, lid, 'youtube', 'How to Structure a Mentoring Programme', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 1),
    (md5('aorthar-r-MEN407-3-2')::uuid, lid, 'youtube', 'Setting Goals with Your Mentee', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 2),
    (md5('aorthar-r-MEN407-3-3')::uuid, lid, 'youtube', 'Effective Mentoring Relationships', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-4-1')::uuid, lid, 'youtube', 'Community Leadership Principles', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 1),
    (md5('aorthar-r-MEN407-4-2')::uuid, lid, 'youtube', 'Leading Creative Communities', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 2),
    (md5('aorthar-r-MEN407-4-3')::uuid, lid, 'youtube', 'How to Lead Without Authority', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-5-1')::uuid, lid, 'youtube', 'Inclusive Leadership in Design', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 1),
    (md5('aorthar-r-MEN407-5-2')::uuid, lid, 'youtube', 'Diversity and Inclusion in Design Teams', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 2),
    (md5('aorthar-r-MEN407-5-3')::uuid, lid, 'youtube', 'Creating Equitable Design Spaces', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-6-1')::uuid, lid, 'youtube', 'Speaking at Design Conferences', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 1),
    (md5('aorthar-r-MEN407-6-2')::uuid, lid, 'youtube', 'Writing About Design for Publication', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 2),
    (md5('aorthar-r-MEN407-6-3')::uuid, lid, 'youtube', 'Teaching Design Skills Online', 'https://www.youtube.com/watch?v=raIUQnPoeok', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-7-1')::uuid, lid, 'youtube', 'Building a Mentorship Programme', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 1),
    (md5('aorthar-r-MEN407-7-2')::uuid, lid, 'youtube', 'ADPList and Design Mentorship at Scale', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 2),
    (md5('aorthar-r-MEN407-7-3')::uuid, lid, 'youtube', 'Running a Formal Mentoring Initiative', 'https://www.youtube.com/watch?v=Stc0beAxavY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-MEN407-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-MEN407-8-1')::uuid, lid, 'youtube', 'Design Legacy and Long-Term Impact', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 1),
    (md5('aorthar-r-MEN407-8-2')::uuid, lid, 'youtube', 'Leaving a Positive Mark on the Design Industry', 'https://www.youtube.com/watch?v=KkBMkjGW3Dk', 2),
    (md5('aorthar-r-MEN407-8-3')::uuid, lid, 'youtube', 'Open Source Contributions for Designers', 'https://www.youtube.com/watch?v=rPCyR_v7GGU', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-MEN407-01')::uuid, cid, 'multiple_choice', 'The primary role of a mentor is to:',
     '[{"id":"a","text":"Give direct instructions to the mentee","is_correct":false},{"id":"b","text":"Share wisdom, open doors and help the mentee navigate their own path through questions and experience","is_correct":true},{"id":"c","text":"Do the mentee''s work for them","is_correct":false},{"id":"d","text":"Evaluate and grade the mentee''s performance","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MEN407-02')::uuid, cid, 'multiple_choice', 'Active listening in a mentoring session means:',
     '[{"id":"a","text":"Waiting for your turn to speak","is_correct":false},{"id":"b","text":"Fully attending to the mentee''s words, body language and emotion, reflecting back to confirm understanding","is_correct":true},{"id":"c","text":"Listening to music during the call","is_correct":false},{"id":"d","text":"Taking detailed notes throughout","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-MEN407-03')::uuid, cid, 'multiple_choice', 'The key difference between mentoring and coaching is:',
     '[{"id":"a","text":"Mentoring is for juniors; coaching is for seniors","is_correct":false},{"id":"b","text":"Mentors share their experience and guide; coaches use questions to help individuals discover their own solutions","is_correct":true},{"id":"c","text":"Coaching is paid; mentoring is free","is_correct":false},{"id":"d","text":"They are the same thing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-04')::uuid, cid, 'multiple_choice', 'A structured mentoring relationship should include:',
     '[{"id":"a","text":"Daily communication on all topics","is_correct":false},{"id":"b","text":"Agreed goals, meeting cadence, communication norms and a defined duration","is_correct":true},{"id":"c","text":"The mentor setting all the goals","is_correct":false},{"id":"d","text":"Monthly progress reports to HR","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-05')::uuid, cid, 'multiple_choice', 'Inclusive community leadership requires:',
     '[{"id":"a","text":"Only including people who agree with the leader","is_correct":false},{"id":"b","text":"Actively creating access, amplifying underrepresented voices and designing for belonging across difference","is_correct":true},{"id":"c","text":"Focusing only on the majority group","is_correct":false},{"id":"d","text":"Avoiding difficult conversations","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-06')::uuid, cid, 'multiple_choice', 'Giving back to the design community through speaking builds:',
     '[{"id":"a","text":"A large personal brand only","is_correct":false},{"id":"b","text":"Shared knowledge, inspiration for others and a stronger overall design ecosystem","is_correct":true},{"id":"c","text":"A paid speaking career immediately","is_correct":false},{"id":"d","text":"A competitive advantage over peers","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-07')::uuid, cid, 'multiple_choice', 'A mentoring programme in an organisation benefits the mentor by:',
     '[{"id":"a","text":"Reducing their own workload","is_correct":false},{"id":"b","text":"Developing leadership and communication skills and gaining fresh perspectives from mentees","is_correct":true},{"id":"c","text":"Getting a salary increase","is_correct":false},{"id":"d","text":"Reducing the need for hiring","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-08')::uuid, cid, 'multiple_choice', 'The GROW coaching model stands for:',
     '[{"id":"a","text":"Goals, Reality, Obstacles, Way forward","is_correct":true},{"id":"b","text":"Growth, Research, Outcomes, Work","is_correct":false},{"id":"c","text":"Goals, Review, Opportunities, Win","is_correct":false},{"id":"d","text":"Guidance, Reflection, Output, Winning","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-09')::uuid, cid, 'multiple_choice', 'Sponsorship differs from mentorship in that a sponsor:',
     '[{"id":"a","text":"Provides financial support","is_correct":false},{"id":"b","text":"Actively advocates for and opens doors for the person when they are not in the room","is_correct":true},{"id":"c","text":"Teaches specific skills","is_correct":false},{"id":"d","text":"Provides emotional support only","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MEN407-10')::uuid, cid, 'multiple_choice', 'Community leadership is most sustainable when:',
     '[{"id":"a","text":"All decisions are made by the founder","is_correct":false},{"id":"b","text":"Leadership is shared, distributed and succession is planned so the community does not depend on one person","is_correct":true},{"id":"c","text":"The community grows without any structure","is_correct":false},{"id":"d","text":"Rules are enforced strictly at all times","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-11')::uuid, cid, 'multiple_choice', 'Design legacy is created through:',
     '[{"id":"a","text":"Building a large portfolio","is_correct":false},{"id":"b","text":"Shaping the field through contributions, mentorship, published work and communities that outlast your direct involvement","is_correct":true},{"id":"c","text":"Winning design awards","is_correct":false},{"id":"d","text":"Being famous on social media","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-12')::uuid, cid, 'multiple_choice', 'When a mentee is struggling, the most effective mentor response is to:',
     '[{"id":"a","text":"Solve the problem for them","is_correct":false},{"id":"b","text":"Ask open questions to help them identify root causes and generate their own solutions","is_correct":true},{"id":"c","text":"End the mentoring relationship","is_correct":false},{"id":"d","text":"Share your own experience immediately","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-13')::uuid, cid, 'multiple_choice', 'Reverse mentorship in a design context means:',
     '[{"id":"a","text":"Junior designers refuse to be mentored","is_correct":false},{"id":"b","text":"Junior or less experienced members mentor senior leaders in areas like technology, culture or emerging trends","is_correct":true},{"id":"c","text":"Mentorship is reversed and becomes punishment","is_correct":false},{"id":"d","text":"Mentors become mentees permanently","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MEN407-14')::uuid, cid, 'multiple_choice', 'Psychological safety is most important in a mentoring relationship because:',
     '[{"id":"a","text":"It keeps sessions comfortable","is_correct":false},{"id":"b","text":"Mentees will only share real challenges and vulnerabilities if they trust they will not be judged","is_correct":true},{"id":"c","text":"Safety regulations require it","is_correct":false},{"id":"d","text":"It speeds up the sessions","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-15')::uuid, cid, 'multiple_choice', 'ADPList is notable in the design industry for:',
     '[{"id":"a","text":"Being a portfolio review platform","is_correct":false},{"id":"b","text":"Democratising access to free mentorship from experienced design professionals globally","is_correct":true},{"id":"c","text":"Paying designers for mentoring","is_correct":false},{"id":"d","text":"Replacing formal design education","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-16')::uuid, cid, 'multiple_choice', 'Open source contributions for designers typically involve:',
     '[{"id":"a","text":"Sharing commercial client work publicly","is_correct":false},{"id":"b","text":"Contributing design resources, templates or tools freely to the community for others to use and build on","is_correct":true},{"id":"c","text":"Open source software only","is_correct":false},{"id":"d","text":"Sharing unfinished work","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-17')::uuid, cid, 'multiple_choice', 'When setting goals in a mentoring relationship, the SMART framework recommends goals be:',
     '[{"id":"a","text":"Simple, Manageable, Achievable, Rational, Timely","is_correct":false},{"id":"b","text":"Specific, Measurable, Achievable, Relevant and Time-bound","is_correct":true},{"id":"c","text":"Strategic, Motivated, Ambitious, Realistic, Tracked","is_correct":false},{"id":"d","text":"Short, Medium, Achievable, Reviewed, Targeted","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-18')::uuid, cid, 'multiple_choice', 'Amplifying underrepresented voices in a community means:',
     '[{"id":"a","text":"Speaking on behalf of others","is_correct":false},{"id":"b","text":"Creating platforms, opportunities and visibility for people whose perspectives are historically marginalised","is_correct":true},{"id":"c","text":"Removing all barriers","is_correct":false},{"id":"d","text":"Allowing everyone to speak equally at all times","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-MEN407-19')::uuid, cid, 'multiple_choice', 'The "pay it forward" model in mentorship means:',
     '[{"id":"a","text":"Mentees pay mentors for their time","is_correct":false},{"id":"b","text":"Those who received mentorship support others in turn, multiplying impact across generations of designers","is_correct":true},{"id":"c","text":"Only senior designers deserve mentorship","is_correct":false},{"id":"d","text":"Mentoring is transactional","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-MEN407-20')::uuid, cid, 'multiple_choice', 'A community leader''s most important quality is:',
     '[{"id":"a","text":"Having the most followers","is_correct":false},{"id":"b","text":"Genuine care for community members'' wellbeing and growth, combined with integrity and consistency","is_correct":true},{"id":"c","text":"Being the most technically skilled person","is_correct":false},{"id":"d","text":"Having the loudest voice","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── BUS408 Business Models & Startup Ecosystems ──────────────────────
  cid := md5('aorthar-course-BUS408')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'BUS408', 'Business Models & Startup Ecosystems',
     'Understand the business landscape that designers operate within. Students explore startup ecosystems, funding stages, business model innovation, unit economics and how to navigate design careers within different organisational structures.',
     y400, y400s2, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-BUS408-1')::uuid, cid, 'The Startup Ecosystem — How It Works', 1, true),
    (md5('aorthar-l-BUS408-2')::uuid, cid, 'Funding Stages — From Pre-Seed to IPO', 2, true),
    (md5('aorthar-l-BUS408-3')::uuid, cid, 'Business Model Innovation', 3, true),
    (md5('aorthar-l-BUS408-4')::uuid, cid, 'Unit Economics for Designers', 4, true),
    (md5('aorthar-l-BUS408-5')::uuid, cid, 'Designing in Different Org Types — Startup vs Scaleup vs Enterprise', 5, true),
    (md5('aorthar-l-BUS408-6')::uuid, cid, 'Working with Investors and Boards', 6, true),
    (md5('aorthar-l-BUS408-7')::uuid, cid, 'Exits — Acquisitions, IPOs and What They Mean for Designers', 7, true),
    (md5('aorthar-l-BUS408-8')::uuid, cid, 'Building Commercial Awareness as a Designer', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-1-1')::uuid, lid, 'youtube', 'How the Startup Ecosystem Works', 'https://www.youtube.com/watch?v=lCIjA-bKcpA', 1),
    (md5('aorthar-r-BUS408-1-2')::uuid, lid, 'youtube', 'Silicon Valley Startup Ecosystem Explained', 'https://www.youtube.com/watch?v=TWoQLBGqUhI', 2),
    (md5('aorthar-r-BUS408-1-3')::uuid, lid, 'youtube', 'African Tech Startup Ecosystem', 'https://www.youtube.com/watch?v=AFa4OAhBSZI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-2-1')::uuid, lid, 'youtube', 'Startup Funding Stages Explained', 'https://www.youtube.com/watch?v=J2sMNMdK20w', 1),
    (md5('aorthar-r-BUS408-2-2')::uuid, lid, 'youtube', 'From Seed to Series A B C', 'https://www.youtube.com/watch?v=n-MQKzKM3mA', 2),
    (md5('aorthar-r-BUS408-2-3')::uuid, lid, 'youtube', 'How Venture Capital Works', 'https://www.youtube.com/watch?v=8mJVJcCQJp4', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-3-1')::uuid, lid, 'youtube', 'Business Model Innovation Explained', 'https://www.youtube.com/watch?v=Ld0J0HwSXFM', 1),
    (md5('aorthar-r-BUS408-3-2')::uuid, lid, 'youtube', 'How to Disrupt an Industry with Business Model Design', 'https://www.youtube.com/watch?v=lTqfnS4OYGE', 2),
    (md5('aorthar-r-BUS408-3-3')::uuid, lid, 'youtube', 'Business Model Canvas Deep Dive', 'https://www.youtube.com/watch?v=AoQ9QHOUXUM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-4-1')::uuid, lid, 'youtube', 'Unit Economics Explained Simply', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 1),
    (md5('aorthar-r-BUS408-4-2')::uuid, lid, 'youtube', 'LTV and CAC for Designers', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 2),
    (md5('aorthar-r-BUS408-4-3')::uuid, lid, 'youtube', 'Understanding Business Metrics as a Designer', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-5-1')::uuid, lid, 'youtube', 'Design at a Startup vs Big Company', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 1),
    (md5('aorthar-r-BUS408-5-2')::uuid, lid, 'youtube', 'Scale-up Design Challenges', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 2),
    (md5('aorthar-r-BUS408-5-3')::uuid, lid, 'youtube', 'Enterprise Design vs Startup Design', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-6-1')::uuid, lid, 'youtube', 'How to Present to a Board', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 1),
    (md5('aorthar-r-BUS408-6-2')::uuid, lid, 'youtube', 'Working with Investors as a Design Leader', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 2),
    (md5('aorthar-r-BUS408-6-3')::uuid, lid, 'youtube', 'What Investors Look for in a Product', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-7-1')::uuid, lid, 'youtube', 'What Happens at a Startup Acquisition', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 1),
    (md5('aorthar-r-BUS408-7-2')::uuid, lid, 'youtube', 'IPO Process Explained', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 2),
    (md5('aorthar-r-BUS408-7-3')::uuid, lid, 'youtube', 'Startup Exits and Equity for Employees', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-BUS408-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-BUS408-8-1')::uuid, lid, 'youtube', 'Commercial Awareness for Designers', 'https://www.youtube.com/watch?v=raIUQnPoeok', 1),
    (md5('aorthar-r-BUS408-8-2')::uuid, lid, 'youtube', 'Business Thinking for UX Designers', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 2),
    (md5('aorthar-r-BUS408-8-3')::uuid, lid, 'youtube', 'How to Talk Business with Executives', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-BUS408-01')::uuid, cid, 'multiple_choice', 'Pre-seed funding is typically provided by:',
     '[{"id":"a","text":"Series A venture capital firms","is_correct":false},{"id":"b","text":"Founders themselves, friends, family or angel investors to validate the idea","is_correct":true},{"id":"c","text":"Public stock markets","is_correct":false},{"id":"d","text":"Government grants exclusively","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BUS408-02')::uuid, cid, 'multiple_choice', 'Unit economics in a business refers to:',
     '[{"id":"a","text":"The economics of each business unit department","is_correct":false},{"id":"b","text":"The revenue and costs associated with a single customer or transaction unit","is_correct":true},{"id":"c","text":"The cost of each software feature","is_correct":false},{"id":"d","text":"Employee salary structures","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-03')::uuid, cid, 'multiple_choice', 'A Series A investment round is used primarily to:',
     '[{"id":"a","text":"Validate a product idea","is_correct":false},{"id":"b","text":"Scale a product that has demonstrated early traction and product-market fit","is_correct":true},{"id":"c","text":"Go public on the stock market","is_correct":false},{"id":"d","text":"Acquire another company","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-04')::uuid, cid, 'multiple_choice', 'Business model innovation occurs when:',
     '[{"id":"a","text":"A company redesigns its logo","is_correct":false},{"id":"b","text":"A company creates new ways of creating, delivering or capturing value that disrupts existing assumptions","is_correct":true},{"id":"c","text":"A company updates its technology stack","is_correct":false},{"id":"d","text":"A company expands internationally","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-05')::uuid, cid, 'multiple_choice', 'Commercial awareness for a designer means:',
     '[{"id":"a","text":"Knowing how to sell design services","is_correct":false},{"id":"b","text":"Understanding how the business makes money and how design decisions affect revenue, costs and competitive position","is_correct":true},{"id":"c","text":"Following business news","is_correct":false},{"id":"d","text":"Managing the design budget","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-06')::uuid, cid, 'multiple_choice', 'An IPO (Initial Public Offering) means:',
     '[{"id":"a","text":"A private company acquires another private company","is_correct":false},{"id":"b","text":"A company sells shares on a public stock exchange for the first time","is_correct":true},{"id":"c","text":"The company is sold to a larger corporation","is_correct":false},{"id":"d","text":"A company closes operations","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-BUS408-07')::uuid, cid, 'multiple_choice', 'Designing in an early-stage startup typically involves:',
     '[{"id":"a","text":"Highly specialised work in one design discipline","is_correct":false},{"id":"b","text":"Wearing multiple hats, making decisions with limited data and shipping quickly to validate assumptions","is_correct":true},{"id":"c","text":"Following an established design system rigorously","is_correct":false},{"id":"d","text":"Large cross-functional teams and defined processes","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-08')::uuid, cid, 'multiple_choice', 'Designing in an enterprise environment typically requires:',
     '[{"id":"a","text":"Moving fast without documentation","is_correct":false},{"id":"b","text":"Navigating complex stakeholders, legacy systems, compliance requirements and long approval cycles","is_correct":true},{"id":"c","text":"Working without a design system","is_correct":false},{"id":"d","text":"Avoiding collaboration with engineering","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-09')::uuid, cid, 'multiple_choice', 'The LTV:CAC ratio in unit economics is healthy when:',
     '[{"id":"a","text":"CAC is greater than LTV","is_correct":false},{"id":"b","text":"LTV is at least 3x CAC, meaning the business earns significantly more from a customer than it costs to acquire them","is_correct":true},{"id":"c","text":"LTV equals CAC","is_correct":false},{"id":"d","text":"Both LTV and CAC are as high as possible","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-BUS408-10')::uuid, cid, 'multiple_choice', 'A startup accelerator like Y Combinator offers:',
     '[{"id":"a","text":"Only office space","is_correct":false},{"id":"b","text":"Seed funding, mentorship, a structured programme and access to a network of investors and founders","is_correct":true},{"id":"c","text":"Guaranteed Series A funding","is_correct":false},{"id":"d","text":"Legal services only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-11')::uuid, cid, 'multiple_choice', 'Burn rate in a startup refers to:',
     '[{"id":"a","text":"How fast the team works","is_correct":false},{"id":"b","text":"The rate at which a startup spends its capital before becoming profitable","is_correct":true},{"id":"c","text":"Server processing speed","is_correct":false},{"id":"d","text":"The speed of product development","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-12')::uuid, cid, 'multiple_choice', 'Acqui-hire is a startup exit where:',
     '[{"id":"a","text":"A company acquires another for its product alone","is_correct":false},{"id":"b","text":"A company is acquired primarily for its talent and team rather than its product","is_correct":true},{"id":"c","text":"Employees buy the company from founders","is_correct":false},{"id":"d","text":"The company hires through acquisition","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-BUS408-13')::uuid, cid, 'multiple_choice', 'Revenue models that generate recurring income are preferred by investors because:',
     '[{"id":"a","text":"They are easier to build","is_correct":false},{"id":"b","text":"Predictable recurring revenue is more valuable and reduces business risk compared to one-time revenue","is_correct":true},{"id":"c","text":"They require no marketing","is_correct":false},{"id":"d","text":"They attract more users","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-14')::uuid, cid, 'multiple_choice', 'A design leader presenting to investors should focus on:',
     '[{"id":"a","text":"Detailed design specifications","is_correct":false},{"id":"b","text":"How design creates competitive differentiation, improves conversion and drives user retention","is_correct":true},{"id":"c","text":"The aesthetic quality of the product","is_correct":false},{"id":"d","text":"The number of designers on the team","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-15')::uuid, cid, 'multiple_choice', 'Gross margin in a business measures:',
     '[{"id":"a","text":"Total revenue before costs","is_correct":false},{"id":"b","text":"Revenue minus cost of goods sold, expressed as a percentage of revenue","is_correct":true},{"id":"c","text":"The profit after all expenses","is_correct":false},{"id":"d","text":"The cost of customer acquisition","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-BUS408-16')::uuid, cid, 'multiple_choice', 'Strategic partnerships for startups can accelerate growth by:',
     '[{"id":"a","text":"Reducing the need for a product","is_correct":false},{"id":"b","text":"Providing access to distribution channels, customers or technology that would take years to build independently","is_correct":true},{"id":"c","text":"Eliminating competition","is_correct":false},{"id":"d","text":"Reducing team size","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-17')::uuid, cid, 'multiple_choice', 'Equity options for employees in a startup are valuable because:',
     '[{"id":"a","text":"They replace the salary immediately","is_correct":false},{"id":"b","text":"They allow employees to benefit financially if the company succeeds through acquisition or IPO","is_correct":true},{"id":"c","text":"They are always worth a lot","is_correct":false},{"id":"d","text":"They are guaranteed income","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-18')::uuid, cid, 'multiple_choice', 'A scaleup differs from a startup in that it:',
     '[{"id":"a","text":"Has a smaller team","is_correct":false},{"id":"b","text":"Has validated product-market fit and is focused on rapidly growing an already proven business model","is_correct":true},{"id":"c","text":"Is older than 10 years","is_correct":false},{"id":"d","text":"Only operates in one market","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-19')::uuid, cid, 'multiple_choice', 'The most important financial metric for a design leader to understand is:',
     '[{"id":"a","text":"The design team budget","is_correct":false},{"id":"b","text":"How design outcomes connect to revenue, retention and customer satisfaction metrics the business tracks","is_correct":true},{"id":"c","text":"The company''s total headcount","is_correct":false},{"id":"d","text":"The design tool subscription cost","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-BUS408-20')::uuid, cid, 'multiple_choice', 'Understanding the funding stage of your employer matters for designers because:',
     '[{"id":"a","text":"It determines your salary automatically","is_correct":false},{"id":"b","text":"It shapes the design team size, process rigour, speed expectations and strategic priorities you will work within","is_correct":true},{"id":"c","text":"It only matters for the finance team","is_correct":false},{"id":"d","text":"It does not affect design work","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── CON409 Content Design & UX Writing ──────────────────────────────
  cid := md5('aorthar-course-CON409')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'CON409', 'Content Design & UX Writing',
     'Master the craft of writing for digital products. Students learn UX writing principles, microcopy, content strategy, voice and tone application, error messages, onboarding copy and how to collaborate with design systems.',
     y400, y400s2, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-CON409-1')::uuid, cid, 'What is UX Writing and Content Design', 1, true),
    (md5('aorthar-l-CON409-2')::uuid, cid, 'Principles of Effective UX Writing', 2, true),
    (md5('aorthar-l-CON409-3')::uuid, cid, 'Microcopy — Buttons, Labels and Tooltips', 3, true),
    (md5('aorthar-l-CON409-4')::uuid, cid, 'Error Messages, Empty States and Confirmations', 4, true),
    (md5('aorthar-l-CON409-5')::uuid, cid, 'Onboarding Copy and User Activation', 5, true),
    (md5('aorthar-l-CON409-6')::uuid, cid, 'Content Strategy for Digital Products', 6, true),
    (md5('aorthar-l-CON409-7')::uuid, cid, 'Voice, Tone and Writing for Brand', 7, true),
    (md5('aorthar-l-CON409-8')::uuid, cid, 'Content Design in Design Systems', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-1-1')::uuid, lid, 'youtube', 'What is UX Writing', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-CON409-1-2')::uuid, lid, 'youtube', 'Content Design vs Copywriting', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-CON409-1-3')::uuid, lid, 'youtube', 'The UX Writer Role Explained', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-2-1')::uuid, lid, 'youtube', 'UX Writing Principles and Best Practices', 'https://www.youtube.com/watch?v=KkBMkjGW3Dk', 1),
    (md5('aorthar-r-CON409-2-2')::uuid, lid, 'youtube', 'Writing Clear and Concise UI Copy', 'https://www.youtube.com/watch?v=rPCyR_v7GGU', 2),
    (md5('aorthar-r-CON409-2-3')::uuid, lid, 'youtube', 'How Words Shape User Behaviour', 'https://www.youtube.com/watch?v=TiJlYTmrfEA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-3-1')::uuid, lid, 'youtube', 'Microcopy in Product Design', 'https://www.youtube.com/watch?v=ReM1uqmVfP0', 1),
    (md5('aorthar-r-CON409-3-2')::uuid, lid, 'youtube', 'Writing Better Button Labels', 'https://www.youtube.com/watch?v=q8d9uuO1Cf4', 2),
    (md5('aorthar-r-CON409-3-3')::uuid, lid, 'youtube', 'Tooltips and Helper Text Best Practices', 'https://www.youtube.com/watch?v=0OE25uMQxgs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-4-1')::uuid, lid, 'youtube', 'Writing Good Error Messages', 'https://www.youtube.com/watch?v=QoAOzMTLP5s', 1),
    (md5('aorthar-r-CON409-4-2')::uuid, lid, 'youtube', 'Empty State Design and Copy', 'https://www.youtube.com/watch?v=IP0cUBWTgpY', 2),
    (md5('aorthar-r-CON409-4-3')::uuid, lid, 'youtube', 'Confirmation Dialogs and Destructive Actions', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-5-1')::uuid, lid, 'youtube', 'Onboarding UX Writing Strategies', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 1),
    (md5('aorthar-r-CON409-5-2')::uuid, lid, 'youtube', 'Writing for User Activation', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 2),
    (md5('aorthar-r-CON409-5-3')::uuid, lid, 'youtube', 'Great Product Onboarding Examples', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-6-1')::uuid, lid, 'youtube', 'Content Strategy for Products', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 1),
    (md5('aorthar-r-CON409-6-2')::uuid, lid, 'youtube', 'Content Audit and Inventory', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 2),
    (md5('aorthar-r-CON409-6-3')::uuid, lid, 'youtube', 'Information Architecture and Content Design', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-7-1')::uuid, lid, 'youtube', 'Brand Voice and Tone of Voice Guide', 'https://www.youtube.com/watch?v=PXbMmGjMKPo', 1),
    (md5('aorthar-r-CON409-7-2')::uuid, lid, 'youtube', 'Mailchimp Voice and Tone — Case Study', 'https://www.youtube.com/watch?v=vtThiNR2MbQ', 2),
    (md5('aorthar-r-CON409-7-3')::uuid, lid, 'youtube', 'How to Develop a Brand Writing Style Guide', 'https://www.youtube.com/watch?v=0QbLqHqUh6Y', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-CON409-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-CON409-8-1')::uuid, lid, 'youtube', 'Content in Design Systems', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 1),
    (md5('aorthar-r-CON409-8-2')::uuid, lid, 'youtube', 'UX Writing and Design System Collaboration', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 2),
    (md5('aorthar-r-CON409-8-3')::uuid, lid, 'youtube', 'Content Tokens in Design Systems', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-CON409-01')::uuid, cid, 'multiple_choice', 'UX writing is primarily concerned with:',
     '[{"id":"a","text":"Writing marketing copy for ads","is_correct":false},{"id":"b","text":"Crafting interface copy that helps users navigate and accomplish goals within a digital product","is_correct":true},{"id":"c","text":"Writing long-form blog content","is_correct":false},{"id":"d","text":"Copyediting brand documents","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CON409-02')::uuid, cid, 'multiple_choice', 'The most important quality of good UX writing is:',
     '[{"id":"a","text":"Creativity and originality","is_correct":false},{"id":"b","text":"Clarity — copy that users can read, understand and act on quickly","is_correct":true},{"id":"c","text":"Length and detail","is_correct":false},{"id":"d","text":"Use of brand terminology","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CON409-03')::uuid, cid, 'multiple_choice', 'Microcopy refers to:',
     '[{"id":"a","text":"Very small font sizes in UI","is_correct":false},{"id":"b","text":"Short, often invisible UI text — buttons, labels, tooltips, error messages — that guides user behaviour","is_correct":true},{"id":"c","text":"Micro-interactions in animations","is_correct":false},{"id":"d","text":"Footnotes in legal documents","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CON409-04')::uuid, cid, 'multiple_choice', 'A well-written error message should:',
     '[{"id":"a","text":"Use technical jargon to be precise","is_correct":false},{"id":"b","text":"Explain what went wrong, why and what the user can do to fix it","is_correct":true},{"id":"c","text":"Be as short as possible — one word","is_correct":false},{"id":"d","text":"Apologise excessively","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CON409-05')::uuid, cid, 'multiple_choice', 'Action-oriented button labels are most effective because:',
     '[{"id":"a","text":"They use more words","is_correct":false},{"id":"b","text":"They clearly communicate what will happen when the user clicks, reducing uncertainty","is_correct":true},{"id":"c","text":"They match brand colour","is_correct":false},{"id":"d","text":"They are more visually appealing","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-CON409-06')::uuid, cid, 'multiple_choice', 'An empty state in a product is best used to:',
     '[{"id":"a","text":"Show an error","is_correct":false},{"id":"b","text":"Guide users to take their first action and explain the value they will get when they do","is_correct":true},{"id":"c","text":"Display a blank screen","is_correct":false},{"id":"d","text":"Reduce visual clutter","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-07')::uuid, cid, 'multiple_choice', 'Progressive disclosure in onboarding copy means:',
     '[{"id":"a","text":"Hiding information permanently","is_correct":false},{"id":"b","text":"Revealing information incrementally as the user needs it, preventing cognitive overload","is_correct":true},{"id":"c","text":"Showing all features immediately","is_correct":false},{"id":"d","text":"Disclosing legal terms","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-08')::uuid, cid, 'multiple_choice', 'Content strategy for a product defines:',
     '[{"id":"a","text":"The visual design of content","is_correct":false},{"id":"b","text":"What content to create, why, for whom and how it is structured and maintained over time","is_correct":true},{"id":"c","text":"The marketing content calendar","is_correct":false},{"id":"d","text":"The SEO keywords to target","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-09')::uuid, cid, 'multiple_choice', 'Tone of voice in a product varies based on:',
     '[{"id":"a","text":"The designer''s mood","is_correct":false},{"id":"b","text":"The context — a success message can be warm; an error should be calm and helpful, not casual","is_correct":true},{"id":"c","text":"The marketing team''s preference","is_correct":false},{"id":"d","text":"The platform being designed for","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-10')::uuid, cid, 'multiple_choice', 'Mailchimp''s content style guide is famous for:',
     '[{"id":"a","text":"Its complex legal language","is_correct":false},{"id":"b","text":"Pioneering a publicly shared voice and tone guide that influenced the entire UX writing field","is_correct":true},{"id":"c","text":"Being the longest style guide ever written","is_correct":false},{"id":"d","text":"Using exclusively formal language","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-11')::uuid, cid, 'multiple_choice', 'In a destructive confirmation dialog (e.g. "Delete account"), the copy should:',
     '[{"id":"a","text":"Use "OK" and "Cancel" as the default labels","is_correct":false},{"id":"b","text":"Clearly state the consequence and use specific, verb-based labels like "Delete account" to confirm intent","is_correct":true},{"id":"c","text":"Use a friendly tone to reassure the user","is_correct":false},{"id":"d","text":"Avoid explaining what will happen","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-12')::uuid, cid, 'multiple_choice', 'Plain language in UX writing means:',
     '[{"id":"a","text":"Using oversimplified childlike language","is_correct":false},{"id":"b","text":"Writing in a clear, direct style appropriate for the audience without unnecessary jargon","is_correct":true},{"id":"c","text":"Avoiding all technical terms forever","is_correct":false},{"id":"d","text":"Using the simplest words always regardless of audience","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-13')::uuid, cid, 'multiple_choice', 'A content audit in a product helps teams to:',
     '[{"id":"a","text":"Measure server storage","is_correct":false},{"id":"b","text":"Inventory all existing copy, assess its quality, consistency and identify gaps or redundancy","is_correct":true},{"id":"c","text":"Plan the marketing content calendar","is_correct":false},{"id":"d","text":"Remove all old content immediately","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-14')::uuid, cid, 'multiple_choice', 'Content tokens in a design system are used to:',
     '[{"id":"a","text":"Store login tokens for content editors","is_correct":false},{"id":"b","text":"Define reusable, named copy patterns (e.g. CTA labels, error formats) to ensure writing consistency across the product","is_correct":true},{"id":"c","text":"Manage content delivery networks","is_correct":false},{"id":"d","text":"Automate content generation","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-CON409-15')::uuid, cid, 'multiple_choice', 'The "inverted pyramid" writing structure in UX means:',
     '[{"id":"a","text":"Writing from conclusion to introduction","is_correct":false},{"id":"b","text":"Leading with the most important information first, with supporting detail following","is_correct":true},{"id":"c","text":"Structuring content as a visual triangle","is_correct":false},{"id":"d","text":"Avoiding sub-headings","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-16')::uuid, cid, 'multiple_choice', 'Placeholder text in form fields (e.g. "Enter your email") should be used to:',
     '[{"id":"a","text":"Replace the field label permanently","is_correct":false},{"id":"b","text":"Provide an example of expected input, supplementing (not replacing) a persistent visible label","is_correct":true},{"id":"c","text":"Fill empty space in the form","is_correct":false},{"id":"d","text":"Show the required character count","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-17')::uuid, cid, 'multiple_choice', 'Inclusive UX writing avoids:',
     '[{"id":"a","text":"Short sentences","is_correct":false},{"id":"b","text":"Language that excludes, stereotypes or alienates users based on gender, ability, culture or background","is_correct":true},{"id":"c","text":"Active voice","is_correct":false},{"id":"d","text":"All informal language","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-18')::uuid, cid, 'multiple_choice', 'A/B testing copy in a product helps teams to:',
     '[{"id":"a","text":"Choose the more aesthetically pleasing copy","is_correct":false},{"id":"b","text":"Determine which version of copy drives better user behaviour and outcomes","is_correct":true},{"id":"c","text":"Satisfy stakeholder preferences","is_correct":false},{"id":"d","text":"Save time on writing","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-19')::uuid, cid, 'multiple_choice', 'The best way to validate UX copy is to:',
     '[{"id":"a","text":"Ask the design team for their opinion","is_correct":false},{"id":"b","text":"Test with real users through moderated sessions, first-click tests or A/B testing to observe comprehension and behaviour","is_correct":true},{"id":"c","text":"Check grammar with a tool","is_correct":false},{"id":"d","text":"Compare to a competitor''s copy","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-CON409-20')::uuid, cid, 'multiple_choice', 'Content design as a discipline considers:',
     '[{"id":"a","text":"Only written words on screen","is_correct":false},{"id":"b","text":"The end-to-end experience of content — structure, format, words, hierarchy and how content shapes user behaviour","is_correct":true},{"id":"c","text":"The visual design of content areas only","is_correct":false},{"id":"d","text":"SEO metadata exclusively","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ── FUT410 Future of Design & Technology ────────────────────────────
  cid := md5('aorthar-course-FUT410')::uuid;
  INSERT INTO courses (id, code, name, description, year_id, semester_id, credit_units, is_premium, status) VALUES
    (cid, 'FUT410', 'Future of Design & Technology',
     'Explore the emerging technologies and trends shaping the next decade of design practice. Students investigate AI in design, spatial computing, ethical design futures, climate design and how to position for a career in an evolving landscape.',
     y400, y400s2, 3, true, 'published')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
    (md5('aorthar-l-FUT410-1')::uuid, cid, 'AI and Machine Learning in Design', 1, true),
    (md5('aorthar-l-FUT410-2')::uuid, cid, 'Designing for Spatial Computing and XR', 2, true),
    (md5('aorthar-l-FUT410-3')::uuid, cid, 'Conversational Interfaces and Voice Design', 3, true),
    (md5('aorthar-l-FUT410-4')::uuid, cid, 'Ethical Design and the Responsible Future', 4, true),
    (md5('aorthar-l-FUT410-5')::uuid, cid, 'Climate Design and Sustainable Digital Products', 5, true),
    (md5('aorthar-l-FUT410-6')::uuid, cid, 'The Future of the Design Profession', 6, true),
    (md5('aorthar-l-FUT410-7')::uuid, cid, 'Emerging Platforms — Web3, Wearables and Beyond', 7, true),
    (md5('aorthar-l-FUT410-8')::uuid, cid, 'Building a Future-Ready Design Career', 8, true)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-1')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-1-1')::uuid, lid, 'youtube', 'AI Tools for UX Designers', 'https://www.youtube.com/watch?v=nAK2WFMKE94', 1),
    (md5('aorthar-r-FUT410-1-2')::uuid, lid, 'youtube', 'How AI Will Change UX Design', 'https://www.youtube.com/watch?v=otnYC7eKxK0', 2),
    (md5('aorthar-r-FUT410-1-3')::uuid, lid, 'youtube', 'Designing AI-Powered Products', 'https://www.youtube.com/watch?v=lTqfnS4OYGE', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-2')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-2-1')::uuid, lid, 'youtube', 'Designing for AR and VR', 'https://www.youtube.com/watch?v=AoQ9QHOUXUM', 1),
    (md5('aorthar-r-FUT410-2-2')::uuid, lid, 'youtube', 'Apple Vision Pro UX Design', 'https://www.youtube.com/watch?v=9Y2UuMxUDiY', 2),
    (md5('aorthar-r-FUT410-2-3')::uuid, lid, 'youtube', 'Spatial Computing Design Principles', 'https://www.youtube.com/watch?v=xWJJbqcmZ3E', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-3')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-3-1')::uuid, lid, 'youtube', 'Voice UI Design Principles', 'https://www.youtube.com/watch?v=bixR-KIJKYM', 1),
    (md5('aorthar-r-FUT410-3-2')::uuid, lid, 'youtube', 'Conversational UX Design', 'https://www.youtube.com/watch?v=irjgfW0BIrw', 2),
    (md5('aorthar-r-FUT410-3-3')::uuid, lid, 'youtube', 'Designing Chatbots and AI Assistants', 'https://www.youtube.com/watch?v=uNL0vEmTUPY', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-4')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-4-1')::uuid, lid, 'youtube', 'Ethical Design Principles', 'https://www.youtube.com/watch?v=qrnT9YmFHTo', 1),
    (md5('aorthar-r-FUT410-4-2')::uuid, lid, 'youtube', 'Dark Patterns and How to Avoid Them', 'https://www.youtube.com/watch?v=V2qBJSVnIQ0', 2),
    (md5('aorthar-r-FUT410-4-3')::uuid, lid, 'youtube', 'Responsible Design and Technology', 'https://www.youtube.com/watch?v=3mTzQBDuBxc', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-5')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-5-1')::uuid, lid, 'youtube', 'Sustainable Web Design', 'https://www.youtube.com/watch?v=SrzJqsedjC0', 1),
    (md5('aorthar-r-FUT410-5-2')::uuid, lid, 'youtube', 'Climate Design and Digital Carbon Footprint', 'https://www.youtube.com/watch?v=zFMgpxG-chM', 2),
    (md5('aorthar-r-FUT410-5-3')::uuid, lid, 'youtube', 'Designing for Sustainability', 'https://www.youtube.com/watch?v=5ABpqVSx33I', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-6')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-6-1')::uuid, lid, 'youtube', 'The Future of the Design Profession', 'https://www.youtube.com/watch?v=GH8Kp0MkFQI', 1),
    (md5('aorthar-r-FUT410-6-2')::uuid, lid, 'youtube', 'Will AI Replace UX Designers', 'https://www.youtube.com/watch?v=raIUQnPoeok', 2),
    (md5('aorthar-r-FUT410-6-3')::uuid, lid, 'youtube', 'Design Careers in 2030', 'https://www.youtube.com/watch?v=v_bHZqPAFYs', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-7')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-7-1')::uuid, lid, 'youtube', 'Web3 and Blockchain for Designers', 'https://www.youtube.com/watch?v=sfGtd2bSqkk', 1),
    (md5('aorthar-r-FUT410-7-2')::uuid, lid, 'youtube', 'Wearable Technology UX Design', 'https://www.youtube.com/watch?v=Stc0beAxavY', 2),
    (md5('aorthar-r-FUT410-7-3')::uuid, lid, 'youtube', 'Ambient Computing and Design', 'https://www.youtube.com/watch?v=2kDkM0OTLiA', 3)
  ON CONFLICT (id) DO NOTHING;

  lid := md5('aorthar-l-FUT410-8')::uuid;
  INSERT INTO resources (id, lesson_id, type, title, url, sort_order) VALUES
    (md5('aorthar-r-FUT410-8-1')::uuid, lid, 'youtube', 'Building a Future-Proof Design Career', 'https://www.youtube.com/watch?v=KkBMkjGW3Dk', 1),
    (md5('aorthar-r-FUT410-8-2')::uuid, lid, 'youtube', 'Skills Designers Need in 2030', 'https://www.youtube.com/watch?v=rPCyR_v7GGU', 2),
    (md5('aorthar-r-FUT410-8-3')::uuid, lid, 'youtube', 'Continuous Learning in Design', 'https://www.youtube.com/watch?v=TiJlYTmrfEA', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO questions (id, course_id, type, question_text, options, points, shuffle_options, is_exam_question, difficulty) VALUES
    (md5('aorthar-q-FUT410-01')::uuid, cid, 'multiple_choice', 'Generative AI tools like Midjourney and DALL-E primarily help designers with:',
     '[{"id":"a","text":"Writing code","is_correct":false},{"id":"b","text":"Rapid visual ideation, mood boarding and generating concept imagery","is_correct":true},{"id":"c","text":"Conducting user interviews","is_correct":false},{"id":"d","text":"Managing design systems","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FUT410-02')::uuid, cid, 'multiple_choice', 'Spatial computing refers to:',
     '[{"id":"a","text":"3D modelling for print","is_correct":false},{"id":"b","text":"Computing environments where digital content is integrated into physical space — including AR, VR and mixed reality","is_correct":true},{"id":"c","text":"Designing for outer space","is_correct":false},{"id":"d","text":"Multi-monitor desktop setups","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FUT410-03')::uuid, cid, 'multiple_choice', 'Voice UI design requires understanding:',
     '[{"id":"a","text":"Visual hierarchy only","is_correct":false},{"id":"b","text":"Conversation flows, error recovery, discoverability of commands and how users speak naturally","is_correct":true},{"id":"c","text":"Animation principles","is_correct":false},{"id":"d","text":"Screen size constraints","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-04')::uuid, cid, 'multiple_choice', 'Dark patterns in UX are:',
     '[{"id":"a","text":"Design using dark colour themes","is_correct":false},{"id":"b","text":"Deceptive UI patterns that trick users into taking actions they did not intend","is_correct":true},{"id":"c","text":"Night mode design patterns","is_correct":false},{"id":"d","text":"Complex visual design styles","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FUT410-05')::uuid, cid, 'multiple_choice', 'Sustainable web design practices focus on:',
     '[{"id":"a","text":"Using green colour palettes","is_correct":false},{"id":"b","text":"Reducing the energy consumption of digital products through efficient code, fewer requests and optimised media","is_correct":true},{"id":"c","text":"Using recycled materials for devices","is_correct":false},{"id":"d","text":"Designing for environmental NGOs only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-06')::uuid, cid, 'multiple_choice', 'The most important skill for a designer to future-proof their career is:',
     '[{"id":"a","text":"Mastering every new AI tool as it launches","is_correct":false},{"id":"b","text":"Developing deep human judgement, systems thinking and the ability to learn and adapt continuously","is_correct":true},{"id":"c","text":"Specialising in one niche permanently","is_correct":false},{"id":"d","text":"Learning to code","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-07')::uuid, cid, 'multiple_choice', 'Designing for XR (extended reality) differs from screen design because:',
     '[{"id":"a","text":"XR uses no visual design","is_correct":false},{"id":"b","text":"XR involves 3D space, physical movement, depth and the full human body as an input device","is_correct":true},{"id":"c","text":"XR only works on mobile","is_correct":false},{"id":"d","text":"XR has no users","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-08')::uuid, cid, 'multiple_choice', 'AI in design tools is most useful for:',
     '[{"id":"a","text":"Replacing designers entirely","is_correct":false},{"id":"b","text":"Automating repetitive tasks, generating options and accelerating exploration so designers focus on higher-order decisions","is_correct":true},{"id":"c","text":"Conducting user research automatically","is_correct":false},{"id":"d","text":"Managing design team workflows","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-09')::uuid, cid, 'multiple_choice', 'Ethical design is concerned with:',
     '[{"id":"a","text":"Following legal requirements only","is_correct":false},{"id":"b","text":"Considering the broader societal, psychological and environmental impact of design decisions beyond the immediate user","is_correct":true},{"id":"c","text":"Ensuring designs are aesthetically moral","is_correct":false},{"id":"d","text":"Avoiding all data collection","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-10')::uuid, cid, 'multiple_choice', 'Web3 in design context introduces challenges around:',
     '[{"id":"a","text":"Making websites faster","is_correct":false},{"id":"b","text":"Designing for decentralised ownership, wallet interactions and the complexity of blockchain-based products","is_correct":true},{"id":"c","text":"Mobile-first responsive layouts","is_correct":false},{"id":"d","text":"Dark mode only interfaces","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FUT410-11')::uuid, cid, 'multiple_choice', 'Ambient computing describes:',
     '[{"id":"a","text":"Designing for outdoor environments","is_correct":false},{"id":"b","text":"Computing that recedes into the background of everyday life, present in everyday objects and environments","is_correct":true},{"id":"c","text":"Slow, background processing","is_correct":false},{"id":"d","text":"Ambient sound design for products","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FUT410-12')::uuid, cid, 'multiple_choice', 'Persuasive technology becomes unethical when:',
     '[{"id":"a","text":"It encourages users to make healthy choices","is_correct":false},{"id":"b","text":"It exploits psychological vulnerabilities to drive behaviour that benefits the business at the user''s expense","is_correct":true},{"id":"c","text":"It is used in health applications","is_correct":false},{"id":"d","text":"It changes user behaviour at all","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-13')::uuid, cid, 'multiple_choice', 'Climate-conscious design teams can reduce digital carbon footprint by:',
     '[{"id":"a","text":"Avoiding all digital products","is_correct":false},{"id":"b","text":"Compressing media, reducing page weight, using efficient code and choosing green hosting providers","is_correct":true},{"id":"c","text":"Using dark mode by default","is_correct":false},{"id":"d","text":"Designing for shorter sessions only","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-14')::uuid, cid, 'multiple_choice', 'The role of the designer is likely to evolve toward:',
     '[{"id":"a","text":"Only visual production work","is_correct":false},{"id":"b","text":"Strategic orchestration — directing AI, systems and cross-disciplinary collaboration to create value at scale","is_correct":true},{"id":"c","text":"Being replaced entirely by AI","is_correct":false},{"id":"d","text":"Focusing only on accessibility","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FUT410-15')::uuid, cid, 'multiple_choice', 'Inclusive AI in product design means ensuring:',
     '[{"id":"a","text":"AI tools are used by all designers","is_correct":false},{"id":"b","text":"AI systems are trained on diverse data and tested for bias to avoid discriminating against underrepresented groups","is_correct":true},{"id":"c","text":"AI is free to access","is_correct":false},{"id":"d","text":"All products use AI","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-16')::uuid, cid, 'multiple_choice', 'Continuous learning in design is important because:',
     '[{"id":"a","text":"Designers must learn everything at once","is_correct":false},{"id":"b","text":"The field evolves rapidly and designers who commit to ongoing learning will remain relevant and valuable","is_correct":true},{"id":"c","text":"Employers require annual certifications","is_correct":false},{"id":"d","text":"Learning is easy in design","is_correct":false}]'::jsonb, 1, true, false, 1),
    (md5('aorthar-q-FUT410-17')::uuid, cid, 'multiple_choice', 'The concept of "right to repair" in design ethics refers to:',
     '[{"id":"a","text":"Users having the right to design repairs","is_correct":false},{"id":"b","text":"Designing products that users can maintain and repair, rather than forcing replacement","is_correct":true},{"id":"c","text":"Legal rights over design ownership","is_correct":false},{"id":"d","text":"Accessibility retrofitting of old designs","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FUT410-18')::uuid, cid, 'multiple_choice', 'T-shaped skills for a future designer means:',
     '[{"id":"a","text":"Being expert at T-shirt design","is_correct":false},{"id":"b","text":"Having broad general knowledge across design and adjacent fields with deep expertise in one area","is_correct":true},{"id":"c","text":"Only knowing two design tools","is_correct":false},{"id":"d","text":"Learning in a T-shaped pattern","is_correct":false}]'::jsonb, 1, true, false, 2),
    (md5('aorthar-q-FUT410-19')::uuid, cid, 'multiple_choice', 'Biometric design — using heart rate, gaze or emotion data in UX — raises ethical concerns around:',
     '[{"id":"a","text":"Data file sizes","is_correct":false},{"id":"b","text":"Consent, surveillance, data misuse and the manipulation of users based on physiological vulnerability","is_correct":true},{"id":"c","text":"Design complexity","is_correct":false},{"id":"d","text":"Hardware compatibility","is_correct":false}]'::jsonb, 1, true, false, 3),
    (md5('aorthar-q-FUT410-20')::uuid, cid, 'multiple_choice', 'The most important thing a designer can do in a world of rapid technological change is:',
     '[{"id":"a","text":"Master every new tool immediately","is_correct":false},{"id":"b","text":"Stay deeply connected to human needs — technology changes but human psychology, goals and context endure","is_correct":true},{"id":"c","text":"Avoid all new technology","is_correct":false},{"id":"d","text":"Specialise in the most popular platform","is_correct":false}]'::jsonb, 1, true, false, 2)
  ON CONFLICT (id) DO NOTHING;

END; $$;
