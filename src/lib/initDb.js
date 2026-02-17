import { getDb } from '@/db/schema';
import { seed } from '@/db/seed';

let initialized = false;

export function ensureDb() {
    if (!initialized) {
        getDb();
        seed();
        initialized = true;
    }
}
