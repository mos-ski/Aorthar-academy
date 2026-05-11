import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const { userId } = await requireAdminApi('content');
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('thumbnail');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'thumbnail file is required' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Upload a JPG, PNG, or WebP image.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Thumbnail must be under 5 MB.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'webp';
  const path = `${id}/thumbnail.${extension}`;

  const { data: existing } = await admin
    .from('standalone_courses')
    .select('thumbnail_url')
    .eq('id', id)
    .single();

  const { error: uploadError } = await admin.storage
    .from('course-thumbnails')
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('course-thumbnails').getPublicUrl(path);

  const { error: updateError } = await admin
    .from('standalone_courses')
    .update({ thumbnail_url: publicUrl })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'standalone_course.update',
    performedBy: userId,
    entityType: 'standalone_course',
    entityId: id,
    oldValue: existing,
    newValue: { thumbnail_url: publicUrl },
    req: request,
  });

  return NextResponse.json({ thumbnail_url: publicUrl });
}
