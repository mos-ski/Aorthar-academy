import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { contractPdfBuffer, safeContractFilename } from '@/lib/contracts/pdf';

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi('finance');
    const body = await request.json() as {
      title?: string;
      recipient_name?: string;
      recipient_email?: string;
      contract_html?: string;
    };

    if (!body.contract_html?.trim()) {
      return NextResponse.json({ error: 'Contract HTML is required' }, { status: 400 });
    }

    const title = body.title?.trim() || 'Contract Preview';
    const pdf = await contractPdfBuffer({
      title,
      recipientName: body.recipient_name?.trim() || 'Recipient',
      recipientEmail: body.recipient_email?.trim() || null,
      contractHtml: body.contract_html,
      signature: null,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeContractFilename(title)}.pdf"`,
      },
    });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
