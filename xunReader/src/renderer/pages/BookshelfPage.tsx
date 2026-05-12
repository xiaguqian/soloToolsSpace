import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookshelf, Book } from '@shared/types';

const BookshelfPage: React.FC = () => {
  const [shelves, setShelves] = useState<Bookshelf[]>([]);
  const [expandedShelf, setExpandedShelf] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookshelves();
  }, []);

  const loadBookshelves = async () => {
    if (window.electronAPI) {
      const data = await window.electronAPI.getBookshelf();
      setShelves(data || []);
    }
  };

  const toggleShelf = (shelfId: string) => {
    setExpandedShelf(expandedShelf === shelfId ? null : shelfId);
  };

  const handleReadBook = (book: Book) => {
    navigate(`/reader/${book.id}`);
  };

  return (
    <div>
      <h1 className="page-title">我的书架</h1>
      {shelves.length === 0 ? (
        <div>暂无书架</div>
      ) : (
        shelves.map((shelf) => (
          <div key={shelf.id} className="shelf-group">
            <div
              className="shelf-group-header"
              style={{ cursor: 'pointer' }}
              onClick={() => toggleShelf(shelf.id)}
            >
              <h2 className="shelf-group-title">
                {shelf.name} {shelf.isDefault && '(默认)'}
                <span style={{ fontSize: 14, color: '#666', marginLeft: 8 }}>
                  ({shelf.books.length} 本)
                </span>
              </h2>
              <button className="btn btn-secondary">
                {expandedShelf === shelf.id ? '收起' : '展开'}
              </button>
            </div>

            <div className="shelf-preview">
              {shelf.books.slice(0, 9).map((book) => (
                <div
                  key={book.id}
                  className="shelf-preview-item"
                  title={book.title}
                >
                  <span style={{ fontWeight: 600 }}>{book.title.slice(0, 2)}</span>
                  <span style={{ marginTop: 4 }}>{book.title.slice(0, 6)}</span>
                </div>
              ))}
            </div>

            {expandedShelf === shelf.id && shelf.books.length > 0 && (
              <div className="book-grid" style={{ marginTop: 20 }}>
                {shelf.books.map((book) => (
                  <div
                    key={book.id}
                    className="book-card"
                    onClick={() => handleReadBook(book)}
                  >
                    <div className="book-cover">📚</div>
                    <div className="book-info">
                      <div className="book-title">{book.title}</div>
                      <div className="book-author">{book.author || '未知作者'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default BookshelfPage;
