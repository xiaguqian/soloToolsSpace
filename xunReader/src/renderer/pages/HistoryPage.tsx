import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryItem } from '@shared/types';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (window.electronAPI) {
      const data = await window.electronAPI.getHistory();
      setHistory(data || []);
    }
  };

  const handleRead = (item: HistoryItem) => {
    navigate(`/reader/${item.bookId}`);
  };

  const handleDelete = async (bookId: string) => {
    if (window.electronAPI) {
      await window.electronAPI.removeFromHistory(bookId);
      loadHistory();
    }
  };

  return (
    <div>
      <h1 className="page-title">阅读历史</h1>
      {history.length === 0 ? (
        <div>暂无阅读历史</div>
      ) : (
        <div className="book-grid">
          {history.map((item) => (
            <div key={item.id} className="book-card">
              <div className="book-cover" onClick={() => handleRead(item)}>
                📖
              </div>
              <div className="book-info">
                <div className="book-title">{item.title}</div>
                <div className="book-author">{item.author || '未知作者'}</div>
                <div className="book-status">
                  阅读 {item.readCount} 次
                  {item.lastReadAt && ` · 最后阅读: ${item.lastReadAt}`}
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={() => handleDelete(item.bookId)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
