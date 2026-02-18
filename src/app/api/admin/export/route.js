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
    const queries = db.prepare(`
    SELECT id, vin, customer_name, customer_phone, customer_email, channel, status,
           vehicle_year, vehicle_make, vehicle_model, vehicle_engine, parts_found,
           email_sent, created_at
    FROM queries ORDER BY created_at DESC
  `).all();

    const headers = ['ID', 'VIN', 'Cliente', 'Teléfono', 'Email', 'Canal', 'Estado',
        'Año', 'Marca', 'Modelo', 'Motor', 'Piezas', 'Email Enviado', 'Fecha'];

    const rows = queries.map(q => [
        q.id, q.vin, q.customer_name, q.customer_phone || '', q.customer_email,
        q.channel, q.status, q.vehicle_year || '', q.vehicle_make || '',
        q.vehicle_model || '', q.vehicle_engine || '', q.parts_found,
        q.email_sent ? 'Sí' : 'No', q.created_at
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=consultas_ufactory_${new Date().toISOString().split('T')[0]}.csv`
        }
    });
}
