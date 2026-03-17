import { z } from 'zod';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';

// ─────────────────────────────────────────────
// ZOD VALIDATORS
// ─────────────────────────────────────────────

export const courseCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}\d{3}$/, 'Course code must be 3 uppercase letters + 3 digits (e.g. DES101)');

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.enum(AORTHAR_DEPARTMENTS, {
    message: 'Please select a department',
  }),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const courseSchema = z.object({
  code: courseCodeSchema,
  name: z.string().min(3, 'Name too short').max(120),
  description: z.string().min(10, 'Description too short').max(1000),
  credit_units: z.number().int().min(1).max(6),
  year_id: z.string().uuid(),
  semester_id: z.string().uuid(),
  pass_mark: z.number().min(50).max(100).default(60),
  quiz_attempt_limit: z.number().int().min(1).max(5).default(3),
  exam_attempt_limit: z.number().int().min(1).max(5).default(3),
  cooldown_hours: z.number().int().min(1).max(72).default(24),
  quiz_weight: z.number().min(0).max(1).default(0.4),
  exam_weight: z.number().min(0).max(1).default(0.6),
  is_premium: z.boolean().default(false),
});

export const lessonSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  content: z.string().optional(),
  order: z.number().int().min(1),
});

export const resourceSchema = z.object({
  lesson_id: z.string().uuid(),
  type: z.enum(['youtube', 'link', 'document']),
  title: z.string().min(2).max(200),
  url: z.string().url('Invalid URL'),
  order: z.number().int().min(1),
});

export const questionSchema = z.object({
  course_id: z.string().uuid(),
  type: z.enum(['multiple_choice', 'ordering', 'matching']),
  question_text: z.string().min(5).max(2000),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().min(1),
        is_correct: z.boolean(),
      }),
    )
    .min(2)
    .max(6),
  points: z.number().int().min(1).max(10).default(1),
  shuffle_options: z.boolean().default(true),
  is_exam_question: z.boolean().default(false),
});

export const capstoneSchema = z.object({
  github_url: z
    .string()
    .url()
    .regex(/github\.com/, 'Must be a GitHub URL'),
  live_url: z.string().url('Must be a valid live project URL'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  tech_stack: z.array(z.string()).min(1, 'List at least one technology'),
});

export const suggestionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('course'),
    course_code: courseCodeSchema,
    course_name: z.string().min(3).max(120),
    description: z.string().min(20).max(1000),
    credit_units: z.number().int().min(1).max(6),
    year_level: z.number().int().refine((n) => [100, 200, 300, 400].includes(n)),
    semester: z.number().int().refine((n) => [1, 2].includes(n)),
  }),
  z.object({
    type: z.literal('lesson'),
    lesson_title: z.string().min(3).max(200),
    course_id: z.string().uuid(),
  }),
  z.object({
    type: z.literal('resource'),
    resource_type: z.enum(['youtube', 'link', 'document']),
    resource_title: z.string().min(2).max(200),
    resource_url: z.string().url(),
    lesson_id: z.string().uuid(),
  }),
]);

export const adminReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().max(1000).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CapstoneInput = z.infer<typeof capstoneSchema>;
export type SuggestionInput = z.infer<typeof suggestionSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
