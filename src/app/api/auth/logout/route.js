import { NextResponse } from 'next/server';
import { deleteSession, clearCookie } from '@/lib/auth';

export async function POST(request) {
    deleteSession(request);
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearCookie());
    return response;
}
