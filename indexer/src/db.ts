import Database from 'better-sqlite3';

const db = new Database('asap.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY,
    provider TEXT NOT NULL,
    farcaster_id INTEGER,
    endpoint TEXT,
    metadata TEXT,
    reputation INTEGER DEFAULT 0,
    last_checked INTEGER
  );
`);

export default db;