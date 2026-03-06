// ─────────────────────────────────────────────
// AORTHAR ACADEMY — CORE TYPES
// ─────────────────────────────────────────────

// ── RBAC ─────────────────────────────────────

export type Role = 'student' | 'contributor' | 'admin';

// ── USER & PROFILE ────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: Role;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile | null;
  subscription_status: 'free' | 'active' | 'expired' | 'cancelled';
}

// ── ACADEMIC HIERARCHY ───────────────────────

export interface Year {
  id: string;
  level: 100 | 200 | 300 | 400;
  name: string; // e.g. "First Year"
  description: string | null;
  created_at: string;
}

export interface Semester {
  id: string;
  year_id: string;
  number: 1 | 2;
  name: string; // e.g. "First Semester"
  created_at: string;
  year?: Year;
}

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  code: string; // e.g. DES101
  name: string;
  description: string;
  credit_units: number;
  year_id: string;
  semester_id: string;
  pass_mark: number; // default 60
  quiz_attempt_limit: number; // default 3
  exam_attempt_limit: number; // default 3
  cooldown_hours: number; // default 24
  quiz_weight: number; // default 0.4
  exam_weight: number; // default 0.6
  exam_duration_minutes: number; // default 90
  is_premium: boolean;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
  year?: Year;
  semester?: Semester;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string | null; // Markdown
  order: number;
  created_at: string;
  updated_at: string;
  course?: Course;
  resources?: Resource[];
}

export type ResourceType = 'youtube' | 'link' | 'document';

export interface Resource {
  id: string;
  lesson_id: string;
  type: ResourceType;
  title: string;
  url: string;
  order: number;
  created_at: string;
  lesson?: Lesson;
}

// ── ASSESSMENT ENGINE ─────────────────────────

export type QuestionType = 'multiple_choice' | 'ordering' | 'matching';

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean; // omitted in client responses
}

export interface Question {
  id: string;
  course_id: string;
  type: QuestionType;
  question_text: string;
  options: QuestionOption[];
  points: number;
  shuffle_options: boolean;
  is_exam_question: boolean;
  created_at: string;
}

// Returned to client — never includes correct_answer
export interface QuestionForClient
  extends Omit<Question, 'options'> {
  options: Omit<QuestionOption, 'is_correct'>[];
}

export type AssessmentType = 'quiz' | 'exam';

export interface QuizAttempt {
  id: string;
  user_id: string;
  course_id: string;
  assessment_type: AssessmentType;
  attempt_number: number;
  started_at: string;
  completed_at: string | null;
  score: number | null; // computed server-side
  passed: boolean | null;
  cooldown_until: string | null;
  created_at: string;
}

export interface QuizSession {
  attempt_id: string;
  questions: QuestionForClient[];
  started_at: string;
  time_limit_minutes: number;
}

export interface SubmitAnswerPayload {
  attempt_id: string;
  answers: Record<string, string | string[]>; // question_id → selected option id(s)
}

export interface GradeResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  cooldown_until: string | null;
}

// ── GPA ENGINE ───────────────────────────────

export type GradePoint = 5.0 | 4.5 | 4.0 | 3.5 | 3.0 | 2.5 | 2.0 | 0.0;

export interface GradeScale {
  grade: string;
  points: GradePoint;
  min_percent: number;
  max_percent: number;
}

export const GRADE_SCALE: GradeScale[] = [
  { grade: 'A+', points: 5.0, min_percent: 90, max_percent: 100 },
  { grade: 'A',  points: 4.5, min_percent: 85, max_percent: 89 },
  { grade: 'B+', points: 4.0, min_percent: 80, max_percent: 84 },
  { grade: 'B',  points: 3.5, min_percent: 75, max_percent: 79 },
  { grade: 'C+', points: 3.0, min_percent: 70, max_percent: 74 },
  { grade: 'C',  points: 2.5, min_percent: 65, max_percent: 69 },
  { grade: 'D',  points: 2.0, min_percent: 60, max_percent: 64 },
  { grade: 'F',  points: 0.0, min_percent: 0,  max_percent: 59 },
];

export interface CourseGrade {
  id: string;
  user_id: string;
  course_id: string;
  quiz_score: number | null;
  exam_score: number | null;
  final_score: number | null;
  grade: string | null;
  grade_points: GradePoint | null;
  passed: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface SemesterGPA {
  id: string;
  user_id: string;
  year_id: string;
  semester_id: string;
  gpa: number;
  total_credits: number;
  computed_at: string;
}

export interface CumulativeGPA {
  user_id: string;
  cumulative_gpa: number;
  total_credits_earned: number;
  computed_at: string;
}

// ── PROGRESSION ENGINE ───────────────────────

export type CourseProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'failed'
  | 'passed';

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  status: CourseProgressStatus;
  enrolled_at: string | null;
  completed_at: string | null;
  course?: Course;
}

export interface SemesterProgress {
  user_id: string;
  year_id: string;
  semester_id: string;
  is_unlocked: boolean;
  is_completed: boolean;
  unlocked_at: string | null;
}

export type CapstoneStatus =
  | 'locked'
  | 'available'
  | 'draft'
  | 'pending'
  | 'revision'
  | 'approved'
  | 'rejected';

export interface ProgressionState {
  user_id: string;
  current_year_level: number;
  current_semester: number;
  completed_course_ids: string[];
  cumulative_gpa: number;
  capstone_status: CapstoneStatus;
}

// ── CAPSTONE SYSTEM ───────────────────────────

export interface CapstoneSubmission {
  id: string;
  user_id: string;
  github_url: string;
  live_url: string;
  description: string;
  tech_stack: string[];
  status: CapstoneStatus;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── CONTRIBUTION / SUGGESTION SYSTEM ────────

export type SuggestionType = 'course' | 'lesson' | 'resource';
export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface Suggestion {
  id: string;
  proposer_id: string;
  type: SuggestionType;
  status: SuggestionStatus;
  // Course fields
  course_code?: string;
  course_name?: string;
  description?: string;
  credit_units?: number;
  year_level?: number;
  semester?: number;
  // Lesson fields
  lesson_title?: string;
  course_id?: string;
  // Resource fields
  resource_type?: ResourceType;
  resource_url?: string;
  resource_title?: string;
  lesson_id?: string;
  // Meta
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  proposer?: Profile;
}

// ── MONETIZATION ─────────────────────────────

export type BillingType = 'one_time' | 'subscription';
export type PlanType = 'free' | 'semester' | 'lifetime' | 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_type: BillingType;
  plan_type: PlanType;
  access_scope: string[]; // list of features unlocked
  created_at: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
  plan?: Plan;
}

export interface Transaction {
  id: string;
  user_id: string;
  paystack_reference: string;
  amount: number;
  currency: string;
  plan_type: PlanType;
  status: TransactionStatus;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

// ── PAYSTACK ──────────────────────────────────

export interface PaystackWebhookEvent {
  event:
    | 'charge.success'
    | 'subscription.create'
    | 'subscription.disable'
    | 'invoice.payment_failed';
  data: {
    reference: string;
    amount: number;
    currency: string;
    customer: { email: string; customer_code: string };
    metadata: { user_id: string; plan_type: PlanType };
    paid_at: string;
  };
}

// ── API RESPONSE SHAPES ───────────────────────

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ── PAGINATION ────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
