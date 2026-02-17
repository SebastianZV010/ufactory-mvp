import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'ufactory.db');

let db;

export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vin TEXT UNIQUE NOT NULL,
      year INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      engine TEXT NOT NULL,
      trim TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      part_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('radiador', 'condensador', 'ventilador')),
      description TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year_from INTEGER NOT NULL,
      year_to INTEGER NOT NULL,
      price REAL NOT NULL,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      vin TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_email TEXT NOT NULL,
      channel TEXT NOT NULL CHECK(channel IN ('web', 'call')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processed', 'sent', 'failed')),
      vehicle_year INTEGER,
      vehicle_make TEXT,
      vehicle_model TEXT,
      vehicle_engine TEXT,
      parts_found INTEGER DEFAULT 0,
      email_sent INTEGER DEFAULT 0,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS query_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_id TEXT NOT NULL,
      part_id INTEGER NOT NULL,
      part_number TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      stock_qty INTEGER NOT NULL,
      FOREIGN KEY (query_id) REFERENCES queries(id),
      FOREIGN KEY (part_id) REFERENCES parts(id)
    );

    CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
    CREATE INDEX IF NOT EXISTS idx_parts_make_model ON parts(make, model);
    CREATE INDEX IF NOT EXISTS idx_queries_user ON queries(user_id);
    CREATE INDEX IF NOT EXISTS idx_queries_created ON queries(created_at);
    CREATE INDEX IF NOT EXISTS idx_queries_channel ON queries(channel);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}

export { DB_PATH };
