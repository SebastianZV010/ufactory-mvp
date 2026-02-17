import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/db/schema';
import { decodeVin } from '@/services/vinDecoder';
import { lookupParts } from '@/services/partsLookup';
import { formatPartsEmail, formatErrorEmail } from '@/services/messageFormatter';
import { sendEmail } from '@/services/emailService';

export async function processQuery({ vin, customerName, customerPhone, customerEmail, channel, userId }) {
  const db = getDb();
  const queryId = uuidv4();

  db.prepare(`
    INSERT INTO queries (id, user_id, vin, customer_name, customer_phone, customer_email, channel, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(queryId, userId || null, vin, customerName, customerPhone || null, customerEmail, channel);

  try {
    const vinResult = decodeVin(vin);

    if (!vinResult.success) {
      db.prepare('UPDATE queries SET status = ?, error_message = ? WHERE id = ?').run('failed', vinResult.error, queryId);

      if (customerEmail) {
        const { subject, html, text } = formatErrorEmail(vinResult.error, customerName);
        await sendEmail(customerEmail, subject, html, text);
      }

      return { success: false, queryId, error: vinResult.error };
    }

    const vehicle = vinResult.vehicle;
    const parts = lookupParts(vehicle.make, vehicle.model, vehicle.year);

    db.prepare(`
      UPDATE queries SET status = 'processed', vehicle_year = ?, vehicle_make = ?, vehicle_model = ?, vehicle_engine = ?, parts_found = ? WHERE id = ?
    `).run(vehicle.year, vehicle.make, vehicle.model, vehicle.engine, parts.length, queryId);

    const insertQueryPart = db.prepare('INSERT INTO query_parts (query_id, part_id, part_number, type, description, price, stock_qty) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const part of parts) {
      insertQueryPart.run(queryId, part.id, part.part_number, part.type, part.description, part.price, part.stock_qty);
    }

    // Send email with results
    let emailSent = false;
    if (customerEmail) {
      const { subject, html, text } = formatPartsEmail(vehicle, parts, customerName);
      const emailResult = await sendEmail(customerEmail, subject, html, text);
      emailSent = emailResult.success;
    }

    db.prepare('UPDATE queries SET status = ?, email_sent = ? WHERE id = ?')
      .run(emailSent ? 'sent' : 'processed', emailSent ? 1 : 0, queryId);

    return { success: true, queryId, vehicle, partsCount: parts.length, parts, emailSent };
  } catch (error) {
    db.prepare('UPDATE queries SET status = ?, error_message = ? WHERE id = ?').run('failed', error.message, queryId);
    return { success: false, queryId, error: error.message };
  }
}
