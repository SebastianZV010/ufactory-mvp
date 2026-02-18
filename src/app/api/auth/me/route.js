import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { ensureDb } from '@/lib/initDb';
import { getSession } from '@/lib/auth';

export async function GET(request) {
    ensureDb();
    const session = getSession(request);
    if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
    return NextResponse.json({
        authenticated: true,
        user: { id: session.userId, name: session.name, email: session.email, phone: session.phone, role: session.role }
    });
}
