-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Years Table (Prerequisite for Courses)
CREATE TABLE IF NOT EXISTS years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level INTEGER NOT NULL UNIQUE CHECK (level IN (100, 200, 300, 400)),
    name VARCHAR(50) NOT NULL, -- e.g., "First Year"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Semesters Table (Prerequisite for Courses)
CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_id UUID REFERENCES years(id) ON DELETE CASCADE NOT NULL,
    number INTEGER NOT NULL CHECK (number IN (1, 2)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year_id, number)
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE, -- e.g., DES101
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credit_units INTEGER NOT NULL DEFAULT 3 CHECK (credit_units BETWEEN 1 AND 6),
    year_id UUID REFERENCES years(id) ON DELETE CASCADE NOT NULL,
    semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE NOT NULL,
    pass_mark INTEGER DEFAULT 60,
    quiz_attempts INTEGER DEFAULT 3,
    exam_attempts INTEGER DEFAULT 3,
    is_premium BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Markdown content
    "order" INTEGER NOT NULL, -- Sequencing within the course
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('youtube', 'link', 'document')),
    url TEXT NOT NULL,
    "order" INTEGER NOT NULL, -- Sequencing within the lesson
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create Indexes for Performance (Based on PRD 10.1)
CREATE INDEX IF NOT EXISTS idx_courses_year_semester ON courses(year_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_lesson_id ON resources(lesson_id);

-- Seed Initial Years (Optional helper to ensure structure exists)
INSERT INTO years (level, name) VALUES 
    (100, 'First Year'),
    (200, 'Second Year'),
    (300, 'Third Year'),
    (400, 'Fourth Year')
ON CONFLICT (level) DO NOTHING;

-- Seed Initial Semesters (Optional helper)
DO $$
DECLARE
    y RECORD;
BEGIN
    FOR y IN SELECT * FROM years LOOP
        INSERT INTO semesters (year_id, number) VALUES (y.id, 1), (y.id, 2) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;