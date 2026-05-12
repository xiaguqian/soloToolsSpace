import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book } from '@shared/types';
import Reader from '../components/Reader';

const ReaderPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    setLoading(true);
    if (window.electronAPI && bookId) {
      const response = await window.electronAPI.callApi('/book/detail', { bookId });
      if (response && response.data) {
        setBook(response.data);
        await window.electronAPI.addToHistory(response.data);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!book) {
    return (
      <div>
        <p>书籍不存在</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          返回
        </button>
      </div>
    );
  }

  return <Reader book={book} initialChapterId={chapterId} onBack={() => navigate(-1)} />;
};

export default ReaderPage;
