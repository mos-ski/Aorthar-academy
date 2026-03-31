import { describe, it, expect } from 'vitest';
import {
  courseCodeSchema,
  registerSchema,
  loginSchema,
  courseSchema,
  questionSchema,
  lessonSchema,
  resourceSchema,
  capstoneSchema,
  suggestionSchema,
  adminReviewSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
} from '@/utils/validators';

describe('courseCodeSchema', () => {
  it('accepts valid 3-letter + 3-digit codes', () => {
    expect(courseCodeSchema.safeParse('DES101').success).toBe(true);
    expect(courseCodeSchema.safeParse('DEV203').success).toBe(true);
    expect(courseCodeSchema.safeParse('UXR102').success).toBe(true);
  });

  it('rejects lowercase', () => {
    expect(courseCodeSchema.safeParse('des101').success).toBe(false);
  });

  it('rejects codes with wrong digit count', () => {
    expect(courseCodeSchema.safeParse('DES10').success).toBe(false);
    expect(courseCodeSchema.safeParse('DES1011').success).toBe(false);
  });

  it('rejects codes with wrong letter count', () => {
    expect(courseCodeSchema.safeParse('DE101').success).toBe(false);
    expect(courseCodeSchema.safeParse('DESK101').success).toBe(false);
  });

  it('rejects empty string', () => {
    expect(courseCodeSchema.safeParse('').success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    full_name: 'Ada Okafor',
    department: 'UI/UX Design' as const,
    email: 'ada@example.com',
    password: 'Secret123',
  };

  it('accepts a valid registration payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(registerSchema.safeParse({ ...valid, full_name: 'A' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Abc1' }).success).toBe(false);
  });

  it('rejects a password without an uppercase letter', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'secret123' }).success).toBe(false);
  });

  it('rejects a password without a number', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'SecretPass' }).success).toBe(false);
  });

  it('rejects an invalid department', () => {
    expect(registerSchema.safeParse({ ...valid, department: 'Marketing' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid login credentials', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'pass' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: 'pass' }).success).toBe(false);
  });

  it('rejects empty password', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: '' }).success).toBe(false);
  });
});

describe('courseSchema', () => {
  const valid = {
    code: 'DES101',
    name: 'Introduction to Design',
    description: 'A foundational course covering core design principles.',
    credit_units: 3,
    year_id: '550e8400-e29b-41d4-a716-446655440000',
    semester_id: '550e8400-e29b-41d4-a716-446655440001',
    pass_mark: 60,
    quiz_attempt_limit: 3,
    exam_attempt_limit: 3,
    cooldown_hours: 24,
    quiz_weight: 0.4,
    exam_weight: 0.6,
    is_premium: false,
  };

  it('accepts a fully valid course', () => {
    expect(courseSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid course code', () => {
    expect(courseSchema.safeParse({ ...valid, code: 'des101' }).success).toBe(false);
  });

  it('rejects name shorter than 3 characters', () => {
    expect(courseSchema.safeParse({ ...valid, name: 'AB' }).success).toBe(false);
  });

  it('rejects description shorter than 10 characters', () => {
    expect(courseSchema.safeParse({ ...valid, description: 'Too short' }).success).toBe(false);
  });

  it('rejects pass_mark below 50', () => {
    expect(courseSchema.safeParse({ ...valid, pass_mark: 49 }).success).toBe(false);
  });

  it('rejects pass_mark above 100', () => {
    expect(courseSchema.safeParse({ ...valid, pass_mark: 101 }).success).toBe(false);
  });

  it('rejects non-UUID year_id', () => {
    expect(courseSchema.safeParse({ ...valid, year_id: 'not-a-uuid' }).success).toBe(false);
  });
});

describe('questionSchema', () => {
  const valid = {
    course_id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'multiple_choice' as const,
    question_text: 'What is the primary role of a PM?',
    options: [
      { id: 'a', text: 'Write code', is_correct: false },
      { id: 'b', text: 'Define product vision', is_correct: true },
    ],
    points: 1,
    shuffle_options: true,
    is_exam_question: false,
  };

  it('accepts a valid question', () => {
    expect(questionSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects question_text shorter than 5 characters', () => {
    expect(questionSchema.safeParse({ ...valid, question_text: 'Why?' }).success).toBe(false);
  });

  it('rejects fewer than 2 options', () => {
    expect(questionSchema.safeParse({
      ...valid,
      options: [{ id: 'a', text: 'Only option', is_correct: true }],
    }).success).toBe(false);
  });

  it('rejects more than 6 options', () => {
    const tooManyOptions = Array.from({ length: 7 }, (_, i) => ({
      id: String(i),
      text: `Option ${i}`,
      is_correct: i === 0,
    }));
    expect(questionSchema.safeParse({ ...valid, options: tooManyOptions }).success).toBe(false);
  });

  it('rejects invalid question type', () => {
    expect(questionSchema.safeParse({ ...valid, type: 'true_false' }).success).toBe(false);
  });

  it('rejects invalid course_id UUID', () => {
    expect(questionSchema.safeParse({ ...valid, course_id: 'not-a-uuid' }).success).toBe(false);
  });
});

describe('lessonSchema', () => {
  const valid = {
    course_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Introduction to Design Thinking',
    content: 'Optional markdown content',
    order: 1,
  };

  it('accepts a valid lesson', () => {
    expect(lessonSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a lesson without content (optional)', () => {
    const { content: _, ...withoutContent } = valid;
    expect(lessonSchema.safeParse(withoutContent).success).toBe(true);
  });

  it('rejects a title shorter than 3 characters', () => {
    expect(lessonSchema.safeParse({ ...valid, title: 'AB' }).success).toBe(false);
  });

  it('rejects a non-UUID course_id', () => {
    expect(lessonSchema.safeParse({ ...valid, course_id: 'not-uuid' }).success).toBe(false);
  });

  it('rejects order less than 1', () => {
    expect(lessonSchema.safeParse({ ...valid, order: 0 }).success).toBe(false);
  });
});

describe('resourceSchema', () => {
  const valid = {
    lesson_id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'youtube' as const,
    title: 'Design Basics Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    order: 1,
  };

  it('accepts a valid resource', () => {
    expect(resourceSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts link and document types', () => {
    expect(resourceSchema.safeParse({ ...valid, type: 'link' }).success).toBe(true);
    expect(resourceSchema.safeParse({ ...valid, type: 'document' }).success).toBe(true);
  });

  it('rejects an invalid type', () => {
    expect(resourceSchema.safeParse({ ...valid, type: 'video' }).success).toBe(false);
  });

  it('rejects an invalid URL', () => {
    expect(resourceSchema.safeParse({ ...valid, url: 'not-a-url' }).success).toBe(false);
  });

  it('rejects a title shorter than 2 characters', () => {
    expect(resourceSchema.safeParse({ ...valid, title: 'A' }).success).toBe(false);
  });

  it('rejects a non-UUID lesson_id', () => {
    expect(resourceSchema.safeParse({ ...valid, lesson_id: 'bad' }).success).toBe(false);
  });
});

describe('capstoneSchema', () => {
  const valid = {
    github_url: 'https://github.com/ada/my-project',
    live_url: 'https://my-project.vercel.app',
    description: 'A'.repeat(100),
    tech_stack: ['React', 'TypeScript', 'Supabase'],
  };

  it('accepts a valid capstone submission', () => {
    expect(capstoneSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a non-GitHub URL for github_url', () => {
    expect(capstoneSchema.safeParse({ ...valid, github_url: 'https://gitlab.com/ada/project' }).success).toBe(false);
  });

  it('rejects an invalid URL for live_url', () => {
    expect(capstoneSchema.safeParse({ ...valid, live_url: 'not-a-url' }).success).toBe(false);
  });

  it('rejects a description shorter than 100 characters', () => {
    expect(capstoneSchema.safeParse({ ...valid, description: 'Too short' }).success).toBe(false);
  });

  it('rejects an empty tech_stack array', () => {
    expect(capstoneSchema.safeParse({ ...valid, tech_stack: [] }).success).toBe(false);
  });
});

describe('suggestionSchema', () => {
  describe('course suggestion', () => {
    const valid = {
      type: 'course' as const,
      course_code: 'GQL201',
      course_name: 'Introduction to GraphQL',
      description: 'A comprehensive intro to GraphQL APIs for modern applications.',
      credit_units: 3,
      year_level: 200,
      semester: 1,
    };

    it('accepts a valid course suggestion', () => {
      expect(suggestionSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects an invalid year_level', () => {
      expect(suggestionSchema.safeParse({ ...valid, year_level: 150 }).success).toBe(false);
    });

    it('rejects an invalid semester', () => {
      expect(suggestionSchema.safeParse({ ...valid, semester: 3 }).success).toBe(false);
    });
  });

  describe('lesson suggestion', () => {
    const valid = {
      type: 'lesson' as const,
      lesson_title: 'Advanced Figma Techniques',
      course_id: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('accepts a valid lesson suggestion', () => {
      expect(suggestionSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects a lesson title shorter than 3 characters', () => {
      expect(suggestionSchema.safeParse({ ...valid, lesson_title: 'AB' }).success).toBe(false);
    });
  });

  describe('resource suggestion', () => {
    const valid = {
      type: 'resource' as const,
      resource_type: 'youtube' as const,
      resource_title: 'Great Figma Tutorial',
      resource_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      lesson_id: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('accepts a valid resource suggestion', () => {
      expect(suggestionSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects an invalid resource_url', () => {
      expect(suggestionSchema.safeParse({ ...valid, resource_url: 'not-a-url' }).success).toBe(false);
    });

    it('rejects an invalid resource_type', () => {
      expect(suggestionSchema.safeParse({ ...valid, resource_type: 'podcast' }).success).toBe(false);
    });
  });

  it('rejects an unknown suggestion type', () => {
    expect(suggestionSchema.safeParse({ type: 'unknown', title: 'test' }).success).toBe(false);
  });
});

describe('adminReviewSchema', () => {
  it('accepts approved status without notes', () => {
    expect(adminReviewSchema.safeParse({ status: 'approved' }).success).toBe(true);
  });

  it('accepts rejected status with notes', () => {
    expect(adminReviewSchema.safeParse({ status: 'rejected', admin_notes: 'Not relevant.' }).success).toBe(true);
  });

  it('rejects invalid status values', () => {
    expect(adminReviewSchema.safeParse({ status: 'pending' }).success).toBe(false);
    expect(adminReviewSchema.safeParse({ status: 'review' }).success).toBe(false);
  });

  it('rejects admin_notes exceeding 1000 characters', () => {
    expect(adminReviewSchema.safeParse({ status: 'approved', admin_notes: 'x'.repeat(1001) }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const valid = { password: 'NewPass123', confirmPassword: 'NewPass123' };

  it('accepts matching valid passwords', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, confirmPassword: 'Different1' }).success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(resetPasswordSchema.safeParse({ password: 'Abc1', confirmPassword: 'Abc1' }).success).toBe(false);
  });

  it('rejects a password without uppercase', () => {
    expect(resetPasswordSchema.safeParse({ password: 'newpass123', confirmPassword: 'newpass123' }).success).toBe(false);
  });

  it('rejects a password without a number', () => {
    expect(resetPasswordSchema.safeParse({ password: 'NewPassword', confirmPassword: 'NewPassword' }).success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts a valid profile update', () => {
    expect(profileSchema.safeParse({ full_name: 'Ada Okafor', bio: 'UI/UX Designer' }).success).toBe(true);
  });

  it('accepts a profile without bio (optional)', () => {
    expect(profileSchema.safeParse({ full_name: 'Ada Okafor' }).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(profileSchema.safeParse({ full_name: 'A' }).success).toBe(false);
  });

  it('rejects a name longer than 100 characters', () => {
    expect(profileSchema.safeParse({ full_name: 'A'.repeat(101) }).success).toBe(false);
  });

  it('rejects a bio exceeding 500 characters', () => {
    expect(profileSchema.safeParse({ full_name: 'Ada', bio: 'x'.repeat(501) }).success).toBe(false);
  });
});
