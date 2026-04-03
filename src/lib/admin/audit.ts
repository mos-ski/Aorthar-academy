import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

type AuditPayload = {
  action: string;
  performedBy: string | null;
  targetUser?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown> | null;
  req?: NextRequest;
};

function getClientIp(req?: NextRequest): string | null {
  if (!req) return null;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }
  return req.headers.get('x-real-ip') ?? null;
}

export async function writeAuditLog(
  payload: AuditPayload,
  client?: SupabaseClient,
): Promise<void> {
  const admin = client ?? createAdminClient();
  const ipAddress = getClientIp(payload.req);

  const { error } = await admin.from('audit_log').insert({
    action: payload.action,
    performed_by: payload.performedBy,
    target_user: payload.targetUser ?? null,
    entity_type: payload.entityType ?? null,
    entity_id: payload.entityId ?? null,
    old_value: payload.oldValue ?? null,
    new_value: payload.newValue ?? null,
    metadata: payload.metadata ?? null,
    ip_address: ipAddress,
  });

  // Auditing should never block core admin actions.
  if (error) {
    console.error('Audit log write failed:', error.message);
  }
}
