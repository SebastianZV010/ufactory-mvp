import { getDb } from '@/db/schema';

export function lookupParts(make, model, year) {
    const db = getDb();
    return db.prepare(`
    SELECT id, part_number, type, description, price, stock_qty,
           CASE WHEN stock_qty > 0 THEN 1 ELSE 0 END as available
    FROM parts
    WHERE make = ? AND model = ? AND year_from <= ? AND year_to >= ?
    ORDER BY type
  `).all(make, model, year, year);
}

export function getAllParts(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM parts WHERE 1=1';
    const params = [];

    if (filters.type) { query += ' AND type = ?'; params.push(filters.type); }
    if (filters.make) { query += ' AND make = ?'; params.push(filters.make); }
    if (filters.search) {
        query += ' AND (part_number LIKE ? OR description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY make, model, type';
    return db.prepare(query).all(...params);
}

export function updatePart(partId, updates) {
    const db = getDb();
    db.prepare('UPDATE parts SET price = ?, stock_qty = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(updates.price, updates.stock_qty, partId);
    return db.prepare('SELECT * FROM parts WHERE id = ?').get(partId);
}
