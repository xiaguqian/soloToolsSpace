import React, { useState, useEffect } from 'react';
import { Book, Chapter } from '@shared/types';

interface ReaderProps {
  book: Book;
  initialChapterId?: string;
  onBack: () => void;
}

const Reader: React.FC<ReaderProps> = ({ book, initialChapterId, onBack }) => {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'day' | 'night'>('day');
  const [bgColor, setBgColor] = useState('#fff9e6');
  const [bgPattern, setBgPattern] = useState('none');

  const chapters = book.chapters || [];

  useEffect(() => {
    if (chapters.length > 0) {
      const chapter = initialChapterId
        ? chapters.find((c) => c.id === initialChapterId) || chapters[0]
        : chapters[0];
      setCurrentChapter(chapter);
    }
  }, [chapters, initialChapterId]);

  const themes = {
    day: {
      bg: bgColor,
      text: '#333',
      border: 'rgba(0, 0, 0, 0.1)',
    },
    night: {
      bg: '#1a1a2e',
      text: '#a0a0a0',
      border: 'rgba(255, 255, 255, 0.1)',
    },
  };

  const currentTheme = themes[theme];

  const patterns: Record<string, string> = {
    none: 'none',
    dots: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
    lines: 'linear-gradient(#f0f0f0 1px, transparent 1px)',
    grid: 'linear-gradient(#e8e8e8 1px, transparent 1px), linear-gradient(90deg, #e8e8e8 1px, transparent 1px)',
  };

  const bgColors = ['#fff9e6', '#f0fff0', '#ffe4e1', '#f0f8ff', '#ffffff'];

  const goToPrevChapter = () => {
    if (!currentChapter) return;
    const index = chapters.findIndex((c) => c.id === currentChapter.id);
    if (index > 0) {
      setCurrentChapter(chapters[index - 1]);
    }
  };

  const goToNextChapter = () => {
    if (!currentChapter) return;
    const index = chapters.findIndex((c) => c.id === currentChapter.id);
    if (index < chapters.length - 1) {
      setCurrentChapter(chapters[index + 1]);
    }
  };

  const selectChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter);
  };

  return (
    <div
      className="reader-container"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
    >
      <div
        className="reader-header"
        style={{ borderBottom: `1px solid ${currentTheme.border}` }}
      >
        <button className="btn btn-secondary" onClick={onBack}>
          返回
        </button>
        <div className="reader-settings">
          <span>字号:</span>
          <button
            className="btn btn-secondary"
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
          >
            -
          </button>
          <span>{fontSize}px</span>
          <button
            className="btn btn-secondary"
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
          >
            +
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
          >
            {theme === 'day' ? '🌙 夜间' : '☀️ 日间'}
          </button>

          {theme === 'day' && (
            <select
              className="input"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            >
              {bgColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          )}

          {theme === 'day' && (
            <select
              className="input"
              value={bgPattern}
              onChange={(e) => setBgPattern(e.target.value)}
            >
              <option value="none">无图案</option>
              <option value="dots">点阵</option>
              <option value="lines">横线</option>
              <option value="grid">网格</option>
            </select>
          )}
        </div>
      </div>

      <div className="reader-content" style={{ fontSize: `${fontSize}px` }}>
        {currentChapter ? (
          <>
            <h2 className="reader-chapter-title">{currentChapter.title}</h2>
            <div>{currentChapter.content}</div>
          </>
        ) : (
          <div>暂无章节内容</div>
        )}
      </div>

      <div
        className="reader-header"
        style={{ borderTop: `1px solid ${currentTheme.border}` }}
      >
        <button className="btn btn-secondary" onClick={goToPrevChapter}>
          上一章
        </button>
        <select
          className="input"
          value={currentChapter?.id || ''}
          onChange={(e) => {
            const chapter = chapters.find((c) => c.id === e.target.value);
            if (chapter) selectChapter(chapter);
          }}
        >
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={goToNextChapter}>
          下一章
        </button>
      </div>
    </div>
  );
};

export default Reader;
