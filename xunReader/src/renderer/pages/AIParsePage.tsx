import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIParseResult, Book, Bookstore } from '@shared/types';

const AIParsePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIParseResult | null>(null);
  const navigate = useNavigate();

  const handleParse = async () => {
    if (!url.trim()) return;

    setLoading(true);
    if (window.electronAPI) {
      const response = await window.electronAPI.callApi('/ai/parse', { url });
      if (response && response.data) {
        setResult(response.data);
        handleResultNavigation(response.data);
      }
    }
    setLoading(false);
  };

  const handleResultNavigation = (data: AIParseResult) => {
    switch (data.type) {
      case 'book':
        const book = data.data as Book;
        navigate(`/book/${book.id}`);
        break;
      case 'bookstore':
        const bookstore = data.data as Bookstore;
        console.log('Bookstore data:', bookstore);
        break;
      case 'chapter':
        const chapterData = data.data as { book: Book; chapter: any };
        navigate(`/reader/${chapterData.book.id}/${chapterData.chapter.id}`);
        break;
    }
  };

  return (
    <div>
      <h1 className="page-title">AI智能解析</h1>
      <div className="ai-parse-form">
        <input
          type="text"
          className="input"
          placeholder="输入在线小说链接..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleParse} disabled={loading}>
          {loading ? '解析中...' : '开始解析'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>解析结果</h3>
          <p>类型: {result.type}</p>
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h3>使用说明</h3>
        <ul style={{ marginLeft: 20, marginTop: 10 }}>
          <li>输入小说详情页链接 → 跳转书籍详情页</li>
          <li>输入书城链接 → 展示书城数据</li>
          <li>输入具体章节链接 → 直接跳转阅读页</li>
        </ul>
      </div>
    </div>
  );
};

export default AIParsePage;
