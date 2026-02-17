import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/initDb';
import { getDb } from '@/db/schema';
import { createSession, sessionCookie } from '@/lib/auth';

export async function POST(request) {
    ensureDb();

    try {
        const body = await request.json();
        const { email, phone } = body;

        if (!email || !phone) return NextResponse.json({ error: 'Email y teléfono son requeridos' }, { status: 400 });

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });

        const cleanPhone = phone.replace(/\D/g, '');
        const userPhone = user.phone.replace(/\D/g, '');
        if (!cleanPhone.endsWith(userPhone) && !userPhone.endsWith(cleanPhone)) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const sessionId = createSession(user);
        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
        response.headers.set('Set-Cookie', sessionCookie(sessionId));
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
    }
}
