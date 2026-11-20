import type { PrismaClient } from '@creatoros/db';

export async function audit(
  db: PrismaClient, actor: string, action: string,
  opts: { entity?: string; entityId?: string; brandId?: string | null; data?: Record<string, unknown> } = {},
) {
  await db.auditLog.create({
    data: { actor, action, entity: opts.entity, entityId: opts.entityId, brandId: opts.brandId ?? undefined,
      data: JSON.parse(JSON.stringify(opts.data ?? {}, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))) },
  });
}

export async function isEmergencyStopped(db: PrismaClient): Promise<boolean> {
  const s = await db.systemSetting.findUnique({ where: { key: 'emergency_stop' } });
  return s?.value === true;
}

export async function setEmergencyStop(db: PrismaClient, on: boolean, actor: string) {
  await db.systemSetting.upsert({
    where: { key: 'emergency_stop' },
    create: { key: 'emergency_stop', value: on, updatedBy: actor },
    update: { value: on, updatedBy: actor },
  });
  await audit(db, actor, on ? 'system.emergency_stop.on' : 'system.emergency_stop.off');
}
