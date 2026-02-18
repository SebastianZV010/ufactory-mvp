import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { ensureDb } from '@/lib/initDb';
import { getSession } from '@/lib/auth';
import { getAllParts, updatePart } from '@/services/partsLookup';

export async function GET(request) {
    ensureDb();
    const session = getSession(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const url = new URL(request.url);
    const filters = {
        type: url.searchParams.get('type'),
        make: url.searchParams.get('make'),
        search: url.searchParams.get('search')
    };

    return NextResponse.json({ parts: getAllParts(filters) });
}

export async function PUT(request) {
    ensureDb();
    const session = getSession(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    try {
        const body = await request.json();
        const { id, price, stock_qty } = body;
        if (!id) return NextResponse.json({ error: 'ID de parte requerido' }, { status: 400 });
        if (price === undefined || stock_qty === undefined) return NextResponse.json({ error: 'Precio y cantidad son requeridos' }, { status: 400 });

        const updated = updatePart(id, { price: parseFloat(price), stock_qty: parseInt(stock_qty) });
        return NextResponse.json({ success: true, part: updated });
    } catch (error) {
        console.error('Inventory update error:', error);
        return NextResponse.json({ error: 'Error actualizando inventario' }, { status: 500 });
    }
}
