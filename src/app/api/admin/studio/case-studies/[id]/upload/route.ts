import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/webm',
]);

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  await requireAdminApi('content');
  const { id } = await params;
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (!files.length || !(files[0] instanceof File)) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${file.type}. Upload JPG, PNG, WebP, GIF, MP4, MOV, or WebM.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `${file.name} exceeds the 20 MB limit.` }, { status: 400 });
    }
  }

  const admin = createAdminClient();
  const results: { url: string; mediaType: 'image' | 'video'; name: string }[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const path = `${id}/${crypto.randomUUID()}.${ext}`;

    const { error } = await admin.storage
      .from('studio-work')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: { publicUrl } } = admin.storage.from('studio-work').getPublicUrl(path);
    results.push({ url: publicUrl, mediaType: file.type.startsWith('video/') ? 'video' : 'image', name: file.name });
  }

  return NextResponse.json({ files: results });
}
