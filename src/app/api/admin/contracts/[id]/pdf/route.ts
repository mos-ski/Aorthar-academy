import { NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { contractPdfBuffer, safeContractFilename } from '@/lib/contracts/pdf';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

type ContractSignature = {
  signer_name: string;
  signer_email: string;
  signed_at: string;
  ip_address: string | null;
  consent_text: string | null;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminApi('finance');
    const { id } = await params;
    const admin = createAdminClient();
    const [{ data: contract }, { data: signatures }] = await Promise.all([
      admin
        .from('contracts')
        .select('id, title, recipient_name, recipient_email, signed_snapshot_html, rendered_html')
        .eq('id', id)
        .single(),
      admin
        .from('contract_signatures')
        .select('signer_name, signer_email, signed_at, ip_address, consent_text')
        .eq('contract_id', id)
        .order('signed_at', { ascending: false })
        .limit(1),
    ]);

    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    const pdf = await contractPdfBuffer({
      title: contract.title,
      recipientName: contract.recipient_name,
      recipientEmail: contract.recipient_email,
      contractHtml: contract.signed_snapshot_html ?? contract.rendered_html ?? '<p>No contract snapshot available.</p>',
      signature: (signatures?.[0] as ContractSignature | undefined) ?? null,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeContractFilename(contract.title)}.pdf"`,
      },
    });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
