import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function ensureAdmin() {
  try {
    await requireRole('admin');
  } catch {
    redirect('/unauthorized');
  }
}

// GET /api/admin/internship/questions — list all questions
export async function GET() {
  await ensureAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('internship_questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, is_active, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

// POST /api/admin/internship/questions — create a new question
export async function POST(request: NextRequest) {
  await ensureAdmin();

  let body: {
    question_text?: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_option?: string;
    sort_order?: number;
    is_active?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, is_active } = body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return NextResponse.json({ error: 'All question fields are required' }, { status: 400 });
  }

  if (!['a', 'b', 'c', 'd'].includes(correct_option.toLowerCase())) {
    return NextResponse.json({ error: 'correct_option must be a, b, c, or d' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('internship_questions')
    .insert({
      question_text: question_text.trim(),
      option_a: option_a.trim(),
      option_b: option_b.trim(),
      option_c: option_c.trim(),
      option_d: option_d.trim(),
      correct_option: correct_option.toLowerCase(),
      sort_order: sort_order ?? 0,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('[admin/internship/questions] Insert error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
