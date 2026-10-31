import { router, json, error, requireAuth, db } from '@appdeploy/sdk';

type ProgressRecord = {
  ownerId: string;
  found: string[];
  questioned: string[];
  theory: string;
  accusation: string;
  ending: string;
  updatedAt: string;
};

function tableFor(userId: string) {
  const safe = userId.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 80);
  return 'progress_' + safe;
}

export const handler = router({
  'GET /api/_healthcheck': [
    async () => json({ ok: true, service: 'mysterybox' }),
  ],
  'GET /api/progress': [
    requireAuth(),
    async ctx => {
      const table = tableFor(ctx.user!.userId);
      const result = await db.list<ProgressRecord>(table, { limit: 5 });
      return json({ progress: result.items[0] ?? null });
    },
  ],
  'POST /api/progress': [
    requireAuth(),
    async ctx => {
      const body = (ctx.body ?? {}) as Partial<ProgressRecord>;
      const clean: ProgressRecord = {
        ownerId: ctx.user!.userId,
        found: Array.isArray(body.found)
          ? body.found
              .filter((v): v is string => typeof v === 'string')
              .slice(0, 6)
          : [],
        questioned: Array.isArray(body.questioned)
          ? body.questioned
              .filter((v): v is string => typeof v === 'string')
              .slice(0, 5)
          : [],
        theory:
          typeof body.theory === 'string' ? body.theory.slice(0, 5000) : '',
        accusation:
          typeof body.accusation === 'string'
            ? body.accusation.slice(0, 40)
            : '',
        ending:
          typeof body.ending === 'string' ? body.ending.slice(0, 1500) : '',
        updatedAt: new Date().toISOString(),
      };
      const table = tableFor(ctx.user!.userId);
      const existing = await db.list<ProgressRecord>(table, { limit: 5 });
      if (existing.items[0]) {
        const [ok] = await db.update(table, [
          { id: existing.items[0].id, record: clean },
        ]);
        if (!ok) return error('Could not update investigation progress.', 503);
      } else {
        const [id] = await db.add(table, [clean]);
        if (!id) return error('Could not save investigation progress.', 503);
      }
      return json({ saved: true, updatedAt: clean.updatedAt });
    },
  ],
});
