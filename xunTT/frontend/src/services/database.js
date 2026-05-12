class LocalDatabase {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init(userId) {
    try {
      const path = window.require('path');
      const fs = window.require('fs');
      const app = window.require('electron').remote?.app || window.require('electron').app;
      const userDataPath = app?.getPath?.('userData') || './data';
      const dbDir = path.join(userDataPath, 'databases');
      
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const dbPath = path.join(dbDir, `user_${userId}.db`);
      const Database = window.require('better-sqlite3');
      this.db = new Database(dbPath);
      this.initTables();
      this.initialized = true;
    } catch (e) {
      console.warn('本地数据库初始化失败，使用 localStorage 作为后备', e);
      this.initialized = false;
    }
  }

  initTables() {
    if (!this.db) return;
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY,
        message_id BIGINT UNIQUE,
        conversation_id TEXT NOT NULL,
        conversation_type INTEGER,
        sender_id BIGINT,
        receiver_id BIGINT,
        group_id BIGINT,
        message_type INTEGER,
        content TEXT,
        file_url TEXT,
        file_name TEXT,
        file_size BIGINT,
        quote_message_id BIGINT,
        status INTEGER DEFAULT 1,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    `);
  }

  saveMessage(message) {
    if (!this.db) {
      this.saveToLocalStorage('messages', message);
      return;
    }
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO messages 
      (message_id, conversation_id, conversation_type, sender_id, receiver_id, 
       group_id, message_type, content, file_url, file_name, file_size, 
       quote_message_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      message.id,
      message.conversationId,
      message.conversationType,
      message.senderId,
      message.receiverId,
      message.groupId,
      message.messageType,
      message.content,
      message.fileUrl,
      message.fileName,
      message.fileSize,
      message.quoteMessageId,
      message.status,
      message.createdAt
    );
  }

  getMessages(conversationId, limit = 100) {
    if (!this.db) {
      return this.getFromLocalStorage('messages')
        .filter(m => m.conversationId === conversationId)
        .slice(-limit);
    }
    
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    const rows = stmt.all(conversationId, limit);
    return rows.reverse();
  }

  updateMessageStatus(messageId, status) {
    if (!this.db) return;
    
    const stmt = this.db.prepare(`
      UPDATE messages SET status = ? WHERE message_id = ?
    `);
    stmt.run(status, messageId);
  }

  markAsRead(conversationId) {
    if (!this.db) return;
    
    const stmt = this.db.prepare(`
      UPDATE messages SET is_read = 1 WHERE conversation_id = ?
    `);
    stmt.run(conversationId);
  }

  deleteMessage(messageId) {
    if (!this.db) return;
    
    const stmt = this.db.prepare(`
      DELETE FROM messages WHERE message_id = ?
    `);
    stmt.run(messageId);
  }

  clearConversation(conversationId) {
    if (!this.db) {
      const messages = this.getFromLocalStorage('messages')
        .filter(m => m.conversationId !== conversationId);
      localStorage.setItem('local_messages', JSON.stringify(messages));
      return;
    }
    
    const stmt = this.db.prepare(`
      DELETE FROM messages WHERE conversation_id = ?
    `);
    stmt.run(conversationId);
  }

  saveToLocalStorage(key, data) {
    const existing = this.getFromLocalStorage(key);
    existing.push(data);
    localStorage.setItem(`local_${key}`, JSON.stringify(existing.slice(-1000)));
  }

  getFromLocalStorage(key) {
    try {
      return JSON.parse(localStorage.getItem(`local_${key}`) || '[]');
    } catch {
      return [];
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

export default new LocalDatabase();
