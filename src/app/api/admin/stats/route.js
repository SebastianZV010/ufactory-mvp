import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { ensureDb } from '@/lib/initDb';
import { getSession } from '@/lib/auth';
import { getDb } from '@/db/schema';

export async function GET(request) {
    ensureDb();
    const session = getSession(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM queries').get().count;
    const byChannel = db.prepare('SELECT channel, COUNT(*) as count FROM queries GROUP BY channel').all();
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM queries GROUP BY status').all();
    const topMakes = db.prepare(`SELECT vehicle_make as make, COUNT(*) as count FROM queries WHERE vehicle_make IS NOT NULL GROUP BY vehicle_make ORDER BY count DESC LIMIT 10`).all();
    const recent = db.prepare('SELECT * FROM queries ORDER BY created_at DESC LIMIT 5').all();
    const totalParts = db.prepare('SELECT COUNT(*) as count FROM parts').get().count;
    const lowStock = db.prepare('SELECT COUNT(*) as count FROM parts WHERE stock_qty <= 3').get().count;
    const todayCount = db.prepare(`SELECT COUNT(*) as count FROM queries WHERE date(created_at) = date('now')`).get().count;
    const thisWeek = db.prepare(`SELECT COUNT(*) as count FROM queries WHERE created_at >= date('now', '-7 days')`).get().count;

    return NextResponse.json({
        stats: {
            totalQueries: total, todayQueries: todayCount, weekQueries: thisWeek, totalParts, lowStock,
            byChannel: Object.fromEntries(byChannel.map(r => [r.channel, r.count])),
            byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
            topMakes, recentQueries: recent
        }
    });
}
