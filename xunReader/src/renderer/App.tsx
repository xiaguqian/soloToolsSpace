import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import BookshelfPage from './pages/BookshelfPage';
import BookstorePage from './pages/BookstorePage';
import HistoryPage from './pages/HistoryPage';
import AIParsePage from './pages/AIParsePage';
import BookDetailPage from './pages/BookDetailPage';
import ReaderPage from './pages/ReaderPage';

const App: React.FC = () => {
  const [environment, setEnvironment] = useState<string>('local');
  const navigate = useNavigate();

  useEffect(() => {
    loadEnvironment();
  }, []);

  const loadEnvironment = async () => {
    if (window.electronAPI) {
      const env = await window.electronAPI.getEnvironment();
      setEnvironment(env);
    }
  };

  const handleEnvChange = async (env: string) => {
    if (window.electronAPI) {
      await window.electronAPI.setEnvironment(env);
      setEnvironment(env);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-links">
          <NavLink to="/">书架</NavLink>
          <NavLink to="/bookstore">云书城</NavLink>
          <NavLink to="/history">阅读历史</NavLink>
          <NavLink to="/ai-parse">AI智能解析</NavLink>
        </div>
        <div className="env-switcher">
          <span>环境：</span>
          <select
            value={environment}
            onChange={(e) => handleEnvChange(e.target.value)}
            className="input"
          >
            <option value="local">本地</option>
            <option value="development">开发</option>
            <option value="production">生产</option>
          </select>
        </div>
      </nav>
      <div className="content">
        <Routes>
          <Route path="/" element={<BookshelfPage />} />
          <Route path="/bookstore" element={<BookstorePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/ai-parse" element={<AIParsePage />} />
          <Route path="/book/:bookId" element={<BookDetailPage />} />
          <Route path="/reader/:bookId" element={<ReaderPage />} />
          <Route path="/reader/:bookId/:chapterId" element={<ReaderPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
