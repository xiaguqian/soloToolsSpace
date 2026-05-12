import { ipcMain, app } from 'electron';
import { getDb } from './database';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';
import path from 'path';
import fs from 'fs';

const store = new Store({
  name: 'xunreader-config',
});

const API_BASE_URL = 'https://api.xunreader.com';

function getDeviceId(): string {
  let deviceId = store.get('deviceId') as string;
  if (!deviceId) {
    deviceId = uuidv4();
    store.set('deviceId', deviceId);
  }
  return deviceId;
}

function getMockData(filename: string): any {
  const mockDir = path.join(app.getAppPath(), 'mock');
  const mockPath = path.join(mockDir, filename);
  if (fs.existsSync(mockPath)) {
    return JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
  }
  return null;
}

export function registerApiHandlers() {
  ipcMain.handle('get-bookshelf', async () => {
    const db = getDb();
    const shelves = db.prepare('SELECT * FROM bookshelves').all();
    const result = shelves.map((shelf: any) => {
      const books = db.prepare('SELECT * FROM books WHERE shelfId = ?').all(shelf.id);
      return { ...shelf, books };
    });
    return result;
  });

  ipcMain.handle('add-book-to-shelf', async (_event, book: any, shelfId: string) => {
    const db = getDb();
    const id = uuidv4();
    db.prepare(`
      INSERT INTO books (id, shelfId, title, cover, author, path, lastReadAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, shelfId, book.title, book.cover || '', book.author || '', book.path || '', null, new Date().toISOString());
    return { id, ...book };
  });

  ipcMain.handle('remove-book-from-shelf', async (_event, bookId: string, shelfId: string) => {
    const db = getDb();
    db.prepare('DELETE FROM books WHERE id = ? AND shelfId = ?').run(bookId, shelfId);
    return true;
  });

  ipcMain.handle('get-history', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM history ORDER BY lastReadAt DESC').all();
  });

  ipcMain.handle('add-to-history', async (_event, book: any) => {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM history WHERE bookId = ?').get(book.id);
    if (existing) {
      db.prepare(`
        UPDATE history SET lastReadAt = ?, readCount = readCount + 1 WHERE bookId = ?
      `).run(new Date().toISOString(), book.id);
    } else {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO history (id, bookId, title, cover, author, lastReadAt, readCount, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, book.id, book.title, book.cover || '', book.author || '', new Date().toISOString(), 1, new Date().toISOString());
    }
    return true;
  });

  ipcMain.handle('remove-from-history', async (_event, bookId: string) => {
    const db = getDb();
    db.prepare('DELETE FROM history WHERE bookId = ?').run(bookId);
    return true;
  });

  ipcMain.handle('call-api', async (_event, endpoint: string, data: any) => {
    const db = getDb();
    const env = db.prepare('SELECT value FROM settings WHERE key = ?').get('environment') as any;
    const environment = env?.value || 'local';
    const deviceId = getDeviceId();

    if (environment === 'local') {
      const mockFile = `${endpoint.replace(/\//g, '_')}.json`;
      const mockData = getMockData(mockFile);
      if (mockData) {
        return mockData;
      }
      return { error: 'Mock data not found' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, deviceId }),
      });
      return await response.json();
    } catch (error) {
      return { error: 'API call failed' };
    }
  });

  ipcMain.handle('get-environment', async () => {
    const db = getDb();
    const env = db.prepare('SELECT value FROM settings WHERE key = ?').get('environment') as any;
    return env?.value || 'local';
  });

  ipcMain.handle('set-environment', async (_event, env: string) => {
    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `).run('environment', env);
    return true;
  });

  ipcMain.handle('get-device-id', async () => {
    return getDeviceId();
  });
}
