import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: NextRequest): Promise<NextResponse> {
  await requireAdminApi('content');
  const formData = await request.formData();
  const file = formData.get('avatar');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'avatar file is required' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Upload a JPG, PNG, or WebP image.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Avatar must be under 3 MB.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'webp';
  const path = `avatars/${crypto.randomUUID()}.${extension}`;

  const { error } = await admin.storage
    .from('bootcamp-instructors')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('bootcamp-instructors').getPublicUrl(path);

  return NextResponse.json({ avatar_url: publicUrl });
}
