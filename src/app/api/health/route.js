import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/initDb';

export async function GET() {
    ensureDb();
    return NextResponse.json({ status: 'ok', service: 'U-FACTORY RADIATORS API', timestamp: new Date().toISOString() });
}
