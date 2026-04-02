-- 008_seed_standalone_lessons.sql
-- Seeds all 76 standalone course lessons from lessons.md
-- Safe to re-run: uses INSERT ... ON CONFLICT DO UPDATE

-- ─── Course 1: Product Design Bootcamp ───────────────────────────────────────
DO $$
DECLARE cid UUID;
BEGIN
  SELECT id INTO cid FROM standalone_courses
  WHERE title ILIKE '%Product Design Bootcamp%' LIMIT 1;
  IF cid IS NULL THEN RAISE NOTICE 'Course not found: Product Design Bootcamp'; RETURN; END IF;

  INSERT INTO standalone_lessons (course_id, title, youtube_url, sort_order, is_published) VALUES
    (cid, 'Welcome to the Bootcamp!',              'https://drive.google.com/file/d/1aINkgvY0my6S8_8YV-PWE_IlDlwC_GQP/view', 1,  true),
    (cid, 'Introduction to Notion',               'https://drive.google.com/file/d/1LqIdjrdeQ-N9D0njHdMc_osoAcVDpdCL/view', 2,  true),
    (cid, 'Basic Principles of Design',           'https://drive.google.com/file/d/1UqBxv4rG0f9LGd5Juc1RmntaTqVl0YeK/view', 3,  true),
    (cid, 'Introduction to UI UX',               'https://drive.google.com/file/d/1HFneXdxeclGqY3RIzLzfuYTRxDBfuZ1v/view', 4,  true),
    (cid, 'Introduction to Figma Pt 1',          'https://drive.google.com/file/d/1nguDeGiofqbDz-D63pLl6QgOr9Yw_62X/view', 5,  true),
    (cid, 'Introduction to Figma Pt 2',          'https://drive.google.com/file/d/1Zw4FdMilBEWYsEcjh2eaFURzIUDlftkN/view', 6,  true),
    (cid, 'Introduction to Photoshop Pt 1',      'https://drive.google.com/file/d/1LE0Zlx2-DaYos5f9JbVss8GxBGQ2z7q2/view', 7,  true),
    (cid, 'Introduction to Photoshop Pt 2',      'https://drive.google.com/file/d/1sZKZdI4GCg4T4792yScvrZtQh9H6EFpo/view', 8,  true),
    (cid, 'Introduction to Photoshop Pt 3',      'https://drive.google.com/file/d/1x0UvHZzg2dQbY5uCAxetztk-zmY7aXiA/view', 9,  true),
    (cid, 'Empathy in Design',                   'https://drive.google.com/file/d/1YSyBEdLejWSm2ILce9fv6A52fIOpsQM3/view', 10, true),
    (cid, 'Interpreting a Project Brief',        'https://drive.google.com/file/d/1PJYam-HKe5XbIZKl0RgbUDRCsfyzTMtm/view', 11, true),
    (cid, 'Initiation of Case Study',            'https://drive.google.com/file/d/1083UX_0BAgWlkdjyPWBrJpf9-n2U2ryK/view', 12, true),
    (cid, 'Designing a Userflow / User Journey', 'https://drive.google.com/file/d/1GrZTMrFENiN-bNDt0U9t84ew0GEuPcnG/view', 13, true),
    (cid, 'Designing a Wireframe',               'https://drive.google.com/file/d/1X3poyT4vcASSORqkoFfYjFBi6u2_2vUp/view', 14, true),
    (cid, 'Design System (material.io)',         'https://drive.google.com/file/d/1JTSxL5Yl1ZUbe0qUcce-dKDvaoXWem6G/view', 15, true),
    (cid, 'Style Guide',                         'https://drive.google.com/file/d/171-ANF-FKiaGGEg1YD0bdsl88TOxWBJ2/view', 16, true),
    (cid, 'Colors',                              'https://drive.google.com/file/d/1YfURaG07nRCrvhNhAk2KdZLQrqC7HEcx/view', 17, true),
    (cid, 'Typography',                          'https://drive.google.com/file/d/18NMSAOeHkgkTnKXVxr8ZZJZHAgy6sQoq/view', 18, true),
    (cid, 'Iconography (Part 1)',                'https://drive.google.com/file/d/1EqZ4ywCGJUGLpy2t1ztN5AGKToX4hbCU/view', 19, true),
    (cid, 'Iconography (Part 2)',                'https://drive.google.com/file/d/1nyetwl82dcVOk9LWPkTiai_u5f-ax1zO/view', 20, true),
    (cid, 'Grid System',                         'https://drive.google.com/file/d/14bBb6UukKie8DY8DgQ1_q48MThKHLvlK/view', 21, true),
    (cid, 'Spacing',                             'https://drive.google.com/file/d/1lgiRP2yarZUO7gJ4HQjEA-xNEC3RGlUW/view', 22, true),
    (cid, 'Text Fields',                         'https://drive.google.com/file/d/11Zk_ze7c85Pr5NqSLB5HV1Kb-GDY8jqi/view', 23, true),
    (cid, 'Buttons',                             'https://drive.google.com/file/d/15VS4HR_w0-IadirHCsricEqrOw3c82lr/view', 24, true),
    (cid, 'Project Management Circle',           'https://drive.google.com/file/d/1b-J9rfqzUQWHXrAhf9KB2xmJKXYMCXHq/view', 25, true),
    (cid, 'Project Management Process',          'https://drive.google.com/file/d/1tM5wATKBwF-vt4v3vH-vUzrTzvpk8gu3/view', 26, true),
    (cid, 'Starting your UI Project',            'https://drive.google.com/file/d/1FnyQDjOn8Y11ByeDTwW3Put2_168uY-3/view', 27, true),
    (cid, 'Starting your UI Project Pt 2',       'https://drive.google.com/file/d/1o9lyi3auRugKsVCXLA2jdv-7IEtcO2P-/view', 28, true),
    (cid, 'Starting your UI Project Pt 3',       'https://drive.google.com/file/d/14x9sg_zN1q64DAmi2nP_5FBXErqc-VKJ/view', 29, true),
    (cid, 'Introduction to Interactive Prototyping', 'https://drive.google.com/file/d/11JW6W1QyzsZk4ymVn0A0oTNbTGr0ZcMC/view', 30, true),
    (cid, 'Rapid Testing in Product Design',     'https://drive.google.com/file/d/1llLBgg8ol0bMRmQ3pS039TAPhXZ7SB6D/view', 31, true),
    (cid, 'AutoLayout and Responsiveness',       'https://drive.google.com/file/d/1s41d1M4QWP0T33-I3vgyuc5_HUtCQ9Lf/view', 32, true),
    (cid, 'Group Project Presentation (A & B)', 'https://drive.google.com/file/d/1jLR4xz5i8D_8HZoUVQ8XZk5JTnM7RW9w/view', 33, true),
    (cid, 'Group Project Presentation (C & D)', 'https://drive.google.com/file/d/1fIYmJ4pIzAkGB-F7b1Xcsfg6KzRaElFx/view', 34, true),
    (cid, 'Group Project Presentation (E)',      'https://drive.google.com/file/d/1tAqemocJZqf8gc_NkFW_nup2sylBE5Tm/view', 35, true),
    (cid, 'Group Project Presentation (F & G)', 'https://drive.google.com/file/d/1b-BxBSpJpahyYqdjys_9Muv6j6qex9Kb/view', 36, true),
    (cid, 'Group Project Presentation (H)',      'https://drive.google.com/file/d/1k0B_qoBVs-8ojMYfZVVQod8UgMtleExP/view', 37, true),
    (cid, 'Introduction to Information Architecture', 'https://drive.google.com/file/d/1FEdEAN32paFQhho3tyl5RY8B208h8gR2/view', 38, true)
  ON CONFLICT (course_id, sort_order) DO UPDATE
    SET title = EXCLUDED.title,
        youtube_url = EXCLUDED.youtube_url;
END $$;

-- ─── Course 2: Product Management Bootcamp ───────────────────────────────────
DO $$
DECLARE cid UUID;
BEGIN
  SELECT id INTO cid FROM standalone_courses
  WHERE title ILIKE '%Product Management%' LIMIT 1;
  IF cid IS NULL THEN RAISE NOTICE 'Course not found: Product Management Bootcamp'; RETURN; END IF;

  INSERT INTO standalone_lessons (course_id, title, youtube_url, sort_order, is_published) VALUES
    (cid, 'Welcome!',                                    'https://drive.google.com/file/d/1de0kfOXub9yPwECvGNagLKiY2Sf4Ggic/view', 1,  true),
    (cid, 'Using Notion',                               'https://drive.google.com/file/d/1ixKO6XRGRErnN15Zp8eCRcAMiwukjKCg/view', 2,  true),
    (cid, 'Let''s check out the topics!',               'https://drive.google.com/file/d/1JlyTSv7PpOlRg3n4K9-9IkbkNAN-qQY0/view', 3,  true),
    (cid, 'Big tasks for your PM Journey!',             'https://drive.google.com/file/d/1G0lZTL7GryXcbtRg28IOOY1w8rL0dCLW/view', 4,  true),
    (cid, 'Submitting your Tasks!',                     'https://drive.google.com/file/d/1uy94OqzfFxNZGvpzkAKQIM46MXxxwvts/view', 5,  true),
    (cid, 'Introducing Product Management',             'https://drive.google.com/file/d/1eWcxEo-k29dKvyGGvbaRBHdLU1A2kmrB/view', 6,  true),
    (cid, 'Who is a Product Manager?',                  'https://drive.google.com/file/d/1voq2m7BVfKjvMVX64Xb--Q2twronK8Ze/view', 7,  true),
    (cid, 'What is a Product?',                         'https://drive.google.com/file/d/1lrx8PuAOwsqVIQLzuNLOgwuZR6ARtj2s/view', 8,  true),
    (cid, 'Types of Product Managers',                  'https://drive.google.com/file/d/15-ZFVQmqioYqQxD7pvuFTQD85wARFUI6/view', 9,  true),
    (cid, 'Which PM do you want to be? [Pt 1]',         'https://drive.google.com/file/d/12yY6xPBfD1oXWQ-VbhPxfgAeRHPeWFDz/view', 10, true),
    (cid, 'Which PM do you want to be? [Pt 2]',         'https://drive.google.com/file/d/1pivJ8GRhXcFy7x-6O_TH6ffAhgggi4EG/view', 11, true),
    (cid, 'Who is a Stakeholder?',                      'https://drive.google.com/file/d/19RBpNTEl_F4uUm2mqq-2THPQ7ALIfVqK/view', 12, true),
    (cid, 'Product Manager vs Project Manager [Pt 1]',  'https://drive.google.com/file/d/1BNJ9DXTkINtsR6XD3oq2xRDKakca-0Sz/view', 13, true),
    (cid, 'Product Manager vs Project Manager [Pt 2]',  'https://drive.google.com/file/d/1VsLGbdYDTv9nhH8aK4T_-hFcTG0KiD1E/view', 14, true),
    (cid, 'Introduction to Vision Development',         'https://drive.google.com/file/d/19VXtYIaGpkM3j-KIgK6pzc-IweMctZrh/view', 15, true),
    (cid, 'Onboarding [Pt 1]',                          'https://drive.google.com/file/d/1aHDn6VRHvrVuZ-letwMfkRCXPm1f0-We/view', 16, true),
    (cid, 'Onboarding [Pt 2]',                          'https://drive.google.com/file/d/1UKHu42v7s5_q-MB4szSoEZjhelMz265R/view', 17, true),
    (cid, 'Setting up a Team',                          'https://drive.google.com/file/d/11eL129_rJB0NV39NMqtMXl3ngmrqL4uh/view', 18, true),
    (cid, 'A Typical Day of a Product Manager',         'https://drive.google.com/file/d/1MqUGobUZebMlJd1d66xQ0Dhn9uVX5YJE/view', 19, true),
    (cid, 'Introduction to Roadmapping',                'https://drive.google.com/file/d/1SMd2T6YeJqGkXJ8ebHZ8ynveicm68qOM/view', 20, true),
    (cid, 'Interpreting a Roadmap',                     'https://drive.google.com/file/d/1iBS8GL9cq6xLquNiGlsGd56eMhCYtJgy/view', 21, true),
    (cid, 'Designing a Roadmap',                        'https://drive.google.com/file/d/1bGltEzMht8APj-H2CYL2mum5ZAPAf_NY/view', 22, true),
    (cid, 'Market Sizing',                              'https://drive.google.com/file/d/1ghuDOPKUHVB7ccOI23P0S6r1KfMuKI4A/view', 23, true),
    (cid, 'Finding Competitors',                        'https://drive.google.com/file/d/1GNXM-nZXgQMKKzJKeEjfkKJnKFArbeVA/view', 24, true),
    (cid, 'Categories of Competitors',                  'https://drive.google.com/file/d/1EBlm2bB6CMAD4Ob062xnQFrQjQahsMWq/view', 25, true),
    (cid, 'Types of Competitors',                       'https://drive.google.com/file/d/1aq2dEDYm5jYKHukUMD2_pkSu9QCQ6f33/view', 26, true),
    (cid, 'Understanding your Competitors [Pt 1]',      'https://drive.google.com/file/d/1YPuI-z-qMwbJl_QGvUcDFw3OIsCOp9ob/view', 27, true),
    (cid, 'Understanding your Competitors [Pt 2]',      'https://drive.google.com/file/d/1rWT5sSXaC1J-nCpTE7yZ1EwM1nOdeDDT/view', 28, true)
  ON CONFLICT (course_id, sort_order) DO UPDATE
    SET title = EXCLUDED.title,
        youtube_url = EXCLUDED.youtube_url;
END $$;

-- ─── Course 3: Starting your Career as a Scrum Master ────────────────────────
DO $$
DECLARE cid UUID;
BEGIN
  SELECT id INTO cid FROM standalone_courses
  WHERE title ILIKE '%Scrum Master%' LIMIT 1;
  IF cid IS NULL THEN RAISE NOTICE 'Course not found: Scrum Master'; RETURN; END IF;

  INSERT INTO standalone_lessons (course_id, title, youtube_url, sort_order, is_published) VALUES
    (cid, 'Introduction to Scrum', 'https://drive.google.com/file/d/1exu3urfXu_nZQxe-1k5PGTimecUzf9QF/view', 1, true),
    (cid, 'Logging Tickets',       'https://drive.google.com/file/d/117ADynxOEZ9O2cNTfUZHmPejTh8iF3Xz/view', 2, true),
    (cid, 'Sprint Retro',          'https://drive.google.com/file/d/1iKOUeITzEqP8hYa5jA_xr-jJc48XNpNz/view', 3, true),
    (cid, 'The Jira Tool',         'https://drive.google.com/file/d/17NmCK5Gz0LafFpT9qcKIWQPfGc8t0tCL/view', 4, true)
  ON CONFLICT (course_id, sort_order) DO UPDATE
    SET title = EXCLUDED.title,
        youtube_url = EXCLUDED.youtube_url;
END $$;

-- ─── Course 4: Starting your Career in Product Development ───────────────────
DO $$
DECLARE cid UUID;
BEGIN
  SELECT id INTO cid FROM standalone_courses
  WHERE title ILIKE '%Product Development%' LIMIT 1;
  IF cid IS NULL THEN RAISE NOTICE 'Course not found: Product Development'; RETURN; END IF;

  INSERT INTO standalone_lessons (course_id, title, youtube_url, sort_order, is_published) VALUES
    (cid, 'Introduction to Product Team', 'https://drive.google.com/file/d/1jQ3YiJhJGbyncrcLP78qMhMTILJAysXd/view', 1, true),
    (cid, 'Quality Assurance',            'https://drive.google.com/file/d/1dH5NrG5QrbmdSZallzKSS-wgc-8-X5Co/view', 2, true),
    (cid, 'Operations',                   'https://drive.google.com/file/d/1ehFjMYtprfjeAB4rEEA6YTOY-Gkn7VX9/view', 3, true),
    (cid, 'Scrum Master',                 'https://drive.google.com/file/d/13fHTc3bJHgO7GpnU5EX8dY6MgDUe-5TC/view', 4, true),
    (cid, 'Product Design',               'https://drive.google.com/file/d/1Wfu_NFEHFNwTT5igHGLcWW65DaaP8fP-/view', 5, true),
    (cid, 'Product Management',           'https://drive.google.com/file/d/1nnukdQRgBVF0Bxo8szQpj_OBLlPfaAeg/view', 6, true)
  ON CONFLICT (course_id, sort_order) DO UPDATE
    SET title = EXCLUDED.title,
        youtube_url = EXCLUDED.youtube_url;
END $$;
