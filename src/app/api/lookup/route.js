import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/initDb';
import { getDb } from '@/db/schema';
import { processQuery } from '@/services/queryProcessor';

export async function POST(request) {
    ensureDb();

    try {
        const body = await request.json();
        const { vin, name, email, phone } = body;

        if (!vin) return NextResponse.json({ error: 'VIN es requerido' }, { status: 400 });
        if (!name) return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
        if (!email) return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });

        const db = getDb();
        let userId = null;
        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (user) userId = user.id;

        const result = await processQuery({
            vin: vin.trim().toUpperCase(),
            customerName: name,
            customerPhone: phone || null,
            customerEmail: email,
            channel: 'web',
            userId
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                queryId: result.queryId,
                vehicle: result.vehicle,
                partsCount: result.partsCount,
                emailSent: result.emailSent,
                message: '¡Consulta procesada! Revisa tu correo electrónico para ver los resultados.'
            });
        } else {
            return NextResponse.json({ success: false, error: result.error, queryId: result.queryId }, { status: 422 });
        }
    } catch (error) {
        console.error('Lookup error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
