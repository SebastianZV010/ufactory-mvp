import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/initDb';
import { getSession } from '@/lib/auth';
import { getDb } from '@/db/schema';

export async function GET(request) {
    ensureDb();
    const session = getSession(request);
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const db = getDb();
    const url = new URL(request.url);
    const channel = url.searchParams.get('channel');
    const status = url.searchParams.get('status');
    const make = url.searchParams.get('make');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let query = 'SELECT * FROM queries WHERE 1=1';
    const params = [];

    if (session.role !== 'admin') {
        query += ' AND (user_id = ? OR customer_email = ?)';
        params.push(session.userId, session.email);
    }

    if (channel) { query += ' AND channel = ?'; params.push(channel); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (make) { query += ' AND vehicle_make = ?'; params.push(make); }
    if (from) { query += ' AND created_at >= ?'; params.push(from); }
    if (to) { query += ' AND created_at <= ?'; params.push(to + 'T23:59:59'); }

    query += ' ORDER BY created_at DESC';

    const queries = db.prepare(query).all(...params);
    const getQueryParts = db.prepare('SELECT * FROM query_parts WHERE query_id = ?');
    const result = queries.map(q => ({ ...q, parts: getQueryParts.all(q.id) }));

    return NextResponse.json({ queries: result });
}
