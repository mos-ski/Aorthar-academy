import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/utils/formatters';

type AuditRow = {
  id: string;
  action: string;
  performed_by: string | null;
  target_user: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default async function AdminAuditLogsPage() {
  await requireRole('admin');
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from('audit_log')
    .select('id, action, performed_by, target_user, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = (logs ?? []) as AuditRow[];
  const actorIds = Array.from(new Set(rows.flatMap((row) => [row.performed_by, row.target_user]).filter(Boolean) as string[]));

  const { data: actors } = actorIds.length > 0
    ? await admin
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_id', actorIds)
    : { data: [] as Array<{ user_id: string; full_name: string | null; email: string | null }> };

  const actorMap = new Map<string, { full_name: string | null; email: string | null }>();
  for (const actor of actors ?? []) {
    actorMap.set(actor.user_id, { full_name: actor.full_name, email: actor.email });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">Recent admin activities across the admin system.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest 200 Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const actor = row.performed_by ? actorMap.get(row.performed_by) : null;
                const target = row.target_user ? actorMap.get(row.target_user) : null;
                return (
                  <TableRow key={row.id}>
                    <TableCell>{formatDateTime(row.created_at)}</TableCell>
                    <TableCell className="font-medium">{row.action}</TableCell>
                    <TableCell>
                      <p>{actor?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{actor?.email ?? row.performed_by ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <p>{target?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{target?.email ?? row.target_user ?? '—'}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.entity_type ?? '—'}{row.entity_id ? `:${row.entity_id}` : ''}
                    </TableCell>
                    <TableCell className="max-w-72 text-xs text-muted-foreground whitespace-pre-wrap break-words">
                      {row.metadata ? JSON.stringify(row.metadata) : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No audit logs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
