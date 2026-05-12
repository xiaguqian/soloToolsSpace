import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, Chapter } from '@shared/types';

const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookDetail();
  }, [bookId]);

  const loadBookDetail = async () => {
    setLoading(true);
    if (window.electronAPI && bookId) {
      const response = await window.electronAPI.callApi('/book/detail', { bookId });
      if (response && response.data) {
        setBook(response.data);
      }
    }
    setLoading(false);
  };

  const handleReadNow = async () => {
    if (book) {
      if (window.electronAPI) {
        await window.electronAPI.addToHistory(book);
      }
      navigate(`/reader/${book.id}`);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    if (book) {
      navigate(`/reader/${book.id}/${chapter.id}`);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!book) {
    return <div>书籍不存在</div>;
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        返回
      </button>

      <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
        <div
          style={{
            width: 200,
            height: 280,
            background: '#ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            borderRadius: 8,
          }}
        >
          📖
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ marginBottom: 16 }}>{book.title}</h1>
          <p style={{ color: '#666', marginBottom: 8 }}>
            作者: {book.author || '未知作者'}
          </p>
          <p style={{ color: '#666', marginBottom: 8 }}>
            状态: {book.isCompleted ? '已完结' : '连载中'}
          </p>
          {book.lastUpdate && (
            <p style={{ color: '#666', marginBottom: 16 }}>
              最后更新: {book.lastUpdate}
            </p>
          )}
          <p style={{ lineHeight: 1.6, marginBottom: 24 }}>
            {book.description}
          </p>

          <button className="btn btn-primary" onClick={handleReadNow}>
            立即阅读
          </button>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 16 }}>目录</h2>
        {book.chapters && book.chapters.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {book.chapters.map((chapter) => (
              <div
                key={chapter.id}
                style={{
                  padding: 12,
                  background: '#fff',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: '1px solid #eee',
                }}
                onClick={() => handleChapterClick(chapter)}
              >
                {chapter.title}
              </div>
            ))}
          </div>
        ) : (
          <div>暂无目录</div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
