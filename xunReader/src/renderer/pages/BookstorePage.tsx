import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '@shared/types';

const BookstorePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookstore();
  }, []);

  const loadBookstore = async () => {
    setLoading(true);
    if (window.electronAPI) {
      const response = await window.electronAPI.callApi('/bookstore/list', {});
      if (response && response.data) {
        setBooks(response.data);
      }
    }
    setLoading(false);
  };

  const handleBookClick = (book: Book) => {
    navigate(`/book/${book.id}`);
  };

  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <h1 className="page-title">云书城</h1>
      {books.length === 0 ? (
        <div>暂无书籍</div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => handleBookClick(book)}
            >
              <div className="book-cover">📖</div>
              <div className="book-info">
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author || '未知作者'}</div>
                <div className="book-author" style={{ marginTop: 4 }}>
                  {truncateDescription(book.description || '')}
                </div>
                <div className="book-status">
                  {book.isCompleted ? '已完结' : '连载中'}
                  {book.lastUpdate && ` · ${book.lastUpdate}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookstorePage;
