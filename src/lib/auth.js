import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE = 'ufactory_session';

// Use globalThis to persist sessions across Next.js dev mode module reloads
// Without this, each route compilation reinitializes the Map and loses all sessions
if (!globalThis.__ufactory_sessions) {
    globalThis.__ufactory_sessions = new Map();
}
const sessions = globalThis.__ufactory_sessions;

export function createSession(user) {
    const sessionId = uuidv4();
    sessions.set(sessionId, {
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: Date.now()
    });
    return sessionId;
}

export function getSession(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (!match) return null;
    return sessions.get(match[1]) || null;
}

export function deleteSession(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (match) sessions.delete(match[1]);
}

export function sessionCookie(sessionId, maxAge = 86400) {
    return `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie() {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
