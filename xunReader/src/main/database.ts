import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

let db: Database.Database;

export function setupDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'xunreader.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS bookshelves (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isDefault INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      shelfId TEXT NOT NULL,
      title TEXT NOT NULL,
      cover TEXT,
      author TEXT,
      path TEXT,
      lastReadAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (shelfId) REFERENCES bookshelves(id)
    );

    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      title TEXT NOT NULL,
      cover TEXT,
      author TEXT,
      lastReadAt TEXT,
      readCount INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const defaultShelf = db.prepare('SELECT * FROM bookshelves WHERE name = ?').get('默认书架');
  if (!defaultShelf) {
    db.prepare(`
      INSERT INTO bookshelves (id, name, isDefault, createdAt)
      VALUES (?, ?, ?, ?)
    `).run('default-shelf', '默认书架', 1, new Date().toISOString());
  }

  const env = db.prepare('SELECT * FROM settings WHERE key = ?').get('environment');
  if (!env) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('environment', 'local');
  }
}

export function getDb() {
  return db;
}
